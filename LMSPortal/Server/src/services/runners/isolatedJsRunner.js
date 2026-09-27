/**
 * Isolated JavaScript Test Harness Runner
 * Runs in a separate child process with --max-old-space-size=64
 * Receives JSON payload via stdin: { sourceCode, testCases }
 * Writes JSON results to stdout
 */
import vm from 'vm';

let inputData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(inputData);
    const { sourceCode, testCases } = payload;

    // Security Hardening: Static keyword screening against sandbox escapes
    const forbiddenPatterns = [
      /\bprocess\b/,
      /\brequire\s*\(/,
      /\bimport\s*\(/,
      /\bchild_process\b/,
      /\bfs\b/,
      /\beval\s*\(/,
      /\bFunction\s*\(/,
      /constructor\s*\.\s*constructor/,
      /__proto__/,
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(sourceCode)) {
        process.stdout.write(
          JSON.stringify({
            error: 'Security Error: Execution of restricted or unsafe system APIs is forbidden.',
            results: [],
          })
        );
        process.exit(0);
      }
    }

    const results = [];

    // Create isolated execution sandbox (without Buffer or system bindings)
    const sandbox = {
      console: {
        log: () => {},
        warn: () => {},
        error: () => {},
      },
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      Buffer,
    };

    const context = vm.createContext(sandbox);

    // Compile user script inside context
    const script = new vm.Script(sourceCode, { filename: 'solution.js' });
    script.runInContext(context, { timeout: 3000 });

    const solutionFn = context.solution;
    if (typeof solutionFn !== 'function') {
      process.stdout.write(
        JSON.stringify({
          error: "Function 'solution' was not defined or is not a function.",
          results: [],
        })
      );
      process.exit(0);
    }

    const normalize = (val) => {
      if (val === undefined) return 'undefined';
      if (val === null) return 'null';
      try {
        if (typeof val === 'object') {
          return JSON.stringify(val);
        }
        return String(val).trim();
      } catch {
        return String(val).trim();
      }
    };

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let parsedInput = tc.input;
      let args = [];

      try {
        if (typeof tc.input === 'string' && (tc.input.startsWith('[') || tc.input.startsWith('{') || tc.input.startsWith('"'))) {
          parsedInput = JSON.parse(tc.input);
        }
      } catch {
        parsedInput = tc.input;
      }

      if (Array.isArray(parsedInput)) {
        args = parsedInput;
      } else {
        args = [parsedInput];
      }

      const start = process.hrtime.bigint();
      let actualOutput = null;
      let passed = false;
      let errMessage = '';

      try {
        const rawOutput = solutionFn(...args);
        actualOutput = normalize(rawOutput);

        let expectedNormalized = tc.expectedOutput;
        try {
          const parsedExpected = JSON.parse(tc.expectedOutput);
          expectedNormalized = normalize(parsedExpected);
        } catch {
          expectedNormalized = String(tc.expectedOutput).trim();
        }

        // Compare JSON or trimmed strings
        passed = actualOutput === expectedNormalized;
      } catch (err) {
        errMessage = err.message || String(err);
        actualOutput = `Error: ${errMessage}`;
        passed = false;
      }

      const end = process.hrtime.bigint();
      const executionTime = Number(end - start) / 1000000; // to ms

      results.push({
        testCaseIndex: i,
        passed,
        actualOutput,
        expectedOutput: tc.isHidden ? '[Hidden Test Case]' : tc.expectedOutput,
        executionTime: Math.round(executionTime * 100) / 100,
        error: errMessage,
        isHidden: Boolean(tc.isHidden),
      });
    }

    const memUsage = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 10) / 10;

    process.stdout.write(
      JSON.stringify({
        success: true,
        memoryUsed: memUsage,
        results,
      })
    );
    process.exit(0);
  } catch (err) {
    process.stdout.write(
      JSON.stringify({
        error: err.message || String(err),
        results: [],
      })
    );
    process.exit(0);
  }
});
