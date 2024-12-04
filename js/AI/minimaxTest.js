import Node from './Node.js';
import Tree from './Tree.js';


// Tree Root (Depth 0)
const tr = new Tree(new Node(0, null));

// Depth 1
tr.addNode(new Node(1, 0));
tr.addNode(new Node(2, 0));
tr.addNode(new Node(3, 0));

// Depth 2
tr.addNode(new Node(4, 1));
tr.addNode(new Node(5, 1));
tr.addNode(new Node(6, 1));

tr.addNode(new Node(7, 2));
tr.addNode(new Node(8, 2));
tr.addNode(new Node(9, 2));

tr.addNode(new Node(10, 3));
tr.addNode(new Node(11, 3));
tr.addNode(new Node(12, 3));

// Depth 3
tr.addNode(new Node(13, 4, 8));
tr.addNode(new Node(14, 4, 2));
tr.addNode(new Node(15, 4, 2));

tr.addNode(new Node(16, 5, 7));
tr.addNode(new Node(17, 5, 4));
tr.addNode(new Node(18, 5, 1));

tr.addNode(new Node(19, 6, 3));
tr.addNode(new Node(20, 6, 3));
tr.addNode(new Node(21, 6, 3));


tr.addNode(new Node(22, 7, 1));
tr.addNode(new Node(23, 7, 2));
tr.addNode(new Node(24, 7, 5));

tr.addNode(new Node(25, 8, 3));
tr.addNode(new Node(26, 8, 1));
tr.addNode(new Node(27, 8, 2));

tr.addNode(new Node(28, 9, 6));
tr.addNode(new Node(29, 9, 1));
tr.addNode(new Node(30, 9, 4));


tr.addNode(new Node(31, 10, 9));
tr.addNode(new Node(32, 10, 9));
tr.addNode(new Node(33, 10, 9));

tr.addNode(new Node(34, 11, 1));
tr.addNode(new Node(35, 11, 8));
tr.addNode(new Node(36, 11, 9));

tr.addNode(new Node(37, 12, 9));
tr.addNode(new Node(38, 12, 1));
tr.addNode(new Node(39, 12, 0));



function evaluate(expected, actual) {
    if (actual === expected)
        return 'Passed';
    else
        return 'Failed';
}

let expected;
let actual;

const result = {
    '1.1.1': null,
    '1.1.2': null,
    '1.2.1': null,
    '1.2.2': null,
    '2.1.1': null,
    '2.1.2': null,
    '2.2.1': null,
    '2.2.2': null
}

console.log(`Scenario 1: Non-optimized Tree`);
console.log(`++ Sub-scenario 1.1: No Pruning`);
console.log(`---------------------------------------------------`);
console.log(`++++ Test Case 1.1.1: Final Value Returned`);
expected = 9;
console.log(`++++++ Expeted: ${expected}`);
actual = tr.minimax();
console.log(`++++++ Actual: ${actual}`);
result['1.1.1'] = evaluate(expected, actual);
console.log(`++++++ Test Case Result: ${result['1.1.1']}`);
console.log(`---------------------------------------------------`);
console.log(`++++ Test Case 1.1.2: Evaluated Nodes Count`);
expected = 27;
console.log(`++++++ Expeted: ${expected}`);
actual = tr.getMinimaxEvaluatedNodesCount();
console.log(`++++++ Actual: ${actual}`);
result['1.1.2'] = evaluate(expected, actual);
console.log(`++++++ Test Case Result: ${result['1.1.2']}`);

console.log(`****************************************************`);
console.log(`++ Sub-scenario 1.2: Pruning`);
console.log(`---------------------------------------------------`);
console.log(`++++ Test Case 1.2.1: Final Value Returned`);
expected = 9;
console.log(`++++++ Expeted: ${expected}`);
actual = tr.minimaxWithPruning();
console.log(`++++++ Actual: ${actual}`);
result['1.2.1'] = evaluate(expected, actual);
console.log(`++++++ Test Case Result: ${result['1.2.1']}`);
console.log(`---------------------------------------------------`);
console.log(`++++ Test Case 1.2.2: Evaluated Nodes Count`);
expected = 22;
console.log(`++++++ Expeted: ${expected}`);
actual = tr.getMinimaxWithPruningEvaluatedNodesCount();
console.log(`++++++ Actual: ${actual}`);
result['1.2.2'] = evaluate(expected, actual);
console.log(`++++++ Test Case Result: ${result['1.2.2']}`);

console.log(``);

console.log(`Scenario 2: Optimized Tree`);
tr.optimize();
console.log(`++ Sub-scenario 2.1: No Pruning`);
console.log(`---------------------------------------------------`);
console.log(`++++ Test Case 2.1.1: Final Value Returned`);
expected = 9;
console.log(`++++++ Expeted: ${expected}`);
actual = tr.minimax();
console.log(`++++++ Actual: ${actual}`);
result['2.1.1'] = evaluate(expected, actual);
console.log(`++++++ Test Case Result: ${result['2.1.1']}`);
console.log(`---------------------------------------------------`);
console.log(`++++ Test Case 2.1.2: Evaluated Nodes Count`);
expected = 27;
console.log(`++++++ Expeted: ${expected}`);
actual = tr.getMinimaxEvaluatedNodesCount();
console.log(`++++++ Actual: ${actual}`);
result['2.1.2'] = evaluate(expected, actual);
console.log(`++++++ Test Case Result: ${result['2.1.2']}`);

console.log(`****************************************************`);
console.log(`++ Sub-scenario 2.2: Pruning`);
console.log(`---------------------------------------------------`);
console.log(`++++ Test Case 2.2.1: Final Value Returned`);
expected = 9;
console.log(`++++++ Expeted: ${expected}`);
actual = tr.minimaxWithPruning();
console.log(`++++++ Actual: ${actual}`);
result['2.2.1'] = evaluate(expected, actual);
console.log(`++++++ Test Case Result: ${result['2.2.1']}`);
console.log(`---------------------------------------------------`);
console.log(`++++ Test Case 2.2.2: Evaluated Nodes Count`);
expected = 11;
console.log(`++++++ Expeted: ${expected}`);
actual = tr.getMinimaxWithPruningEvaluatedNodesCount();
console.log(`++++++ Actual: ${actual}`);
result['2.2.2'] = evaluate(expected, actual);
console.log(`++++++ Test Case Result: ${result['2.2.2']}`);


const testSummaryDiv = document.querySelector('.test-summary');
Object.keys(result).forEach((testCaseId) => {
    testSummaryDiv.innerHTML += `<div>Test Case ${testCaseId}: ${result[testCaseId]}</div>`;
});