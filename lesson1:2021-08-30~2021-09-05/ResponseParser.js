const TrunkedBodyParser = require('./TrunkedBodyParser');

class ResponseParser {
    constructor() {
        this.WATTING_STATUS_LINE = 0;
        this.WATTING_STATUS_LINE_END = 1;
        this.WATTING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WATING_EADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WATTING_HEADER_BL0CK_END = 6;
        this.WATING_BODY = 7;
        this.current = this.WATTING_STATUS_LINE;
        this.statusLine = "";
        this.headers = {};
        this.headerName = '';
        this.headerVaLue = '';
        this.bodyParser = null;
    }

    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }

    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(str) {
        for (let i = 0; i < str.length; i++) {
            this.receiveChar(str.charAt(i));
        }
    }

    receiveChar(char) {
        if (this.current === this.WATTING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WATTING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if (this.current === this.WATTING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WATTING_HEADER_NAME;
            }
        } else if (this.current === this.WATTING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE
            } else if (char === '\r') {
                this.current = this.WATTING_HEADER_BL0CK_END
                if (this.headers['Transfer-Encoding'] === 'chunked')
                    this.bodyParser = new TrunkedBodyParser();
            } else {
                this.headerName += char;
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === '') {
                this.current = this.WATING_EADER_VALUE;
            }
        } else if (this.current === this.WATING_EADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerVaLue;
                this.headerName = '';
                this.headerVaLue = '';
            } else {
                this.headerVaLue += char;
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = this.WATTING_HEADER_NAME;
            } else if (this.current === this.WATTING_HEADER_BL0CK_END) {
                if (char === '\n') {
                    this.current = this.WATING_BODY;
                } else if (this.current === this.WATING_BODY) {
                    this.bodyParser.receiveChar(char);
                }
            }
        }
    }
}

module.exports = ResponseParser;
