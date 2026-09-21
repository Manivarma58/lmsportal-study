import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'sonner';
import NeuralBackground from '../../components/NeuralBackground';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [resetToken, setResetToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      return toast.error('Please provide a valid password reset token');
    }
    if (!newPassword || newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({
        resetToken: resetToken.trim(),
        newPassword,
      });
      setResetSuccess(true);
      toast.success(res.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 font-body-md text-body-md text-slate-900 min-h-screen flex flex-col justify-between blueprint-grid selection:bg-blue-100 selection:text-blue-700 relative overflow-x-hidden">
      {/* Live 3D Kinetic Neural Knowledge Cloud Background */}
      <NeuralBackground
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        opacity={0.65}
        nodeCount={55}
        maxLines={150}
      />

      {/* ================= FIXED TOP HEADER ================= */}
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="h-16 max-w-7xl mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <Link to="/" className="flex items-center gap-space-md group">
              <img
                alt="Brand logo"
                className="h-8 w-auto object-contain rounded-md group-hover:scale-105 transition-transform"
                src="/assets/nova-logo.png"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://lh3.googleusercontent.com/aida/AEtjO1UgC3VTGpx9ax-r_6UpM35x8ax2iPF16pw-6-9F4A6rxNge9kMA45erC8H2iSBnyIy4xWEYwjhF9kdDro5CqtIjuKgMuwlLKS3cSbv-zeJ8-0U7T1fFSfFwgf7O0zSJfkCvo4x9ljzn45d17ujEfI92ox2cjYqT6y8xAefFjuqQBiOnY0w-EXB5FDtL6-jmJFUZVPigoqkbzdOf6LBjqJLorwHllR2p6rJaisk60SMmxcTsI_chQfBKOA';
                }}
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-slate-900 leading-tight tracking-tight">
                  StudyPilot
                </span>
                <span className="font-label-sm text-label-sm text-slate-500 hidden sm:inline">
                  NOVA Learning Cloud
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-space-md">
            <Link
              to="/login"
              className="font-label-lg text-label-lg text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="w-full pt-16 flex-1 flex flex-col justify-center items-center px-gutter py-space-xl">
        <div className="flex flex-col w-full items-center justify-center relative py-space-xl">
          {/* Ambient Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[380px] bg-gradient-to-tr from-blue-200/30 to-indigo-200/20 blur-3xl opacity-50"></div>
          </div>

          <div className="w-full max-w-md mx-auto backdrop-blur-2xl bg-white rounded-2xl shadow-xl p-6 sm:p-10 relative border border-slate-200/80">
            {/* 4-Step Progress Indicator: Step 3 Active */}
            <div className="flex items-center justify-center gap-2 mb-space-xl">
              {/* Step 1: Email (Done) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center">
                    ✓
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium hidden sm:inline">
                    Email
                  </span>
                </div>
                <div className="w-8 h-1 bg-primary rounded-full"></div>
              </div>

              {/* Step 2: Verify (Done) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center">
                    ✓
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium hidden sm:inline">
                    Verify
                  </span>
                </div>
                <div className="w-8 h-1 bg-primary rounded-full"></div>
              </div>

              {/* Step 3: Reset (Active) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center">
                    3
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium hidden sm:inline">
                    Reset
                  </span>
                </div>
                <div className="w-8 h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full ${resetSuccess ? 'w-full bg-primary' : 'w-1/2 bg-primary'}`}></div>
                </div>
              </div>

              {/* Step 4: Done */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full font-label-sm text-label-sm flex items-center justify-center ${
                    resetSuccess
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  4
                </span>
                <span
                  className={`font-label-sm text-label-sm hidden sm:inline ${
                    resetSuccess ? 'text-on-surface font-medium' : 'text-on-surface-variant'
                  }`}
                >
                  Done
                </span>
              </div>
            </div>

            {/* Header Block */}
            <div className="text-center mb-space-lg">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary mx-auto mb-space-sm shadow-inner">
                <span className="material-symbols-outlined text-[24px]">key</span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-2">
                Set new password
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Provide your security token and enter a strong new password for your StudyPilot account.
              </p>
            </div>

            {resetSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-primary-container/20 border border-primary/30 text-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Password Re-Encrypted!</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Your credentials have been securely updated in the cluster directory. Redirecting to login...
                </p>
                <Link
                  to="/login"
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Sign In to Terminal</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-space-md">
                {/* Reset Token Input */}
                <div className="space-y-1.5">
                  <label className="font-label-lg text-label-lg text-on-surface block" htmlFor="reset-token">
                    Verification Key / Token
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
                      vpn_key
                    </span>
                    <input
                      id="reset-token"
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste your reset token key"
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-code-md text-label-md focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-outline"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="font-label-lg text-label-lg text-on-surface block" htmlFor="new-password">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="new-password"
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-outline"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="font-label-lg text-label-lg text-on-surface block" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
                      lock_reset
                    </span>
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-outline"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary hover:to-secondary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-lg shadow-primary-container/20 transition-all hover:scale-[1.008] cursor-pointer disabled:opacity-60"
                >
                  <span>{loading ? 'Re-encrypting Credentials...' : 'Save New Password'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            )}

            <div className="text-center mt-space-lg pt-space-md">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full bg-surface-container-lowest py-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-t border-surface-container-high/30">
        <div className="max-w-7xl mx-auto px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-md text-center sm:text-left">
          <div className="font-label-sm text-label-sm text-on-surface-variant">
            © 2025 StudyPilot by NOVA Learning Systems Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
            <Link to="/about" className="hover:text-on-surface transition-colors">
              Security &amp; Privacy
            </Link>
            <span className="text-outline-variant">•</span>
            <Link to="/about" className="hover:text-on-surface transition-colors">
              Terms of Service
            </Link>
            <span className="text-outline-variant">•</span>
            <Link to="/contact" className="hover:text-on-surface transition-colors">
              Support Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword;
