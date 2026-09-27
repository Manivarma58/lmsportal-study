import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import API from '../../services/api';
import { toast } from 'sonner';
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  ArrowLeft,
  Terminal,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  FileCode,
  History,
  Code2,
  Database,
} from 'lucide-react';
import { ProgressBar } from '../../components/ui';

export const CODING_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', badge: 'Node.js 18', monaco: 'javascript', ext: 'js' },
  { id: 'python', name: 'Python', badge: 'Python 3.10', monaco: 'python', ext: 'py' },
  { id: 'cpp', name: 'C++', badge: 'G++ 17', monaco: 'cpp', ext: 'cpp' },
  { id: 'c', name: 'C', badge: 'GCC 11', monaco: 'c', ext: 'c' },
  { id: 'java', name: 'Java', badge: 'OpenJDK 17', monaco: 'java', ext: 'java' },
  { id: 'sql', name: 'SQL', badge: 'ANSI / PG', monaco: 'sql', ext: 'sql' },
  { id: 'mysql', name: 'MySQL', badge: 'MySQL 8.0', monaco: 'sql', ext: 'sql' },
];

export const getMonacoLanguage = (lang) => {
  switch (lang) {
    case 'python': return 'python';
    case 'cpp': return 'cpp';
    case 'c': return 'c';
    case 'java': return 'java';
    case 'sql':
    case 'mysql': return 'sql';
    default: return 'javascript';
  }
};

/**
 * Checks if code contains pre-solved full solutions that would spoil the challenge
 */
export const isFullSolution = (codeStr) => {
  if (!codeStr || typeof codeStr !== 'string') return false;
  const hasFullAuth = (codeStr.includes('Buffer.from(') || codeStr.includes('base64.b64decode(')) && 
                      (codeStr.includes('payload.issuer') || codeStr.includes('payload.get("issuer")')) && 
                      !codeStr.includes('// TODO') && !codeStr.includes('# TODO');
  const hasTwoSumMap = (codeStr.includes('map.set(') || codeStr.includes('seen[num] =')) && 
                       (codeStr.includes('target - nums') || codeStr.includes('target - num')) &&
                       !codeStr.includes('// TODO') && !codeStr.includes('# TODO');
  const hasParenthesesStack = (codeStr.includes('stack.pop()') && codeStr.includes('map[char]')) &&
                              !codeStr.includes('// TODO') && !codeStr.includes('# TODO');
  const hasTokenBucket = (codeStr.includes('elapsed * refillRate') || codeStr.includes('elapsed * refill_rate')) &&
                         !codeStr.includes('// TODO') && !codeStr.includes('# TODO');
  return hasFullAuth || hasTwoSumMap || hasParenthesesStack || hasTokenBucket;
};

/**
 * Generates clean, realistic starter boilerplate without revealing the solution
 */
