import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { toast } from 'sonner';

export default function CertificateGallery() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [certificates, setCertificates] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPOS, setGeneratingPOS] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCertificatesData = async () => {
    try {
      setLoading(true);
      const [certRes, enrollRes] = await Promise.allSettled([
        API.get('/certificates/student/my-certificates'),
        API.get('/enrollments/my-courses'),
      ]);

      if (certRes.status === 'fulfilled') {
        setCertificates(certRes.value.data?.certificates || []);
      }
      if (enrollRes.status === 'fulfilled') {
        const raw = enrollRes.value.data?.enrollments || [];
        setEnrollments(raw.filter((e) => Boolean(e.course)));
      }
    } catch (err) {
      console.warn('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificatesData();
  }, []);

  const handleGenerateProofOfSkill = async () => {
    try {
      setGeneratingPOS(true);
      const res = await API.post('/certificates/generate-proof-of-skill', {});
      toast.success(res.data?.message || 'Proof-of-Skill Certificate generated successfully!');
      await fetchCertificatesData();
      if (res.data?.certificate?._id) {
        navigate(`/student/certificates/${res.data.certificate._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not generate Proof-of-Skill Certificate';
      toast.error(msg);
    } finally {
      setGeneratingPOS(false);
    }
  };

  const candidateName = user?.name || 'Academic Scholar';

  // Filtered certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const code = (c.certificateId || c.certificateCode || '').toLowerCase();
      const title = (c.roleOrSkillTitle || c.course?.title || '').toLowerCase();
      const category = (c.course?.category || '').toLowerCase();
      return code.includes(q) || title.includes(q) || category.includes(q);
    });
  }, [certificates, searchQuery]);

  // Courses in progress towards certification
  const inProgressCourses = useMemo(() => {
    return enrollments.filter((e) => {
      const prog = e.completionPercentage ?? e.progressPercentage ?? 0;
      const isDone = e.completed || prog === 100;
      const hasCert = certificates.some(
        (c) => c.course?._id === e.course?._id || c.course === e.course?._id
      );
      return !hasCert && !isDone;
    });
  }, [enrollments, certificates]);

  const handleCopyLink = (code) => {
    const url = `${window.location.origin}/verify/${code}`;
    navigator.clipboard?.writeText(url);
    toast.success('Public verification link copied to clipboard!');
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16 px-6 sm:px-8 lg:px-10 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-200/90">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
            Student Portal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Certificates</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Verified Academic &amp; Proof-of-Skill Credentials
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Verifiable diplomas, demonstrated skill credentials, and cryptographic certificates earned across your coursework and practical projects.
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleGenerateProofOfSkill}
              disabled={generatingPOS}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {generatingPOS ? 'progress_activity' : 'workspace_premium'}
              </span>
              <span>{generatingPOS ? 'Verifying Achievements...' : 'Generate Proof-of-Skill Certificate'}</span>
            </button>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200/70 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {certificates.length} VERIFIED CREDENTIALS
            </span>
          </div>
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 my-6 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="relative flex-1 sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by credential code, role or course title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
          <span>ISSUED TO: <strong className="text-slate-800">{candidateName}</strong></span>
        </div>
      </div>

      {/* Main Certificate Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-mono mt-3">Verifying student ledger credentials...</p>
        </div>
      ) : filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => {
            const isProofOfSkill = cert.certificateType === 'proof_of_skill';
            const certTitle = cert.roleOrSkillTitle || cert.course?.title || 'Academic Specialization';
            const certCategory = isProofOfSkill ? 'Proof-of-Skill Specialization' : (cert.course?.category || 'Engineering');
            const certCode = cert.certificateId || cert.certificateCode || `NOVA-${cert._id.slice(-8).toUpperCase()}`;
            const issueDate = cert.assessmentDate || cert.issueDate || cert.createdAt;

            return (
              <div
                key={cert._id}
                className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden relative group"
              >
                {/* Decorative accent rim */}
                <div className={`absolute inset-x-0 top-0 h-1.5 ${
                  isProofOfSkill
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600'
                }`}></div>

                <div className="p-6 flex flex-col gap-4">
                  {/* Top Seal & Academy Badge */}
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                      isProofOfSkill
                        ? 'bg-purple-50 text-purple-600 border-purple-200/60'
                        : 'bg-amber-50 text-amber-600 border-amber-200/60'
                    }`}>
                      <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isProofOfSkill ? (
                        <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-mono text-[10px] font-bold border border-purple-200/60">
                          PROOF-OF-SKILL
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200/60 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          COURSE COMPLETION
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Certificate Info */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                      {certCategory}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug">
                      {certTitle}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {isProofOfSkill
                        ? `Conferred to ${candidateName} based on verified telemetry: ${cert.demonstratedSkills?.length || 0} skills evaluated.`
                        : `Awarded to ${candidateName} for demonstrating excellence in coursework and practical laboratories.`}
                    </p>
                  </div>

                  {/* Demonstrated Skills / Capstone snippet for POS */}
                  {isProofOfSkill && (
                    <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col gap-1.5 text-xs">
                      {cert.capstoneProject?.title && (
                        <div className="text-[11px] text-purple-900 font-semibold line-clamp-1">
                          Capstone: {cert.capstoneProject.title} ({cert.capstoneProject.score}%)
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(cert.demonstratedSkills || []).slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-purple-700 border border-purple-200 font-medium">
                            {s.name} ({s.score}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Ledger Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Credential ID:</span>
                      <span className="font-semibold text-slate-700">{certCode}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Date Evaluated:</span>
                      <span className="text-slate-700">{new Date(issueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(certCode)}
                      className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                      title="Copy Public Verification Link"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                    </button>
                    <Link
                      to={`/verify/${certCode}`}
                      target="_blank"
                      className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white transition-colors cursor-pointer"
                      title="Open Public Verification Page"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/student/certificates/${cert._id}`}
                      className={`px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1 ${
                        isProofOfSkill
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <span>View Diploma</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px]">workspace_premium</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {searchQuery ? 'No matching certificates found' : 'No Certificates Issued Yet'}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mt-2 leading-relaxed">
            {searchQuery
              ? `No certificates matched your query "${searchQuery}".`
              : 'Demonstrate skills across projects, coding challenges, and simulations to generate official Proof-of-Skill credentials.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleGenerateProofOfSkill}
              disabled={generatingPOS}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer disabled:opacity-50"
            >
              {generatingPOS ? 'Verifying Achievements...' : 'Generate Proof-of-Skill Certificate'}
            </button>
            <Link
              to="/student/my-courses"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50"
            >
              Continue Enrolled Courses
            </Link>
          </div>
        </div>
      )}

      {/* Roadmap Section: Enrolled Courses in Progress Towards Certification */}
      {inProgressCourses.length > 0 && (
        <section className="mt-12 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Course Certificates in Progress</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
              {inProgressCourses.length} Curricula
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressCourses.map((e) => {
              const course = e.course;
              const progress = e.completionPercentage ?? e.progressPercentage ?? 0;

              return (
                <div
                  key={e._id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase text-blue-600">
                        {course.category || 'Curriculum'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">{progress}%</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-slate-500">
                      Complete remaining modules to trigger automatic course certificate issuance.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {100 - progress}% until certification
                      </span>
                      <Link
                        to={`/student/course/${course._id}/learn`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Study Now →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
