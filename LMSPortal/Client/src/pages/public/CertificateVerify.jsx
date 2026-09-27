import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import {
  ShieldCheck,
  XCircle,
  Search,
  Award,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  User,
  Briefcase,
  Code,
  FolderGit2,
  Sparkles,
  Lock,
  Layers,
  CheckCircle,
  FileCheck2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CertificateVerify() {
  const { code: paramCode } = useParams();
  const [inputCode, setInputCode] = useState(paramCode || '');
  const [cert, setCert] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'valid' | 'invalid'
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const verifyCode = async (codeToVerify) => {
    if (!codeToVerify || !codeToVerify.trim()) return;
    try {
      setStatus('loading');
      const res = await API.get(`/certificates/verify/${codeToVerify.trim()}`);
      if (res.data?.isValid && res.data?.certificate) {
        setCert(res.data.certificate);
        setStatus('valid');
      } else {
        setCert(null);
        setStatus('invalid');
      }
    } catch (err) {
      setCert(null);
      setStatus('invalid');
    }
  };

  useEffect(() => {
    if (paramCode) {
      setInputCode(paramCode);
      verifyCode(paramCode);
    }
  }, [paramCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      verifyCode(inputCode.trim());
    }
  };

  const handleCopyLink = () => {
    const url = cert?.verificationUrl || window.location.href;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    toast.success('Public Verification URL copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyHash = () => {
    if (cert?.merkleProof) {
      navigator.clipboard?.writeText(cert.merkleProof);
      setCopiedHash(true);
      toast.success('Cryptographic Merkle Proof copied!');
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const isProofOfSkill = cert?.certificateType === 'proof_of_skill';
  const candidateName = cert?.student?.name || 'Verified Learner';
  const roleOrSkill = cert?.roleOrSkillTitle || cert?.course?.title || 'Applied Engineering';
  const certId = cert?.certificateId || cert?.certificateCode || '';
  const assessmentDate = cert?.assessmentDate || cert?.issueDate || cert?.createdAt;
  const formattedDate = assessmentDate
    ? new Date(assessmentDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Verified On-Chain';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full flex-1 space-y-8">
        {/* Verification Hero Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
            NOVA Proof-of-Skill Verification Registry
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Real-time cryptographic database validation of verified learner achievements, practical
            software labs, job simulations, and demonstrated technical capabilities.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative flex items-center">
          <input
            type="text"
            placeholder="Enter Certificate Serial ID (e.g. CERT-POS-20260927-970FE8)..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full pl-11 pr-28 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 shadow-xl transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4" />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Verify ID
          </button>
        </form>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-mono">
              Querying institutional ledger and cryptographic hashes...
            </p>
          </div>
        )}

        {/* VERIFIED CREDENTIAL REPORT */}
        {status === 'valid' && cert && (
          <div className="bg-slate-900/90 rounded-3xl border-2 border-emerald-500/40 shadow-2xl p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 backdrop-blur-sm">
            {/* Top Verification Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-lg">
                      Authentic Credential Verified
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                      ON-CHAIN LEDGER ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Validated against NOVA database records. Cryptographic signatures match exactly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Share Verification URL'}</span>
                </button>
                <Link
                  to={`/student/certificates/${cert._id}`}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>View Diploma</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Core Credential Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              {/* 1. Learner Name */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-400" />
                  Learner Name
                </span>
                <p className="font-extrabold text-base text-white">{candidateName}</p>
                <span className="text-[11px] text-slate-500 font-mono">Verified Scholar</span>
              </div>

              {/* 2. Skill / Role */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-indigo-400" />
                  Conferred Skill / Role
                </span>
                <p className="font-bold text-base text-indigo-400 line-clamp-1">{roleOrSkill}</p>
                <span className="text-[11px] text-slate-500 font-mono">Specialized Track</span>
              </div>

              {/* 9. Assessment Date */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  Assessment Date
                </span>
                <p className="font-bold text-sm text-white">{formattedDate}</p>
                <span className="text-[11px] text-slate-500 font-mono">Conferred Evaluation</span>
              </div>

              {/* 10. Certificate ID */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-indigo-400" />
                  Certificate ID
                </span>
                <p className="font-mono font-bold text-xs text-amber-400 truncate">{certId}</p>
                <span className="text-[11px] text-slate-500 font-mono">Tamper-Proof Registry</span>
              </div>
            </div>

            {/* 3 & 4. DEMONSTRATED SKILLS & SKILL LEVELS */}
            {isProofOfSkill && cert.demonstratedSkills?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <h3 className="font-extrabold text-white text-base">
                      Demonstrated Skills &amp; Verified Levels
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {cert.demonstratedSkills.length} Verified Competencies
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {cert.demonstratedSkills.map((skill, index) => {
                    const isExpert = skill.level === 'Expert';
                    const isAdvanced = skill.level === 'Advanced';
                    const isIntermediate = skill.level === 'Intermediate';

                    const badgeColor = isExpert
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : isAdvanced
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : isIntermediate
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700';

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-white">{skill.name}</h4>
                            <span className="text-[11px] font-mono text-slate-500">
                              {skill.category || 'Engineering'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${badgeColor}`}
                            >
                              {skill.level}
                            </span>
                            <span className="font-mono font-extrabold text-sm text-indigo-400">
                              {skill.score}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Meter */}
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isExpert
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                            }`}
                            style={{ width: `${skill.score}%` }}
                          ></div>
                        </div>

                        {skill.evidenceSummary && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Evidence: {skill.evidenceSummary}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. CAPSTONE PROJECT FEATURED MODULE */}
            {isProofOfSkill && cert.capstoneProject && cert.capstoneProject.title && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-extrabold text-white text-base">
                    Capstone Engineering Project
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30">
                    BENCHMARK CAPSTONE
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 border border-amber-500/30 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-white">
                        {cert.capstoneProject.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                        {cert.capstoneProject.description ||
                          'End-to-end production-grade engineering design, cloud architecture, and fault-tolerant implementation.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs font-semibold border border-slate-700">
                        {cert.capstoneProject.difficulty || 'Advanced'}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono text-xs font-extrabold border border-emerald-500/30">
                        {cert.capstoneProject.score}% PASS
                      </span>
                    </div>
                  </div>

                  {(cert.capstoneProject.repoUrl || cert.capstoneProject.deploymentUrl) && (
                    <div className="flex items-center gap-3 pt-2 text-xs font-mono">
                      {cert.capstoneProject.repoUrl && (
                        <a
                          href={cert.capstoneProject.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" />
                          <span>Code Repository</span>
                        </a>
                      )}
                      {cert.capstoneProject.deploymentUrl && (
                        <a
                          href={cert.capstoneProject.deploymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live Deployment</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5, 6, 7. PRACTICAL PROJECTS, CODING ASSESSMENTS & JOB SIMULATIONS */}
            {isProofOfSkill && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 5. Practical Projects */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
                      Practical Projects
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold">
                      {cert.practicalProjects?.length || 0} COMPLETED
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cert.practicalProjects?.length > 0 ? (
                      cert.practicalProjects.slice(0, 3).map((proj, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                          <p className="font-semibold text-white line-clamp-1">{proj.title}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                            <span>{proj.difficulty}</span>
                            <span className="text-emerald-400 font-bold">{proj.score}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No standalone projects listed.</p>
                    )}
                  </div>
                </div>

                {/* 6. Coding Assessments */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      Coding Assessments
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold">
                      {cert.codingAssessmentsCount || 0} PASSED
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cert.codingAssessments?.length > 0 ? (
                      cert.codingAssessments.slice(0, 3).map((c, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                          <p className="font-semibold text-white line-clamp-1">{c.title}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                            <span>{c.category}</span>
                            <span className="text-emerald-400 font-bold">{c.score}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Automated test harness verified.</p>
                    )}
                  </div>
                </div>

                {/* 7. Job Simulations */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                      Job Simulations
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono text-[10px] font-bold">
                      {cert.jobSimulationsCount || 0} COMPLETED
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cert.jobSimulations?.length > 0 ? (
                      cert.jobSimulations.slice(0, 3).map((sim, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                          <p className="font-semibold text-white line-clamp-1">{sim.title}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                            <span>{sim.role}</span>
                            <span className="text-emerald-400 font-bold">{sim.score}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Workplace simulations verified.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Course Completion Fallback Display */}
            {!isProofOfSkill && (
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-mono uppercase text-indigo-400 font-bold">
                  Curriculum Program
                </span>
                <h4 className="text-lg font-bold text-white">{cert.course?.title}</h4>
                <p className="text-xs text-slate-400">
                  Category: {cert.course?.category || 'Software Engineering'} • Level:{' '}
                  {cert.course?.level || 'Advanced'}
                </p>
              </div>
            )}

            {/* Cryptographic Ledger Footer & Merkle Proof */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 block">Merkle Proof Hash</span>
                <span className="text-[11px] text-slate-300 break-all">{cert.merkleProof}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyHash}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
                >
                  {copiedHash ? 'Hash Copied!' : 'Copy Merkle Hash'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INVALID CERTIFICATE STATE */}
        {status === 'invalid' && (
          <div className="p-10 bg-slate-900/90 rounded-3xl border-2 border-rose-500/40 shadow-2xl text-center space-y-4 animate-in fade-in">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="font-extrabold text-white text-xl">
              Unrecognized Certificate Identifier
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              No verified certificate matches ID <code className="text-rose-400 font-mono">{inputCode}</code>.
              Please check the serial number for typos or contact the issuing learner.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
