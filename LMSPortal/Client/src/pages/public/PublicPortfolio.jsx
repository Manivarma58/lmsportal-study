import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPublicPortfolio = async () => {
      setLoading(true);
      setError(null);
      setIsPrivate(false);
      try {
        const res = await API.get(`/portfolio/public/${slug}`);
        if (!isMounted) return;
        if (res.data?.success && res.data.data) {
          setData(res.data.data);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.response?.status === 403 || err.response?.data?.isPrivate) {
          setIsPrivate(true);
        } else {
          setError(err.response?.data?.message || 'Portfolio not found or link has expired.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPublicPortfolio();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Portfolio URL copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <span className="material-symbols-outlined text-4xl text-blue-600 animate-spin">
          progress_activity
        </span>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          Verifying cryptographic learner proof-of-work on NOVA Skill Engine...
        </p>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Private Candidate Portfolio</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The candidate has configured this skill portfolio as private. If you are a recruiter or employer, please contact the candidate directly to request temporary access.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              <span>Return to NOVA LMS</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">sentiment_dissatisfied</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Portfolio Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'The requested portfolio does not exist or may have been unlinked.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              <span>Explore NOVA LMS</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { profile, targetRole, skills = [], projects = [], assignments = [], codingChallenges = [], jobSimulations = [], certificates = [], stats } = data;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans blueprint-grid selection:bg-blue-100 selection:text-blue-700 pb-16">
      {/* ================= RECRUITER VERIFICATION HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs font-bold text-sm">
              N
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              NOVA <span className="text-blue-600">PORTFOLIO</span>
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            100% Verified Telemetry
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            title="Copy share link"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Print Candidate Summary</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* ================= 1. RECRUITER HERO PROFILE ================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md shrink-0">
                  {profile.name.substring(0, 2).toUpperCase()}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    {profile.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Proof-of-Work Verified
                  </span>
                </div>

                <p className="text-sm font-semibold text-blue-600">
                  {profile.headline}
                </p>

                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  {profile.bio}
                </p>

                {/* Social & Contact */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 font-mono">
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold transition flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">mail</span>
                      <span>Contact Candidate</span>
                    </a>
                  )}
                  {profile.socialLinks?.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>GitHub</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>LinkedIn</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Target Role & Verification Badge */}
            {targetRole && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 min-w-[260px] space-y-2 shrink-0">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Target Engineering Role
                </span>
                <div className="font-bold text-sm text-slate-900">{targetRole.name}</div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-600 pt-1">
                  <span>Role Alignment:</span>
                  <span className="font-bold text-blue-600">{targetRole.alignmentScore}% Ready</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${targetRole.alignmentScore}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Verified Projects</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{stats.projectsCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Practical Labs</span>
              <div className="text-xl font-bold font-mono text-indigo-600 mt-0.5">{stats.assignmentsCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Challenges Solved</span>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{stats.challengesCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Practical Score</span>
              <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">{stats.avgPracticalScore}%</div>
            </div>
          </div>
        </section>

        {/* ================= 2. VERIFIED SKILLS WITH EVIDENCE LIST ================= */}
        {skills.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">verified</span>
                <span>Verified Skills &amp; Evidentiary Proof-of-Work</span>
              </h2>
              <p className="text-xs text-slate-500">
                Percentages calculated strictly through automated test suites, rubric-graded projects, and evaluated code challenges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{skill.name}</h3>
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          {skill.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold font-mono text-blue-600">
                          {skill.overallScore}%
                        </span>
                        <div className="text-[10px] font-mono font-bold text-emerald-600 uppercase">
                          {skill.proficiencyLevel}
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-3">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${skill.overallScore}%` }}
                      ></div>
                    </div>

                    {/* Exact Evidence List as per Prompt Spec */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-slate-700">Verified Evidence:</span>
                      <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc font-medium">
                        {skill.evidenceBullets.map((eb, idx) => (
                          <li key={idx}>{eb}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                    <span>Practical: {skill.practicalScore}%</span>
                    <span>Projects: {skill.projectScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= 3. VERIFIED REAL-WORLD PROJECTS ================= */}
        {projects.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">rocket_launch</span>
                <span>Verified Capstone Projects</span>
              </h2>
              <p className="text-xs text-slate-500">
                End-to-end production systems built, deployed, and evaluated with rubric scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                        {proj.difficulty}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
                        {proj.score}% Score
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">{proj.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{proj.feedback}</p>

                    {/* Rubric Grades */}
                    {proj.rubricGrades?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        {proj.rubricGrades.map((rg, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-500">{rg.criterionName}:</span>{' '}
                            <span className="font-mono font-bold text-slate-800">{rg.pointsEarned}/{rg.maxPoints} pts</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    {proj.repositoryUrl && (
                      <a
                        href={proj.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">code</span>
                        <span>Source Code</span>
                      </a>
                    )}
                    {proj.deploymentUrl && (
                      <a
                        href={proj.deploymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= 4. PRACTICAL ASSIGNMENTS & CODING LABS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">assignment</span>
                <span>Practical Assignments</span>
              </h3>
              <div className="space-y-3">
                {assignments.map((asgn) => (
                  <div key={asgn.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{asgn.title}</h4>
                      <span className="font-mono text-xs font-bold text-emerald-600">{asgn.score}% Verified</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{asgn.feedback}</p>
                    {asgn.repositoryUrl && (
                      <a
                        href={asgn.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-blue-600 hover:underline flex items-center gap-1 pt-1"
                      >
                        <span className="material-symbols-outlined text-xs">terminal</span>
                        <span>{asgn.repositoryUrl}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {codingChallenges.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">code</span>
                <span>Passed Algorithmic Challenges</span>
              </h3>
              <div className="space-y-3">
                {codingChallenges.map((ch) => (
                  <div key={ch.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{ch.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ch.passedTests}/{ch.totalTests} TESTS PASSED
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>Language: {ch.language}</span>
                      <span>•</span>
                      <span>Difficulty: {ch.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ================= 5. JOB SIMULATIONS & CREDENTIALS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobSimulations.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">work</span>
                <span>Job Simulations Completed</span>
              </h3>
              <div className="space-y-3">
                {jobSimulations.map((sim) => (
                  <div key={sim.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{sim.title}</h4>
                        <span className="text-[10px] font-mono text-blue-600">{sim.role}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-600">{sim.overallScore}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{sim.feedback}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">workspace_premium</span>
                <span>Verified Certifications</span>
              </h3>
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{cert.courseTitle}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        VERIFIED
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Credential: {cert.certificateNumber}</span>
                      <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer watermark */}
      <footer className="text-center text-xs font-mono text-slate-400 pt-12 pb-6">
        Verified Proof-of-Work Telemetry • Generated by NOVA LMS Skill Engine
      </footer>
    </div>
  );
}
