function search(str) {
    let a = false;
    for (let char of str) {
        if (char === 'a') {
            a = true
        } else if (a && char === 'b') {
            return true
        } else a = false;
    }
    return false;
}
