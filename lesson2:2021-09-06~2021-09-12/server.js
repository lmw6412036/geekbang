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
            response.end('<html lang="en">' +
                '<head>' +
                '<title>demo</title>' +
                '<style type="text/css">' +
                'h1{color: red}' +
                'p span{color: blue}' +
                '</style>' +
                '</head>' +
                '<body>' +
                '<h1>表TI</h1>' +
                '<p><span>在呢</span></p>' +
                '</body>' +
                '</html>')
        })
})
    .listen(8080)
console.log('start on 8080');
