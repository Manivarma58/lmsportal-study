import { connectDB } from '../config/db.js';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';

// Dictionary of 20 domain-specific questions for each course/quiz topic
const QUIZ_QUESTIONS_MAP = {
  // 1. Full-Stack Web Development & Architecture
  'fullstack': [
    {
      q: 'Which HTTP method is specifically defined as idempotent according to RFC 7231?',
      opts: ['POST', 'PUT and DELETE', 'PATCH only', 'CONNECT'],
      ans: 1,
      exp: 'PUT and DELETE are idempotent per HTTP specifications; repeating them produces the same server state as a single invocation.'
    },
    {
      q: 'In React 19, what is the primary advantage of the Actions and useActionState hook?',
      opts: ['Eliminates the virtual DOM completely', 'Handles pending state, optimistic updates, and form submissions natively without manual state flags', 'Replaces Redux with direct global window variables', 'Forces all components to render on the GPU'],
      ans: 1,
      exp: 'React Actions streamline async data mutation, error handling, and pending indicators natively.'
    },
    {
      q: 'What is the primary role of the ETag header in HTTP conditional requests?',
      opts: ['Encrypts the payload using asymmetric keys', 'Enables optimistic concurrency and cache validation via If-Match / If-None-Match', 'Sets cookie expiration timestamps', 'Compresses responses using Brotli'],
      ans: 1,
      exp: 'ETags allow client caches to check if server resources have modified without re-downloading unchanged bodies.'
    },
    {
      q: 'Which MongoDB indexing strategy is most optimal for querying users by age range sorted by signup date?',
      opts: ['Single index on age only', 'Compound index on { age: 1, signupDate: 1 } following the ESR (Equality, Sort, Range) rule', 'Text index with default weights', 'Wildcard index on entire collection'],
      ans: 1,
      exp: 'Compound indexes designed with the ESR rule minimize in-memory sorting and maximize index scan efficiency.'
    },
    {
      q: 'How does Cross-Site Request Forgery (CSRF) differ from Cross-Site Scripting (XSS)?',
      opts: ['CSRF injects malicious client script, while XSS steals browser RAM', 'XSS executes arbitrary scripts in user context; CSRF tricks authenticated browsers into submitting unwanted state-changing actions', 'CSRF only affects mobile devices', 'There is no functional distinction'],
      ans: 1,
      exp: 'XSS exploits trust the user has for a website; CSRF exploits trust the site has in user browser sessions.'
    },
    {
      q: 'What is the main benefit of implementing Redis as a caching layer in front of a relational or document database?',
      opts: ['Eliminates the need for any secondary storage', 'Sub-millisecond in-memory read access and cache-aside key-value retrieval', 'Automatically normalizes third-normal-form SQL tables', 'Generates automatic REST documentation'],
      ans: 1,
      exp: 'Redis provides ultra-fast in-memory operations and data structures to offload high-frequency database queries.'
    },
    {
      q: 'What HTTP status code should be returned when an unauthenticated request attempts to access a protected route?',
      opts: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
      ans: 1,
      exp: '401 Unauthorized indicates authentication credentials are missing or invalid; 403 Forbidden indicates credentials lack permissions.'
    },
    {
      q: 'In Node.js, what does the Event Loop libuv thread pool handle by default?',
      opts: ['Pure JavaScript calculations', 'Blocking I/O tasks like file system access (fs), DNS lookups, and crypto hashing', 'CSS rendering in browser tabs', 'TCP network packet routing at router level'],
      ans: 1,
      exp: 'libuv delegates synchronous OS system calls (fs, crypto, zlib, DNS) to worker threads to avoid blocking the main event thread.'
    },
    {
      q: 'What is the primary trade-off when using Server-Side Rendering (SSR) over Single Page Applications (SPA)?',
      opts: ['SSR has zero server load, but worse SEO', 'SSR improves initial Time-to-First-Byte (TTFB) and SEO at the expense of higher origin server CPU utilization', 'SSR cannot use CSS', 'SSR is incompatible with JavaScript'],
      ans: 1,
      exp: 'SSR renders HTML on demand, improving indexability and first contentful paint, but demands server compute resources.'
    },
    {
      q: 'How does CORS (Cross-Origin Resource Sharing) protect web applications?',
      opts: ['It encrypts server hard drives', 'It allows servers to specify which external origins are permitted to read and mutate their resources from browsers', 'It prevents all outgoing fetch calls permanently', 'It replaces TLS/SSL certificates'],
      ans: 1,
      exp: 'CORS is a browser security mechanism that restricts cross-origin HTTP requests unless explicitly whitelisted by server headers.'
    },
    {
      q: 'What is the primary difference between JWT access tokens and refresh tokens?',
      opts: ['Access tokens are short-lived and sent with API calls; refresh tokens are long-lived and used to rotate access tokens securely', 'Refresh tokens are stored in plain URL query parameters', 'Access tokens must never be signed', 'Refresh tokens are only used for CSS styles'],
      ans: 0,
      exp: 'Short-lived access tokens minimize blast radius if intercepted, while refresh tokens securely extend session lifetimes.'
    },
    {
      q: 'In RESTful architectural design, what does the HATEOAS constraint mandate?',
      opts: ['Hardcoding all client endpoints in mobile app binaries', 'Providing navigational hypermedia links within API responses to guide application state dynamically', 'Disabling all JSON formatting', 'Using only HTTP POST for all interactions'],
      ans: 1,
      exp: 'HATEOAS (Level 3 Richardson Maturity) embeds relational links in payloads, allowing clients to traverse state dynamically.'
    },
    {
      q: 'Which database isolation level prevents dirty reads, non-repeatable reads, and phantom reads?',
      opts: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
      ans: 3,
      exp: 'Serializable is the highest isolation level in ACID transactions, completely preventing concurrency anomalies.'
    },
    {
      q: 'What does the HTTP header `Cache-Control: no-cache` actually mean?',
      opts: ['The browser must never store the response on disk', 'The browser can store the response, but must revalidate it with the origin server before using cached copies', 'The server disables all compression', 'Only proxy servers are allowed to read the data'],
      ans: 1,
      exp: '`no-cache` allows caching but requires validation (e.g. via ETag) prior to serving; `no-store` forbids caching entirely.'
    },
    {
      q: 'Which Web API protocol enables full-duplex, bidirectional communication over a single persistent TCP connection?',
      opts: ['HTTP/1.0', 'WebSockets', 'DNS UDP polling', 'SMTP'],
      ans: 1,
      exp: 'WebSockets establish a persistent two-way connection ideal for real-time collaboration, chat, and live streaming.'
    },
    {
      q: 'In microservices architectures, what is the role of an API Gateway like Envoy or Kong?',
      opts: ['Replaces all relational databases', 'Acts as a unified reverse proxy managing routing, rate-limiting, auth termination, and telemetry', 'Transpiles Python code to Rust at runtime', 'Manages DNS registrar billing'],
      ans: 1,
      exp: 'API Gateways decouple client interfaces from internal microservice topologies while centralizing security policies.'
    },
    {
      q: 'What is the primary purpose of database connection pooling in high-concurrency Node.js backends?',
      opts: ['Eliminates the cost of establishing new TCP & TLS handshakes for every incoming request by reusing warm connections', 'Encrypts query strings with AES-256', 'Ensures only one user can query the database at a time', 'Compresses MongoDB BSON into XML'],
      ans: 0,
      exp: 'Connection pooling maintains reusable database sockets, drastically reducing per-request latency and connection overhead.'
    },
    {
      q: 'Which data structure is primarily used by MongoDB for B-tree index traversal?',
      opts: ['Linked List', 'B-Tree / B+ Tree', 'Circular Buffer', 'Hash Map without range support'],
      ans: 1,
      exp: 'B-trees allow logarithmic time complexity for insertions, deletions, range scans, and exact lookups.'
    },
    {
      q: 'What mechanism prevents timing attacks when comparing sensitive password hashes or HMAC tokens?',
      opts: ['Standard string equality `a === b`', 'Constant-time comparison algorithms (e.g., crypto.timingSafeEqual)', 'Reversing the strings before checking', 'Adding random pauses between queries'],
      ans: 1,
      exp: 'Constant-time comparison takes uniform CPU cycles regardless of character mismatches, thwarting execution-time leakage.'
    },
    {
      q: 'Why should sensitive JWT tokens be stored in HttpOnly, Secure, SameSite=Strict cookies rather than localStorage?',
      opts: ['Cookies consume less disk space than localStorage', 'HttpOnly cookies cannot be accessed or exfiltrated by malicious JavaScript during Cross-Site Scripting (XSS) attacks', 'localStorage is deprecated in modern browsers', 'Cookies automatically disable all CORS checks'],
      ans: 1,
      exp: 'HttpOnly flag prevents client-side script access, mitigating session token theft if an XSS vulnerability exists.'
    }
  ],

  // 2. Agentic AI & Autonomous Systems
  'agentic': [
    {
      q: 'Which cognitive framework interleaves reasoning traces and task-specific actions for autonomous agents?',
      opts: ['ReAct (Reasoning and Acting)', 'Static Regex Fallbacks', 'Single-layer Perceptrons', 'Linear Regression'],
      ans: 0,
      exp: 'ReAct combines "thought" generation with "action" execution to iteratively solve multi-step problems.'
    },
    {
      q: 'What is the primary role of Vector Embeddings in modern RAG (Retrieval-Augmented Generation)?',
      opts: ['Compress raw video files into WebM', 'Represent semantic proximity of text chunks in high-dimensional mathematical vector space', 'Compile Python code into C++', 'Generate RSA keypairs'],
      ans: 1,
      exp: 'Embeddings map text to vector space where geometric distance (cosine, Euclidean) reflects conceptual meaning.'
    },
    {
      q: 'Which orchestration topology prevents circular deadlocks in complex multi-agent collaborative workflows?',
      opts: ['Unbounded message flooding', 'Directed Acyclic Graph (DAG) state machine', 'Infinite while loops without timers', 'Random dispatch'],
      ans: 1,
      exp: 'DAG topologies enforce unambiguous execution order and dependency resolution without cycle hazards.'
    },
    {
      q: 'How do production agentic systems guard against prompt injection when processing untrusted web content?',
      opts: ['Execute all inputs in root bash environments', 'Input sanitization, strict JSON schema validation, tool permission sandboxing, and output evaluation', 'Disable system prompt instructions', 'Ignore external input errors'],
      ans: 1,
      exp: 'Multi-layer defense: typed Pydantic/Zod schemas, isolated sandboxes, and safety guardrails isolate malicious user injections.'
    },
    {
      q: 'What parameter in autoregressive LLM decoding controls the entropy and diversity of next-token selection?',
      opts: ['Baud Rate', 'Temperature', 'Context Window Length', 'Batch Size'],
      ans: 1,
      exp: 'Temperature scales logit values; lower values produce deterministic greedier output, higher values increase variety.'
    },
    {
      q: 'What is the "Lost in the Middle" phenomenon observed in Large Language Model context retrieval?',
      opts: ['Models lose power if disconnected from WiFi', 'Performance degrades when relevant information is located in the middle of a very long context window compared to beginning or end', 'Agents hallucinate when using JSON', 'Tokens in the center are automatically deleted'],
      ans: 1,
      exp: 'Empirical studies show LLMs attend most strongly to the extreme start and end of prompt contexts.'
    },
    {
      q: 'Which pattern allows an AI agent to critique, evaluate, and correct its own intermediate outputs before final delivery?',
      opts: ['Reflection & Self-Correction Pattern', 'Single-Pass Greedy Decoding', 'Unbounded Recursion', 'Hardcoded Regex Replacements'],
      ans: 0,
      exp: 'Reflection agents take their generated output, run a critiquing prompt or test suite, and refine until meeting quality criteria.'
    },
    {
      q: 'What is the function of a Cross-Encoder Reranker in high-precision RAG pipelines?',
      opts: ['Generates synthetic user queries', 'Jointly scores query-document pairs with full cross-attention to reorder bi-encoder vector top-k candidates', 'Translates text between languages', 'Compresses vector indexes into HNSW'],
      ans: 1,
      exp: 'Rerankers process query and chunk together, capturing nuanced semantic interactions that bi-encoders miss.'
    },
    {
      q: 'In tool calling (Function Calling), how does the model communicate its intent to execute a tool?',
      opts: ['By emitting a structured JSON envelope matching the predefined tool schema with arguments', 'By speaking over audio speakers', 'By directly writing into database memory', 'By modifying browser CSS styles'],
      ans: 0,
      exp: 'Models output structured function call objects containing tool name and JSON parameters matching the declared schema.'
    },
    {
      q: 'What is the role of Semantic Caching in production LLM gateways (like GPTCache)?',
      opts: ['Deletes old model weights', 'Returns cached responses for semantically identical questions using embedding similarity, reducing latency and cost', 'Rewrites queries into SQL', 'Blocks all API traffic'],
      ans: 1,
      exp: 'Semantic caching detects conceptually equivalent prompts, skipping expensive model inference.'
    },
    {
      q: 'What type of memory in agent architectures maintains user facts, preferences, and biographical details across sessions?',
      opts: ['Short-term conversation buffer', 'Long-term Semantic / Episodic Memory stored in vector databases or knowledge graphs', 'CPU L1 cache', 'GPU VRAM buffer'],
      ans: 1,
      exp: 'Long-term memory persists episodic experiences and factual profiles across disparate user interactions.'
    },
    {
      q: 'What is HyDE (Hypothetical Document Embeddings) in modern retrieval systems?',
      opts: ['Encrypting documents using AES', 'Prompting an LLM to hallucinate a hypothetical ideal answer, then using that synthetic embedding to search real documents', 'Deleting all metadata', 'Storing vectors in plaintext files'],
      ans: 1,
      exp: 'HyDE generates a hypothetical answer whose embedding often matches real document vectors better than raw questions.'
    },
    {
      q: 'Which technique limits context size while keeping vital facts by summarizing older dialogue turns?',
      opts: ['Conversation Summary Memory Buffer', 'Zero-shot prompt dropping', 'Infinite context looping', 'Hard restart'],
      ans: 0,
      exp: 'Summary buffering condenses historical exchanges into a dense synthetic narrative to preserve token budget.'
    },
    {
      q: 'What does the term "Hallucination" refer to in generative AI systems?',
      opts: ['Hardware overheating in data centers', 'Generation of fluent, grammatically correct content that is factually ungrounded or contradicted by reality', 'Rendering 3D graphics incorrectly', 'Network disconnection errors'],
      ans: 1,
      exp: 'Hallucination occurs when generative models predict plausible-sounding tokens that lack factual grounding.'
    },
    {
      q: 'In multi-agent systems, what is a "Consensus Voting" pattern?',
      opts: ['Rebooting servers upon disagreement', 'Aggregating independent answers from multiple specialized models or prompts to vote on the most reliable solution', 'Using random numbers to pick options', 'Hardcoding human manager approval'],
      ans: 1,
      exp: 'Consensus voting uses ensemble evaluation across multiple agent outputs to maximize accuracy on complex reasoning.'
    },
    {
      q: 'Which vector distance metric is invariant to the magnitude (scale) of the vectors and solely measures orientation?',
      opts: ['Euclidean Distance (L2)', 'Cosine Similarity', 'Manhattan Distance (L1)', 'Hamming Distance'],
      ans: 1,
      exp: 'Cosine similarity normalizes for vector length, focusing strictly on the angular directional alignment of representations.'
    },
    {
      q: 'What is the function of "Guardrails" frameworks (such as NeMo Guardrails or Llama Guard)?',
      opts: ['Physical fences around data centers', 'Programmable policies that inspect input prompts and output responses for safety, PII leaks, and topic adherence', 'Cooling fans inside GPU racks', 'CSS boundaries on webpages'],
      ans: 1,
      exp: 'Guardrails intercept toxic inputs, jailbreak attempts, and sensitive data leakage before prompts hit models or users.'
    },
    {
      q: 'What is "Chain of Thought" (CoT) prompting?',
      opts: ['Chaining multiple API servers in series', 'Encouraging the model to generate step-by-step intermediate reasoning steps prior to giving the final answer', 'Running models in parallel threads', 'Encrypting prompt tokens'],
      ans: 1,
      exp: 'CoT prompting explicitly elicits intermediate logical steps, significantly enhancing complex deduction and arithmetic.'
    },
    {
      q: 'Which tool calling architecture executes code within isolated micro-containers to prevent host compromise?',
      opts: ['Root Bash Terminals', 'Ephemeral Docker Sandboxes or WebAssembly (Wasm) runtimes', 'Direct OS Kernel Hooks', 'Shared Memory Segments'],
      ans: 1,
      exp: 'Isolated sandboxes constrain filesystem, network, and memory access, ensuring safe code execution.'
    },
    {
      q: 'What metric evaluates whether retrieved chunks in RAG contain the actual ground truth needed to answer a query?',
      opts: ['Context Recall', 'Baud Rate', 'Cache Hit Ratio', 'PageRank'],
      ans: 0,
      exp: 'Context Recall measures the percentage of ground-truth information successfully captured in retrieved passages.'
    }
  ],

  // 3. Cyber Defense & Cryptographic Security
  'cyber': [
    {
      q: 'Which cryptographic property guarantees that compromise of long-term server private keys cannot decrypt past recorded sessions?',
      opts: ['Perfect Forward Secrecy (PFS)', 'MD5 Hashing', 'Symmetric Substitution', 'Static RSA Pre-Master Secrets'],
      ans: 0,
      exp: 'PFS generates unique ephemeral session keys per handshake, protecting past traffic from retrospective decryption.'
    },
    {
      q: 'In a Zero Trust Architecture (ZTA), what is the foundational operational axiom?',
      opts: ['Implicitly trust internal corporate intranet traffic', 'Never trust, always verify every access request regardless of origin', 'Disable MFA inside office headquarters', 'Store passwords in plaintext for audits'],
      ans: 1,
      exp: 'Zero Trust assumes the perimeter is compromised, requiring explicit continuous identity, device, and posture verification.'
    },
    {
      q: 'What HTTP security header mandates browser connections exclusively over HTTPS and specifies preloading?',
      opts: ['Strict-Transport-Security (HSTS)', 'Access-Control-Allow-Origin: *', 'X-Frame-Options: SAMEORIGIN', 'Cache-Control: private'],
      ans: 0,
      exp: 'HSTS instructs compliant browsers that a domain must only be reached via HTTPS, mitigating SSL-stripping attacks.'
    },
    {
      q: 'Which attack vector exploits parsing discrepancies between front-end reverse proxies and backend HTTP servers?',
      opts: ['HTTP Request Smuggling (HRS)', 'CSS Keylogging', 'ARP Cache Poisoning on WAN', 'DNS Recursive Amplification'],
      ans: 0,
      exp: 'HTTP Request Smuggling arises when proxies disagree on Content-Length vs Transfer-Encoding chunked boundaries.'
    },
    {
      q: 'What is the primary vulnerability targeted by a Cross-Site Scripting (XSS) attack?',
      opts: ['Injecting malicious scripts into trusted websites that execute in victim browsers', 'Cracking RSA-4096 keys via quantum superposition', 'Physical hard drive destruction', 'Overloading network switches with ICMP echo'],
      ans: 0,
      exp: 'XSS exploits unescaped or unvalidated user inputs to run malicious code in the security context of client sessions.'
    },
    {
      q: 'What cryptographic primitive produces a fixed-size, irreversible digest from arbitrary-length inputs?',
      opts: ['Cryptographic Hash Function (e.g. SHA-256)', 'Caesar Cipher', 'Base64 Encoding', 'XOR Masking'],
      ans: 0,
      exp: 'Cryptographic hash functions are deterministic, collision-resistant, and pre-image resistant one-way functions.'
    },
    {
      q: 'Which key exchange protocol is used in TLS 1.3 to ensure ephemeral Perfect Forward Secrecy?',
      opts: ['ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)', 'Static RSA Key Transport', 'DES Electronic Codebook', 'Plaintext Diffie-Hellman without signatures'],
      ans: 0,
      exp: 'TLS 1.3 completely removed static RSA key exchange in favor of ephemeral Diffie-Hellman (ECDHE).'
    },
    {
      q: 'What defense mechanism mitigates SQL Injection vulnerabilities fundamentally in application code?',
      opts: ['Parameterized Queries / Prepared Statements', 'String concatenation with single quote removal', 'Using GET instead of POST', 'Hiding database port numbers'],
      ans: 0,
      exp: 'Prepared statements treat user inputs as distinct data parameters, preventing them from altering the SQL command syntax.'
    },
    {
      q: 'What is the function of the `Content-Security-Policy` (CSP) HTTP response header?',
      opts: ['Restricts the resources (scripts, styles, images) that browsers are permitted to load and execute for a given page', 'Controls cookie expiration times', 'Enables server gzip compression', 'Manages DNS name lookups'],
      ans: 0,
      exp: 'CSP provides fine-grained control over allowable script origins, severely restricting unauthorized script execution.'
    },
    {
      q: 'Which security principle restricts user and process permissions strictly to what is necessary to perform their assigned task?',
      opts: ['Principle of Least Privilege (PoLP)', 'Security Through Obscurity', 'Maximum Privilege Mode', 'Unbounded Trust Topology'],
      ans: 0,
      exp: 'Least Privilege minimizes the potential blast radius of compromised credentials or compromised service components.'
    },
    {
      q: 'What is an "Evil Twin" attack in wireless network security?',
      opts: ['A rogue Wi-Fi access point masquerading as a legitimate network to harvest credentials', 'Two identical virus files uploaded together', 'A computer virus that duplicates itself twice', 'A server with duplicate CPU cores'],
      ans: 0,
      exp: 'Evil Twin access points spoof genuine SSIDs and MAC addresses, sniffing traffic from unsuspecting connected devices.'
    },
    {
      q: 'In symmetric cryptography, why is an Initialization Vector (IV) / Nonce required in AES-GCM mode?',
      opts: ['To ensure identical plaintexts produce completely different ciphertexts each encryption cycle', 'To store the encryption password', 'To increase payload file size', 'To bypass TLS inspection'],
      ans: 0,
      exp: 'Unique IVs prevent pattern leakage and replay attacks; reusing an IV with the same key in GCM completely destroys security.'
    },
    {
      q: 'What is the purpose of an EDR (Endpoint Detection and Response) agent on corporate devices?',
      opts: ['Continuously monitor, record, and detect malicious behaviors and process anomalies on endpoints in real time', 'Overclock GPU processors', 'Delete user document files automatically', 'Clean optical mouse sensors'],
      ans: 0,
      exp: 'EDR platforms aggregate endpoint telemetry, alerting security operations teams to behavioral anomalies and lateral movement.'
    },
    {
      q: 'What is "Kerberoasting" in Active Directory penetration testing?',
      opts: ['Requesting Kerberos TGS service tickets for accounts with SPNs and cracking password hashes offline', 'Overheating Windows Domain Controllers', 'Deleting Active Directory database files', 'Blocking DNS port 53'],
      ans: 0,
      exp: 'Kerberoasting extracts Kerberos service tickets encrypted with service account NTLM hashes for offline brute-forcing.'
    },
    {
      q: 'How does Multi-Factor Authentication (MFA) defend against credential stuffing attacks?',
      opts: ['Requires an independent authentication factor (e.g. FIDO2 hardware token or TOTP) even if passwords are breached', 'Changes the username automatically every 5 minutes', 'Encrypts user emails with PGP', 'Blocks all international IP addresses'],
      ans: 0,
      exp: 'Even with stolen usernames and passwords, attackers cannot authenticate without the secondary possession/biometric factor.'
    },
    {
      q: 'What is the difference between asymmetric and symmetric encryption?',
      opts: ['Symmetric uses one shared secret key for both encryption and decryption; asymmetric uses a public/private keypair', 'Asymmetric is 1000x faster than symmetric', 'Symmetric encryption can never be decrypted', 'There is no mathematical difference'],
      ans: 0,
      exp: 'Symmetric (AES) is computationally fast for bulk data; asymmetric (RSA/ECC) solves key distribution and digital signatures.'
    },
    {
      q: 'What attack exploits race conditions between the time a security condition is checked and the time a resource is used?',
      opts: ['Time-of-Check to Time-of-Use (TOCTOU)', 'Man-in-the-Middle', 'SYN Flood', 'Slowloris HTTP Attack'],
      ans: 0,
      exp: 'TOCTOU race conditions allow attackers to swap files or mutate states between privilege checks and resource access.'
    },
    {
      q: 'What is the primary function of a Web Application Firewall (WAF)?',
      opts: ['Filters, monitors, and blocks malicious Layer 7 HTTP/HTTPS traffic targeting web applications', 'Replaces operating system firewalls', 'Suppresses all email spam', 'Enhances physical data center security'],
      ans: 0,
      exp: 'WAFs inspect Layer 7 requests, thwarting common application attacks like SQLi, XSS, and command injection.'
    },
    {
      q: 'What does the `SameSite=Strict` cookie attribute enforce in modern web browsers?',
      opts: ['Cookies will never be sent in cross-site requests, completely preventing CSRF attacks on GET and POST calls', 'Cookies expire after 10 seconds', 'Cookies are encrypted with client keys', 'Cookies can only be read by search engine spiders'],
      ans: 0,
      exp: 'SameSite=Strict ensures the browser withholds cookies on any cross-site navigation, isolating sessions.'
    },
    {
      q: 'What type of malware demands monetary payment in exchange for decrypting hostage enterprise files?',
      opts: ['Ransomware', 'Adware', 'Spyware', 'Keylogger'],
      ans: 0,
      exp: 'Ransomware encrypts target filesystem contents using strong public-key cryptography and demands ransom for decryption keys.'
    }
  ],

  // 4. Quantum Computing & Algorithms
  'quantum': [
    {
      q: 'What quantum logic gate places a basis state |0⟩ into an equal superposition of |0⟩ and |1⟩?',
      opts: ['Hadamard Gate (H)', 'Pauli-X Gate', 'Toffoli CCNOT Gate', 'Phase S Gate'],
      ans: 0,
      exp: 'The Hadamard gate maps basis states into balanced superpositions: H|0⟩ = (|0⟩ + |1⟩)/√2.'
    },
    {
      q: 'Which quantum algorithm provides quadratic speedup for unstructured database searching?',
      opts: ["Grover's Algorithm", "Shor's Algorithm", 'Deutsch-Jozsa Algorithm', 'Quantum Approximate Optimization (QAOA)'],
      ans: 0,
      exp: "Grover's algorithm searches unstructured sets in O(√N) oracle queries compared to classical O(N)."
    },
    {
      q: 'Which quantum algorithm provides polynomial time factorization of large integers, threatening RSA cryptography?',
      opts: ["Shor's Algorithm", "Grover's Algorithm", 'Simons Algorithm', 'VQE'],
      ans: 0,
      exp: "Shor's algorithm factors integers in polynomial time O((log N)³) by transforming factorization into order-finding via QFT."
    },
    {
      q: 'What is the fundamental theorem that states it is impossible to create an identical copy of an arbitrary unknown quantum state?',
      opts: ['No-Cloning Theorem', 'Bell Theorem', 'Pauli Exclusion Principle', 'Heisenberg Uncertainty Principle'],
      ans: 0,
      exp: 'The No-Cloning theorem is a direct consequence of the linearity of quantum mechanics and unitary evolution.'
    },
    {
      q: 'What is the Bloch Sphere used to represent geometrically in quantum information science?',
      opts: ['The state space of a single pure two-level quantum system (qubit)', 'The physical magnetic coil of an MRI machine', 'A cloud data center server topology', 'A multi-qubit quantum error syndrome'],
      ans: 0,
      exp: 'Points on the surface of the unit sphere in 3D represent pure qubit states parameterized by polar angles θ and φ.'
    },
    {
      q: 'What physical phenomenon occurs when quantum systems interact with their thermal environment, losing coherence?',
      opts: ['Quantum Decoherence', 'Quantum Teleportation', 'Quantum Entanglement', 'Phase Inversion'],
      ans: 0,
      exp: 'Decoherence causes the off-diagonal elements of the density matrix to decay, converting pure quantum states into classical mixtures.'
    },
    {
      q: 'Which quantum gate performs an entangling conditional bit-flip operation between two qubits?',
      opts: ['Controlled-NOT (CNOT / CX) Gate', 'Single Qubit Phase Gate', 'Hadamard Gate', 'Identity Gate'],
      ans: 0,
      exp: 'CNOT flips the target qubit if and only if the control qubit is in state |1⟩, generating entangled states like Bell pairs.'
    },
    {
      q: 'What are the four maximally entangled two-qubit quantum states called?',
      opts: ['Bell States / EPR Pairs', 'Bloch Coordinates', 'Feynman Basis', 'Fourier Modes'],
      ans: 0,
      exp: 'The Bell states form an orthonormal basis of maximally entangled two-qubit quantum states.'
    },
    {
      q: 'What is the primary role of the Quantum Fourier Transform (QFT) in quantum algorithms?',
      opts: ['Transforms quantum amplitudes into phase frequencies, enabling period-finding in Shor algorithm', 'Translates Python to QASM', 'Cools dilution refrigerators to 15 millikelvin', 'Compiles quantum gates into C code'],
      ans: 0,
      exp: 'QFT performs discrete Fourier transformation over quantum state amplitudes with exponential speedup over classical FFT.'
    },
    {
      q: 'What is the Variational Quantum Eigensolver (VQE) algorithm primarily used for on NISQ devices?',
      opts: ['Finding ground state energy levels of molecular Hamiltonians in quantum chemistry', 'Formatting hard drives', 'Playing 3D video games', 'Sorting classical spreadsheets'],
      ans: 0,
      exp: 'VQE is a hybrid quantum-classical algorithm estimating ground-state energies for quantum chemistry and material science.'
    },
    {
      q: 'What does "NISQ" stand for in current quantum computing hardware architectures?',
      opts: ['Noisy Intermediate-Scale Quantum', 'Non-Invasive Semiconductor Quantum', 'Network Integrated Superconducting Qubits', 'Normalized Instruction Set Qubit'],
      ans: 0,
      exp: 'NISQ denotes the current generation of 50-1000 qubit devices without full fault-tolerant quantum error correction.'
    },
    {
      q: 'Which quantum communication protocol allows transmitting an unknown quantum state using a shared Bell pair and classical bits?',
      opts: ['Quantum Teleportation', 'Quantum Random Walk', 'Quantum Key Escrow', 'Classical Tunneling'],
      ans: 0,
      exp: 'Quantum teleportation transfers state information using entanglement and 2 classical bits without violating no-cloning.'
    },
    {
      q: 'What is Quantum Key Distribution (QKD) protocol BB84 used for?',
      opts: ['Establishing provably secure symmetric encryption keys guaranteed by quantum mechanics', 'Cracking DES passwords', 'Mining cryptocurrency', 'Encrypting quantum processors'],
      ans: 0,
      exp: 'BB84 detects any eavesdropping attempt through irreversible wavefunction collapse during measurement.'
    },
    {
      q: 'What is a Surface Code in fault-tolerant quantum computing architectures?',
      opts: ['A 2D topological quantum error-correcting code with high fault-tolerance threshold', 'The paint coating on quantum dilution refrigerators', 'A high-level programming language', 'A circuit diagram visualizer'],
      ans: 0,
      exp: 'Surface codes arrange data and syndrome qubits on a 2D lattice, tolerating physical error rates up to ~1%.'
    },
    {
      q: 'What is the Pauli-Z gate operation on a qubit state (|0⟩ + |1⟩)/√2?',
      opts: ['(|0⟩ - |1⟩)/√2 (flips relative phase)', '(|0⟩ + |1⟩)/√2 (no change)', '|0⟩', '|1⟩'],
      ans: 0,
      exp: 'The Pauli-Z gate leaves |0⟩ unchanged and maps |1⟩ to -|1⟩, reversing the relative phase.'
    },
    {
      q: 'What hardware technology uses superconducting Josephson junctions cooled to millikelvin temperatures?',
      opts: ['Transmon Superconducting Qubits (IBM, Google)', 'Trapped Ion Systems', 'Neutral Atom Arrays', 'Photonic Quantum Chips'],
      ans: 0,
      exp: 'Transmon qubits use non-linear LC oscillators formed by Josephson junctions inside cryogenic dilution refrigerators.'
    },
    {
      q: 'What is Quantum Supremacy / Quantum Advantage?',
      opts: ['When a programmable quantum device performs a defined computational task that is infeasible for any classical supercomputer', 'When all classical computers are destroyed', 'When a computer achieves consciousness', 'When quantum computers reach 100 GHz clock speeds'],
      ans: 0,
      exp: 'Quantum advantage denotes demonstration of a programmable quantum calculation impossible on classical supercomputers in reasonable time.'
    },
    {
      q: 'What is the Pauli-X gate analogous to in classical computing?',
      opts: ['NOT gate (bit flip)', 'AND gate', 'OR gate', 'XOR gate'],
      ans: 0,
      exp: 'Pauli-X maps |0⟩ to |1⟩ and |1⟩ to |0⟩, acting as a quantum NOT operation.'
    },
    {
      q: 'What inequality theorem proves that quantum mechanics cannot be explained by local hidden variable theories?',
      opts: ["Bell's Inequality (CHSH Theorem)", "Moore's Law", 'Shannon Sampling Theorem', 'Nyquist Theorem'],
      ans: 0,
      exp: "Violations of Bell's inequality experimentally confirm non-local quantum entanglement."
    },
    {
      q: 'What is the role of an ancilla qubit in quantum error correction and measurement?',
      opts: ['An auxiliary qubit used to detect error syndromes without directly measuring and destroying data qubit superpositions', 'A spare qubit in case physical wires break', 'A qubit used solely for cooling', 'A classical bit stored in RAM'],
      ans: 0,
      exp: 'Ancilla qubits entangle with data qubits to extract parity and syndrome measurements without collapsing logical state data.'
    }
  ]
};

