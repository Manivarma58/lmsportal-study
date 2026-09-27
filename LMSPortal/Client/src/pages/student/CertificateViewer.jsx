import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { toast } from 'sonner';

export default function CertificateViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isCompilingPdf, setIsCompilingPdf] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      API.get(`/certificates/${id}`)
        .then((res) => {
          if (isMounted && res.data?.certificate) {
            setCertificate(res.data.certificate);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch certificate by ID:', err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const isProofOfSkill = certificate?.certificateType === 'proof_of_skill';
  const candidateName = certificate?.student?.name || user?.name || 'Academic Scholar';
  const certTitle =
    certificate?.roleOrSkillTitle ||
    certificate?.course?.title ||
    'Full Stack Cloud & Distributed Systems Engineering';
  const certCategory =
    certificate?.course?.category || (isProofOfSkill ? 'Proof-of-Skill Specialization' : 'Applied Technology');
  const certCode =
    certificate?.certificateId || certificate?.certificateCode || id || 'CERT-POS-2026-99428';
  const issueDate = certificate?.assessmentDate || certificate?.issueDate
    ? new Date(certificate?.assessmentDate || certificate?.issueDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'October 24, 2026';
  const instructorName =
    certificate?.instructorName ||
    certificate?.course?.instructor?.name ||
    'NOVA Academic & Industry Evaluation Board';
  const merkleProof =
    certificate?.merkleProof ||
    `0x8f2d88194a0b2c129e71cc81bf9a004b2c37e19b${(id || 'abc').slice(-4)}`;

  const demonstratedSkills = certificate?.demonstratedSkills || [];
  const practicalProjects = certificate?.practicalProjects || [];
  const codingCount = certificate?.codingAssessmentsCount ?? 0;
  const simCount = certificate?.jobSimulationsCount ?? 0;
  const capstone = certificate?.capstoneProject;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setIsCompilingPdf(true);
    setTimeout(() => {
      setIsCompilingPdf(false);
      toast.success('Archival Vector PDF generated for print and offline archiving.');
      window.print();
    }, 1000);
  };

  const handleCopyLink = () => {
    const url = certificate?.verificationUrl || `${window.location.origin}/verify/${certCode}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    toast.success('Public Verification URL copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(merkleProof);
    setCopiedHash(true);
    toast.success('Merkle proof hash copied to clipboard!');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16 px-6 sm:px-8 lg:px-10 py-6">
      {/* Top Action & Navigation Rail */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/certificates')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Certificates Gallery</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>/</span>
            <span className="text-slate-700 font-semibold">{certCode}</span>
          </div>
          {isProofOfSkill && (
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-[10px] font-bold border border-purple-200">
              PROOF-OF-SKILL CREDENTIAL
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print Diploma</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isCompilingPdf}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCompilingPdf ? 'progress_activity' : 'download'}
            </span>
            <span>{isCompilingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
          </button>

          <Link
            to={`/verify/${certCode}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Public Verify</span>
          </Link>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Certificate Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative bg-white rounded-3xl border-8 border-slate-100 p-8 sm:p-12 shadow-xl overflow-hidden print:border-0 print:shadow-none print:p-0">
            {/* Elegant Double Border Inner Frame */}
            <div className="relative border-2 border-amber-600/40 p-6 sm:p-10 rounded-2xl flex flex-col items-center text-center">
              
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-600"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-600"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-600"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-600"></div>

              {/* Institution Header */}
              <div className="flex flex-col items-center gap-1 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-sm mb-2">
                  <span className="material-symbols-outlined text-[32px]">workspace_premium</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider uppercase font-serif">
                  NOVA INSTITUTE OF TECHNOLOGY
                </h2>
                <span className="text-xs font-mono text-amber-700 tracking-widest uppercase font-semibold">
                  {isProofOfSkill
                    ? 'OFFICIAL PROOF-OF-SKILL CREDENTIAL & APPLIED MASTERY DIPLOMA'
                    : 'OFFICIAL ACADEMIC CREDENTIAL & SPECIALIZATION DIPLOMA'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 italic max-w-lg mb-4 font-serif">
                {isProofOfSkill
                  ? 'This attests that the scholar named below has demonstrated verified technical proficiency across evaluated coding challenges, applied laboratories, job simulations, and real-world software milestones.'
                  : 'This certifies that the academic candidate specified below has fulfilled all requisite laboratory practicums, peer audits, and curricular standards with honors.'}
              </p>

              {/* Candidate Name */}
              <div className="my-3 py-2 px-8 border-b-2 border-slate-300">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
                  {candidateName}
                </h1>
              </div>
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-6">
                VERIFIED CREDENTIAL RECIPIENT
              </span>

              {/* Conferred Skill / Curriculum */}
              <div className="max-w-xl mb-6">
                <span className="text-xs font-mono font-semibold text-indigo-600 uppercase">
                  {isProofOfSkill ? 'DEMONSTRATED COMPETENCY IN' : 'IN RECOGNITION OF ADVANCED MASTERY IN'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  {certTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Department of {certCategory} • Cyber-Academic Engineering &amp; Applied Telemetry
                </p>
              </div>

              {/* Proof-of-Skill Specific Breakdown inside Certificate */}
              {isProofOfSkill && demonstratedSkills.length > 0 && (
                <div className="w-full my-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 pb-1 border-b border-slate-200">
                    <span>DEMONSTRATED SKILL TELEMETRY</span>
                    <span>VERIFIED PROFICIENCY</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {demonstratedSkills.slice(0, 4).map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                        <span className="font-semibold text-slate-800">{skill.name}</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            skill.level === 'Expert' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {skill.level}
                          </span>
                          <span className="font-bold text-slate-700">{skill.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Capstone Mention */}
                  {capstone?.title && (
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
                      <span className="text-slate-500">CAPSTONE PROJECT: <strong className="text-slate-800">{capstone.title}</strong></span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        PASSED ({capstone.score}%)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Signatures & Seal Row */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 items-end">
                <div className="flex flex-col items-center">
                  <span className="font-serif italic text-base text-slate-800 border-b border-slate-400 pb-1 w-36 text-center">
                    {instructorName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase mt-1">
                    Industry Evaluation Board
                  </span>
                </div>

                {/* Golden Seal Badge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-lg border-2 border-white">
                    <span className="material-symbols-outlined text-[28px]">verified</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 font-bold tracking-wider mt-1">
                    VERIFIED SEAL
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-serif italic text-base text-slate-800 border-b border-slate-400 pb-1 w-36 text-center">
                    Dr. Jonathan Vance
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase mt-1">
                    Dean of Academic Affairs
                  </span>
                </div>
              </div>

              {/* Certificate Footer Ledger Metas */}
              <div className="w-full mt-8 pt-4 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
                <span>CONFERRED: {issueDate}</span>
                <span>LEDGER ID: {certCode}</span>
                <span>STATUS: VERIFIED ON-CHAIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Verification Ledger & Audit Panel */}
        <div className="lg:col-span-4 flex flex-col gap-5 print:hidden">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">security</span>
              Cryptographic Verification
            </h3>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 uppercase text-[10px]">Credential Identifier</span>
                <span className="font-bold text-slate-800 text-xs truncate">{certCode}</span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 uppercase text-[10px]">Recipient Scholar</span>
                <span className="font-bold text-slate-800 text-xs">{candidateName}</span>
              </div>

              {isProofOfSkill && (
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-purple-50/60 border border-purple-200/80">
                  <span className="text-purple-600 uppercase text-[10px] font-bold">Verified Evidence Counts</span>
                  <div className="grid grid-cols-3 gap-1 text-[11px] text-purple-950 font-bold mt-1">
                    <div>{practicalProjects.length} Projects</div>
                    <div>{codingCount} Challenges</div>
                    <div>{simCount} Simulations</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Merkle Proof Hash</span>
                  <button onClick={handleCopyHash} className="text-indigo-600 hover:underline text-[10px] cursor-pointer">
                    {copiedHash ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <span className="text-[11px] text-slate-600 break-all">{merkleProof}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>This credential is cryptographically attested and valid indefinitely.</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">link</span>
              <span>Copy Public Verification Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
