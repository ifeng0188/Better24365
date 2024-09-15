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
        })
    }

    if (page === 'zwxx') {
        // 显示隐藏选项
        if (GM_getValue('b24365_showHiddenOption')) {
            // 显示学历要求
            document.querySelectorAll('#searchBar')[0].style.display = 'flex'
            document.querySelectorAll('.degree-box')[0].className = 'btn-group btn-group-lg degree-box'
            GM_addStyle('.fixed-search-bar .jobtype-box{display:none}')
        }
    }
})()
