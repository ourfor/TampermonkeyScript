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
// ==/UserScript==
(function () {
    'use strict';
    // Your code here...
    GM_log("nPlayer plugin")
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

    function log(args) {
        GM_log(args)
        console.log(args)
    }

    const id = GM_registerMenuCommand ("使用nPlayer播放", () => {
        log("open with nPlayer")
        const url = new URL(document.baseURI);
        const isH5 = url.pathname.includes("h5.")
        let pathname = url.pathname;
        if (pathname.endsWith("/0")) pathname = pathname.substring(0, pathname.length-2)
        const videoId = parseInt(pathname.substring(pathname.lastIndexOf("/")+1));
        const token = getToken(isH5);
        const apiUrl = `${url.origin}/api/videos/getPreUrl`
        const req = {
            method: "POST",
            url: apiUrl,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "content-type": "application/json; charset=utf-8",
              "auth": token,
              "origin": url.origin
            },
            data: JSON.stringify({
                videoId: videoId
            }),
            onload: function(response) {
                log("video real play url")
                log(response.responseText);

                // nplayer://
                const resp = JSON.parse(response.responseText)
                const url = new URL(resp.data.url)
                url.searchParams.delete("start")
                url.searchParams.delete("end");
                const link = url.href;
                log(link)
                GM_openInTab(`nplayer://${link}`)
            }
        };
        log(req)
        GM_xmlhttpRequest(req)
     }, "h");
})();

