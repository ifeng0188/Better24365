// ==UserScript==
// @name         Better24365
// @namespace    https://github.com/ifeng0188
// @version      0.1.0
// @description  更好的24365，让你更好地体验求职之旅
// @author       ifeng0188
// @match        *://*.ncss.cn/*
// @icon         https://t1.chei.com.cn/ncss/student/img/favicon.ico
// @grant        GM_addStyle
// @license      MIT License
// ==/UserScript==

;(function () {
    'use strict'

    const page = (() => {
        if (document.title.includes('职位信息')) return 'zwxx'
    })()

    if (page === 'zwxx') {
        // 显示学历要求
        document.querySelectorAll('#searchBar')[0].style.display = 'flex'
        document.querySelectorAll('.degree-box')[0].className = 'btn-group btn-group-lg degree-box'
        GM_addStyle('.fixed-search-bar .jobtype-box{display:none}')
    }
})()
