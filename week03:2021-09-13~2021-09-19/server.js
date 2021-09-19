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
    div {
        border:solid 1px black;
    }
    #main{
        align-items:center;display:flex;width:500px;justify-content:space-around;
    }
    .c1{
        flex:1;width:100px;height:70px;
    }
    .c2{
        width:200px;height:50px;
    }
    .c3{
        width:200px;height:100px;
    }
</style>
</head>
<body>
<div id="main">
    <div class="c1"></div>
    <div class="c2"></div>
    <div class="c3"></div>
</div>
</body>
</html>`)
        })
})
    .listen(8080)


