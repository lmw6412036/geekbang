function search(str) {
    let target = ['a', 'b', 'c', 'd', 'e', 'f'];
    let stack = [];
    for (let char of str) {
        if (target[stack.length] === char) {
            stack.push(target[stack.length]);
            if (stack.length === target.length) return true;
        } else {
            stack.splice(0);
            if (char === 'a') stack.push('a')
        }
    }
    return false;
}

console.log(search('ababcdeh'));
