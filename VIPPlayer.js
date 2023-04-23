if ($response.status == 200) {
    if ($request.url.indexOf('videos/getInfo') != -1) {
        const data = JSON.parse($response.body);
        data.data.canPrePlay = true;
        $done({ status: $response.status, headers: $response.headers, body: JSON.stringify(data) })
    } else if ($request.url.indexOf('videos/getPreUrl') != -1) {
        const data = JSON.parse($response.body);
        const url = data.data.url.replace("start", "xstart").replace("end", "xend");
        data.data.url = url;
        $done({ status: $response.status, headers: $response.headers, body: JSON.stringify(data) })
    } else {
        $done({})
    }
} else {
    $done({})
}

// http-response ^https:\/\/.* script-path=https://raw.githubusercontent.com/ourfor/TampermonkeyScript/master/VIPPlayer.js, requires-body=true, timeout=10,tag=📺 VIP视频播放
