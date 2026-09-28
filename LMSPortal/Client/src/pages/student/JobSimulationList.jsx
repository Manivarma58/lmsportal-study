import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';
import {
  Briefcase,
  Building2,
  Clock,
  ChevronRight,
  Database,
  Terminal,
  Code2,
  FileSpreadsheet,
  Layers,
  Award,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  FileText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { getCache, setCache } from '../../utils/fastCache';

const SIMULATION_TYPES = [
  'All',
  'Data Analysis',
  'Software Development',
  'SQL',
  'Debugging',
  'API Development',
  'Business Case',
];

const DIFFICULTY_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const JobSimulationList = () => {
  const cachedInitialSims = getCache('job_simulations_all', []);
  const safeInitial = Array.isArray(cachedInitialSims) ? cachedInitialSims : [];
  const [simulations, setSimulations] = useState(safeInitial);
  const [loading, setLoading] = useState(safeInitial.length === 0);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSimulations = async (isManualAction = false) => {
    if (isManualAction && simulations.length === 0) {
      setLoading(true);
    }
    try {
      const params = {};
      if (selectedType !== 'All') params.type = selectedType;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await API.get('/simulations', { params });
      let list = res.data.simulations || [];
      if (list.length === 0 && selectedType === 'All' && selectedDifficulty === 'All' && !searchQuery.trim()) {
        try {
          await API.get('/system/auto-seed');
          const retryRes = await API.get('/simulations');
          list = retryRes.data.simulations || [];
        } catch (e) {
          // ignore retry failure
        }
      }
      setSimulations(list);

      if (selectedType === 'All' && selectedDifficulty === 'All' && !searchQuery.trim() && list.length > 0) {
        setCache('job_simulations_all', list);
      }
    } catch (err) {
      console.error('Failed to fetch simulations:', err);
      toast.error('Failed to load workplace simulations catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations(simulations.length === 0);
  }, [selectedType, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSimulations(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Data Analysis':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'Software Development':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'SQL':
        return <Database className="w-4 h-4 text-indigo-600" />;
      case 'Debugging':
        return <Terminal className="w-4 h-4 text-rose-600" />;
      case 'API Development':
        return <Layers className="w-4 h-4 text-amber-600" />;
      case 'Business Case':
        return <Briefcase className="w-4 h-4 text-violet-600" />;
      default:
        return <Briefcase className="w-4 h-4 text-blue-600" />;
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Advanced':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen text-slate-800">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-10 border border-slate-200/90 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-blue-50 border border-blue-200 text-blue-700">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>Workplace Performance Sandbox</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Enterprise{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Job Simulations
            </span>
          </h1>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Step directly into realistic professional roles. Solve dirty data challenges, build resilient backend webhook architectures, diagnose live production outages, and author executive briefs. Every verified deliverable directly feeds your demonstrated skill proficiencies.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">Scenarios</span>
              <span className="text-lg font-bold text-slate-900">6 Live Roles</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">Deliverables</span>
              <span className="text-lg font-bold text-blue-600">Code &amp; SQL</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">Evaluation</span>
              <span className="text-lg font-bold text-emerald-600">Rubric Driven</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">Outcome</span>
              <span className="text-lg font-bold text-indigo-600">Skill Engine Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company, or challenge title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs transition-all"
            />
          </form>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono font-medium">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-xs"
            >
              {DIFFICULTY_LEVELS.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Simulation Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SIMULATION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 shadow-xs ${
                selectedType === type
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
              }`}
            >
              {type !== 'All' && getTypeIcon(type)}
              <span>{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 bg-slate-200/70 rounded-3xl" />
          ))}
        </div>
      ) : (simulations || []).length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Simulations Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No workplace scenarios matched your criteria. Try adjusting the search query or selecting a different simulation category.
          </p>
          <button
            onClick={() => {
              setSelectedType('All');
              setSelectedDifficulty('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(simulations || []).map((sim) => {
            const hasStarted = sim.learnerStatus?.hasStarted;
            const status = sim.learnerStatus?.status;
            const score = sim.learnerStatus?.overallScore;
            const passed = sim.learnerStatus?.passed;
            const progressPct = sim.learnerStatus?.progressPercentage || 0;

            return (
              <div
                key={sim._id}
                className="rounded-3xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group shadow-sm"
              >
                <div className="p-6 space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {getTypeIcon(sim.simulationType)}
                      <span>{sim.simulationType}</span>
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getDifficultyBadge(
                        sim.difficulty
                      )}`}
                    >
                      {sim.difficulty}
                    </span>
                  </div>

                  {/* Target Professional Role & Title */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-blue-700 uppercase tracking-wider block font-semibold">
                      Target Role: {sim.role}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {sim.title}
                    </h3>
                  </div>

                  {/* Company Scenario Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{sim.companyScenario?.companyName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{sim.companyScenario?.industry}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                      {sim.companyScenario?.context}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[9px] font-mono uppercase text-slate-500 font-semibold block">Est. Time</span>
                      <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-blue-600" />
                        {sim.estimatedTime}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[9px] font-mono uppercase text-slate-500 font-semibold block">Tasks</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                        {sim.tasks?.length || 0} Milestones
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[9px] font-mono uppercase text-slate-500 font-semibold block">Datasets</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                        {sim.datasets?.length || 0} Sources
                      </span>
                    </div>
                  </div>

                  {/* Required Skills Chips */}
                  {sim.requiredSkills?.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Target Skills Evaluated:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {sim.requiredSkills.map((rs, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium"
                          >
                            {rs.skillName} (Req: {rs.minProficiency}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learner Progress Bar if Started */}
                  {hasStarted && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-mono font-medium">Progress:</span>
                        <span className="font-mono font-bold text-blue-700">
                          {status === 'Evaluated' ? 'Evaluated' : `${progressPct}% Complete`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                          style={{ width: `${status === 'Evaluated' ? 100 : progressPct}%` }}
                        ></div>
                      </div>

                      {status === 'Evaluated' && score !== null && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                          <span className="text-slate-600 font-medium">Performance Score:</span>
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                              passed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {score}% • {passed ? 'PASSED' : 'NEEDS WORK'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <Link
                    to={`/student/simulations/${sim.slug}`}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                      status === 'Evaluated'
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : hasStarted
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-sm'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    <span>
                      {status === 'Evaluated'
                        ? 'Review Evaluation & Rubric'
                        : hasStarted
                        ? 'Resume Workspace'
                        : 'Enter Simulation'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobSimulationList;
