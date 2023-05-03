// ==UserScript==
// @name         重写响应
// @author       仲夏夜之梦
// @namespace    https://stay.app/
// @version      0.1
// @icon         https://static.ourfor.top/app/moshu.png
// @updateURL    https://raw.githubusercontent.com/ourfor/TampermonkeyScript/main/ResponseRewrite.js
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
        },
        read: (key, default_value) => {
            return GM_getValue(key, default_value)
        },
        write: (key, value) => {
            GM_setValue(key, value)
        }
    }

    const rewrites = [
        {
            pattern: /api\/auth\/session/,
            handle: (text) => {
                const data = JSON.parse(text);
                data.user.name = "风暴降生龙之母";
                data.user.email = "god@mail.com";
                return JSON.stringify(text);
            }
        },
        {
            pattern: /backend-api\/accounts\/check/,
            handle: (text) => {
                const data = JSON.parse(text);
                data.account_plan.is_paid_subscription_active = true;
                data.account_plan.was_paid_customer = true;
                helper.log(data)
                return JSON.stringify(data)
            }
        },
        {
            pattern: /videos\/getInfo/,
            handle: (text) => {
                const data = JSON.parse(text);
                helper.write(data.data.info.id, JSON.stringify(data.data.info));
                return text;
            }
        },
        {
            pattern: /videos\/getPreUrl/,
            handle: (text) => {
                const data = JSON.parse(text);
                const url = data.data.url.replace(/start=\d+&?/, "").replace(/end=\d+&?/, "");
                data.data.url = url;
                let info = helper.read(data.data.id, null)
                if (info) {
                    info = JSON.parse(info)
                    const item = {
                        vid: `fi11-${info.id}`,
                        name: info.name,
                        url
                    }
                    helper.fetch({
                        method: "POST",
                        url: "https://api.endeny.me/godbox/m3u8/info",
                        data: JSON.stringify(item),
                        headers: {
                            "Content-Type": "application/json"
                        },
                        onload: function (response) {
                            helper.log("[REWRITE] Response data");
                            helper.log(JSON.parse(response.responseText));
                        },
                        onerror: function (response) {
                            helper.log("[REWRITE] Error");
                            helper.log(response.responseText);
                        }
                    });
                }
                text = JSON.stringify(data);
                return text;
            }
        }
    ]

    const originalFetch = fetch;
    window.originalFetch = originalFetch;
    window.fetch = async function (url, options) {
        const response = await originalFetch(url, options);
        const isJSON = response.headers.get('content-type').includes('application/json');
        if (isJSON) {
            for (const { pattern, handle } of rewrites) {
                if (pattern.test(url)) {
                    helper.log(`[REWRITE] ${url}`);
                    const data = await response.text();
                    const newData = handle(data) ?? data; 
                    return new Response(newData, response);
                }
            }
        }
        return response;
    }

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (_, url) {
        const target = this;
        for (const { pattern, handle } of rewrites) {
            if (pattern.test(url)) {
                helper.log(`[REWRITE] ${url}`);
                const keys = ["response", "responseText"];
                keys.forEach(key => {
                    const getter = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, key).get;
                    Object.defineProperty(target, key, {
                        get: () => {
                            const result = getter.call(target);
                            return handle(result) ?? result;
                        }
                    });
                })
                break;
            }
        }
        return originalOpen.apply(target, arguments);
    }
})();