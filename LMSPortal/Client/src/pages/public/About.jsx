import React from 'react';
import Navbar from '../../components/Navbar';
import { GraduationCap, ShieldCheck, Users, Globe, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import NeuralBackground from '../../components/NeuralBackground';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased blueprint-grid relative overflow-x-hidden">
      {/* Live 3D Kinetic Neural Knowledge Cloud Background */}
      <NeuralBackground
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        opacity={0.6}
        nodeCount={50}
        maxLines={140}
      />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" /> About LMS Portal
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Empowering Education Across the Globe
          </h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
            Our mission is to democratize high-impact tech education, making industry-grade knowledge, verified assessments, and verifiable certification accessible to every passionate learner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Interactive Learning</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Step-by-step modular lessons with rich video streaming, code attachments, and real-time progress syncing.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Verifiable Certificates</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated certificate generation with unique verification codes that employers and institutions can validate instantly.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Collaborative Community</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Live discussion boards, instant direct messaging, and real-time announcements powered by WebSockets.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/20">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-bold">Ready to start your learning journey?</h2>
            <p className="text-indigo-100 text-sm">Join thousands of students and instructors today.</p>
          </div>
          <Link
            to="/courses"
            className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition-colors whitespace-nowrap text-sm"
          >
            Browse Courses
          </Link>
        </div>
      </main>
    </div>
  );
}
