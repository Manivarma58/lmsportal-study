import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import CodingChallenge from './models/CodingChallenge.js';
import Skill from './models/Skill.js';
import User from './models/User.js';

dotenv.config();

export const INITIAL_CHALLENGES = [
  {
    title: 'Node.js Authentication Lab',
    slug: 'node-js-authentication-lab',
    description: `### Problem Description
Implement an authentication token validator function for a secure Node.js microservice.

Your function \`solution(header, expectedIssuer)\` must inspect the incoming HTTP \`Authorization\` header and return an object indicating validation status.

#### Requirements:
1. If the header does not begin with \`"Bearer "\`, return:
   \`{ "valid": false, "error": "Missing or malformed Authorization header" }\`
2. Extract the base64-encoded token string. The token has 2 dot-separated parts: \`payload.signature\` (e.g., \`eyJ1c2VySWQiOiAiMTIzIiwgImlzc3VlciI6ICJub3ZhLWxtcyJ9.sig123\`).
3. Decode the payload JSON.
4. If \`payload.issuer\` does NOT strictly equal \`expectedIssuer\`, return:
   \`{ "valid": false, "error": "Invalid token issuer" }\`
5. If valid, return:
   \`{ "valid": true, "userId": payload.userId }\`

#### Constraints:
- Non-empty strings for header and expectedIssuer
- Time Limit: 3000ms`,
    difficulty: 'Medium',
    category: 'Backend Architecture',
    supportedLanguages: ['javascript', 'python', 'cpp', 'c', 'java', 'sql', 'mysql'],
    starterCode: {
      javascript: `/**
 * Validates incoming Authorization header and verifies token payload.
 * @param {string} header - e.g. "Bearer <token>"
 * @param {string} expectedIssuer - Expected issuer identifier
 * @return {object} - { valid: boolean, userId?: string, error?: string }
 */
function solution(header, expectedIssuer) {
  // TODO: Check header format, decode base64 payload, and verify issuer
  
}`,
      python: `def solution(header: str, expected_issuer: str) -> dict:
    """
    Validate incoming authorization header and token payload.
    :param header: HTTP Authorization header string
    :param expected_issuer: Target issuer string
    :return: Dictionary indicating validation result
    """
    # TODO: Check header format, decode base64 payload, and verify issuer
    pass
`,
      cpp: `#include <iostream>
#include <string>

class Solution {
public:
    // TODO: Implement token authorization validator
    bool validateAuth(const std::string& header, const std::string& expectedIssuer) {
        // Write your solution here
        return false;
    }
};
`,
      c: `#include <stdio.h>
#include <stdbool.h>
#include <string.h>

// TODO: Implement authorization header validation
bool solution(const char* header, const char* expected_issuer) {
    // Write your solution here
    return false;
}
`,
      java: `import java.util.*;

public class Solution {
    /**
     * Validates authorization header and token issuer.
     */
    public Map<String, Object> solution(String header, String expectedIssuer) {
        Map<String, Object> result = new HashMap<>();
        // TODO: Write your implementation here
        
        return result;
    }
}
`,
      sql: `-- SQL: Validate incoming authorization records
-- Schema: auth_tokens (id INT, header VARCHAR(255), issuer VARCHAR(100), user_id VARCHAR(50))
SELECT 
    header,
    issuer,
    user_id
FROM auth_tokens
-- TODO: Filter valid tokens matching issuer
WHERE 1 = 1;
`,
      mysql: `-- MySQL 8.0: Validate authorization tokens
-- Schema: auth_tokens (id INT, header VARCHAR(255), issuer VARCHAR(100), user_id VARCHAR(50))
SELECT 
    header,
    issuer,
    user_id
FROM auth_tokens
-- TODO: Filter valid tokens matching issuer
WHERE 1 = 1;
`,
    },
    testCases: [
      {
        input: '["Bearer eyJ1c2VySWQiOiAiVVNSLTAxIiwgImlzc3VlciI6ICJub3ZhLWxtcyJ9.sig_alpha", "nova-lms"]',
        expectedOutput: '{"valid":true,"userId":"USR-01"}',
        isHidden: false,
        explanation: 'Valid token with matching issuer',
      },
      {
        input: '["Basic dXNlcjpwYXNz", "nova-lms"]',
        expectedOutput: '{"valid":false,"error":"Missing or malformed Authorization header"}',
        isHidden: false,
        explanation: 'Non-Bearer auth scheme rejected',
      },
      {
        input: '["Bearer eyJ1c2VySWQiOiAiVVNSLTAyIiwgImlzc3VlciI6ICJmb3JlaWduLWlkcCJ9.sig_beta", "nova-lms"]',
        expectedOutput: '{"valid":false,"error":"Invalid token issuer"}',
        isHidden: true,
        explanation: 'Mismatched issuer rejected',
      },
      {
        input: '["Bearer eyJ1c2VySWQiOiAiVVNSLTk5OSIsICJpc3N1ZXIiOiAibm92YS1sbXMifQ.sig_gamma", "nova-lms"]',
        expectedOutput: '{"valid":true,"userId":"USR-999"}',
        isHidden: true,
        explanation: 'Deep verify userId USR-999',
      },
    ],
    timeLimit: 3000,
    memoryLimit: 128,
    skillSlugs: ['node-js', 'javascript'],
  },
  {
    title: 'Two Sum Target Array',
    slug: 'two-sum-target-array',
    description: `### Problem Description
Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input has exactly one solution, and you may not use the same element twice. You can return the answer in any order.

#### Example 1:
\`\`\`
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] == 9, so return [0, 1].
\`\`\`

#### Constraints:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- Exactly one valid answer exists.`,
    difficulty: 'Easy',
    category: 'Algorithms & Data Structures',
    supportedLanguages: ['javascript', 'python', 'cpp', 'c', 'java', 'sql', 'mysql'],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
  // TODO: Return indices of the two numbers such that they add up to target
  
}`,
      python: `def solution(nums: list[int], target: int) -> list[int]:
    # TODO: Return indices of the two numbers such that they add up to target
    pass
`,
      cpp: `#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // TODO: Return indices of the two numbers that add up to target
        return {};
    }
};
`,
      c: `#include <stdio.h>
