// ==UserScript==
// @name         Better24365
// @namespace    https://github.com/ifeng0188
// @version      1.0.0
// @description  更好的24365，让你更好地体验求职之旅
// @author       ifeng0188
// @match        *://*.ncss.cn/*
// @icon         https://t1.chei.com.cn/ncss/student/img/favicon.ico
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_addStyle
// @license      MIT License
// ==/UserScript==

;(function () {
    'use strict'

    // 最大并发请求数
    const MAX_CONCURRENT_REQUESTS = 50

    // 随机整数
    const randomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    // 时间戳转时间字符串
    const timeStamp2timeStr = timeStamp => {
        let date = new Date(timeStamp)
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let hour = date.getHours()
        let minute = date.getMinutes()
        let second = date.getSeconds()
        month = (month < 10 ? '0' : '') + month
        day = (day < 10 ? '0' : '') + day
        hour = (hour < 10 ? '0' : '') + hour
        minute = (minute < 10 ? '0' : '') + minute
        second = (second < 10 ? '0' : '') + second
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }

    // 限制并发进行请求
    let currentRequests = 0
    const fetchWithLimit = url => {
        return new Promise((resolve, reject) => {
            const fetchRequest = () => {
                if (currentRequests < MAX_CONCURRENT_REQUESTS) {
                    currentRequests++
                    fetch(url)
                        .then(response => resolve(response))
                        .catch(error => reject(error))
                    currentRequests--
                } else {
                    setTimeout(fetchRequest, randomInt(100, 300)) // 等待一些时间再重试
                }
            }
            fetchRequest()
        })
    }

    // 页面
    const page = (() => {
        if (document.title.includes('职位信息')) return 'zwxx'
    })()

    // 菜单项
    let menu_items = []

    // 注册菜单
    const registerMenu = () => {
        menu_items.forEach(item => GM_unregisterMenuCommand(item))
        GM_setValue('b24365_showHiddenOption', GM_getValue('b24365_showHiddenOption') !== undefined ? GM_getValue('b24365_showHiddenOption') : true)
        menu_items[0] = GM_registerMenuCommand(`${GM_getValue('b24365_showHiddenOption') ? '✅' : '❌'} 显示隐藏选项`, () => menuSwitch('b24365_showHiddenOption', '显示隐藏选项'))
        menu_items[1] = GM_registerMenuCommand('🔽 导出职位信息', () => {
            getjobsList()
        })
    }

    // 菜单项开关
    const menuSwitch = (index, name) => {
        if (GM_getValue(index) == true) {
            GM_setValue(index, false)
            GM_notification({
                text: `已关闭 [${name}] 功能\n（点击刷新网页后生效）`,
                timeout: 3500,
                onclick: () => {
                    location.reload()
                },
            })
        } else {
            GM_setValue(index, true)
            GM_notification({
                text: `已开启 [${name}] 功能\n（点击刷新网页后生效）`,
                timeout: 3500,
                onclick: () => {
                    location.reload()
                },
            })
        }
        registerMenu()
    }

    // 导出为CSV文件
    const saveCsv = content => {
        let blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' })
        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'jobs.csv'
        a.click()
    }

    // 导出职位列表
    const getjobsList = () => {
        let page_num = prompt('请输入需要导出的页数（默认为5）：')
        if (page_num === null) return
        page_num = parseInt(page_num) || 5
        let csv = '编号,职位名称,所在城市,薪资,学历要求,公司名称,公司规模,福利待遇,发布时间,更新时间,链接\n'
        let id = 1
        let fetchPromises = []
        for (let i = 1; i <= page_num; i++) {
            parameter.offset = i
            fetchPromises.push(
                fetchWithLimit(`/student/jobs/jobslist/ajax/?${new URLSearchParams(parameter).toString()}`)
                    .then(response => response.json())
                    .then(data => {
                        let jobList = data.data.list
                        for (let j = 0; j < jobList.length; j++) {
                            let salary = (() => {
                                if (jobList[j].lowMonthPay == 0 && jobList[j].highMonthPay == 0) {
                                    return '面议'
                                } else {
                                    return `${jobList[j].lowMonthPay}k-${jobList[j].highMonthPay}k`
                                }
                            })()
                            csv += `${id},${jobList[j].jobName},${jobList[j].areaCodeName},${salary},${jobList[j].degreeName},${jobList[j].recName},${jobList[j].recScale},${jobList[j].recTags},${timeStamp2timeStr(jobList[j].publishDate)},${timeStamp2timeStr(jobList[j].updateDate)},https://www.ncss.cn/student/jobs/${jobList[j].jobId}/detail.html\n`
                            id++
                        }
                    })
            )
        }
        Promise.all(fetchPromises).then(() => {
            saveCsv(csv)
        })
    }

    if (page === 'zwxx') {
        // 注册菜单
        registerMenu()

        // 显示隐藏选项
        if (GM_getValue('b24365_showHiddenOption')) {
            // 显示学历要求
            document.querySelector('#searchBar').style.display = 'flex'
            document.querySelector('.degree-box').className = 'btn-group btn-group-lg degree-box'
            GM_addStyle('.fixed-search-bar>.jobtype-box{display:none}')
        }

        // 添加下载按钮
        let toolbar = document.createElement('div')
        toolbar.className = 'b24365-toolbar'
        GM_addStyle('.b24365-toolbar{position:fixed;top:50%;z-index:1000;transform:translateX(-50%) translateY(-50%);transition:transform 0.3s ease-out}')
        GM_addStyle('.b24365-toolbar>div{display:flex;justify-content:center;align-items:center;cursor:pointer;margin-bottom:20px;padding:10px;background-color:rgba(255,255,255,0.6);border-radius:50%}')
        GM_addStyle('.b24365-toolbar:hover{transform:translateX(0) translateY(-50%)}')
        GM_addStyle('.b24365-toolbar:hover>div{background-color:rgba(255,255,255,1)}')
        GM_addStyle('.b24365-toolbar svg{width:24px;height:24px;fill:#666}')
        toolbar.innerHTML = `
        <div title="导出职位信息">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293V6.5z"/><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/></svg>
        </div>
        `
        document.body.appendChild(toolbar)
        document.querySelector('.b24365-toolbar>div[title="导出职位信息"]').addEventListener('click', () => {
            getjobsList()
        })
    }
})()