// Generic subject questions generator for other technical courses to guarantee 20 high-grade questions
const generateSubjectQuestions = (courseTitle, domain) => {
  return [
    {
      q: `What is the foundational architectural principle governing ${courseTitle}?`,
      opts: [
        'Stateless design, clear separation of concerns, and verifiable reliability',
        'Hardcoding configurations directly inside static templates',
        'Ignoring error boundaries in distributed asynchronous pipelines',
        'Storing sensitive credentials in plain URL query parameters'
      ],
      ans: 0,
      exp: 'Enterprise production systems mandate clean boundaries, stateless design, and resilient error recovery.'
    },
    {
      q: `When deploying ${courseTitle} into high-availability production, what is the best practice for secret management?`,
      opts: [
        'Commit API keys into public git repositories',
        'Use environment variables, secrets management vaults (e.g. Vault, AWS Secrets Manager), and 12-factor principles',
        'Transmit credentials over unencrypted HTTP parameters',
        'Hardcode passwords into client JavaScript bundles'
      ],
      ans: 1,
      exp: 'Secrets must always be managed through encrypted vaults, strict IAM roles, and decoupled environment parameters.'
    },
    {
      q: `Which monitoring strategy provides the highest real-time visibility into bottlenecks in ${courseTitle}?`,
      opts: [
        'Distributed Tracing (OpenTelemetry) with metric alerting and structured JSON logging',
        'Manually inspecting raw terminal logs once a month',
        'Disabling all error logging to reduce disk usage',
        'Relying solely on end-user bug reports'
      ],
      ans: 0,
      exp: 'OpenTelemetry distributed tracing surfaces microservice latency regressions and cascading failures in real time.'
    },
    {
      q: `What is the primary trade-off when optimizing performance and throughput for ${courseTitle}?`,
      opts: [
        'Balancing latency and computational resource cost versus consistency and system simplicity',
        'Disabling all network security firewalls',
        'Converting all backend code to static HTML files',
        'Eliminating all unit and integration testing'
      ],
      ans: 0,
      exp: 'Engineering trade-offs continuously balance throughput, latency, memory footprints, and architectural complexity.'
    },
    {
      q: `In the context of ${courseTitle}, what does Idempotency guarantee during distributed execution?`,
      opts: [
        'Executing an operation multiple times produces the identical side effect as executing it once',
        'Every operation generates completely random outputs',
        'Requests must only run during server nighttime hours',
        'Transactions can never fail'
      ],
      ans: 0,
      exp: 'Idempotency ensures retry safety across unstable networks without creating duplicate records or double charging.'
    },
    {
      q: `How should database schema migrations be orchestrated in zero-downtime deployments for ${courseTitle}?`,
      opts: [
        'Backward-compatible expand-and-contract (two-phase) schema evolution',
        'Dropping entire database tables immediately during peak traffic hours',
        'Disabling the database server during updates',
        'Manually editing production tables through command line shells'
      ],
      ans: 0,
      exp: 'Expand-and-contract migrations allow old and new code versions to run concurrently without schema lock contention.'
    },
    {
      q: `What is the primary role of asynchronous message queues (e.g. Kafka, RabbitMQ) in ${courseTitle}?`,
      opts: [
        'Decoupling producer and consumer workflows, smoothing traffic spikes, and guaranteeing durable event delivery',
        'Replacing relational databases completely',
        'Translating CSS styles for web browsers',
        'Compiling source code into machine binaries'
      ],
      ans: 0,
      exp: 'Message queues buffer bursty traffic, decouple service lifecycles, and enable resilient asynchronous processing.'
    },
    {
      q: `Which caching pattern queries the cache first, and on a miss reads from the database and populates the cache?`,
      opts: [
        'Cache-Aside (Lazy Loading)',
        'Write-Through Cache without reads',
        'Read-Only Static Invalidation',
        'Permanent Disk Eviction'
      ],
      ans: 0,
      exp: 'Cache-Aside loads data on demand, keeping memory utilization bounded to actively requested keys.'
    },
    {
      q: `What security threat is mitigated by implementing Rate Limiting and Circuit Breakers in ${courseTitle}?`,
      opts: [
        'Denial of Service (DoS) and cascading failures caused by downstream service outages',
        'Physical theft of laptop computers',
        'Slow broadband internet cables',
        'Browser cache clearing'
      ],
      ans: 0,
      exp: 'Circuit breakers prevent failing services from being bombarded, preserving cluster stability and failing gracefully.'
    },
    {
      q: `In distributed environments for ${courseTitle}, what does the CAP theorem state?`,
      opts: [
        'A distributed data store can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously',
        'All computers can achieve infinite speed if cooled with liquid nitrogen',
        'Security, Cost, and Accuracy are mathematically impossible together',
        'CPUs cannot execute more than one instruction per second'
      ],
      ans: 0,
      exp: 'Under network partitions, distributed architectures must choose between strong consistency or high availability.'
    },
    {
      q: `What is the primary benefit of containerizing workloads in ${courseTitle} using Docker and OCI images?`,
      opts: [
        'Hermetic, reproducible environments that package dependencies and guarantee uniform execution across development and cloud',
        'Guaranteed 100x increase in CPU clock frequency',
        'Free unlimited cloud storage',
        'Eliminates the need for any unit tests'
      ],
      ans: 0,
      exp: 'Containers encapsulate user space, binaries, and runtime configurations, ensuring "runs anywhere" predictability.'
    },
    {
      q: `How does continuous integration (CI) enhance code quality in ${courseTitle}?`,
      opts: [
        'Automatically runs linting, unit tests, security scans, and build validation on every pull request before merging',
        'Deletes old git commits permanently',
        'Forces developers to write code without comments',
        'Prevents all developers from viewing git logs'
      ],
      ans: 0,
      exp: 'CI pipelines catch regressions, vulnerabilities, and syntax defects early in the software development lifecycle.'
    },
    {
      q: `What HTTP protocol version introduced multiplexed bidirectional streams over a single TCP connection?`,
      opts: [
        'HTTP/2',
        'HTTP/1.0',
        'Telnet',
        'FTP'
      ],
      ans: 0,
      exp: 'HTTP/2 introduced binary framing and multiplexing, eliminating head-of-line blocking present in HTTP/1.1.'
    },
    {
      q: `What is the main objective of Chaos Engineering in enterprise architectures for ${courseTitle}?`,
      opts: [
        'Proactively injecting synthetic failures (e.g. killing nodes, adding network latency) to verify system resilience and self-healing',
        'Corrupting customer databases intentionally for fun',
        'Shutting down servers during live customer checkout',
        'Disabling security patches'
      ],
      ans: 0,
      exp: 'Chaos engineering identifies hidden failure modes under controlled conditions before real production outages strike.'
    },
    {
      q: `Which hashing algorithm is considered cryptographically secure for storing passwords in ${courseTitle}?`,
      opts: [
        'Argon2id or bcrypt with salt and work factor',
        'Plain MD5 without salt',
        'SHA-1 without rounds',
        'Base64 encoding'
      ],
      ans: 0,
      exp: 'Argon2id and bcrypt are computationally expensive, memory-hard algorithms designed specifically to thwart GPU brute-force attacks.'
    },
    {
      q: `What is the purpose of an Index in relational or document databases for ${courseTitle}?`,
      opts: [
        'Accelerates search and retrieval operations at the cost of slight write overhead and additional disk storage',
        'Compresses all database strings into uppercase',
        'Deletes duplicate rows automatically',
        'Encrypts tables using AES-128'
      ],
      ans: 0,
      exp: 'Indexes provide logarithmic lookup paths (B-trees) avoiding expensive full-collection table scans.'
    },
    {
      q: `What does the term "Infrastructure as Code" (IaC) refer to?`,
      opts: [
        'Managing and provisioning cloud resources through machine-readable definition files (e.g. Terraform) rather than manual GUI clicks',
        'Writing operating systems in pure HTML',
        'Soldering computer hardware by hand',
        'Creating visual UML diagrams on paper'
      ],
      ans: 0,
      exp: 'IaC ensures repeatable, version-controlled, and auditable cloud infrastructure configurations.'
    },
    {
      q: `What is a Deadlock in concurrent multithreaded systems?`,
      opts: [
        'A state where two or more processes are unable to proceed because each is waiting for the other to release a shared lock',
        'When computer power cords are unplugged',
        'A process that completes in zero seconds',
        'When memory is completely cleared'
      ],
      ans: 0,
      exp: 'Deadlocks occur under mutual exclusion, hold-and-wait, no-preemption, and circular-wait conditions.'
    },
    {
      q: `Which design pattern separates write operations (commands) from read operations (queries)?`,
      opts: [
        'Command Query Responsibility Segregation (CQRS)',
        'Singleton Pattern',
        'Factory Pattern',
        'Model View Controller (MVC)'
      ],
      ans: 0,
      exp: 'CQRS optimizes read and write models independently, ideal for high-scale event-driven distributed platforms.'
    },
    {
      q: `What is the final verification required before graduating or certifying in ${courseTitle}?`,
      opts: [
        'Demonstrating mastery over theoretical foundations, architectural trade-offs, and practical operational telemetry',
        'Guessing answers randomly without reading questions',
        'Paying a fee to bypass questions',
        'Submitting blank examination papers'
      ],
      ans: 0,
      exp: 'Certified engineering mastery demands verified comprehension of theory, practical implementation, and operational resilience.'
    }
  ];
};

