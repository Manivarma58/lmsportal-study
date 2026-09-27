import sys
import json
import time

def normalize(val):
    if val is None:
        return 'null'
    if isinstance(val, (dict, list, bool)):
        return json.dumps(val, separators=(',', ':'))
    return str(val).strip()

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            sys.stdout.write(json.dumps({"error": "No input payload received", "results": []}))
            return

        payload = json.loads(raw_input)
        source_code = payload.get("sourceCode", "")
        test_cases = payload.get("testCases", [])

        # Security Hardening: Static screening against dangerous imports and system calls
        import re
        forbidden_py_patterns = [
            r'\bimport\s+(os|sys|subprocess|shutil|socket|ctypes|inspect|importlib|pathlib|posix|builtin|urllib|requests|http)\b',
            r'\bfrom\s+(os|sys|subprocess|shutil|socket|ctypes|inspect|importlib|pathlib|posix|builtin|urllib|requests|http)\b',
            r'__import__',
            r'\bopen\s*\(',
            r'\beval\s*\(',
            r'\bexec\s*\(',
            r'\bcompile\s*\(',
            r'__subclasses__',
            r'__bases__',
            r'__globals__',
        ]

        for pat in forbidden_py_patterns:
            if re.search(pat, source_code, re.IGNORECASE):
                sys.stdout.write(json.dumps({"error": "Security Error: Execution of restricted or unsafe system APIs is forbidden.", "results": []}))
                return

        # Safe built-in functions whitelist
        safe_builtins = {
            'abs': abs, 'all': all, 'any': any, 'bin': bin, 'bool': bool,
            'dict': dict, 'divmod': divmod, 'enumerate': enumerate, 'filter': filter,
            'float': float, 'format': format, 'frozenset': frozenset, 'hasattr': hasattr,
            'hash': hash, 'hex': hex, 'int': int, 'isinstance': isinstance,
            'issubclass': issubclass, 'iter': iter, 'len': len, 'list': list,
            'map': map, 'max': max, 'min': min, 'next': next, 'oct': oct,
            'ord': ord, 'pow': pow, 'range': range, 'repr': repr, 'reversed': reversed,
            'round': round, 'set': set, 'slice': slice, 'sorted': sorted, 'str': str,
            'sum': sum, 'tuple': tuple, 'type': type, 'zip': zip,
            'True': True, 'False': False, 'None': None,
            'Exception': Exception, 'ValueError': ValueError, 'TypeError': TypeError,
            'IndexError': IndexError, 'KeyError': KeyError,
        }

        # Execution scope with constrained builtins
        scope = {'__builtins__': safe_builtins}
        try:
            exec(source_code, scope)
        except Exception as e:
            sys.stdout.write(json.dumps({"error": f"Compilation Error: {str(e)}", "results": []}))
            return

        solution_fn = scope.get("solution")
        if not callable(solution_fn):
            sys.stdout.write(json.dumps({"error": "Function 'solution' was not defined or is not callable.", "results": []}))
            return

        results = []

        for i, tc in enumerate(test_cases):
            tc_input = tc.get("input", "")
            expected_output = str(tc.get("expectedOutput", "")).strip()
            is_hidden = bool(tc.get("isHidden", False))

            args = []
            try:
                parsed = json.loads(tc_input)
                if isinstance(parsed, list):
                    args = parsed
                else:
                    args = [parsed]
            except Exception:
                args = [tc_input]

            start = time.perf_counter()
            err_msg = ""
            actual_str = ""
            passed = False

            try:
                raw_res = solution_fn(*args)
                actual_str = normalize(raw_res)

                # Normalize expected output
                try:
                    expected_parsed = json.loads(expected_output)
                    expected_normalized = normalize(expected_parsed)
                except Exception:
                    expected_normalized = expected_output

                passed = (actual_str == expected_normalized)
            except Exception as e:
                err_msg = str(e)
                actual_str = f"Runtime Error: {err_msg}"
                passed = False

            end = time.perf_counter()
            exec_time = round((end - start) * 1000, 2) # in ms

            results.append({
                "testCaseIndex": i,
                "passed": passed,
                "actualOutput": actual_str,
                "expectedOutput": "[Hidden Test Case]" if is_hidden else expected_output,
                "executionTime": exec_time,
                "error": err_msg,
                "isHidden": is_hidden
            })

        sys.stdout.write(json.dumps({
            "success": True,
            "memoryUsed": 12.0,
            "results": results
        }))

    except Exception as e:
        sys.stdout.write(json.dumps({"error": str(e), "results": []}))

if __name__ == "__main__":
    main()
