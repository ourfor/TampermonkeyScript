// ==UserScript==
// @name         重写响应
// @namespace    https://stay.app/
// @version      0.1
// @icon         https://static.ourfor.top/app/nplayer/nplayer.png
// @description  重写响应
// @author       ourfor
// @match        *://*/*
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
    const helper = {
        log: (...args) => {
            GM_log(...args);
            console.log(...args);
        },
        fetch: (...args) => {
            GM_xmlhttpRequest(...args);
        }
    }
    const originalFetch = fetch;
    window.originalFetch = originalFetch;
    window.fetch = async function (url, options) {
        helper.log(`Fetch request: ${url}`);
        const response = await originalFetch(url, options);
        helper.log(`Fetch response: ${response.status} ${response.statusText}`);
        const isJSON = response.headers.get('content-type').includes('application/json');
        const isUrlMatch = url.endsWith("check");
        if (isJSON && isUrlMatch) {
            const data = await response.json();
            data["account_plan"]["is_paid_subscription_active"] = true;
            helper.log(data)
            const newData = JSON.stringify(data);
            const newResponse = new Response(newData, response);
            return newResponse;
        }
        return response;
    }

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (_, url) {
        const target = this;
        if (url.indexOf("videos/getInfo") != -1) {
            helper.log(url)
            const keys = ["response", "responseText"];
            keys.forEach(key => {
                const getter = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, key).get;
                Object.defineProperty(target, key, {
                    get: () => {
                        let result = getter.call(target);
                        const data = JSON.parse(result);
                        localStorage.setItem(data.data.info.id, JSON.stringify(data.data.info))
                        return result;
                    }
                });
            })
        } else if (url.indexOf("videos/getPreUrl") != -1) {
            helper.log(url)
            const keys = ["response", "responseText"];
            keys.forEach(key => {
                const getter = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, key).get;
                Object.defineProperty(target, key, {
                    get: () => {
                        let result = getter.call(target);
                        const data = JSON.parse(result);
                        const url = data.data.url.replace(/start=\d+&?/, "").replace(/end=\d+&?/, "");
                        data.data.url = url;
                        let info = localStorage.getItem(data.data.id)
                        if (info) {
                            info = JSON.parse(info)
                            const item = {
                                vid: `fi11-${info.id}`,
                                name: info.name,
                                url
                            }
                            helper.log(item)
                            helper.fetch({
                                method: "POST",
                                url: "https://api.endeny.me/godbox/m3u8/info",
                                data: JSON.stringify(item),
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                onload: function(response) {
                                    console.log("Response data:", response.responseText);
                                },
                                onerror: function(response) {
                                    console.error("Error:", response);
                                }
                            });
                        }
                        result = JSON.stringify(data);
                        return result;
                    }
                });
            })
        }
        return originalOpen.apply(target, arguments);
    }
})();