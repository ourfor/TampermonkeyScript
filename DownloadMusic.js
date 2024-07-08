// ==UserScript==
// @name         重写响应
// @author       仲夏夜之梦
// @namespace    https://stay.app/
// @version      0.3
// @icon         https://raw.githubusercontent.com/ourfor/TampermonkeyScript/main/icon/rewrite.png
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
// @grant        GM_log
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
        info: (...args) => {
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
        },
        get: (key) => {
            localStorage.getItem(key)
        },
        set: (key, value) => {
            localStorage.setItem(key, value)
        }
    }

    function makeVideoModel(url) {
        const $ = document.querySelector.bind(document)
        const poster = $(".player .bg-overlay .el-image .el-image__inner")?.src ?? $(".van-image > img").dataset["src"]
        const title = $(".article-title")?.innerText
        const releaseDate = $(".player>div>.flex>div>span:nth-child(2)")?.innerText
        const tags = $(".player>div>.flex>div:nth-child(3)")?.innerText.split("\n")
        return {
            url,
            poster,
            title,
            releaseDate,
            tags
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
            pattern: /v_pan_code_anti\.htm/,
            handle: (text) => {
                helper.log("music download")
                const json = JSON.parse(text)
                const ele = document.createElement("span")
                ele.innerHTML = json.message
                const style = ele.children[0]
                const visibles = style.innerHTML.replaceAll(/\.([^\{]+?)\{display:inline[^}]*\}.*/g, "$1").split(",")
                const code = [...ele.children].filter((e, i) => i != 0 && visibles.some(a => a.endsWith(e.className))).map(e => e.innerText).join("")
                const link = [...document.querySelectorAll(`.alert.alert-success`)].map(item => item.querySelector("a")).filter(item => item != null).map(item => item.href).pop()
                const final = `https://vercel-chi-kohl.vercel.app/lanzouyunapi.php?data=${link}&pw=${code}&redirect=1`
                helper.log(final)
                const download = document.createElement('a')
                download.href = final
                download.click()
                helper.log(code)
                return text;
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
                data.data.canPrePlay = true;
                data.data.canPlay = false;
                helper.write(data.data.info.id, JSON.stringify(data.data.info));
                return JSON.stringify(data);
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
                    const model = makeVideoModel(url)
                    const item = {
                        name: `fi11-${info.id}`,
                        data: {
                            title: info.title,
                            info,
                            ...model,
                        },
                        downloaded: false
                    }
                    helper.log(item)
                    helper.fetch({
                        method: "POST",
                        url: "https://api.endemy.me/api/media",
                        data: JSON.stringify(item),
                        headers: {
                            "Content-Type": "application/json"
                        },
                        onload: function (response) {
                            helper.log("[REWRITE] Response data");
                            const isJSON = response.responseHeaders.includes('application/json');
                            const data = isJSON ? JSON.parse(response.responseText) : response.responseText;
                            helper.log(data);
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
        const isJSON = response.headers.get('content-type')?.includes('application/json');
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
    XMLHttpRequest.prototype.open = function (method, url) {
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
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (k, v) => {
        if (k === "preInfo" || k === "visitorInfo") {
            helper.log(`[LOCALSTORAGE] ${k}=${v}`);
            v = v.replace(/"count":"\d+"/, '"count":"0"').replace(/"preNum":"\d+"/, '"preNum":"99999"').replace(/"payStatus":false/, '"payStatus":false');
        }
        return originalSetItem.call(localStorage, k, v);
    };
})();