#include <stdlib.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // TODO: Write your solution here
    *returnSize = 0;
    return NULL;
}
`,
      java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // TODO: Return indices of the two numbers that add up to target
        return new int[]{};
    }
}
`,
      sql: `-- Given table 'numbers' (id INT PRIMARY KEY, val INT)
-- Find a pair of IDs where sum of val equals :target
SELECT a.id AS idx1, b.id AS idx2
FROM numbers a
JOIN numbers b ON a.id < b.id
-- TODO: Filter where a.val + b.val = target
LIMIT 1;
`,
      mysql: `-- MySQL 8.0: Two Sum Indices
-- Schema: numbers (id INT PRIMARY KEY, val INT)
SELECT a.id AS idx1, b.id AS idx2
FROM numbers a
INNER JOIN numbers b ON a.id < b.id
-- TODO: Filter where a.val + b.val = target
LIMIT 1;
`,
    },
    testCases: [
      {
        input: '[[2, 7, 11, 15], 9]',
        expectedOutput: '[0,1]',
        isHidden: false,
        explanation: 'Basic case: 2 + 7 = 9',
      },
      {
        input: '[[3, 2, 4], 6]',
        expectedOutput: '[1,2]',
        isHidden: false,
        explanation: '2 + 4 = 6',
      },
      {
        input: '[[3, 3], 6]',
        expectedOutput: '[0,1]',
        isHidden: true,
        explanation: 'Identical numbers: 3 + 3 = 6',
      },
      {
        input: '[[-10, 20, 30, 40], 30]',
        expectedOutput: '[0,3]',
        isHidden: true,
        explanation: 'Negative numbers: -10 + 40 = 30',
      },
    ],
    timeLimit: 2000,
    memoryLimit: 64,
    skillSlugs: ['javascript', 'react'],
  },
  {
    title: 'Valid Parentheses & Bracket Matching',
    slug: 'valid-parentheses-bracket-matching',
    description: `### Problem Description
Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

#### Constraints:
- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'\`.`,
    difficulty: 'Easy',
    category: 'Algorithms & Data Structures',
    supportedLanguages: ['javascript', 'python', 'cpp', 'c', 'java', 'sql', 'mysql'],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function solution(s) {
  // TODO: Determine if brackets are properly closed and in valid order
  
}`,
      python: `def solution(s: str) -> bool:
    # TODO: Determine if brackets are properly closed and in valid order
    pass
`,
      cpp: `#include <string>
#include <stack>

class Solution {
public:
    bool isValid(std::string s) {
        // TODO: Determine if brackets are properly closed
        return false;
    }
};
`,
      c: `#include <stdbool.h>
#include <string.h>

bool isValid(char* s) {
    // TODO: Determine if brackets are properly closed
    return false;
}
`,
      java: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // TODO: Determine if brackets are properly closed
        return false;
    }
}
`,
      sql: `-- Bracket Matching Evaluation
-- Schema: bracket_logs (id INT, sequence VARCHAR(255))
SELECT id, sequence
FROM bracket_logs
-- TODO: Write verification query
;
`,
      mysql: `-- MySQL 8.0: Bracket Matching Evaluation
-- Schema: bracket_logs (id INT, sequence VARCHAR(255))
SELECT id, sequence
FROM bracket_logs
-- TODO: Write verification query
;
`,
    },
    testCases: [
      {
        input: '["()"]',
        expectedOutput: 'true',
        isHidden: false,
      },
      {
        input: '["()[]{}"]',
        expectedOutput: 'true',
        isHidden: false,
      },
      {
        input: '["(]"]',
        expectedOutput: 'false',
        isHidden: false,
      },
      {
        input: '["([)]"]',
        expectedOutput: 'false',
        isHidden: true,
      },
      {
        input: '["{[]}"]',
        expectedOutput: 'true',
        isHidden: true,
      },
    ],
    timeLimit: 2000,
    memoryLimit: 64,
    skillSlugs: ['javascript'],
  },
  {
    title: 'Async Rate Limiter Token Bucket',
    slug: 'async-rate-limiter-token-bucket',
    description: `### Problem Description
Implement a deterministic Token Bucket rate limiting evaluator for high-throughput microservices.

Your function \`solution(capacity, refillRatePerSec, timestamps)\` takes:
- \`capacity\` (integer): Maximum burst capacity of tokens.
- \`refillRatePerSec\` (float): Tokens replenished per second.
- \`timestamps\` (array of floats in ascending seconds): Sequence of incoming request arrival times.

Each request attempts to consume **1.0 token**. The bucket starts completely full at \`timestamps[0]\`.

Return an array of booleans indicating whether each request at \`timestamps[i]\` was accepted (\`true\`) or dropped/rate-limited (\`false\`).`,
    difficulty: 'Hard',
    category: 'Distributed Systems & Architecture',
    supportedLanguages: ['javascript', 'python', 'cpp', 'c', 'java', 'sql', 'mysql'],
    starterCode: {
      javascript: `/**
 * Deterministic Token Bucket rate limiter
 * @param {number} capacity - Max token capacity
 * @param {number} refillRate - Tokens added per second
 * @param {number[]} timestamps - Request arrival times in seconds
 * @return {boolean[]} - Acceptance decision for each timestamp
 */
function solution(capacity, refillRate, timestamps) {
  // TODO: Implement token bucket algorithm for request arrival timestamps
  
}`,
      python: `def solution(capacity: float, refill_rate: float, timestamps: list[float]) -> list[bool]:
    # TODO: Implement token bucket algorithm for request arrival timestamps
    pass
`,
      cpp: `#include <vector>

class Solution {
public:
    std::vector<bool> rateLimiter(double capacity, double refillRate, const std::vector<double>& timestamps) {
        // TODO: Implement token bucket algorithm
        return {};
    }
};
`,
      c: `#include <stdbool.h>
#include <stdlib.h>

bool* rateLimiter(double capacity, double refillRate, double* timestamps, int size, int* returnSize) {
    // TODO: Implement token bucket rate limiter
    *returnSize = size;
    return NULL;
}
`,
      java: `import java.util.*;

class Solution {
    public List<Boolean> rateLimiter(double capacity, double refillRate, double[] timestamps) {
        // TODO: Implement token bucket rate limiter
        return new ArrayList<>();
    }
}
`,
      sql: `-- Token Bucket Simulation
-- Schema: request_stream (id INT, arrival_time DOUBLE, client_id INT)
SELECT 
    id, 
    arrival_time
    -- TODO: Compute token window balance
FROM request_stream
ORDER BY arrival_time ASC;
`,
      mysql: `-- MySQL 8.0: Token Bucket Simulation
-- Schema: request_stream (id INT, arrival_time DOUBLE, client_id INT)
SELECT 
    id, 
    arrival_time
    -- TODO: Compute token window balance
FROM request_stream
ORDER BY arrival_time ASC;
`,
    },
    testCases: [
      {
        input: '[3, 1.0, [0.0, 0.2, 0.4, 0.6]]',
        expectedOutput: '[true,true,true,false]',
        isHidden: false,
        explanation: 'Capacity 3: First 3 accepted, 4th at 0.6s dropped (only 0.6 tokens refilled)',
      },
      {
        input: '[2, 0.5, [0.0, 1.0, 2.0, 3.0]]',
        expectedOutput: '[true,true,false,true]',
        isHidden: false,
      },
      {
        input: '[5, 2.0, [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 1.0, 1.1]]',
        expectedOutput: '[true,true,true,true,true,false,true,false]',
        isHidden: true,
      },
    ],
    timeLimit: 3000,
    memoryLimit: 128,
    skillSlugs: ['node-js', 'javascript'],
  },
];