const run = async () => {
  await connectDB();
  console.log('[Seed 20 Questions] Connected to MongoDB.');

  const quizzes = await Quiz.find().populate('course', 'title category domain').exec();
  console.log(`[Seed 20 Questions] Processing ${quizzes.length} quizzes...`);

  let updatedCount = 0;

  for (const quiz of quizzes) {
    const titleLower = quiz.title.toLowerCase();
    const courseTitle = quiz.course?.title || quiz.title;
    const domain = quiz.course?.domain || 'Software Engineering';

    let questionsPool = [];

    if (titleLower.includes('agentic') || titleLower.includes('autonomous')) {
      questionsPool = QUIZ_QUESTIONS_MAP['agentic'];
    } else if (titleLower.includes('cyber') || titleLower.includes('security') || titleLower.includes('zero-trust')) {
      questionsPool = QUIZ_QUESTIONS_MAP['cyber'];
    } else if (titleLower.includes('quantum')) {
      questionsPool = QUIZ_QUESTIONS_MAP['quantum'];
    } else if (titleLower.includes('full-stack') || titleLower.includes('web development')) {
      questionsPool = QUIZ_QUESTIONS_MAP['fullstack'];
    } else {
      questionsPool = generateSubjectQuestions(courseTitle, domain);
    }

    // Format all 20 questions according to Question Schema
    const formattedQuestions = questionsPool.map((item, idx) => ({
      question: item.q,
      options: item.opts,
      correctAnswer: item.ans,
      marks: 10,
      points: 10,
      explanation: item.exp,
    }));

    quiz.questions = formattedQuestions;
    quiz.timeLimitMinutes = 25; // 25 minutes for 20 questions
    quiz.passingScore = 70;

    await quiz.save();
    updatedCount++;
    console.log(`[${updatedCount}/${quizzes.length}] Updated "${quiz.title}" -> Exactly ${quiz.questions.length} questions.`);
  }

  console.log(`[Seed 20 Questions] Successfully updated all ${updatedCount} quizzes with 20 subject-specific questions!`);
  process.exit(0);
};

run().catch((err) => {
  console.error('[Seed 20 Questions] Error:', err);
  process.exit(1);
});
