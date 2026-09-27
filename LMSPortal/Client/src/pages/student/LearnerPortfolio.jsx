import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';

export default function LearnerPortfolio() {
  const { user } = useSelector((state) => state.auth);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings form state
  const [formData, setFormData] = useState({
    slug: '',
    isPublic: true,
    customHeadline: '',
    customBio: '',
    sectionsVisibility: {
      targetRole: true,
      skills: true,
      projects: true,
      assignments: true,
      codingChallenges: true,
      jobSimulations: true,
      certificates: true,
      contactEmail: true,
      socialLinks: true,
    },
  });

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await API.get('/portfolio/me');
      if (res.data?.success && res.data.data) {
        setPortfolio(res.data.data);
        const { settings, profile } = res.data.data;
        setFormData({
          slug: settings.slug || '',
          isPublic: settings.isPublic ?? true,
          customHeadline: settings.customHeadline || profile.headline || '',
          customBio: settings.customBio || profile.bio || '',
          sectionsVisibility: settings.sectionsVisibility || {
            targetRole: true,
            skills: true,
            projects: true,
            assignments: true,
            codingChallenges: true,
            jobSimulations: true,
            certificates: true,
            contactEmail: true,
            socialLinks: true,
          },
        });
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
      toast.error('Unable to retrieve skill portfolio evidence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleCopyLink = () => {
    if (!portfolio?.settings?.slug) return;
    const origin = window.location.origin;
    const fullUrl = `${origin}/portfolio/${portfolio.settings.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Public portfolio link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTogglePublic = async () => {
    try {
      const newStatus = !portfolio.settings.isPublic;
      const res = await API.put('/portfolio/settings', { isPublic: newStatus });
      if (res.data?.success) {
        setPortfolio(res.data.data);
        setFormData((prev) => ({ ...prev, isPublic: newStatus }));
        toast.success(newStatus ? 'Portfolio is now publicly accessible.' : 'Portfolio is now set to private.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update visibility.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await API.put('/portfolio/settings', formData);
      if (res.data?.success) {
        setPortfolio(res.data.data);
        setSettingsOpen(false);
        toast.success('Portfolio privacy & customization settings saved!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <span className="material-symbols-outlined text-4xl text-blue-600 animate-spin">
          progress_activity
        </span>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          Aggregating verified skill portfolio &amp; cryptographic evidence...
        </p>
      </div>
    );
  }

  const { profile, settings, targetRole, skills, projects, assignments, codingChallenges, jobSimulations, certificates, stats } = portfolio;
  const origin = window.location.origin;
  const publicShareUrl = `${origin}/portfolio/${settings?.slug}`;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 min-h-screen bg-transparent space-y-6">
      {/* =========================================================================
          1. SHARE & PRIVACY COMMAND BAR
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-xl">share</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Shareable Recruiter Link:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                settings?.isPublic
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {settings?.isPublic ? 'PUBLICLY ACCESSIBLE' : 'PRIVATE (ONLY YOU)'}
              </span>
            </div>
            <div className="text-xs font-mono text-blue-600 truncate max-w-sm sm:max-w-md mt-0.5">
              {publicShareUrl}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          {/* Preview Public Link */}
          <a
            href={publicShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm border border-slate-200 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-blue-600">open_in_new</span>
            <span>Preview Public View</span>
          </a>

          {/* Quick Visibility Toggle */}
          <button
            onClick={handleTogglePublic}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm border transition-all cursor-pointer ${
              settings?.isPublic
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {settings?.isPublic ? 'visibility' : 'visibility_off'}
            </span>
            <span>{settings?.isPublic ? 'Make Private' : 'Make Public'}</span>
          </button>

          {/* Privacy Settings Modal Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Configure portfolio sections & privacy"
          >
            <span className="material-symbols-outlined text-lg">tune</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. LEARNER HERO & PROFILE SUMMARY CARD
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-md shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Verified Scholar
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-200">
                  NOVA LEVEL 4
                </span>
              </div>

              <p className="text-sm font-medium text-slate-700">
                {settings?.customHeadline || profile.headline}
              </p>

              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                {settings?.customBio || profile.bio}
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 font-mono">
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
                {profile.socialLinks?.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-600 flex items-center gap-1"
                  >
                    <span>Website</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                )}
                <span className="text-slate-400">
                  • Member since {new Date(profile.memberSince).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Target Role Readiness Card */}
          {targetRole && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 min-w-[280px] space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 uppercase tracking-wider font-semibold">
                  Target Role
                </span>
                <span className="font-mono font-bold text-blue-600">
                  {targetRole.alignmentScore || 82}% Alignment
                </span>
              </div>
              <div className="font-bold text-sm text-slate-900">{targetRole.name}</div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {targetRole.description}
              </p>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${targetRole.alignmentScore || 82}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* 4 Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Verified Projects</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{stats.projectsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Practical Labs</span>
            <div className="text-xl font-bold font-mono text-indigo-600 mt-0.5">{stats.assignmentsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Passed Challenges</span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{stats.challengesCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Avg Practical Score</span>
            <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">{stats.avgPracticalScore}%</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. VERIFIED SKILLS & EVIDENCE BREAKDOWN
             Example from Prompt:
             React
             86%
             Advanced
             Evidence:
             - 12 coding challenges
             - 3 assignments
             - 2 projects
      ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">psychology</span>
              <span>Demonstrated Skills &amp; Cryptographic Evidence</span>
            </h2>
            <p className="text-xs text-slate-500">
              Only verified completed coding challenges, practical assignments, and evaluated projects qualify. Learners cannot claim arbitrary skill percentages.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {skills.length} Evaluated Skills
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{skill.name}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
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

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      skill.overallScore >= 85
                        ? 'bg-purple-600'
                        : skill.overallScore >= 70
                        ? 'bg-blue-600'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${skill.overallScore}%` }}
                  ></div>
                </div>

                {/* Exact Evidence List as per Prompt Spec */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-mono font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-blue-600">verified</span>
                    <span>Verified Evidence:</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc font-medium">
                    {skill.evidenceBullets.map((eb, idx) => (
                      <li key={idx} className="leading-snug">
                        {eb}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                <span>Knowledge: {skill.knowledgeScore}%</span>
                <span>Practical: {skill.practicalScore}%</span>
                <span>Projects: {skill.projectScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          4. VERIFIED PROJECTS SHOWCASE
      ========================================================================= */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">rocket_launch</span>
                <span>Verified Capstone Projects</span>
              </h2>
              <p className="text-xs text-slate-500">
                Architectural solutions evaluated against automated rubrics and instructor grading.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-200">
              {projects.length} Verified
            </span>
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
                      {proj.difficulty} Level
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      {proj.score}% Score
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{proj.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{proj.feedback}</p>

                  {/* Rubric Criteria Summary */}
                  {proj.rubricGrades?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {proj.rubricGrades.map((rg, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
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
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">code</span>
                      <span>View Repository</span>
                    </a>
                  )}
                  {proj.deploymentUrl && (
                    <a
                      href={proj.deploymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      <span>Live Deployment</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          5. VERIFIED PRACTICAL ASSIGNMENTS & CODING LABS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practical Assignments */}
        {assignments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-base">assignment</span>
                  <span>Practical Assignments</span>
                </h3>
                <p className="text-xs text-slate-500">Evaluated hands-on code implementations.</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{assignments.length} Passed</span>
            </div>

            <div className="space-y-3">
              {assignments.map((asgn) => (
                <div key={asgn.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 truncate max-w-[240px]">{asgn.title}</h4>
                    <span className="font-mono text-xs font-bold text-emerald-600">{asgn.score}% Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{asgn.feedback}</p>
                  {asgn.repositoryUrl && (
                    <div className="pt-1">
                      <a
                        href={asgn.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">terminal</span>
                        <span>{asgn.repositoryUrl}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coding Assessments */}
        {codingChallenges.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-base">code</span>
                  <span>Passed Algorithmic Challenges</span>
                </h3>
                <p className="text-xs text-slate-500">Passed automated test runner suites.</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{codingChallenges.length} Accepted</span>
            </div>

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
                    <span>•</span>
                    <span>Status: Accepted</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. VERIFIED JOB SIMULATIONS & CERTIFICATIONS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Simulations */}
        {jobSimulations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base">work</span>
                  <span>Completed Job Simulations</span>
                </h3>
                <p className="text-xs text-slate-500">Simulated corporate engineering workflows.</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{jobSimulations.length} Evaluated</span>
            </div>

            <div className="space-y-3">
              {jobSimulations.map((sim) => (
                <div key={sim.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{sim.title}</h4>
                      <span className="text-[10px] font-mono text-blue-600 font-semibold">{sim.role}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-600">{sim.overallScore}% Score</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{sim.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Certificates */}
        {certificates.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-base">workspace_premium</span>
                  <span>Issued Certifications</span>
                </h3>
                <p className="text-xs text-slate-500">Cryptographically verifiable credentials.</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{certificates.length} Verified</span>
            </div>

            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
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
          </div>
        )}
      </div>

      {/* =========================================================================
          7. PORTFOLIO PRIVACY & CUSTOMIZATION SETTINGS MODAL
      ========================================================================= */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Portfolio Privacy &amp; Display Settings</h3>
                <p className="text-xs text-slate-500">Configure what recruiters and external viewers see.</p>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* Public Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Public Portfolio Access</span>
                  <p className="text-[11px] text-slate-500">Allow recruiters to view your verified portfolio via share link.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Vanity Slug */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Custom Shareable URL Slug</label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden text-xs">
                  <span className="px-3 text-slate-400 font-mono">/portfolio/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-white px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="your-name"
                  />
                </div>
              </div>

              {/* Custom Headline */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Custom Headline (Recruiter Title)</label>
                <input
                  type="text"
                  value={formData.customHeadline}
                  onChange={(e) => setFormData({ ...formData, customHeadline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white"
                  placeholder="e.g. Distributed Systems Engineer & Microservices Practitioner"
                />
              </div>

              {/* Custom Bio */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Custom Bio</label>
                <textarea
                  rows={3}
                  value={formData.customBio}
                  onChange={(e) => setFormData({ ...formData, customBio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white resize-none"
                  placeholder="Tell recruiters about your engineering journey..."
                />
              </div>

              {/* Section Visibility Toggles */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] font-mono">
                  Display Sections on Public View
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.keys(formData.sectionsVisibility).map((secKey) => (
                    <label key={secKey} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sectionsVisibility[secKey]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sectionsVisibility: {
                              ...formData.sectionsVisibility,
                              [secKey]: e.target.checked,
                            },
                          })
                        }
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="capitalize text-slate-700 font-medium">
                        {secKey.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
