class TrunkedBodyParser {
    constructor() {
        this.WATTING_LENGTH = 0;
        this.WATTING_LENGTH_LINE_END = 1;
        this.READING_TRUNK = 2;
        this.WAITING_NEN_LINE = 3;
        this.WATING_NEW_LINE_END = 4;
        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.current = this.WATTING_LENGTH
    }

    receiveChar(char) {
        if (this.current === this.WATTING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                }
                this.current = this.WATTING_LENGTH_LINE_END;
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if (this.current === this.WATTING_LENGTH_LINE_END) {
            if (char === '\n')
                this.current = this.READING_TRUNK;
        } else if (this.current === this.READING_TRUNK) {
            this.content.push(char);
            this.length--;
            if (this.length === 0)
                this.current = this.WAITING_NEN_LINE;
        } else if (this.current === this.WAITING_NEN_LINE) {
            if (char === '\r')
                this.current = this.WATING_NEW_LINE_END;
        } else if (this.current === this.WATING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = this.WATTING_LENGTH;
            }
        }
    }
}

module.exports = TrunkedBodyParser;
