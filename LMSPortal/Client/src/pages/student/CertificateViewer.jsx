import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import {
  Award,
  Printer,
  Share2,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const CertificateViewer = () => {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/certificates/${id}`);
        setCert(res.data.certificate);
      } catch (err) {
        toast.error(err.message || 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/${cert?.certificateCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Public verification link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Award className="w-16 h-16 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Certificate Not Found</h2>
        <Link to="/student/dashboard" className="text-sm text-indigo-600 mt-2 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 flex flex-col items-center">
      {/* Top Controls (Hidden when printing) */}
      <div className="max-w-4xl w-full flex items-center justify-between gap-4 mb-6 print:hidden">
        <Link
          to="/student/my-courses"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors"
          >
            <Share2 className="w-4 h-4 text-indigo-500" /> Share Link
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/20 transition-all"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Certificate Frame */}
      <div className="max-w-4xl w-full bg-white text-slate-900 p-8 sm:p-14 rounded-3xl shadow-2xl border-8 border-double border-amber-600/30 relative overflow-hidden print:border-amber-600 print:shadow-none print:m-0">
        {/* Decorative corner accents */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500"></div>
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500"></div>

        {/* Certificate Content */}
        <div className="text-center space-y-6 relative z-10 py-6">
          <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full border border-amber-200 shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-amber-700">
              Certificate of Completion
            </h4>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-2">
              LMS Portal Academy
            </h1>
          </div>

          <p className="text-sm text-slate-500 italic">This is proudly presented to</p>

          <div className="py-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-wide underline decoration-amber-400 decoration-2 underline-offset-8">
              {cert.student?.name}
            </h2>
          </div>

          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            for successfully completing all required coursework, lesson milestones, and assessments for the curriculum program
          </p>

          <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 max-w-xl mx-auto">
            "{cert.course?.title}"
          </h3>

          <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
            Grade: {cert.grade}
          </p>

          {/* Signatures & Seal */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 items-end gap-6 border-t border-slate-200 mt-8">
            <div className="text-center">
              <p className="font-serif italic text-lg text-slate-800">
                {cert.instructorName || cert.course?.instructor?.name}
              </p>
              <div className="w-32 mx-auto border-b border-slate-400 my-1"></div>
              <p className="text-[11px] uppercase font-bold text-slate-400">
                Authorized Instructor
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-double border-amber-500 text-amber-600 flex flex-col items-center justify-center font-bold text-[9px] uppercase tracking-tighter">
                <span>Official</span>
                <ShieldCheck className="w-4 h-4" />
                <span>Verified</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">
                {new Date(cert.issueDate).toLocaleDateString()}
              </p>
              <div className="w-32 mx-auto border-b border-slate-400 my-1"></div>
              <p className="text-[11px] uppercase font-bold text-slate-400">
                Date of Issuance
              </p>
            </div>
          </div>

          <div className="pt-4 text-[10px] text-slate-400 font-mono">
            Verification ID: {cert.certificateCode} • Verify at: {window.location.origin}/verify/{cert.certificateCode}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;