export const getRealisticStarterTemplate = (lang, challenge) => {
  const slug = challenge?.slug || '';

  // 1. Node.js Authentication Lab
  if (slug === 'node-js-authentication-lab') {
    switch (lang) {
      case 'python':
        return `def solution(header: str, expected_issuer: str) -> dict:
    """
    Validate incoming authorization header and token payload.
    :param header: HTTP Authorization header string
    :param expected_issuer: Target issuer string
    :return: Dictionary indicating validation result
    """
    # TODO: Check header format, decode base64 payload, and verify issuer
    pass
`;
      case 'cpp':
        return `#include <iostream>
#include <string>

class Solution {
public:
    // TODO: Implement token authorization validator
    bool validateAuth(const std::string& header, const std::string& expectedIssuer) {
        // Write your solution here
        return false;
    }
};
`;
      case 'c':
        return `#include <stdio.h>
#include <stdbool.h>
#include <string.h>

// TODO: Implement authorization header validation
bool solution(const char* header, const char* expected_issuer) {
    // Write your solution here
    return false;
}
`;
      case 'java':
        return `import java.util.*;

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
`;
      case 'sql':
        return `-- SQL: Validate incoming authorization records
-- Schema: auth_tokens (id INT, header VARCHAR(255), issuer VARCHAR(100), user_id VARCHAR(50))
SELECT 
    header,
    issuer,
    user_id
FROM auth_tokens
-- TODO: Filter valid tokens matching issuer
WHERE 1 = 1;
`;
      case 'mysql':
        return `-- MySQL 8.0: Validate authorization tokens
-- Schema: auth_tokens (id INT, header VARCHAR(255), issuer VARCHAR(100), user_id VARCHAR(50))
SELECT 
    header,
    issuer,
    user_id
FROM auth_tokens
-- TODO: Filter valid tokens matching issuer
WHERE 1 = 1;
`;
      default:
        return `/**
 * Validates incoming Authorization header and verifies token payload.
 * @param {string} header - e.g. "Bearer <token>"
 * @param {string} expectedIssuer - Expected issuer identifier
 * @return {object} - { valid: boolean, userId?: string, error?: string }
 */
function solution(header, expectedIssuer) {
  // TODO: Check header format, decode base64 payload, and verify issuer
  
}
`;
    }
  }

  // 2. Two Sum Target Array
  if (slug === 'two-sum-target-array') {
    switch (lang) {
      case 'python':
        return `def solution(nums: list[int], target: int) -> list[int]:
    # TODO: Return indices of the two numbers such that they add up to target
    pass
`;
      case 'cpp':
        return `#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // TODO: Return indices of the two numbers that add up to target
        return {};
    }
};
`;
      case 'c':
        return `#include <stdio.h>
#include <stdlib.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // TODO: Write your solution here
    *returnSize = 0;
    return NULL;
}
`;
      case 'java':
        return `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // TODO: Return indices of the two numbers that add up to target
        return new int[]{};
    }
}
`;
      case 'sql':
        return `-- Given table 'numbers' (id INT PRIMARY KEY, val INT)
-- Find a pair of IDs where sum of val equals :target
SELECT a.id AS idx1, b.id AS idx2
FROM numbers a
JOIN numbers b ON a.id < b.id
-- TODO: Filter where sum equals target
LIMIT 1;
`;
      case 'mysql':
        return `-- MySQL 8.0: Two Sum Indices
-- Schema: numbers (id INT PRIMARY KEY, val INT)
SELECT a.id AS idx1, b.id AS idx2
FROM numbers a
INNER JOIN numbers b ON a.id < b.id
-- TODO: Filter where a.val + b.val = target
LIMIT 1;
`;
      default:
        return `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
  // TODO: Return indices of the two numbers such that they add up to target
  
}
`;
    }
  }

  // 3. Valid Parentheses & Bracket Matching
  if (slug === 'valid-parentheses-bracket-matching') {
    switch (lang) {
      case 'python':
        return `def solution(s: str) -> bool:
    # TODO: Determine if brackets are properly closed and in valid order
    pass
`;
      case 'cpp':
        return `#include <string>
#include <stack>

class Solution {
public:
    bool isValid(std::string s) {
        // TODO: Determine if brackets are properly closed
        return false;
    }
};
`;
      case 'c':
        return `#include <stdbool.h>
#include <string.h>

bool isValid(char* s) {
    // TODO: Determine if brackets are properly closed
    return false;
}
`;
      case 'java':
        return `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // TODO: Determine if brackets are properly closed
        return false;
    }
}
`;
      case 'sql':
        return `-- Bracket Matching Evaluation
-- Schema: bracket_logs (id INT, sequence VARCHAR(255))
SELECT id, sequence
FROM bracket_logs
-- TODO: Write verification query
;
`;
      case 'mysql':
        return `-- MySQL 8.0: Bracket Matching Evaluation
-- Schema: bracket_logs (id INT, sequence VARCHAR(255))
SELECT id, sequence
FROM bracket_logs
-- TODO: Write verification query
;
`;
      default:
        return `/**
 * @param {string} s
 * @return {boolean}
 */
function solution(s) {
  // TODO: Determine if brackets are properly closed and in valid order
  
}
`;
    }
  }

  // 4. Async Rate Limiter Token Bucket
  if (slug === 'async-rate-limiter-token-bucket') {
    switch (lang) {
      case 'python':
        return `def solution(capacity: float, refill_rate: float, timestamps: list[float]) -> list[bool]:
    # TODO: Implement token bucket algorithm for request arrival timestamps
    pass
`;
      case 'cpp':
        return `#include <vector>

class Solution {
public:
    std::vector<bool> rateLimiter(double capacity, double refillRate, const std::vector<double>& timestamps) {
        // TODO: Implement token bucket algorithm
        return {};
    }
};
`;
      case 'c':
        return `#include <stdbool.h>
#include <stdlib.h>

bool* rateLimiter(double capacity, double refillRate, double* timestamps, int size, int* returnSize) {
    // TODO: Implement token bucket rate limiter
    *returnSize = size;
    return NULL;
}
`;
      case 'java':
        return `import java.util.*;

class Solution {
    public List<Boolean> rateLimiter(double capacity, double refillRate, double[] timestamps) {
        // TODO: Implement token bucket rate limiter
        return new ArrayList<>();
    }
}
`;
      case 'sql':
        return `-- Token Bucket Simulation
-- Schema: request_stream (id INT, arrival_time DOUBLE, client_id INT)
SELECT 
    id, 
    arrival_time
    -- TODO: Compute token window balance
FROM request_stream
ORDER BY arrival_time ASC;
`;
      case 'mysql':
        return `-- MySQL 8.0: Token Bucket Simulation
-- Schema: request_stream (id INT, arrival_time DOUBLE, client_id INT)
SELECT 
    id, 
    arrival_time
    -- TODO: Compute token window balance
FROM request_stream
ORDER BY arrival_time ASC;
`;
      default:
        return `/**
 * Deterministic Token Bucket rate limiter
 * @param {number} capacity - Max token capacity
 * @param {number} refillRate - Tokens added per second
 * @param {number[]} timestamps - Request arrival times in seconds
 * @return {boolean[]} - Acceptance decision for each timestamp
 */
function solution(capacity, refillRate, timestamps) {
  // TODO: Implement token bucket algorithm for request arrival timestamps
  
}
`;
    }
  }

  // Generic Realistic Fallback Template
  switch (lang) {
    case 'python':
      return `def solution(input_data):
    """
    Write your solution here.
    """
    # TODO: Implement solution logic
    pass
`;
    case 'cpp':
      return `#include <iostream>
#include <vector>
#include <string>

class Solution {
public:
    // TODO: Implement solution method
    void solve() {
        // Write your solution here
    }
};
`;
    case 'c':
      return `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

// TODO: Implement solution function
int solution(void) {
    return 0;
}
`;
    case 'java':
      return `import java.util.*;

public class Solution {
    // TODO: Implement solution method
    public static void main(String[] args) {
        // Write your code here
    }
}
`;
    case 'sql':
      return `-- ANSI SQL Solution
-- Write your query below
SELECT 
    -- TODO: Specify columns
    *
FROM records
WHERE 1 = 1;
`;
    case 'mysql':
      return `-- MySQL 8.0 Solution
-- Write your query below
SELECT 
    -- TODO: Specify columns
    *
FROM records
WHERE 1 = 1;
`;
    default:
      return `/**
 * @param {any} input
 * @return {any}
 */
function solution(input) {
  // TODO: Write your solution here
  
}
`;
  }
};

