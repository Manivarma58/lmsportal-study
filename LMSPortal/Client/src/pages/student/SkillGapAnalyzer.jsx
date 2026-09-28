import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';
import Skeleton from '../../components/ui/Skeleton';
import ScoreBadge from '../../components/ui/ScoreBadge';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import { getCache, setCache } from '../../utils/fastCache';

const SkillGapAnalyzer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleParam = searchParams.get('roleId');

  // Fast Instant Caching Initializers
  const cachedRoles = getCache('skill_gap_roles', []);
  const safeInitialRoles = Array.isArray(cachedRoles) ? cachedRoles : [];
  const initialRoleId = roleParam || (safeInitialRoles.length > 0 ? safeInitialRoles[0]._id : '');
  const cachedAnalysis = initialRoleId ? getCache(`skill_gap_analysis_${initialRoleId}`, null) : null;

  // Core Data States
  const [roles, setRoles] = useState(safeInitialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoleId);
  const [analysisData, setAnalysisData] = useState(cachedAnalysis);
  const [loading, setLoading] = useState(!safeInitialRoles.length || !cachedAnalysis);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Active Target Setting State & Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [settingGoal, setSettingGoal] = useState(false);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [targetPace, setTargetPace] = useState('standard');
  const [goalNotes, setGoalNotes] = useState('');

  // Extensible Custom Role Creation Modal
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    category: 'Software Engineering',
    description: '',
    careerSalary: '$110,000 - $150,000',
    demandLevel: 'High',
    requiredSkills: [],
  });
  const [creatingRole, setCreatingRole] = useState(false);

  // Matrix Filter State
  const [matrixFilter, setMatrixFilter] = useState('all'); // 'all' | 'strong' | 'developing' | 'gap'

  // Fetch available target roles catalog and analysis concurrently
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        const rolesRes = await API.get('/target-roles');
        const roleList = rolesRes.data?.roles || [];
        if (!isMounted) return;

        setRoles(roleList);
        setCache('skill_gap_roles', roleList);

        const activeId = roleParam || selectedRoleId || (roleList.length > 0 ? roleList[0]._id : null);
        if (activeId) {
          if (!selectedRoleId) setSelectedRoleId(activeId);

          const analysisRes = await API.get(`/target-roles/analyzer?roleId=${activeId}`);
          if (!isMounted) return;

          setAnalysisData(analysisRes.data);
          setCache(`skill_gap_analysis_${activeId}`, analysisRes.data);
        } else {
          // If no roles defined in database yet, set graceful state
          setAnalysisData({
            targetRole: {
              name: 'Full Stack Engineer',
              category: 'Software Engineering',
              description: 'Design, develop, and scale end-to-end full stack web platforms.',
              careerOutlook: {
                averageSalary: '$120,000 - $160,000',
                demandLevel: 'Very High',
                marketGrowth: '+22% YoY',
              },
            },
            summary: {
              roleReadinessScore: 75,
              readinessTier: 'Competent',
              totalSkillsRequired: 6,
              strongCount: 4,
              developingCount: 1,
              gapCount: 1,
            },
            roleSkillMatrix: [],
            recommendedActions: [],
          });
        }
      } catch (err) {
        console.error('Skill gap data load error:', err);
        if (!analysisData && isMounted) {
          setError(err.response?.data?.message || 'Unable to load industry target roles.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setAnalyzing(false);
        }
      }
    };

    initData();

    // Fetch skills list in background for custom role creator
    API.get('/skills')
      .then((res) => {
        if (isMounted) setAvailableSkills(res.data?.skills || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [roleParam]);

  // Role Switcher Handler with instant cache response
  const handleRoleChange = async (roleId) => {
    setSelectedRoleId(roleId);
    setSearchParams({ roleId });

    // Check fast cache first for 0ms transition
    const cached = getCache(`skill_gap_analysis_${roleId}`, null);
    if (cached) {
      setAnalysisData(cached);
    } else {
      setAnalyzing(true);
    }

    try {
      const res = await API.get(`/target-roles/analyzer?roleId=${roleId}`);
      setAnalysisData(res.data);
      setCache(`skill_gap_analysis_${roleId}`, res.data);
    } catch (err) {
      console.error('Skill gap analysis error:', err);
      toast.error(err.response?.data?.message || 'Failed to complete skill gap analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Re-run analysis silently
  const runSkillGapAnalysis = async (roleId) => {
    if (!roleId) return;
    setAnalyzing(true);
    try {
      const res = await API.get(`/target-roles/analyzer?roleId=${roleId}`);
      setAnalysisData(res.data);
      setCache(`skill_gap_analysis_${roleId}`, res.data);
    } catch (err) {
      console.error('Skill gap analysis error:', err);
      toast.error('Failed to refresh skill gap analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Open Goal Modal with current values
  const handleOpenGoalModal = () => {
    const lg = analysisData?.learnerTargetRole;
    if (lg) {
      if (lg.targetDate) {
        try {
          setTargetDate(new Date(lg.targetDate).toISOString().slice(0, 10));
        } catch (_) {}
      }
      if (lg.targetPace) setTargetPace(lg.targetPace);
      if (lg.notes) setGoalNotes(lg.notes);
    }
    setIsGoalModalOpen(true);
  };

  // Quick preset days setter for goal timeline
  const setPresetDays = (days) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setTargetDate(d.toISOString().slice(0, 10));
  };

  // 1-Click Fast Goal Activation
  const handleQuickSetGoal = async () => {
    if (!selectedRoleId || settingGoal) return;
    setSettingGoal(true);
    try {
      await API.post('/target-roles/learner/select', {
        targetRoleId: selectedRoleId,
        targetDate,
        targetPace,
        notes: goalNotes || '',
      });
      const roleName = analysisData?.targetRole?.name || 'Target role';
      toast.success(`${roleName} activated as your career goal!`);
      await runSkillGapAnalysis(selectedRoleId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate target role.');
    } finally {
      setSettingGoal(false);
    }
  };

  // Set / Update Active Target Role with Timeline Customization
  const handleSaveLearnerGoal = async (e) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    setSettingGoal(true);
    try {
      await API.post('/target-roles/learner/select', {
        targetRoleId: selectedRoleId,
        targetDate,
        targetPace,
        notes: goalNotes,
      });
      const roleName = analysisData?.targetRole?.name || 'Target role';
      toast.success(`${roleName} goal timeline updated!`);
      setIsGoalModalOpen(false);
      await runSkillGapAnalysis(selectedRoleId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set target role.');
    } finally {
      setSettingGoal(false);
    }
  };

  // Handle Dynamic Role Skill Toggle in Creator Modal
  const handleToggleSkillRequirement = (skillId) => {
    setNewRoleForm((prev) => {
      const exists = prev.requiredSkills.find((s) => s.skill === skillId);
      if (exists) {
        return {
          ...prev,
          requiredSkills: prev.requiredSkills.filter((s) => s.skill !== skillId),
        };
      } else {
        return {
          ...prev,
          requiredSkills: [
            ...prev.requiredSkills,
            { skill: skillId, requiredScore: 75, importance: 'Important' },
          ],
        };
      }
    });
  };

  // Handle Custom Role Creation Submit
  const handleCreateCustomRole = async (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim() || newRoleForm.requiredSkills.length === 0) {
      toast.error('Please specify a role name and select at least one skill.');
      return;
    }

    setCreatingRole(true);
    try {
      const payload = {
        name: newRoleForm.name.trim(),
        category: newRoleForm.category,
        description: newRoleForm.description,
        careerOutlook: {
          averageSalary: newRoleForm.careerSalary,
          demandLevel: newRoleForm.demandLevel,
          marketGrowth: '+20% YoY growth',
        },
        requiredSkills: newRoleForm.requiredSkills,
      };

      const res = await API.post('/target-roles', payload);
      toast.success(`Role "${res.data?.role?.name || 'New Role'}" created dynamically!`);
      setIsCreateRoleModalOpen(false);

      if (res.data?.role) {
        const updatedRoles = [...roles, res.data.role];
        setRoles(updatedRoles);
        setCache('skill_gap_roles', updatedRoles);
        setSelectedRoleId(res.data.role._id);
        runSkillGapAnalysis(res.data.role._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create target role.');
    } finally {
      setCreatingRole(false);
    }
  };

  // Filtered Matrix List with safe null check
  const filteredMatrix = (analysisData?.roleSkillMatrix || []).filter((item) => {
    if (matrixFilter === 'all') return true;
    return item.status === matrixFilter;
  });

  if (loading && !analysisData) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton variant="card" className="h-44 bg-slate-200/70 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton variant="card" className="h-28 bg-slate-200/70 rounded-2xl" />
          <Skeleton variant="card" className="h-28 bg-slate-200/70 rounded-2xl" />
          <Skeleton variant="card" className="h-28 bg-slate-200/70 rounded-2xl" />
          <Skeleton variant="card" className="h-28 bg-slate-200/70 rounded-2xl" />
        </div>
        <Skeleton variant="card" className="h-96 bg-slate-200/70 rounded-2xl" />
      </div>
    );
  }

  if (error && !analysisData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorState
          title="Skill Gap Analyzer Unavailable"
          message={error}
          onRetry={() => runSkillGapAnalysis(selectedRoleId)}
        />
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton variant="card" className="h-44 bg-slate-200/70 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton variant="card" className="h-28 bg-slate-200/70 rounded-2xl" />
          <Skeleton variant="card" className="h-28 bg-slate-200/70 rounded-2xl" />
          <Skeleton variant="card" className="h-28 bg-slate-200/70 rounded-2xl" />
          <Skeleton variant="card" className="h-28 bg-slate-200/70 rounded-2xl" />
        </div>
        <Skeleton variant="card" className="h-96 bg-slate-200/70 rounded-2xl" />
      </div>
    );
  }

  const role = analysisData?.targetRole || {};
  const summary = analysisData?.summary || {};
  const learnerGoal = analysisData?.learnerTargetRole;
  const recommendedActions = Array.isArray(analysisData?.recommendedActions)
    ? analysisData.recommendedActions
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen text-slate-800">
      {/* 1. TOP HEADER & TARGET ROLE SELECTION */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2.5 flex-1 min-w-0 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px] text-indigo-600">insights</span>
              Skill Gap Analyzer
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              <span className="text-slate-400 font-medium mr-2">Target Role:</span>
              <span className="text-slate-900 font-extrabold">
                {role?.name || 'Select a Role'}
              </span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              {role?.description ||
                'Compare your actual demonstrated skills against industry role benchmarks to uncover targeted learning recommendations.'}
            </p>

            {learnerGoal?.isActive && (
              <div className="pt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Target in {learnerGoal.daysRemaining || 90} days ({learnerGoal.targetPace || 'standard'} pace)
                </span>
              </div>
            )}
          </div>

          {/* Role Switching & Goal Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start xl:self-center">
            <div className="relative min-w-[200px] max-w-[260px]">
              <select
                value={selectedRoleId}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all cursor-pointer truncate"
              >
                {(roles || []).map((r) => (
                  <option key={r._id} value={r._id} className="text-slate-800">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {learnerGoal?.isActive ? (
              <div className="flex items-center gap-2 shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-xs whitespace-nowrap">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                  Active Goal
                </div>
                <button
                  type="button"
                  onClick={handleOpenGoalModal}
                  title="Adjust target completion date and pace"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">edit_calendar</span>
                  Adjust Timeline
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleQuickSetGoal}
                  disabled={settingGoal}
                  title="Set as your active career target role"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95 disabled:opacity-75"
                >
                  {settingGoal ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">flag</span>
                      <span>Set as My Goal</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleOpenGoalModal}
                  title="Customize timeline and pace before saving"
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-indigo-600 shadow-xs transition-all shrink-0 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsCreateRoleModalOpen(true)}
              title="Add a custom target role dynamically without code changes"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-indigo-600">add</span>
              <span>Custom Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. READINESS GAUGES & SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {/* Main Readiness Gauge Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 flex items-center gap-5 shadow-sm">
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            {/* Circular Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  (summary.roleReadinessScore || 0) >= 80
                    ? 'text-emerald-500'
                    : (summary.roleReadinessScore || 0) >= 60
                    ? 'text-blue-600'
                    : 'text-amber-500'
                }
                strokeDasharray={`${summary.roleReadinessScore || 0}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-extrabold text-slate-900 font-mono">
                {summary.roleReadinessScore || 0}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-mono text-slate-500 font-semibold tracking-wider">
              Role Readiness
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {summary.readinessTier || 'Evaluating'}
            </h3>
            <p className="text-xs text-slate-500">
              {summary.totalSkillsRequired || 0} benchmark skills mapped
            </p>
          </div>
        </div>

        {/* Strong Skills Metric */}
        <div
          onClick={() => setMatrixFilter('strong')}
          className={`cursor-pointer rounded-2xl bg-white border p-5 transition-all flex items-center justify-between shadow-sm ${
            matrixFilter === 'strong'
              ? 'border-emerald-400 bg-emerald-50/30 ring-1 ring-emerald-300'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono text-slate-500 font-semibold">Strong Skills</span>
            <div className="text-3xl font-extrabold text-emerald-600 font-mono">
              {summary.strongCount || 0}
            </div>
            <p className="text-xs text-slate-500">Benchmark met or exceeded</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
        </div>

        {/* Developing Skills Metric */}
        <div
          onClick={() => setMatrixFilter('developing')}
          className={`cursor-pointer rounded-2xl bg-white border p-5 transition-all flex items-center justify-between shadow-sm ${
            matrixFilter === 'developing'
              ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-300'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono text-slate-500 font-semibold">Developing</span>
            <div className="text-3xl font-extrabold text-amber-600 font-mono">
              {summary.developingCount || 0}
            </div>
            <p className="text-xs text-slate-500">Within 20 pts of target</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[24px]">trending_up</span>
          </div>
        </div>

        {/* Critical Skill Gaps Metric */}
        <div
          onClick={() => setMatrixFilter('gap')}
          className={`cursor-pointer rounded-2xl bg-white border p-5 transition-all flex items-center justify-between shadow-sm ${
            matrixFilter === 'gap'
              ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-300'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono text-slate-500 font-semibold">Skill Gaps</span>
            <div className="text-3xl font-extrabold text-rose-600 font-mono">
              {summary.gapCount || 0}
            </div>
            <p className="text-xs text-slate-500">Needs focused evidence</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
        </div>
      </div>

      {/* 3. ROLE SKILL COMPARISON MATRIX */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">view_column</span>
              Role Skill Comparison Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Real demonstrated learner scores compared directly against {role?.name || 'role'} requirements
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            {[
              { id: 'all', label: 'All Skills' },
              { id: 'strong', label: 'Strong' },
              { id: 'developing', label: 'Developing' },
              { id: 'gap', label: 'Gaps Only' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setMatrixFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  matrixFilter === f.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="divide-y divide-slate-100">
          {filteredMatrix.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No skills found matching filter "{matrixFilter}".
            </div>
          ) : (
            filteredMatrix.map((item) => {
              const isMet = item.status === 'strong';
              const isDeveloping = item.status === 'developing';

              return (
                <div
                  key={item.skillId || item._id}
                  className="p-5 hover:bg-slate-50/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Skill Title & Info */}
                  <div className="min-w-[260px] space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold text-slate-900 tracking-wide">
                        {item.skillName}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md font-semibold ${
                          item.importance === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.importance === 'Important'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.importance}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.proficiencyLevel}</span>
                      <span>•</span>
                      <span className="font-mono text-blue-600 font-medium">
                        {item.evidenceCount || 0} verified evidence
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar Comparison */}
                  <div className="flex-1 max-w-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Learner Score:</span>
                        <span
                          className={`font-bold ${
                            isMet
                              ? 'text-emerald-600'
                              : isDeveloping
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {item.currentScore || 0}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Required:</span>
                        <span className="text-slate-800 font-semibold">{item.requiredScore || 0}%</span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      {/* Target Indicator Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-amber-500 z-10 shadow-xs"
                        style={{ left: `${Math.min(100, item.requiredScore || 0)}%` }}
                        title={`Target: ${item.requiredScore}%`}
                      />
                      {/* Current Score Fill */}
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isMet
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : isDeveloping
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                            : 'bg-gradient-to-r from-rose-500 to-red-400'
                        }`}
                        style={{ width: `${Math.min(100, item.currentScore || 0)}%` }}
                      />
                    </div>

                    {/* 4-Dimension Mini Indicators */}
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-0.5">
                      <span>Quiz: {item.scoresByDimension?.knowledge || 0}%</span>
                      <span>Coding Lab: {item.scoresByDimension?.practical || 0}%</span>
                      <span>Projects: {item.scoresByDimension?.project || 0}%</span>
                      <span>Assignments: {item.scoresByDimension?.assessment || 0}%</span>
                    </div>
                  </div>

                  {/* Status & Gap Size */}
                  <div className="flex items-center gap-3 lg:justify-end min-w-[150px]">
                    {isMet ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                        Benchmark Met
                      </span>
                    ) : (
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                            isDeveloping
                              ? 'bg-amber-50 border border-amber-200 text-amber-700'
                              : 'bg-rose-50 border border-rose-200 text-rose-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                          Gap: {item.gapSize || 0} pts
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {Math.round(item.matchPercentage || 0)}% achieved
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. NON-ARBITRARY TARGETED RECOMMENDED ACTIONS */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600">model_training</span>
              Targeted Learning Actions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Personalized recommendations derived from your verified submissions, quizzes, and practical projects
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-blue-700 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
            {recommendedActions.length} Priority Actions
          </span>
        </div>

        {recommendedActions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center space-y-3 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-emerald-600">military_tech</span>
            <h3 className="text-lg font-bold text-slate-900">Full Role Mastery Achieved</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Your demonstrated performance meets or exceeds every required threshold for {role?.name || 'this role'}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedActions.map((action, idx) => (
              <div
                key={action.skillId || idx}
                className="rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all p-6 space-y-5 shadow-sm relative overflow-hidden"
              >
                {/* Header: Skill Name & Gap Metric */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">
                        Action #{idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          action.importance === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {action.importance}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{action.skillName}</h3>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-1 rounded border border-rose-200">
                      Gap: {action.gapSize} pts
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {action.currentScore}% of {action.requiredScore}%
                    </p>
                  </div>
                </div>

                {/* Algorithmic Diagnosis */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-blue-600 flex-shrink-0 mt-0.5">
                    psychology
                  </span>
                  <span>{action.diagnosis}</span>
                </div>

                {/* Sub-Action Cards */}
                <div className="space-y-3">
                  {/* 1. Recommended Practical Coding Challenge */}
                  {action.recommendedPracticalChallenge && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 flex items-center justify-between gap-4 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <span className="material-symbols-outlined text-[18px]">terminal</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-blue-700 tracking-wider font-semibold">
                            Practical Coding Lab
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {action.recommendedPracticalChallenge.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {action.recommendedPracticalChallenge.difficulty} •{' '}
                            {action.recommendedPracticalChallenge.note}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/student/challenge/${action.recommendedPracticalChallenge.id}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex-shrink-0"
                      >
                        Start Challenge
                      </Link>
                    </div>
                  )}

                  {/* 2. Recommended Capstone Project */}
                  {action.recommendedProject && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 flex items-center justify-between gap-4 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-indigo-700 tracking-wider font-semibold">
                            Capstone Project
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {action.recommendedProject.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {action.recommendedProject.difficulty} •{' '}
                            {action.recommendedProject.estimatedDuration}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/student/projects/${action.recommendedProject.id}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex-shrink-0"
                      >
                        View Project
                      </Link>
                    </div>
                  )}

                  {/* 3. Recommended Course / Learning Module */}
                  {action.recommendedLearningResources &&
                    action.recommendedLearningResources.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 flex items-center justify-between gap-4 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <span className="material-symbols-outlined text-[18px]">menu_book</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono text-emerald-700 tracking-wider font-semibold">
                              Curated Course
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {action.recommendedLearningResources[0].title}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {action.recommendedLearningResources[0].level} •{' '}
                              {action.recommendedLearningResources[0].totalLessons || 0} Lessons
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/student/course/${action.recommendedLearningResources[0].id}/learn`}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold text-xs shadow-xs transition-colors flex-shrink-0"
                        >
                          {action.recommendedLearningResources[0].actionLabel || 'Learn'}
                        </Link>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. MODAL: SET TARGET ROLE & CAREER TIMELINE */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Set Target Role & Career Milestone"
        size="md"
      >
        <form onSubmit={handleSaveLearnerGoal} className="space-y-4">
          <p className="text-xs text-slate-500">
            Committing to a target role personalizes your daily dashboard next actions and calibrates your learning velocity.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase font-mono mb-1.5">
              Selected Target Role
            </label>
            <input
              type="text"
              readOnly
              value={role?.name || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase font-mono">
                Target Completion Milestone
              </label>
              <span className="text-[11px] text-slate-500">Quick Presets</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setPresetDays(90)}
                className="py-1.5 px-2 text-xs rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 font-medium text-slate-700 transition-colors"
              >
                3 Months
              </button>
              <button
                type="button"
                onClick={() => setPresetDays(180)}
                className="py-1.5 px-2 text-xs rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 font-medium text-slate-700 transition-colors"
              >
                6 Months
              </button>
              <button
                type="button"
                onClick={() => setPresetDays(365)}
                className="py-1.5 px-2 text-xs rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 font-medium text-slate-700 transition-colors"
              >
                1 Year
              </button>
            </div>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase font-mono mb-1.5">
              Commitment Pace
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'relaxed', label: 'Relaxed', time: '3-5 hrs/wk', desc: 'Self-paced' },
                { id: 'standard', label: 'Standard', time: '8-12 hrs/wk', desc: 'Recommended' },
                { id: 'intensive', label: 'Intensive', time: '20+ hrs/wk', desc: 'Bootcamp' },
              ].map((pace) => (
                <button
                  key={pace.id}
                  type="button"
                  onClick={() => setTargetPace(pace.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    targetPace === pace.id
                      ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{pace.label}</div>
                  <div className="text-[11px] font-semibold text-indigo-600 font-mono">{pace.time}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{pace.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase font-mono mb-1.5">
              Career Goal Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={goalNotes}
              onChange={(e) => setGoalNotes(e.target.value)}
              placeholder="e.g. Aiming for Senior AI & Data Systems Engineer before quarterly reviews"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={settingGoal}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
            >
              {settingGoal && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              Save Target Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. MODAL: EXTENSIBLE CUSTOM TARGET ROLE CREATOR */}
      <Modal
        isOpen={isCreateRoleModalOpen}
        onClose={() => setIsCreateRoleModalOpen(false)}
        title="Create New Custom Target Role"
        size="lg"
      >
        <form onSubmit={handleCreateCustomRole} className="space-y-4">
          <p className="text-xs text-slate-500">
            Define dynamic benchmark roles on the fly without modifying code. Select required skills and required scores to customize career roadmaps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase font-mono mb-1.5">
                Role Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Web3 Security Auditor"
                value={newRoleForm.name}
                onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase font-mono mb-1.5">
                Category
              </label>
              <select
                value={newRoleForm.category}
                onChange={(e) => setNewRoleForm({ ...newRoleForm, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data & Artificial Intelligence">Data & Artificial Intelligence</option>
                <option value="Infrastructure & Cloud">Infrastructure & Cloud</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Product & Design">Product & Design</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase font-mono mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              required
              placeholder="Overview of core competencies and architecture expectations..."
              value={newRoleForm.description}
              onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase font-mono mb-1.5">
              Select Required Skills ({newRoleForm.requiredSkills.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              {(availableSkills || []).map((sk) => {
                const reqItem = newRoleForm.requiredSkills.find((s) => s.skill === sk._id);
                const isChecked = !!reqItem;

                return (
                  <div
                    key={sk._id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                      isChecked ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border border-slate-100'
                    }`}
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSkillRequirement(sk._id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0"
                      />
                      <span className="font-semibold text-slate-800">{sk.name}</span>
                      <span className="text-slate-500">({sk.category})</span>
                    </label>

                    {isChecked && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-600">Score:</span>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            value={reqItem.requiredScore}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setNewRoleForm((prev) => ({
                                ...prev,
                                requiredSkills: prev.requiredSkills.map((s) =>
                                  s.skill === sk._id ? { ...s, requiredScore: val } : s
                                ),
                              }));
                            }}
                            className="w-16 px-2 py-1 rounded bg-white border border-slate-300 text-blue-600 font-mono text-center font-bold"
                          />
                        </div>
                        <select
                          value={reqItem.importance}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewRoleForm((prev) => ({
                              ...prev,
                              requiredSkills: prev.requiredSkills.map((s) =>
                                s.skill === sk._id ? { ...s, importance: val } : s
                              ),
                            }));
                          }}
                          className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 text-xs"
                        >
                          <option value="Critical">Critical</option>
                          <option value="Important">Important</option>
                          <option value="Optional">Optional</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateRoleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingRole}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
            >
              {creatingRole && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              Publish Target Role
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SkillGapAnalyzer;
