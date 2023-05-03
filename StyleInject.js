// ==UserScript==
// @name         自定义样式
// @author       仲夏夜之梦
// @namespace    https://stay.app/
// @icon         https://static.ourfor.top/app/kouhong.png  
// @updateURL    https://raw.githubusercontent.com/ourfor/TampermonkeyScript/main/StyleInject.js
// @description  网页注入自定义样式
// @version      1.00
// @license      BSD-3-Clause
// @include      *://*
// @exclude      /^(http|https).*((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/
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
  GM_addStyle(`
    @font-face{font-family:AritaHeiti;src:local('AritaHeiti'),url(//static.ourfor.top/fonts/AritaHeiti-Medium.woff2);font-weight:400}@font-face{font-family:DankMono;font-style:normal;font-variant-ligatures:normal;src:local('DankMono Nerd Font'),url(//static.ourfor.top/fonts/DankMono-Regular.ttf);font-weight:400}@font-face{font-family:DankMono;font-style:italic;font-variant-ligatures:normal;src:local('DankMono Nerd Font'),url(//static.ourfor.top/fonts/DankMono-Italic.ttf);font-weight:400}a,p,div,span,li,ul{font-family:DankMono,AritaHeiti,sans-serif}
    .text-base .items-end .p-1>svg {display:none;}
    .text-base .items-end .p-1 {background-repeat: no-repeat;background-size:100%,100%;background-color: rgba(0,0,0,0) !important;background-image: url("//www.gravatar.com/avatar/${avatarHash}");}
  `)

})()
