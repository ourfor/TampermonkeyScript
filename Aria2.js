// ==UserScript==
// @name         Aria2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Offline download
// @author       You
// @match        https://*/*
// @icon         https://aria2.endeny.me/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const elements = document.querySelectorAll(".control>a.button.is-primary")
    elements.forEach(element => {
        element.onclick = (e) => {
            e.preventDefault();
            const url = element.href
            const data = {urls: [url]}
            fetch("https://api.endeny.me/godbox/aria2/download", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if ("Notification" in window) {
                Notification.requestPermission().then(function (permission) {
                    if (permission === "granted") {
                        const notification = new Notification("下载中", {
                            body: url,
                            icon: "https://aria2.endeny.me/favicon.ico"
                        });
                    }
                });
            }
        }
    })
})();