const difficultyStyles = {
  Easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80',
  Medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80',
  Hard: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80',
  Expert: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80',
};

export const CodingLabDetail = () => {
  const { id } = useParams();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'testcases' | 'submissions'
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Resolve code for a given language without spoiling solutions
  const resolveStarterCode = (lang, challengeData) => {
    if (!challengeData) return getRealisticStarterTemplate(lang, null);

    const starters = challengeData.starterCode || {};
    const rawCode = typeof starters.get === 'function' ? starters.get(lang) : starters[lang];

    // If there is no code or it is a pre-solved solution, supply realistic skeleton
    if (!rawCode || isFullSolution(rawCode)) {
      return getRealisticStarterTemplate(lang, challengeData);
    }

    return rawCode;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const [challengeRes, subsRes] = await Promise.allSettled([
          API.get(`/challenges/${id}`),
          API.get(`/challenges/${id}/submissions`),
        ]);

        if (isMounted) {
          if (challengeRes.status === 'fulfilled') {
            const data = challengeRes.value.data?.challenge;
            setChallenge(data);

            // Set starter code for default language (guaranteeing no spoiled solution)
            const initialCode = resolveStarterCode('javascript', data);
            setCode(initialCode);
          }
          if (subsRes.status === 'fulfilled') {
            setSubmissions(subsRes.value.data?.submissions || []);
          }
        }
      } catch (err) {
        toast.error('Failed to load coding challenge.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChallenge();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle language switch
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const starter = resolveStarterCode(newLang, challenge);
    setCode(starter);
    toast.info(`Switched environment to ${CODING_LANGUAGES.find((l) => l.id === newLang)?.name || newLang}`);
  };

  // Reset to starter code
  const handleResetCode = () => {
    const starter = resolveStarterCode(language, challenge);
    setCode(starter);
    toast.info('Editor reset to clean starter template.');
  };

  // Run code against sample/public test cases
  const handleRunCode = async () => {
    if (!code || !code.trim()) {
      toast.error('Source code cannot be empty.');
      return;
    }

    try {
      setIsRunning(true);
      setSubmissionResult(null);
      const res = await API.post(`/challenges/${challenge._id}/run`, {
        language,
        sourceCode: code,
      });

      setRunResult(res.data);
      if (res.data?.status === 'Accepted') {
        toast.success(`Sample test cases passed (${res.data.passedTests}/${res.data.totalTests})!`);
      } else {
        toast.warning(`Sample run result: ${res.data?.status}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code execution failed.');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code for full evaluation & skill scoring
  const handleSubmitCode = async () => {
    if (!code || !code.trim()) {
      toast.error('Source code cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setRunResult(null);
      const res = await API.post(`/challenges/${challenge._id}/submit`, {
        language,
        sourceCode: code,
      });

      setSubmissionResult(res.data);

      if (res.data?.status === 'Accepted') {
        toast.success(`🎉 Accepted! Score: 100%. Practical skill evidence verified.`);
      } else {
        toast.error(`Evaluation: ${res.data?.status} (${res.data?.passedTests}/${res.data?.totalTests} Passed)`);
      }

      // Refresh submissions history
      const subsRes = await API.get(`/challenges/${challenge._id}/submissions`).catch(() => null);
      if (subsRes?.data?.submissions) {
        setSubmissions(subsRes.data.submissions);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
          <span className="text-xs font-mono text-slate-500">Initializing Isolated Laboratory Sandbox...</span>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Challenge Not Found</h3>
        <Link to="/student/challenges" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          ← Back to Coding Lab
        </Link>
      </div>
    );
  }

  const sampleTestCases = challenge.testCases || [];
  const hiddenTestCasesCount = challenge.stats?.hiddenTestCases || 0;

  return (
    <div className="flex flex-col w-full text-slate-800 dark:text-slate-100 antialiased pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/student/challenges"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            title="Back to Challenge Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${
                difficultyStyles[challenge.difficulty] || difficultyStyles.Medium
              }`}>
                {challenge.difficulty}
              </span>
              <h1 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {challenge.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-500 border-t-transparent animate-spin"></span>
            ) : (
              <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            )}
            <span>Run Code</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-140px)]">
        
        {/* ========================================================== */}
        {/* LEFT COLUMN: PROBLEM / TEST CASES / SUBMISSIONS (5 Cols) */}
        {/* ========================================================== */}
        <div className="lg:col-span-5 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900/60 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-4">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-3 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'problem'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Problem</span>
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-3 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'testcases'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Sample Cases ({sampleTestCases.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'submissions'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions ({submissions.length})</span>
            </button>
          </div>

          {/* Left Panel Body */}
          <div className="p-6 overflow-y-auto flex-1 max-h-[calc(100vh-200px)]">
            {activeTab === 'problem' && (
              <div className="flex flex-col gap-4 text-xs sm:text-sm leading-relaxed">
                {/* Problem Description */}
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: challenge.description
                        .replace(/\n/g, '<br/>')
                        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">$1</code>'),
                    }}
                  />
                </div>

                {/* Constraints Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Execution Limits
                  </span>
                  <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>Time: {challenge.timeLimit || 3000}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Memory: {challenge.memoryLimit || 128}MB</span>
                    </div>
                  </div>
                </div>

                {/* Supported Runtimes Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Supported Runtime Environments</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CODING_LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition-all cursor-pointer border ${
                          language === lang.id
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Mapped */}
                {challenge.skills && challenge.skills.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                      Earned Skill Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {challenge.skills.map((s) => (
                        <span
                          key={s._id || s}
                          className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold border border-indigo-200/70 dark:border-indigo-800 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          {s.name || 'Skill'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {sampleTestCases.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestCaseIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        activeTestCaseIndex === idx
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {sampleTestCases[activeTestCaseIndex] && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                        Input Arguments
                      </span>
                      <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto">
                        {sampleTestCases[activeTestCaseIndex].input}
                      </pre>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                        Expected Output
                      </span>
                      <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto">
                        {sampleTestCases[activeTestCaseIndex].expectedOutput}
                      </pre>
                    </div>

                    {sampleTestCases[activeTestCaseIndex].explanation && (
                      <p className="text-xs text-slate-500 italic">
                        Note: {sampleTestCases[activeTestCaseIndex].explanation}
                      </p>
                    )}
                  </div>
                )}

                {hiddenTestCasesCount > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-mono flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-500" />
                    <span>+ {hiddenTestCasesCount} hidden benchmark test cases will be validated upon submission.</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="flex flex-col gap-3">
                {submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-xs font-bold ${
                            sub.status === 'Accepted'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {sub.status} ({sub.score}%)
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(sub.submittedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Language: {sub.language}</span>
                        <span>{sub.passedTests}/{sub.totalTests} tests passed</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No submissions recorded yet for this challenge.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: MONACO CODE EDITOR & OUTPUT CONSOLE (7 Cols) */}
        {/* ========================================================== */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 border-b border-slate-800">
          
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Language:</span>
              </span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-inner transition-colors"
              >
                {CODING_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.badge})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleResetCode}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-slate-800"
              title="Reset code to clean realistic starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Template</span>
            </button>
          </div>

          {/* Monaco Editor Container */}
          <div className="h-[430px] w-full">
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
              value={code}
              theme="vs-dark"
              onChange={(newVal) => setCode(newVal || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Menlo, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                tabSize: language === 'python' ? 4 : 2,
              }}
            />
          </div>

          {/* Execution Output Console */}
          <div className="border-t border-slate-800 bg-slate-950 p-4 flex flex-col gap-3 min-h-[160px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Test Execution Results
                </span>
              </div>

              {(runResult || submissionResult) && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">
                    Execution: {(runResult || submissionResult).executionTime}ms
                  </span>
                  <span className="text-slate-400">
                    Memory: {(runResult || submissionResult).memoryUsed}MB
                  </span>
                </div>
              )}
            </div>

            {/* Run / Submission Status Banner */}
            {(runResult || submissionResult) ? (
              <div className="flex flex-col gap-3">
                {(() => {
                  const res = submissionResult || runResult;
                  const isAccepted = res.status === 'Accepted';

                  return (
                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-2 ${
                        isAccepted
                          ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isAccepted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="font-mono font-bold text-xs uppercase">
                            {res.status}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold">
                          {res.passedTests} / {res.totalTests} Tests Passed
                        </span>
                      </div>

                      {/* Display test case items */}
                      <div className="divide-y divide-slate-800/60 mt-1">
                        {res.testResults?.map((tr, idx) => (
                          <div key={idx} className="py-1.5 flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-300">
                              Test Case {idx + 1} {tr.isHidden ? '(Hidden)' : ''}:
                            </span>
                            <span className={tr.passed ? 'text-emerald-400' : 'text-red-400'}>
                              {tr.passed ? 'PASSED' : tr.error || 'FAILED'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Skill updates notification */}
                      {submissionResult?.skillUpdates?.length > 0 && (
                        <div className="mt-1 pt-2 border-t border-emerald-800/50 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Demonstrated skill practical score updated in your student profile!</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-mono text-slate-500">
                Click "Run Code" to test against sample cases, or "Submit Solution" to run full evaluation.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default CodingLabDetail;
