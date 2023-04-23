if ($response.status == 200) {
    if ($request.url.indexOf('chat.openai.com/api/auth/session') != -1) {
        $notification.post("ChatGPT 个性化", "", "");
        const data = JSON.parse($response.body);
        data.user.name = "风暴降生龙之母";
        data.user.email = "god@mail.com"
        $done({ status: 200, headers: $response.headers, body: JSON.stringify(data) })
    } else {
        $done({})
    }
} else {
    $done({})
}

// 💄 ChatGPT个性化 = type=http-response, pattern=^https:\/\/chat\.openai\.com\/api, script-path=https://raw.githubusercontent.com/ourfor/TampermonkeyScript/master/ChatGPTCustom.js, requires-body=true, timeout=10, enable=true