const Request = require('./Request');
const {parseHTML} = require("./parser");
const images = require("images");
const render = require("./render");
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
    const dom = parseHTML(response.body);
    //console.log(JSON.stringify(dom.children[0].children[3].children[1].children[1], null, '    '));
    const viewport = images(800, 600);
    render(viewport, dom);
    viewport.save('viewport.jpg');
})()
