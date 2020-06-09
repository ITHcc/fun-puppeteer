# 前期准备

开始之前请确保如下工具已经正确的安装，更新到最新版本，并进行正确的配置。

- [Funcraft](https://github.com/alibaba/funcraft)
- [Docker](https://www.docker.com/get-started)

## Funcraft

[Funcraft](https://github.com/aliyun/fun) 是函数计算提供的一种命令行工具，通过该工具，您可以便捷地管理函数计算、API 网关、日志服务等资源。通过一个资源配置文件 template.yml，Funcraft 即可协助您进行开发、构建、部署操作。本文提供安装 Funcraft 的三种方式。

1. 安装

   - 执行以下命令安装Funcraft

     `npm install @alicloud/fun -g`

   - 安装完成之后，在控制终端执行fun命令查看版本信息。

     `fun --version`

2. 配置Funcraft

   - 执行以下命令

     `fun config`

   - 按照提示依次配置 Account ID、AccessKeyId、AccessKeySecret、Default Region Name。

## Docker

Funcraft 进行依赖编译、安装、本地运行调试等，需要依赖于[Docker]((https://docs.docker.com/engine/install/))来模拟本地环境。

**Windows**

1. 安装

   根据系统下载并安装 [Docker Desktop](https://www.docker.com/get-started)

2. 配置国内镜像

   ~~~json
   {
     "registry-mirrors": [
       "https://docker.mirrors.ustc.edu.cn",
       "https://registry.docker-cn.com",
       "http://hub-mirror.c.163.com"
     ]
   }
   ~~~

   在桌面右下角状态栏中右键 docker 图标，修改在 Docker Daemon 标签页中的 json ，把 上面的镜像地址加到"registry-mirrors"的数组里，保存即可。

   **Tips: 推荐使用阿里云Docker镜像。**

# 安装依赖

1. 生成[Funcraft](https://github.com/alibaba/funcraft)的配置文件

   `fun config`

   按照提示依次配置 Account ID、AccessKeyId、AccessKeySecret、Default Region Name。

2. 安装依赖

   `fun install -d`

# 本地调试函数

在本地调试代码，可以使用如下命令：

~~~
$ fun local start
using template: template.yml
HttpTrigger httpTrigger of FunPuppetter/baiduKeywordResult was registered
        url: http://localhost:8000/2016-08-15/proxy/FunPuppetter/baiduKeywordResult
        methods: [ 'POST', 'GET' ]
        authType: ANONYMOUS
~~~



浏览器打开`http://localhost:8000/2016-08-15/proxy/FunPuppetter/baiduKeywordResult`,会自动下载Response



Response:

~~~json
{"msg":"参数不正确!","code":4005,"data":null}
~~~



携带keyword和page参数后Response:

`http://localhost:8000/2016-08-15/proxy/FunPuppetter/baiduKeywordResult?keyword=vue&page=3`

~~~json
{
	"msg": "success",
	"data": [
        {
            "title": "vue.js官网",
            "abstract": "Vue.js - The Progressive JavaScript Framework... 订阅我们的周刊 (英文) 你可以在 news.vuejs.org 翻阅往期的 issue,也可以收听 podcast。",
            "redirectUrl": "http://www.baidu.com/link?url=Men7IMCzaXf2qP148hYmJKK54l5fL03Wbya_S4L25_i",
            "url": "https://cn.vuejs.org/",
            "domain": "cn.vuejs.org",
            "keyword": "vue",
            "pageNum": 1,
            "rank": 1
		}, 
        {
            "title": "Vue.js 教程 | 菜鸟教程",
            "abstract": "Vue.js 教程 Vue.js(读音 /vjuː/, 类似于 view) 是一套构建用户界面的渐进式框架。 Vue 只关注视图层, 采用自底向上增量开发的设计。 Vue 的目标是通过...",
            "redirectUrl": "http://www.baidu.com/link?url=WXIdaqC4EhUmm3Vdis5p0BCM3vUo139WwLQCB28LV8p5epqoiZMceQ1AWV_HpjKAb2jaqVpsXyWytUzPrnDqt_",
            "url": "https://www.runoob.com/vue2/vue-tutorial.html",
            "domain": "www.runoob.com",
            "keyword": "vue",
            "pageNum": 1,
            "rank": 2
		},
        {
            "title": "介绍— Vue.js",
            "abstract": "Vue.js - The Progressive JavaScript Framework... Vue (读音 /vjuː/,类似于 view) 是一套用于构建用户界面的渐进式框架。与其它大型框架不同的是,Vue 被设...",
            "redirectUrl": "http://www.baidu.com/link?url=RjryFjnGxvreIzhFX1iicF8hHcRbNhkoTTTrFLjsLk4EmqM5ydhCbTR2vye8NBUv",
            "url": "https://cn.vuejs.org/v2/guide/",
            "domain": "cn.vuejs.org",
            "keyword": "vue",
            "pageNum": 1,
            "rank": 3
		}
    	.......
    ],
	"code": 2000
}
~~~

# 一键部署服务

在本地调试代码，可以使用如下命令：

![](https://user-gold-cdn.xitu.io/2020/6/9/17296eb44801f15b?w=620&h=547&f=png&s=36096)

- 确认yml文件中的配置，选择Y就可以了，使用`fun deploy -y`部署时可跳过确认

![](https://user-gold-cdn.xitu.io/2020/6/9/17296eb867ee8ff0?w=591&h=89&f=png&s=8590)

- 使用nas服务管理依赖

![](https://user-gold-cdn.xitu.io/2020/6/9/17296f157c334769?w=1201&h=72&f=png&s=12406)

FunPuppetter/baiduKeywordResult函数大小超过50M，需要使用Nas服务来管理依赖。

- ? Do you want to let fun to help you automate the configuration? 

  询问是否使用 Fun 来自动化的配置 NAS 管理依赖，选择Yes

- ? We recommend using the 'NasConfig: Auto' configuration to manage your function dependencies. 

  是否使用NasConfig: Auto配置来管理函数依赖关系， 选择Yes。

  Tips:  可以选择手动配置。[函数计算挂载NAS访问](https://help.aliyun.com/document_detail/87401.html?spm=a2c4g.11186623.6.631.592325fdxrIZiY)。如果你已经手动配置，这里则提示用户选择已经配置的 NAS 存储函数依赖

![](https://user-gold-cdn.xitu.io/2020/6/9/17296fa642a45d04?w=1330&h=717&f=png&s=134820)

看到这里就表示部署成功了。

## 为什么Response会强制下载

因为服务端会为response header中强制添加content-disposition: attachment字段，此字段会使得返回结果在浏览器中以附件的方式打开。此字段无法覆盖，使用自定义域名将不受影响。

## 配置自定义域名

接下来我们给函数服务配置一个自定义域名，这样Http trigger触发的函数响应就不会再强制下载了。

1. 登录阿里云函数计算控制台

2. 打开自定义域名，创建域名

   ![](https://user-gold-cdn.xitu.io/2020/6/9/172970120de0824f?w=776&h=572&f=png&s=33383)

   把`fun.root2.cn`换成你们的域名地址

3. 解析域名到函数计算的Endpoint

   Endpoint在函数计算控制台/概览的右上角获取。

   ![](https://user-gold-cdn.xitu.io/2020/6/9/1729707e7f656164?w=382&h=237&f=png&s=12308)

   打开云解析DNS控制台，选中域名，添加记录

   ![](https://user-gold-cdn.xitu.io/2020/6/9/1729709bbd71016c?w=673&h=475&f=png&s=23135)

   记录类型选择`CNAME`,记录值为函数计算的Endpoint

4. 测试解析是否生效

   如下图则解析成功

   ![](https://user-gold-cdn.xitu.io/2020/6/9/172970dc561e8ad3?w=734&h=209&f=png&s=22488)



## 添加了新依赖，如何更新?

如果添加了新依赖，只需要重新执行`fun nas sync`进行同步即可。

如果修改了代码，只需要重新执行`fun deploy`重新部署即可。