export const seedChallenges = async () => {
  console.log('[Seed Challenges] Initializing Coding Challenges...');

  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    try {
      const { seedSkills } = await import('./seed-skills.js');
      await seedSkills();
    } catch (_) {}
  }

  let instructor = await User.findOne({ role: 'instructor' }) || await User.findOne({});
  if (!instructor) {
    try {
      instructor = await User.create({
        name: 'Prof. Alex Rivera',
        email: 'instructor@lms.com',
        password: 'Password123!',
        role: 'instructor',
        headline: 'Principal Full-Stack Architect',
      });
    } catch (_) {
      instructor = await User.findOne({});
    }
  }
  const creatorId = instructor?._id;

  for (const cData of INITIAL_CHALLENGES) {
    const { skillSlugs, ...fields } = cData;

    // Find matching skills
    const skills = await Skill.find({ slug: { $in: skillSlugs || [] } });
    const skillIds = skills.map((s) => s._id);

    let challenge = await CodingChallenge.findOne({
      $or: [{ slug: fields.slug }, { title: fields.title }],
    });

    if (!challenge) {
      challenge = await CodingChallenge.create({
        ...fields,
        skills: skillIds,
        createdBy: creatorId,
      });
      console.log(`[Seed Challenges] Created: ${challenge.title} (${challenge.difficulty})`);
    } else {
      Object.assign(challenge, fields, { skills: skillIds });
      await challenge.save();
      console.log(`[Seed Challenges] Updated: ${challenge.title}`);
    }
  }

  console.log('[Seed Challenges] Coding challenge seeding completed.');
};

if (process.argv[1]?.endsWith('seed-challenges.js')) {
  (async () => {
    try {
      await connectDB();
      await seedChallenges();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Challenges Error]:', err);
      process.exit(1);
    }
  })();
}

export default seedChallenges;
