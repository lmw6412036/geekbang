const http = require('http');
http.createServer((request, response) => {
    let body = [];
    request.on('error', err => console.error(err))
        .on('data', chunk => body.push(chunk))
        .on('end', () => {
            console.log('body：', Buffer.concat(body).toString());
            response.writeHead(200, {"Content-Type": "text/html"});
            response.end("hello,word")
        })
})
    .listen(8080)
console.log('start on 8080');
