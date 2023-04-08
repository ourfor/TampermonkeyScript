// ==UserScript==
// @name         nPlayer播放器
// @namespace    https://stay.app/
// @version      0.1
// @icon         https://static.ourfor.top/app/nplayer/nplayer.png
// @description  使用nPlayer播放
// @author       ourfor
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
(function () {
    'use strict';
    // Your code here...
    function randomString(e) {    
        e = e || 32;
        const chs = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        const length = chs.length;
        let n = "";
        for (let i = 0; i < e; i++) n += chs.charAt(Math.floor(Math.random() * length));
        return n
    }
    const helper = {
        log: (...args) => {
            GM_log(...args);
            console.log(...args);
        },
        addMenu: (title, action, shotcut) => {
            GM_registerMenuCommand(title, action, shotcut);
        },
        fetch: (...args) => {
            GM_xmlhttpRequest(...args);
        },
        open: (...args) => {
            GM_openInTab(...args);
        },
        read: (key, default_value) => {
            return GM_getValue(key, default_value)
        },
        write: (key, value) => {
            GM_setValue(key, value)
        }
    };

    helper.log("nPlayer plugin")
    function setToken(value) {
        const size = localStorage.length;
        let key = "";
        for (let i = 0; i < size; i++) {
            key = localStorage.key(i);
            if (key.endsWith("token")) {
                break;
            }
        }
        localStorage.setItem(key, value);
    }
    function getToken(isH5) {
        const size = localStorage.length;
        let key = "";
        for (let i = 0; i < size; i++) {
            key = localStorage.key(i);
            if (key.endsWith("token")) {
                break;
            }
        }
        const token = localStorage.getItem(key);
        return token.substring(1, token.length-1);
    }

    helper.addMenu("刷新Token", () => {
        const url = new URL(document.baseURI);
        const apiUrl = `${url.origin}/api/login/userReg`
        const mimeType = "application/json";
        const username = `${randomString(10)}@mail.com`;
        const password = "89LRBsPjz1IvE4w2eHIM+A=="
        const req = {
            method: "POST",
            url: apiUrl,
            headers: {
              "Content-Type": mimeType,
              "origin": url.origin
            },
            overrideMimeType: mimeType,
            data: JSON.stringify({
                "user_login": username,
                "user_pass": password,
                "source":"pc",
                "channel":"P"
            }),
            onload: function(response) {
                helper.log("refresh token")
                helper.log(response.responseText);
                const res = JSON.parse(response.responseText)
                helper.write("token", res.data.token)
                setToken(`"${res.data.token}"`)
            }
        };
        helper.log(req)
        helper.fetch(req);
    }, "l")

    helper.addMenu("使用nPlayer播放", () => {
        helper.log("open with nPlayer")
        const url = new URL(document.baseURI);
        const isH5 = url.pathname.includes("h5.")
        let pathname = url.pathname;
        if (pathname.endsWith("/0")) pathname = pathname.substring(0, pathname.length-2)
        const videoId = parseInt(pathname.substring(pathname.lastIndexOf("/")+1));
        const token = helper.read("token");
        const apiUrl = `${url.origin}/api/videos/getPreUrl`
        const mimeType = "application/json";
        const req = {
            method: "POST",
            url: apiUrl,
            headers: {
              "Content-Type": mimeType,
              "auth": token,
              "origin": url.origin
            },
            overrideMimeType: mimeType,
            data: JSON.stringify({
                videoId: videoId
            }),
            onload: function(response) {
                helper.log("video real play url")
                helper.log(response.responseText);

                // nplayer://
                const resp = JSON.parse(response.responseText)
                const url = new URL(resp.data.url)
                url.searchParams.delete("start")
                url.searchParams.delete("end");
                const link = url.href;
                const nPlayerLink = `nplayer-${link}`;
                helper.log(link)
                helper.log(nPlayerLink);
                helper.open(nPlayerLink)
            }
        };
        helper.log(req)
        helper.fetch(req)
     }, "h");
})();

