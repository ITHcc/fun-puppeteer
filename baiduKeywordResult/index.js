const puppeteer = require('puppeteer');
const _ = require('lodash');
const async = require('async');
const axios = require('axios');
const cheerio = require('cheerio');
const nodeUrl = require('url');

/*
if you open the initializer feature, please implement the initializer function, as below:
module.exports.initializer = function(context, callback) {
    console.log('initializing');
    callback(null, '');
};
*/

module.exports.handler = async function(req, resp, context) {

    // 接收参数
    let { keyword, page } = req.queries;

    if (_.isEmpty(keyword) || _.isEmpty(page)) {
        resp.send(JSON.stringify({
            msg: '参数不正确!',
            code: 4005,
            data: null
        }))
    }

    try {
        // 百度搜索结果最多只有76页
        page = Math.min(page, 76);

        const task = new Task({ keyword, page })
        const result = await task.start();
        console.log('response result', result)
        resp.send(JSON.stringify(result))
    } catch(e) {
        console.log(e)
    }

}


class Task {

    // 构造函数, 创建示例时会调用
    constructor(task) {
        this._result = {
            msg: 'success',
            data: {},
            code: 5000
        };
        this._browser = null;
        this._task = task;
    }

    async start() {
        try {
            await this.initialize();
            await this.execute();
            this._result.code = 2000;
        } catch(e) {
            console.log(e.stack);
            this._result.msg = e.stack;
            this._result.code = 5000;
        } finally {
            await this.destroy();
        }

        return this._result;
    }

    async initialize() {
        // 打开一个浏览器实例
        this._browser = await puppeteer.launch({
            headless: true,
            ignoreDefaultArgs: ['--disable-extensions'],
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ]
        });
    }

    async execute() {
        const { keyword, page } = this._task;
        const pageRange = _.range(0, page * 10, 10);
        
        let results = [];
        
        // 并发获取每页搜索结果
        results = await async.mapLimit(
            pageRange,
            50,
            async (offset) => {
                
                // 失败重试机制
                let retry = 0;
                let success = false;
                
                do {
                    // 打开一个Tab页
                    let entryPage = await this._browser.newPage();
                    try {
                        const url = `https://baidu.com/s?wd=${keyword}&pn=${offset}`;
                        console.log('Crawler url:', url)
                        await entryPage.goto(url,{
                            waitUntil: 'load',
                            timeout: 1000 * 30,
                        });
                        
                        let pageData = [];
                        if(this.isLastPage(entryPage)) {
                            pageData = await this.structureData(offset, entryPage);
                        }
                        
                        success = true;
                        return pageData;
                    } catch(e) {
                        console.log('error', e);
                        retry++;
                        
                        // 重试6次后依旧失败则抛出异常,由handler函数内的catch捕捉
                        if (retry >= 6) {
                            throw e;
                        }
                    } finally {
                        await entryPage.close()
                    }
                } while(!success && retry < 6)

            }
        );
        
        results = _.flatMapDepth(results).map((item, index)=>{
            item.rank = index + 1;
            return item;
        })
        console.log(results);
        this._result.data = results;

    }
    
    async structureData(offset = 0, entryPage) {

        const htmlContent = await entryPage.content();
        let htmlData = await this.htmlParse(htmlContent);
        
        // 遍历解析后的数据，增加page和keyword字段
        htmlData = _.map(htmlData, (data) => {
            data.keyword = this._task.keyword;
            data.pageNum = Math.max(1, offset / 10);
            return data;
        });
    
        return htmlData;
    }
    
    async htmlParse(html) {
        // 解析html获取数据
        const $ = cheerio.load(html);
        let pageItems = [];
        $(".result.c-container").each(function (i, el) {
            const that = $(el);
            const item = {
                title: _.trim(that.find("h3 > a").text()),
                abstract: _.trim(that.find(".c-abstract").text()),
                redirectUrl: _.trim(that.find("h3 > a").attr("href")),
                url: "",
            };
            pageItems.push(item);
        });

        // 并发请求url, 获取百度重定向后的真实url
        pageItems = await new Promise((resolve, reject) => {
            async.mapLimit(
            pageItems,
            50,
            async (item) => {
                const redirectResponse = await axios.head(item.redirectUrl, {
                timeout: 1000 * 10, // 10秒
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status >= 200 && status < 400;
                },
                });
                item.url = redirectResponse.headers.location || item.redirectUrl;
                item.domain = nodeUrl.parse(item.url).host;
                return item;
            },
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            }
            );
        });
        return pageItems;
    }

    async isLastPage(entryPage) {
        const htmlContent = await entryPage.content();
        // 解析html获取数据
        const $ = cheerio.load(htmlContent);
        
        return $("#page").length && $("#page .n").length
    }

    async destroy() {
        await this._browser.close();
    }
}