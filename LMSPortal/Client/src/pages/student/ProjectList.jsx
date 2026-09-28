import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { EmptyState, Skeleton, ProgressBar } from '../../components/ui';
import { toast } from 'sonner';

export default function ProjectList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      let res = await API.get('/projects');
      let list = res.data?.projects || [];
      if (list.length === 0) {
        try {
          await API.get('/system/auto-seed');
          const retryRes = await API.get('/projects');
          list = retryRes.data?.projects || [];
        } catch (e) {
          // ignore retry failure
        }
      }
      if (Array.isArray(list)) {
        setProjects(list);
      }
    } catch (err) {
      console.error('Failed to load projects catalog:', err);
      toast.error('Unable to fetch project catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        const uStatus = p.userStatus || 'Not Started';
        if (statusFilter === 'Not Started' && uStatus !== 'Not Started') return false;
        if (statusFilter === 'In Progress' && uStatus !== 'In Progress') return false;
        if (statusFilter === 'Submitted' && uStatus !== 'Submitted') return false;
        if (statusFilter === 'Needs Revision' && uStatus !== 'Needs Revision') return false;
        if (statusFilter === 'Passed' && uStatus !== 'Passed') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = p.title?.toLowerCase() || '';
        const desc = p.description?.toLowerCase() || '';
        return title.includes(q) || desc.includes(q);
      }
      return true;
    });
  }, [projects, difficultyFilter, statusFilter, searchQuery]);

  // KPIs
  const totalProjects = projects.length;
  const inProgressCount = projects.filter((p) => p.userStatus === 'In Progress').length;
  const submittedCount = projects.filter((p) => p.userStatus === 'Submitted').length;
  const completedCount = projects.filter((p) => p.userStatus === 'Passed').length;

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'Beginner':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Intermediate':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Advanced':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Expert':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const renderStatusBadge = (status, score) => {
    switch (status) {
      case 'Passed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PASSED {score ? `(${score}%)` : ''}
          </span>
        );
      case 'Needs Revision':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            NEEDS REVISION
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            SUBMITTED
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            IN PROGRESS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            READY TO START
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-20 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-200/90">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
            Student Portal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Project-Based Learning</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Real-World Capstone Projects
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Build end-to-end production systems, track iterative milestone deliverables, and earn verified capstone competency credentials.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold border border-indigo-200 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              {inProgressCount} ACTIVE WORKSPACES
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Total Capstones</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalProjects}</p>
          <span className="text-[11px] text-slate-400 font-mono">Real-world tasks</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-indigo-600 uppercase font-mono">In Progress</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{inProgressCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Milestones underway</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase font-mono">Under Review</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{submittedCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Submitted deliverables</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase font-mono">Mastered &amp; Passed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Skill evidence credited</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'In Progress', label: 'In Progress' },
            { id: 'Submitted', label: 'Submitted' },
            { id: 'Needs Revision', label: 'Needs Revision' },
            { id: 'Passed', label: 'Passed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton height="220px" rounded="16px" />
          <Skeleton height="220px" rounded="16px" />
          <Skeleton height="220px" rounded="16px" />
          <Skeleton height="220px" rounded="16px" />
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const status = project.userStatus || 'Not Started';
              const progressPct = project.progressPercentage || 0;
              const completedCount = project.completedMilestones || 0;
              const totalM = project.totalMilestones || project.milestones?.length || 0;

              return (
                <div
                  key={project._id}
                  className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-2.5">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getDifficultyBadge(
                            project.difficulty
                          )}`}
                        >
                          {project.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          • {project.estimatedDuration}
                        </span>
                      </div>
                      {renderStatusBadge(status, project.userSubmission?.score)}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 tracking-tight leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Required Skills */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {project.requiredSkills?.map((sk) => (
                        <span
                          key={sk._id || sk}
                          className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          #{typeof sk === 'object' ? sk.name : sk}
                        </span>
                      ))}
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs font-mono mb-1 text-slate-600">
                        <span>Milestone Progress</span>
                        <span>
                          {completedCount} of {totalM} Complete ({progressPct}%)
                        </span>
                      </div>
                      <ProgressBar
                        progress={progressPct}
                        color={progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}
                      />
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs font-mono text-slate-400">
                      {project.course?.title ? `Course: ${project.course.title}` : 'Standalone Capstone'}
                    </div>

                    <button
                      onClick={() => navigate(`/student/projects/${project._id}`)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>{status === 'Not Started' ? 'Start Project' : 'Open Workspace'}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <EmptyState
                title="No Real-World Projects Found"
                description="No capstones matched your search criteria."
                actionLabel="Clear Filters"
                onAction={() => {
                  setDifficultyFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
