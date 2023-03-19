// ==UserScript==
// @name         自定义样式
// @author       仲夏夜之梦
// @namespace    https://github.com/ourfor/TampermonkeyScript/tree/master/StyleInject.js
// @description  网页注入自定义样式
// @version      1.00
// @license      BSD-3-Clause
// @include      *://*
// @exclude      /^(http|https).*((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/
// @icon         data:image/png;base64,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
// @noframes
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

(function () {
  'use strict'

  // Email md5 hash from gavatar
  const avatarHash = "da653d57f268f7297048c1c61adc4dd1"

  // 位置信息样式
  let positionStyle = null
  // 设置按钮位置
  function setButtonPosition() {
    if (positionStyle) positionStyle.parentNode.removeChild(positionStyle)
    positionStyle = GM_addStyle(`
      @font-face{font-family:AritaHeiti;src:local('AritaHeiti'),url(//static.ourfor.top/fonts/AritaHeiti-Medium.woff2);font-weight:400}@font-face{font-family:DankMono;font-style:normal;font-variant-ligatures:normal;src:local('DankMono Nerd Font'),url(//static.ourfor.top/fonts/DankMono-Regular.ttf);font-weight:400}@font-face{font-family:DankMono;font-style:italic;font-variant-ligatures:normal;src:local('DankMono Nerd Font'),url(//static.ourfor.top/fonts/DankMono-Italic.ttf);font-weight:400}a,p,div,span,li,ul{font-family:DankMono,AritaHeiti,sans-serif}
      .text-base .items-end .p-1>svg {display:none;}
      .text-base .items-end .p-1 {background-repeat: no-repeat;background-size:100%,100%;background-color: rgba(0,0,0,0) !important;background-image: url("//www.gravatar.com/avatar/${avatarHash}");}
    `)
  }

   // 初始化按钮位置
   setButtonPosition()
})()
