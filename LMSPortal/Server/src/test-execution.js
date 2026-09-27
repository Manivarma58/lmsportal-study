import { executeCode } from './services/codeExecutionService.js';

async function test() {
  console.log('--- 1. Testing JavaScript Valid Execution ---');
  const res1 = await executeCode({
    language: 'javascript',
    sourceCode: 'function solution(a, b) { return a + b; }',
    testCases: [
      { input: '[2, 3]', expectedOutput: '5', isHidden: false },
      { input: '[10, -5]', expectedOutput: '5', isHidden: true },
      { input: '[0, 0]', expectedOutput: '1', isHidden: false }, // Intentional fail
    ],
    timeLimit: 3000,
  });
  console.log('Status:', res1.status, '| Passed:', res1.passedTests, '/', res1.totalTests, '| Score:', res1.score);
  console.log('Test Results:', res1.testResults);

  console.log('\n--- 2. Testing JavaScript Timeout (Infinite Loop Protection) ---');
  const resTimeout = await executeCode({
    language: 'javascript',
    sourceCode: 'function solution(n) { while(true) {} }',
    testCases: [{ input: '5', expectedOutput: '5', isHidden: false }],
    timeLimit: 1500,
  });
  console.log('Timeout Status:', resTimeout.status, '| Error:', resTimeout.error);

  console.log('\n--- 3. Testing Python String Reverse ---');
  const resPy = await executeCode({
    language: 'python',
    sourceCode: 'def solution(s):\n    return s[::-1]',
    testCases: [
      { input: '"hello"', expectedOutput: '"olleh"', isHidden: false },
      { input: '"nova"', expectedOutput: '"avon"', isHidden: true },
    ],
    timeLimit: 3000,
  });
  console.log('Py Status:', resPy.status, '| Passed:', resPy.passedTests, '/', resPy.totalTests, '| Score:', resPy.score);
  console.log('Py Results:', resPy.testResults);
}

test();
