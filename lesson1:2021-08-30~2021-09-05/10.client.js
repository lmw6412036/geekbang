const Request = require('./Request');
(async function () {
    const request = new Request({
        port: 8080,
        method: "GET",
        host: '127.0.0.1',
        path: '/',
        headers: {
            "X-Token": "token"
        },
        body: {
            name: 'lmw'
        }
    });
    let response = await request.send();
    console.log(response);
})()
