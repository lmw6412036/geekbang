const http = require('http');
http.createServer((request, response) => {
    let body = [];
    request.on('error', err => console.error(err))
        .on('data', chunk => body.push(chunk))
        .on('end', () => {
            console.log('body：', Buffer.concat(body).toString());
            response.setHeader("Content-Type", "text/html");
            response.setHeader("X-Token", "lmw");
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.end(`<html lang="en">
<head>
<title>demo</title>
<style>
    #main{
        display:flex;
        width: 500px;
        height: 300px;
        background-color: rgb(255,255,255);
    }
    .c1{
        width: 200px;
        height: 100px;
        background-color: rgb(255,0,0);
    }
    .c2{
        flex: 1;
        background-color: rgb(0,255,0);
    }
</style>
</head>
<body>
<div id="main">
    <div class="c1"></div>
    <div class="c2"></div>
</div>
</body>
</html>`)
        })
})
    .listen(8080)


