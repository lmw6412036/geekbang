const net = require('net');
const ResponseParser = require("./ResponseParser");

class Request {
    constructor(options) {
        this.method = options.method || "GET";
        this.port = options.port || "80";
        this.host = options.host || "127.0.0.1";
        this.path = options.path || "/";
        this.body = options.body || {}
        this.headers = options.headers || {};
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        } else {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }
        this.headers['Content-Length'] = this.bodyText.length;
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`;
    }

    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser()
            if (connection) connection.write(this.toString())
            else connection = net.createConnection({
                host: this.host,
                port: this.port
            }, () => {
                console.log(this.toString());
                connection.write(this.toString())
            });

            connection.on('data', data => {
                console.log(data.toString());
                parser.receive(data.toString())
                if (parser.isFinished) resolve(parser.response);
                connection.end();
            })

            connection.on('error', (err) => {
                console.error(err);
                reject(err)
                connection.end()
            })
        })
    }
}

module.exports = Request;
