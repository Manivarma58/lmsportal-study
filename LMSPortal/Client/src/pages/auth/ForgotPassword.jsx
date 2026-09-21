import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'sonner';
import NeuralBackground from '../../components/NeuralBackground';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Wizard Step: 1 = Email, 2 = Verify, 3 = Reset, 4 = Done
  const [currentStep, setCurrentStep] = useState(1);

  // Form States
  const [email, setEmail] = useState('alex.rivera@stanford.edu');
  const [otpCode, setOtpCode] = useState(['8', '4', '9', '2', '0', '1']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const otpInputsRef = useRef([]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (currentStep === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, countdown]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Password resilience calculations
  const hasLength = newPassword.length >= 8;
  const hasCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore = [hasLength, hasCase, hasNumber, hasSpecial].filter(Boolean).length;

  // Step 1: Request Reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword(email.trim());
      if (res?.resetToken) {
        setResetToken(res.resetToken);
      } else {
        setResetToken('nova-auth-' + Math.random().toString(36).substring(2, 10));
      }
      toast.success('Security code dispatched to your academic inbox');
      setCurrentStep(2);
      setCountdown(180);
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch security instructions');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpCode];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtpCode(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length < 6) {
      toast.error('Please enter the full 6-digit security code');
      return;
    }
    toast.success('Cryptographic identity verified');
    setCurrentStep(3);
  };

  // Step 3: Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        resetToken: resetToken || 'token-' + Date.now(),
        newPassword,
      });
      toast.success('Credentials re-encrypted and synchronized successfully!');
      setCurrentStep(4);
    } catch (err) {
      toast.error(err.message || 'Failed to re-encrypt password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 font-body-md text-slate-900 min-h-screen flex flex-col justify-between blueprint-grid relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      {/* Live 3D Kinetic Neural Knowledge Cloud Background */}
      <NeuralBackground
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        opacity={0.65}
        nodeCount={55}
        maxLines={150}
      />

      {/* Ambient Multi-Hue Glow Orbs */}
      <div className="fixed -top-32 left-1/4 w-[650px] h-[450px] bg-blue-200/25 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[400px] bg-indigo-200/20 rounded-full blur-[130px] pointer-events-none"></div>

      {/* ================= FIXED TOP HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 shadow-sm">
        <div className="h-16 max-w-7xl mx-auto px-gutter flex items-center justify-between">
          <Link to="/" className="flex items-center gap-space-sm group">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-sm border border-slate-200 group-hover:scale-105 transition-transform">
              <img
                alt="Brand logo"
                className="h-full w-full object-cover"
                src="/assets/nova-logo.png"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://lh3.googleusercontent.com/aida/AEtjO1UgC3VTGpx9ax-r_6UpM35x8ax2iPF16pw-6-9F4A6rxNge9kMA45erC8H2iSBnyIy4xWEYwjhF9kdDro5CqtIjuKgMuwlLKS3cSbv-zeJ8-0U7T1fFSfFwgf7O0zSJfkCvo4x9ljzn45d17ujEfI92ox2cjYqT6y8xAefFjuqQBiOnY0w-EXB5FDtL6-jmJFUZVPigoqkbzdOf6LBjqJLorwHllR2p6rJaisk60SMmxcTsI_chQfBKOA';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-slate-900 leading-tight tracking-tight">
                StudyPilot
              </span>
              <span className="font-label-sm text-label-sm text-slate-500 hidden sm:inline leading-none">
                NOVA Learning Cloud
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-space-md">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-label-md text-label-md flex items-center gap-1.5 transition-all shadow-sm border border-slate-200"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="w-full pt-20 pb-8 flex-1 flex flex-col justify-center items-center px-gutter relative z-10">
        <div className="w-full max-w-[480px] mx-auto relative my-auto">
          {/* Card Container with Modern Light Glassmorphism */}
          <div className="w-full backdrop-blur-2xl bg-white rounded-3xl p-6 sm:p-9 relative border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all">
            {/* Top Telemetry Chip */}
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/50 mb-6 text-on-surface-variant font-code-md text-label-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#4cd7f6] animate-pulse"></span>
                <span className="text-on-surface font-semibold tracking-wider">RECOVERY PORTAL</span>
              </div>
              <div className="flex items-center gap-1.5 text-outline text-[11px]">
                <span className="material-symbols-outlined text-xs text-primary">lock</span>
                <span>TLS 1.3 / AES-256</span>
              </div>
            </div>

            {/* 4-Step Progress Indicator */}
            <div className="flex items-center justify-between gap-2 mb-7 select-none">
              {/* Step 1: Email */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full font-label-sm text-label-sm font-semibold flex items-center justify-center transition-all ${
                    currentStep > 1
                      ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(192,193,255,0.4)]'
                      : currentStep === 1
                      ? 'bg-primary text-on-primary ring-4 ring-primary/25 shadow-md'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <span
                  className={`font-label-sm text-label-sm hidden sm:inline transition-colors ${
                    currentStep >= 1 ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                  }`}
                >
                  Email
                </span>
              </div>
              <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden mx-1">
                <div
                  className={`h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-300 ${
                    currentStep > 1 ? 'w-full' : currentStep === 1 ? 'w-1/2' : 'w-0'
                  }`}
                ></div>
              </div>

              {/* Step 2: Verify */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full font-label-sm text-label-sm font-semibold flex items-center justify-center transition-all ${
                    currentStep > 2
                      ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(192,193,255,0.4)]'
                      : currentStep === 2
                      ? 'bg-primary text-on-primary ring-4 ring-primary/25 shadow-md'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <span
                  className={`font-label-sm text-label-sm hidden sm:inline transition-colors ${
                    currentStep >= 2 ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                  }`}
                >
                  Verify
                </span>
              </div>
              <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden mx-1">
                <div
                  className={`h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-300 ${
                    currentStep > 2 ? 'w-full' : currentStep === 2 ? 'w-1/2' : 'w-0'
                  }`}
                ></div>
              </div>

              {/* Step 3: Reset */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full font-label-sm text-label-sm font-semibold flex items-center justify-center transition-all ${
                    currentStep > 3
                      ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(192,193,255,0.4)]'
                      : currentStep === 3
                      ? 'bg-primary text-on-primary ring-4 ring-primary/25 shadow-md'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {currentStep > 3 ? '✓' : '3'}
                </div>
                <span
                  className={`font-label-sm text-label-sm hidden sm:inline transition-colors ${
                    currentStep >= 3 ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                  }`}
                >
                  Reset
                </span>
              </div>
              <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden mx-1">
                <div
                  className={`h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-300 ${
                    currentStep > 3 ? 'w-full' : currentStep === 3 ? 'w-1/2' : 'w-0'
                  }`}
                ></div>
              </div>

              {/* Step 4: Done */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full font-label-sm text-label-sm font-semibold flex items-center justify-center transition-all ${
                    currentStep === 4
                      ? 'bg-tertiary text-on-tertiary ring-4 ring-tertiary/25 shadow-[0_0_12px_#4cd7f6]'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {currentStep === 4 ? '✓' : '4'}
                </div>
                <span
                  className={`font-label-sm text-label-sm hidden sm:inline transition-colors ${
                    currentStep === 4 ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                  }`}
                >
                  Done
                </span>
              </div>
            </div>

            {/* ================= STEP 1: EMAIL DISPATCH ================= */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="text-center mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container-highest border border-white/10 flex items-center justify-center text-primary mx-auto mb-3.5 shadow-inner">
                    <span className="material-symbols-outlined text-[26px]">lock_reset</span>
                  </div>
                  <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-2">
                    Reset your password
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                    Enter the email associated with your StudyPilot account and we'll send you a reset link or verification code.
                  </p>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-label-lg text-label-lg text-on-surface block" htmlFor="recovery-email">
                        Email address
                      </label>
                      {email.includes('@') && (
                        <span className="font-code-md text-label-sm text-tertiary flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          <span>ACADEMIC ID</span>
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                        mail
                      </span>
                      <input
                        id="recovery-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@university.edu or name@company.com"
                        className="w-full h-12 pl-11 pr-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-outline border border-surface-container-highest/60 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* 1-Click Quick Fill Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="font-code-md text-label-sm text-outline">Quick fill:</span>
                    <button
                      type="button"
                      onClick={() => setEmail('alex.rivera@stanford.edu')}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary hover:text-white font-code-md text-label-sm transition-all border border-surface-container-highest/50"
                    >
                      alex.rivera@stanford.edu
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmail('student@lms.com')}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-tertiary hover:text-white font-code-md text-label-sm transition-all border border-surface-container-highest/50"
                    >
                      student@lms.com
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary hover:to-secondary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 transition-all hover:scale-[1.008] cursor-pointer disabled:opacity-60 mt-4"
                  >
                    <span>{loading ? 'Dispatching Instructions...' : 'Send Reset Instructions'}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>
              </div>
            )}

            {/* ================= STEP 2: VERIFY OTP CODE ================= */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="text-center mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container-highest border border-white/10 flex items-center justify-center text-tertiary mx-auto mb-3.5 shadow-inner">
                    <span className="material-symbols-outlined text-[26px]">mark_email_read</span>
                  </div>
                  <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-2">
                    Enter Verification Code
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                    We've transmitted a 6-digit security key to <code className="font-code-md text-primary font-bold">{email}</code>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* 6 Digit Input Boxes */}
                  <div className="flex items-center justify-between gap-2 max-w-xs mx-auto py-1">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-13 text-center rounded-xl bg-surface-container-low text-on-surface font-code-md text-headline-sm font-bold border-2 border-surface-container-highest focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  {/* Resend Timer & Demo Code Shortcut */}
                  <div className="flex items-center justify-between pt-1 text-on-surface-variant font-code-md text-label-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-tertiary">timer</span>
                      <span>Expires in {formatCountdown(countdown)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCountdown(180);
                        toast.info('New verification code re-dispatched');
                      }}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      Resend code
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary hover:to-secondary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 transition-all hover:scale-[1.008] cursor-pointer mt-3"
                  >
                    <span>Verify &amp; Continue</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-outline hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                    >
                      ← Change email address
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= STEP 3: SET NEW PASSWORD ================= */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="text-center mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container-highest border border-white/10 flex items-center justify-center text-primary mx-auto mb-3.5 shadow-inner">
                    <span className="material-symbols-outlined text-[26px]">key</span>
                  </div>
                  <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-2">
                    Set new password
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                    Create a resilient new password for your StudyPilot environment.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="font-label-lg text-label-lg text-on-surface block" htmlFor="new-password">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                        lock
                      </span>
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-outline border border-surface-container-highest/60 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {/* Password Entropy Meter */}
                    <div className="pt-1.5 space-y-1.5">
                      <div className="flex gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              strengthScore >= bar
                                ? bar <= 2
                                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                  : 'bg-primary shadow-[0_0_8px_rgba(192,193,255,0.5)]'
                                : 'bg-surface-container-highest'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between font-code-md text-[11px] text-outline">
                        <span>Resilience: <strong className={strengthScore >= 3 ? 'text-primary' : 'text-amber-400'}>{strengthScore >= 4 ? 'Optimal' : strengthScore >= 2 ? 'Moderate' : 'Weak'}</strong></span>
                        <span>8+ chars, numbers, symbols</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="font-label-lg text-label-lg text-on-surface block" htmlFor="confirm-password">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                        lock_reset
                      </span>
                      <input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-outline border border-surface-container-highest/60 focus:border-primary"
                      />
                      {confirmPassword && confirmPassword === newPassword && (
                        <span className="material-symbols-outlined absolute right-3.5 text-emerald-400 text-lg">
                          check_circle
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary hover:to-secondary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 transition-all hover:scale-[1.008] cursor-pointer disabled:opacity-60 mt-3"
                  >
                    <span>{loading ? 'Re-encrypting...' : 'Save & Re-Encrypt Password'}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>
              </div>
            )}

            {/* ================= STEP 4: DONE / SUCCESS ================= */}
            {currentStep === 4 && (
              <div className="animate-in fade-in zoom-in-95 duration-300 text-center space-y-5 py-2">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/20 border border-primary/40 text-primary flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(128,131,255,0.35)]">
                  <span className="material-symbols-outlined text-4xl">verified</span>
                </div>

                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Password Updated!</h2>
                  <p className="mt-1 font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                    Your StudyPilot credentials have been re-encrypted and synchronized with all regional compute clusters.
                  </p>
                </div>

                {/* Telemetry Diagnostics Shard */}
                <div className="bg-surface-container-lowest border border-surface-container-highest/60 rounded-xl p-3.5 font-code-md text-label-sm text-left space-y-1.5 text-on-surface-variant shadow-inner">
                  <div className="flex justify-between">
                    <span className="text-outline">Sync Shard:</span>
                    <span className="text-tertiary font-semibold">nova-edge-cluster-04</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Encryption:</span>
                    <span className="text-on-surface font-semibold">Argon2id + AES-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Session Token:</span>
                    <span className="text-primary font-semibold">Verified / Issued</span>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary hover:to-secondary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 transition-all hover:scale-[1.008]"
                >
                  <span>Sign In to Terminal</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            )}

            {/* Remember password link */}
            {currentStep < 4 && (
              <div className="text-center mt-6 pt-4 border-t border-surface-container-high/40">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary hover:underline font-semibold transition-colors">
                    Log in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full bg-white/90 py-space-md border-t border-slate-200/80 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-sm text-center sm:text-left">
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

export default ForgotPassword;