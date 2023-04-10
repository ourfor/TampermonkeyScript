// ==UserScript==
// @name         nPlayer播放器
// @namespace    https://stay.app/
// @version      0.1
// @icon         https://static.ourfor.top/app/nplayer/nplayer.png
// @description  使用外部播放器播放
// @author       ourfor
// @match        *://*/*
// @require      https://cdn.plyr.io/3.7.8/plyr.js
// @require      https://code.jquery.com/jquery-3.6.4.min.js
// @resource plyrStyle     https://cdn.plyr.io/3.7.8/plyr.css
// @resource nPlayerIcon   https://static.ourfor.top/app/nplayer/nplayer.png
// @resource plyrIcon      https://static.ourfor.top/app/plyr/plyr.png
// @resource refreshIcon   https://static.ourfor.top/app/shuaxin.png
// @resource dragIcon      https://static.ourfor.top/app/Concise.png
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_getResourceURL
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==
(function () {
    'use strict';
    // Your code here...
    const helper = {
        log: (...args) => {
            GM_log(...args);
            console.log(...args);
        },
        addMenu: (title, action, shotcut) => {
            GM_registerMenuCommand(title, action, shotcut);
        },
        addElement: (tag, option, parent = null) => {
            if (parent) {
                const element = document.createElement(tag, option)
                parent.appendChild(element)
                return element;
            } else {
                const element = document.createElement(tag, option)
                document.body.appendChild(element)
                return element;
            }
        },
        addStyle: (css) => {
            GM_addStyle(css)
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
        },
        randomString: (size = 32) => {
            const chs = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhijklmnoprstuvwxyz0123456789";
            const length = chs.length;
            let result = "";
            for (let i = 0; i < size; i++) {
                result += chs.charAt(Math.floor(Math.random() * length));
            }
            return result
        }
    };

    function addDrag(element, target) {
        const sourceElement = $(element);
        const targetElement = $(target ?? element)
        let isDragging = false;
        let startCoords = { x: 0, y: 0 };
        let dragOffset = { x: 0, y: 0 };
        const minBottom = $(window).height() - targetElement.height();
        const maxRight = $(window).width() - targetElement.width();

        // touchstart事件
        sourceElement.on("touchstart mousedown", function (event) {
            event.preventDefault();
            isDragging = true;
            startCoords.x = event.type === "touchstart" ? event.originalEvent.touches[0].pageX : event.pageX;
            startCoords.y = event.type === "touchstart" ? event.originalEvent.touches[0].pageY : event.pageY;
            dragOffset.x = targetElement.offset().left - startCoords.x;
            dragOffset.y = targetElement.offset().top - startCoords.y;
        });

        // touchmove事件
        sourceElement.on("touchmove mousemove", function (event) {
            event.preventDefault();
            if (isDragging) {
                const currentX = event.type === "touchmove" ? event.originalEvent.touches[0].pageX : event.pageX;
                const currentY = event.type === "touchmove" ? event.originalEvent.touches[0].pageY : event.pageY;
                let left = currentX + dragOffset.x;
                let top = currentY + dragOffset.y;
                targetElement.offset({
                    left,
                    top
                });
            }
        });

        // touchend事件
        sourceElement.on("touchend mouseup", function (event) {
            event.preventDefault();
            isDragging = false;
        });
    }


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
        return token.substring(1, token.length - 1);
    }
    function refreshToken() {
        const url = new URL(document.baseURI);
        const apiUrl = `${url.origin}/api/login/userReg`
        const mimeType = "application/json";
        const username = `${helper.randomString(10)}@mail.com`;
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
                "source": "pc",
                "channel": "P"
            }),
            onload: function (response) {
                helper.log("refresh token")
                helper.log(response.responseText);
                const res = JSON.parse(response.responseText)
                helper.write("token", res.data.token)
                setToken(`"${res.data.token}"`)
            }
        };
        helper.log(req)
        helper.fetch(req);
    }
    function realMediaSource(callback) {
        const url = new URL(document.baseURI);
        const isH5 = url.pathname.includes("h5.")
        let pathname = url.pathname;
        if (pathname.endsWith("/0")) pathname = pathname.substring(0, pathname.length - 2)
        const videoId = parseInt(pathname.substring(pathname.lastIndexOf("/") + 1));
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
            onload: function (response) {
                helper.log("video real play url")
                helper.log(response.responseText);

                const resp = JSON.parse(response.responseText)
                const url = new URL(resp.data.url)
                url.searchParams.delete("start")
                url.searchParams.delete("end");
                const link = url.href;
                callback(link)
            }
        };
        helper.log(req)
        helper.fetch(req)
    }
    function addPlayerContainer() {
        if (document.plyrContainer) return;
        const container = helper.addElement('div', {});
        container.id = "plyr-video-container"
        const video = helper.addElement('video', {}, container)
        video.id = "plyr-video"
        addDrag(container)
        document.plyrContainer = container;
    }
    function initPlayer() {
        if (window.plyrPlayer) return;
        const data = {
            type: "video",
            captions: { active: true, update: true, language: "zh" },
            sources: [
                {
                    src: ""
                }
            ]
        };
        const player = new Plyr("#plyr-video", data);
        window.plyrPlayer = player
    }
    function playWithPlyr() {
        helper.log("play with plyr");
        realMediaSource((link) => {
            const player = window.plyrPlayer;
            player.source = {
                type: 'video',
                sources: [
                    { src: link },
                ],
            };
            player.play();
        })
    }
    helper.addMenu("刷新Token", refreshToken, "l")
    function playWithNPlayer() {
        helper.log("play with nPlayer")
        realMediaSource((link) => {
            const nPlayerLink = `nplayer-${link}`;
            helper.log(link)
            helper.log(nPlayerLink);
            helper.open(nPlayerLink)
        })
    }
    helper.addMenu("使用nPlayer播放", playWithNPlayer, "h");
    const plyrStyle = helper.addElement('link', { type: "text/css" }, document.head);
    plyrStyle.rel = "stylesheet";
    plyrStyle.href = "https://cdn.plyr.io/3.7.8/plyr.css";
    helper.addStyle(`
     #player-menu {
        display: flex;
        position: fixed;
        transform: translate(0, -50%);
        min-height: 2.5em;
        width: 2.5em;
        background-color: rgba(241, 241, 241, 0.29);
        top: 50%;
        left: 0;
        border-radius: 0.4rem;
        flex-direction: column;
        z-index: 9999;
     }
     #player-menu > img, #player-menu > div {
        cursor: pointer;
     }
     #player-menu > img:first-child {
        margin-top: 0.25em;
     } 
     #player-menu > img:last-child {
        margin-top: 0.25em;
     } 
     #player-nPlayer, #player-plyr, #player-menu > div {
        width: 100%;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
     }
     #player-menu > div {
        font-size: 2.5em;
        background-color: transparent;
     }
     #plyr-video-container {
        position: fixed;
        width: 90%;
        min-height: 40%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
     } 
     #plyr-video {
        object-fit: fill;
     }
    `)
    const menuContainer = helper.addElement('div', {}, document.body)
    menuContainer.id = "player-menu";
    const nPlayerItem = helper.addElement('img', {}, menuContainer)
    nPlayerItem.id = "player-nPlayer"
    nPlayerItem.src = GM_getResourceURL("nPlayerIcon")
    $(nPlayerItem).on("click tap", (e) => {
        playWithNPlayer()
    });
    const plyrItem = helper.addElement('img', {}, menuContainer)
    plyrItem.id = "player-plyr"
    plyrItem.src = GM_getResourceURL("plyrIcon")
    $(plyrItem).on("click tap", (e) => {
        addPlayerContainer();
        initPlayer();
        playWithPlyr();
    });

    const refreshItem = helper.addElement('img', {}, menuContainer)
    refreshItem.id = "menu-refresh"
    refreshItem.src = GM_getResourceURL("refreshIcon")
    $(refreshItem).on("click tap", (e) => {
        refreshToken();
        alert("刷新成功")
    })

    const dragItem = helper.addElement('img', {}, menuContainer)
    dragItem.id = "menu-drag"
    dragItem.src = GM_getResourceURL("dragIcon")
    addDrag(dragItem, menuContainer)
})();

