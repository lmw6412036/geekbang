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
                '</head>' +
                '<body>' +
                '<h1>表TI</h1>' +
                '</body>' +
                '</html>')
        })
})
    .listen(8080)
console.log('start on 8080');
