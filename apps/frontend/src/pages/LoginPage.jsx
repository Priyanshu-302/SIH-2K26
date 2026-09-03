import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Scale, Mail, ArrowRight, CheckCircle2, ShieldCheck, 
  Sparkles, BookOpen, AlertCircle, RefreshCw, ArrowLeft,
  KeyRound, Building2, UserCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { sendOtpAPI, verifyOtpAPI, googleAuthAPI } from '../services/apiService';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  // Destination URL after successful authentication
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/app/chat';

  // Redirect immediately if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Auth flow states: 'email_step' | 'otp_step'
  const [authStep, setAuthStep] = useState('email_step');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [simulatedNotice, setSimulatedNotice] = useState('');

  const otpInputsRef = useRef([]);
  const googleBtnRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle Google OAuth Credential Token response
  const handleGoogleCredentialResponse = async (googleRes) => {
    setIsGoogleLoading(true);
    try {
      if (!googleRes?.credential) {
        throw new Error('No credential token returned from Google.');
      }
      const res = await googleAuthAPI({ credential: googleRes.credential });
      login(res.token, res.user);
      addToast({ type: 'success', message: `Signed in as ${res.user.email}!` });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Google authentication failed.' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    const initGsi = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });

        if (googleBtnRef.current && !googleBtnRef.current.hasChildNodes()) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: googleBtnRef.current.offsetWidth || 380,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'center',
          });
        }
      }
    };

    initGsi();
    const interval = setInterval(initGsi, 300);
    const timer = setTimeout(() => clearInterval(interval), 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [googleClientId]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (authStep === 'otp_step' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    setSimulatedNotice('');

    try {
      const res = await sendOtpAPI(email);
      addToast({ type: 'success', message: '6-digit verification code dispatched!' });
      
      if (res.simulated) {
        setSimulatedNotice('ℹ️ Brevo simulation mode: Check your backend terminal log for the 6-digit code or enter the code sent to your email.');
      }

      setAuthStep('otp_step');
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);

      // Focus first OTP input on transition
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to send verification code.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit input changes with auto-advance
  const handleDigitChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (cleanValue && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace and navigation across digit inputs
  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Support pasting full 6-digit code
  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedText) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedText.length; i++) {
      newDigits[i] = pastedText[i];
    }
    setOtpDigits(newDigits);

    const focusIndex = Math.min(pastedText.length, 5);
    otpInputsRef.current[focusIndex]?.focus();
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      addToast({ type: 'error', message: 'Please enter all 6 digits of your verification code.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyOtpAPI(email, fullOtp, fullName);
      login(res.token, res.user);
      addToast({ type: 'success', message: `Welcome back, ${res.user.name || 'Researcher'}!` });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Invalid or expired code.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click on Google button: triggers official Google Account selection prompt
  const handleGoogleAuth = () => {
    if (!googleClientId) {
      addToast({
        type: 'error',
        message: 'VITE_GOOGLE_CLIENT_ID is missing in apps/frontend/.env',
      });
      return;
    }

    if (window.google?.accounts?.id) {
      setIsGoogleLoading(true);
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleLoading(false);
        }
      });
    } else {
      addToast({
        type: 'info',
        message: 'Google Sign-In is initializing. Please try again in 2 seconds...',
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-alabaster-50 font-sans antialiased text-slate-800">
      
      {/* Left Column: Hero & Legal Heritage Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ayur-900 via-ayur-800 to-sage-950 p-12 flex-col justify-between relative overflow-hidden text-white">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-ayur-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-heading text-white">Ayur-IP</span>
              <span className="block text-[10px] uppercase font-semibold tracking-widest text-emerald-300/90">Prior Art Intelligence</span>
            </div>
          </Link>
        </div>

        {/* Center Presentation Pitch */}
        <div className="relative z-10 my-auto space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Passwordless Secure Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight leading-tight">
            Defend Ancient Wisdom. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-200">
              Navigate Modern Patents.
            </span>
          </h1>

          <p className="text-sm text-sage-200/90 leading-relaxed">
            Sign in to access your customized Indian Patents Act (Section 3p, 3e, 3d) assessments, classical TKDL citation drawer, and encrypted session archives.
          </p>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <BookOpen className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">TKDL Classical Grounding</p>
                <p className="text-[11px] text-sage-300">Direct cross-referencing with Charaka, Sushruta & InPASS registries.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Persistent Confidential Sessions</p>
                <p className="text-[11px] text-sage-300">Every patent claim and formulation inquiry is encrypted and tied to your account.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-sage-400 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} Ayur-IP Intelligence Platform</span>
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            Indian Patent Office & Ayush Alignment
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Mobile Header */}
        <div className="lg:hidden w-full max-w-md mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ayur-700 text-white flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-slate-900">Ayur-IP</span>
          </Link>
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div className="text-center sm:text-left space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              {authStep === 'email_step' ? 'Sign in to Ayur-IP' : 'Enter verification code'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {authStep === 'email_step' 
                ? 'Passwordless authentication via Email OTP or Google Account'
                : `We emailed a single-use 6-digit code to ${email}`}
            </p>
          </div>

          {/* Google Sign-In Button */}
          {authStep === 'email_step' && (
            <div className="space-y-4">
              {/* Google Identity Services official rendered button container */}
              <div 
                ref={googleBtnRef} 
                className="w-full flex justify-center min-h-[44px]"
              />

              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">or email code</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </div>
          )}

          {/* Form Step 1: Email Form */}
          {authStep === 'email_step' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work / Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. examiner@ipindia.gov.in"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-ayur-600 focus:ring-2 focus:ring-ayur-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. A. Sharma"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-ayur-600 focus:ring-2 focus:ring-ayur-500/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ayur-700 hover:bg-ayur-800 text-white text-xs sm:text-sm font-semibold shadow-soft-card hover:shadow-soft-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Code via Brevo...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Fillers for Evaluator Convenience */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Quick Demo Accounts for Evaluators:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('examiner.sharma@ipindia.gov.in');
                      setFullName('Dr. A. Sharma (Examiner)');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sage-50 hover:bg-sage-100 border border-sage-200 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Patent Examiner
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('researcher.ayush@csir.res.in');
                      setFullName('Priyanshu (R&D Lead)');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sage-50 hover:bg-sage-100 border border-sage-200 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Ayush R&D Lead
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Form Step 2: 6-Digit OTP Form */}
          {authStep === 'otp_step' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {simulatedNotice && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                  {simulatedNotice}
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                  Enter the 6-digit code
                </label>
                <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleDigitPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono bg-white border-2 border-slate-200 rounded-xl focus:border-ayur-600 focus:ring-2 focus:ring-ayur-500/15 focus:outline-none transition-all shadow-xs"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ayur-700 hover:bg-ayur-800 text-white text-xs sm:text-sm font-semibold shadow-soft-card hover:shadow-soft-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify & Enter Workspace</span>
                  </>
                )}
              </button>

              {/* Resend and change email options */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAuthStep('email_step')}
                  className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Change email
                </button>

                <div>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-ayur-700 hover:text-ayur-800 font-semibold cursor-pointer"
                    >
                      Resend code
                    </button>
                  ) : (
                    <span>Resend in {countdown}s</span>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Privacy & Ayush notice */}
          <p className="text-center text-[11px] text-slate-400">
            By signing in, you agree to access official Indian Patent prior art datasets in accordance with TKDL access guidelines.
          </p>
        </div>
      </div>

    </div>
  );
}
