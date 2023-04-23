if ($response.status == 200) {
    if ($request.url.indexOf('chat.openai.com/api/auth/session') != -1) {
        const data = JSON.parse($response.body);
        data.user.name = "风暴降生龙之母";
        data.user.email = "god@mail.com"
        $done({ status: $request.status, headers: $response.headers, body: JSON.stringify(data) })
    } else {
        $done({})
    }
} else if ($request.url.indexOf("chat.openai.com/backend-api/accounts/check") != -1) {
    const data = JSON.parse($response.body);
    data.account_plan.was_paid_customer = true;
    data.account_plan.is_paid_subscription_active = true;
    $done({ status: $request.status, headers: $response.headers, body: JSON.stringify(data) })
} else {
    $done({})
}

// 💄 ChatGPT个性化 = type=http-response, pattern=^https:\/\/chat\.openai\.com\/api, script-path=https://raw.githubusercontent.com/ourfor/TampermonkeyScript/master/ChatGPTCustom.js, requires-body=true, timeout=10, enable=true