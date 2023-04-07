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
    function getToken() {
        const token =  localStorage.getItem("token");
        return token.substring(1, token.length-1);
    }


    const id = GM_registerMenuCommand ("使用nPlayer播放", function(){
        const url = new URL(document.baseURI);
        const videoId = parseInt(url.pathname.substring(url.pathname.lastIndexOf("/")+1));
        const token = getToken();
        const apiUrl = `${url.origin}/api/videos/getPreUrl`
        const req = {
            method: "POST",
            url: apiUrl,
            headers: {
              "auth": token,
              "origin": url.origin,
              "Content-Type": "application/json"
            },
            data: JSON.stringify({
                videoId: videoId
            }),
            onload: function(response) {
                console.log("video real play url")
                console.log(response.responseText);

                // nplayer://
                const resp = JSON.parse(response.responseText)
                const url = new URL(resp.data.url)
                url.searchParams.delete("start")
                url.searchParams.delete("end");
                const link = url.href;
                console.log(link)
                GM_openInTab(`nplayer://${link}`)
            }
        };
        console.log(req)
        GM_xmlhttpRequest(req)
     }, "h");
})();

