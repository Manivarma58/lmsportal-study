import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  Code,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';
import { Skeleton } from '../../components/ui';

const difficultyStyles = {
  Easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800',
  Medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-800',
  Hard: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800',
  Expert: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800',
};

export const CodingLabList = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const res = await API.get('/challenges', {
          params: {
            difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            search: search.trim() || undefined,
          },
        });
        if (isMounted) {
          setChallenges(res.data?.challenges || []);
        }
      } catch (err) {
        console.warn('Failed to fetch coding challenges:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const debounce = setTimeout(fetchChallenges, 250);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [selectedDifficulty, selectedCategory, search]);

  const solvedCount = challenges.filter((c) => c.userProgress?.isSolved).length;

  return (
    <div className="flex flex-col w-full text-slate-800 dark:text-slate-100 antialiased pb-16">
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 max-w-7xl mx-auto">
        
        {/* Top Header */}
        <section className="relative w-full rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/90 dark:border-slate-800 p-6 lg:p-8 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold border border-indigo-200/70 dark:border-indigo-800 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  ISOLATED RUNTIME BENCHMARKS
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-semibold border border-emerald-200/70 dark:border-emerald-800">
                  {solvedCount} Solved
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Coding Laboratory &amp; Benchmarks
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                Test your code against automated unit test suites, execution time limits, and memory thresholds. Completed submissions directly feed your verified practical skill profile.
              </p>
            </div>

            {/* Quick Stat Pill */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 p-4 shrink-0 flex items-center gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Demonstrated Rate</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {challenges.length > 0 ? Math.round((solvedCount / challenges.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search challenges by title, keyword, or problem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDifficulty === diff
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </section>

        {/* Challenges Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex flex-col gap-4"
              >
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))
          ) : challenges.length > 0 ? (
            challenges.map((challenge) => {
              const isSolved = challenge.userProgress?.isSolved;
              const diffClass = difficultyStyles[challenge.difficulty] || difficultyStyles.Medium;

              return (
                <div
                  key={challenge._id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border uppercase tracking-wider ${diffClass}`}>
                          {challenge.difficulty}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {challenge.category}
                        </span>
                      </div>

                      {isSolved && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          SOLVED ({challenge.userProgress.bestScore}%)
                        </span>
                      )}
                    </div>

                    <div>
                      <Link to={`/student/challenge/${challenge._id}`}>
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {challenge.title}
                        </h3>
                      </Link>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 mt-1 leading-relaxed">
                        {challenge.description.replace(/#{1,6}\s+/g, '').replace(/```[\s\S]*?```/g, '')}
                      </p>
                    </div>

                    {/* Skill Tags */}
                    {challenge.skills && challenge.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {challenge.skills.map((skill) => (
                          <span
                            key={skill._id || skill}
                            className="px-2 py-0.5 rounded-md bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-semibold border border-indigo-200/60 dark:border-indigo-900/60"
                          >
                            {skill.name || 'Skill'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>{challenge.totalTestCases} Test Cases</span>
                      <span>•</span>
                      <span>{challenge.timeLimit || 3000}ms Limit</span>
                    </div>

                    <Link
                      to={`/student/challenge/${challenge._id}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span>{isSolved ? 'Review' : 'Solve'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-12 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center">
              <Code className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">No challenges match your filters</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting the difficulty or search query.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default CodingLabList;
