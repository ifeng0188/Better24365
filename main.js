// ==UserScript==
// @name         Better24365
// @namespace    https://github.com/ifeng0188
// @version      0.1.0
// @description  更好的24365，让你更好地体验求职之旅
// @author       ifeng0188
// @match        *://*.ncss.cn/*
// @icon         https://t1.chei.com.cn/ncss/student/img/favicon.ico
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_addStyle
// @license      MIT License
// ==/UserScript==

;(function () {
    'use strict'

    const page = (() => {
        if (document.title.includes('职位信息')) return 'zwxx'
    })()

    const registerMenu = () => {
        GM_setValue('b24365_showHiddenOption', GM_getValue('b24365_showHiddenOption') !== undefined ? GM_getValue('b24365_showHiddenOption') : true)
        GM_registerMenuCommand(`${GM_getValue('b24365_showHiddenOption') ? '✅' : '❌'} 显示隐藏选项`, () => {
            if (GM_getValue('b24365_showHiddenOption') == true) {
                GM_setValue('b24365_showHiddenOption', false)
                GM_notification({
                    text: `已关闭 [显示隐藏选项] 功能\n（点击刷新网页后生效）`,
                    timeout: 3500,
                    onclick: () => {
                        location.reload()
                    },
                })
            } else {
                GM_setValue('b24365_showHiddenOption', true)
                GM_notification({
                    text: `已开启 [显示隐藏选项] 功能\n（点击刷新网页后生效）`,
                    timeout: 3500,
                    onclick: () => {
                        location.reload()
                    },
                })
            }
            registerMenu()
        })
        GM_registerMenuCommand('⏏ 导出职位信息', () => {
            let page_num = prompt('请输入需要导出的页数（默认为5）：')
            if (page_num === null) return
            page_num = parseInt(page_num) || 5
            getjobsList(page_num)
        })
    }

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

    const saveCsv = content => {
        let blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' })
        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'jobs.csv'
        a.click()
    }

    // 获取职位列表
    const getjobsList = (page_num = 1) => {
        let csv = '编号,职位名称,所在城市,薪资,学历要求,公司名称,公司规模,福利待遇,发布时间,更新时间,链接\n'
        let id = 1
        let fetchPromises = []
        for (let i = 1; i <= page_num; i++) {
            parameter.offset = i
            fetchPromises.push(
                fetch(`/student/jobs/jobslist/ajax/?${new URLSearchParams(parameter).toString()}`)
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
                            csv += `${id},${jobList[j].jobName},${jobList[j].areaCodeName},${salary},${jobList[j].degreeName},${jobList[j].recName},${jobList[j].recScale},${jobList[j].recTags},${timeStamp2timeStr(jobList[j].publishDate)},${timeStamp2timeStr(jobList[j].updateDate)},https://www.ncss.cn/student/jobs/${jobList[j].jobId}/detail.html\n` // prettier-ignore
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
            document.querySelectorAll('#searchBar')[0].style.display = 'flex'
            document.querySelectorAll('.degree-box')[0].className = 'btn-group btn-group-lg degree-box'
            GM_addStyle('.fixed-search-bar .jobtype-box{display:none}')
        }
    }
})()
