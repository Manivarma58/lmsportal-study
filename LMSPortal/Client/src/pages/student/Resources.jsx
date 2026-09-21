import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Resources', count: 18 },
    { id: 'docs', name: 'Official Specs & Docs', count: 5 },
    { id: 'code', name: 'SDKs & Repositories', count: 4 },
    { id: 'sandboxes', name: 'Cloud Sandboxes & Tooling', count: 5 },
    { id: 'papers', name: 'Research Papers & Datasets', count: 4 },
  ];

  const resources = [
    {
      id: 1,
      title: 'Kubernetes Official Architecture & API Reference',
      category: 'docs',
      description: 'Complete production reference for pods, controllers, ingress controllers, and CRD specifications.',
      url: 'https://kubernetes.io/docs/home/',
      icon: 'cloud_circle',
      tag: 'INFRA & K8S',
      format: 'Documentation',
    },
    {
      id: 2,
      title: 'PyTorch 2.3 Deep Learning & Tensor Internals',
      category: 'docs',
      description: 'Official guide to dynamic computational graphs, TorchScript, custom C++ extensions, and distributed training.',
      url: 'https://pytorch.org/docs/stable/index.html',
      icon: 'neurology',
      tag: 'AI & ML',
      format: 'API Reference',
    },
    {
      id: 3,
      title: 'Istio Service Mesh Architecture & EnvoyFilter Spec',
      category: 'docs',
      description: 'Mutual TLS security enforcement, traffic splitting, rate limiting, and observability mesh manifests.',
      url: 'https://istio.io/latest/docs/',
      icon: 'hub',
      tag: 'DEVOPS',
      format: 'Official Docs',
    },
    {
      id: 4,
      title: 'Qiskit Quantum SDK & Hardware Execution Guide',
      category: 'code',
      description: 'Open-source quantum computing framework for working with quantum circuits, algorithms, and IBM Quantum processors.',
      url: 'https://qiskit.org/documentation/',
      icon: 'memory',
      tag: 'QUANTUM',
      format: 'Python SDK',
    },
    {
      id: 5,
      title: 'Circom & SnarkJS Cryptographic Circuit Library',
      category: 'code',
      description: 'Domain-specific language and toolchain for zero-knowledge arithmetic circuit synthesis and proof verification.',
      url: 'https://iden3.io/circom',
      icon: 'shield',
      tag: 'CRYPTOGRAPHY',
      format: 'Compiler & Toolchain',
    },
    {
      id: 6,
      title: 'JupyterLab Interactive Cloud Sandbox',
      category: 'sandboxes',
      description: 'High-performance interactive computing environment with pre-installed PyTorch, CUDA, and data science kernels.',
      url: 'https://jupyter.org/try',
      icon: 'terminal',
      tag: 'SANDBOX',
      format: 'Web IDE',
    },
    {
      id: 7,
      title: 'Linux Kernel eBPF Documentation & Cilium Guide',
      category: 'docs',
      description: 'Sandboxed in-kernel programs for networking, security observability, and system profiling.',
      url: 'https://ebpf.io/',
      icon: 'settings_ethernet',
      tag: 'KERNEL & SYSTEMS',
      format: 'Documentation',
    },
    {
      id: 8,
      title: 'HuggingFace Transformers & Pretrained Model Hub',
      category: 'code',
      description: 'State-of-the-art pretrained transformer weights, tokenizers, quantization scripts, and inference pipelines.',
      url: 'https://huggingface.co/docs',
      icon: 'smart_toy',
      tag: 'AI & NLP',
      format: 'Model Hub',
    },
    {
      id: 9,
      title: 'Google Colab GPU Compute Pods',
      category: 'sandboxes',
      description: 'Free and pro cloud notebook execution with integrated NVIDIA GPU acceleration.',
      url: 'https://colab.research.google.com/',
      icon: 'developer_board',
      tag: 'GPU CLUSTER',
      format: 'Cloud Notebook',
    },
    {
      id: 10,
      title: 'Attention Is All You Need (Vaswani et al.)',
      category: 'papers',
      description: 'The foundational research paper introducing the transformer architecture and self-attention mechanism.',
      url: 'https://arxiv.org/abs/1706.03762',
      icon: 'article',
      tag: 'RESEARCH PAPER',
      format: 'arXiv Preprint',
    },
    {
      id: 11,
      title: 'Raft: In Search of an Understandable Consensus Algorithm',
      category: 'papers',
      description: 'Seminal paper on replicated state machine consensus, leader election, and log replication.',
      url: 'https://raft.github.io/raft.pdf',
      icon: 'menu_book',
      tag: 'DISTRIBUTED SYSTEMS',
      format: 'Research PDF',
    },
    {
      id: 12,
      title: 'Rust Programming Language Book & Standard Library',
      category: 'docs',
      description: 'Comprehensive guide to memory safety without garbage collection, concurrency, and ownership semantics.',
      url: 'https://doc.rust-lang.org/book/',
      icon: 'integration_instructions',
      tag: 'SYSTEMS PROGRAMMING',
      format: 'Handbook',
    },
  ];

  // Filter logic
  const filteredResources = useMemo(() => {
    return resources
      .filter((r) => {
        if (activeCategory === 'all') return true;
        return r.category === activeCategory;
      })
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tag.toLowerCase().includes(q)
        );
      });
  }, [resources, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16 px-6 sm:px-8 lg:px-10 py-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-200/90">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
            Student Portal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Resources</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Academic &amp; Engineering Resources
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Curated official technical specifications, cloud sandboxes, research papers, and software toolchains.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {resources.length} VERIFIED REPOSITORIES
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 my-6 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search resources, tags, docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">{res.icon}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                  {res.tag}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">{res.format}</span>
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
              >
                <span>Access</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}