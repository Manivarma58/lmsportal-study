import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import { ShieldCheck, XCircle, Search, Award, CheckCircle2, ArrowRight } from 'lucide-react';

const CertificateVerify = () => {
  const { code: paramCode } = useParams();
  const [inputCode, setInputCode] = useState(paramCode || '');
  const [cert, setCert] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'valid', 'invalid'

  const verifyCode = async (codeToVerify) => {
    if (!codeToVerify) return;
    try {
      setStatus('loading');
      const res = await API.get(`/certificates/verify/${codeToVerify}`);
      setCert(res.data.certificate);
      setStatus('valid');
    } catch (err) {
      setCert(null);
      setStatus('invalid');
    }
  };

  useEffect(() => {
    if (paramCode) {
      verifyCode(paramCode);
    }
  }, [paramCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      verifyCode(inputCode.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-16 w-full flex-1 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Certificate Authenticity Verification
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Validate the authenticity, issuer, and completion details of any LMS Portal credential.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Enter Certificate Serial ID (e.g. CERT-LMS-2026-DEMO99)..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full pl-11 pr-32 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4" />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Verify
          </button>
        </form>

        {/* Verification Result Card */}
        {status === 'loading' && (
          <div className="p-8 text-center text-slate-400 text-sm">
            Querying blockchain and database records...
          </div>
        )}

        {status === 'valid' && cert && (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/40 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold text-base">Authentic Credential Verified</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border-y border-slate-100 dark:border-slate-800 py-4">
              <div>
                <span className="text-slate-400 block mb-0.5">Recipient</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {cert.student?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Date Awarded</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {new Date(cert.issueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Course Program</span>
                <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {cert.course?.title}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                ID: {cert.certificateCode}
              </span>
              <Link
                to={`/student/certificates/${cert._id}`}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                View Full Certificate <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {status === 'invalid' && (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-500/40 shadow-xl text-center space-y-2 animate-in fade-in">
            <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Invalid or Unrecognized Code
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active certificate record matches the entered code. Please double check the ID for typos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerify;
