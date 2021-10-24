import {Evaluator} from "./evaluator.js";
import {parse} from "./SyntaxParser.js";

document.getElementById('runBtn').addEventListener('click', function () {
    let source = document.getElementById('source').value;
    let tree = parse(source);
    console.log(new Evaluator().evaluate(tree));
})
