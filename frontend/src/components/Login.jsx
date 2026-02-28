import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';
import { forgotPassword } from '../utils/auth';

export function Login({ onLoginSuccess, onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [localError, setLocalError] = useState('');
    
    // Forgot password state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);

    const { login, loading, error: authError } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!email || !password) {
            setLocalError('Please fill in all fields');
            toast.error('Please fill in all fields');
            return;
        }

        try {
            await login(email, password);
            toast.success('Logged in successfully!');
            if (onLoginSuccess) onLoginSuccess();
        } catch (err) {
            setLocalError(err.message || 'Login failed');
            toast.error(err.message || 'Login failed');
        }
    };

    const error = localError || authError;

    return (
        <div
            className="fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden font-sans"
            style={{ backgroundColor: '#F6F9FF' }}
        >
            {/* Subtle decorative background elements */}
            <div className="absolute pointer-events-none" style={{ width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(30,58,138,0.04)', filter: 'blur(90px)', top: '-120px', left: '-100px' }} />
            <div className="absolute pointer-events-none" style={{ width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(212,175,55,0.06)', filter: 'blur(80px)', bottom: '-80px', right: '-80px' }} />
            <div className="absolute pointer-events-none" style={{ width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(37,99,235,0.04)', filter: 'blur(70px)', bottom: '20%', left: '5%' }} />

            {/* Main Login Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full overflow-hidden"
                style={{
                    width: '350px',
                    borderRadius: '16px',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 20px 50px rgba(30,58,138,0.15), 0 4px 16px rgba(30,58,138,0.06)',
                    margin: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(30,58,138,0.07)',
                }}
            >
                {/* Header */}
                <div
                    className="relative flex flex-col items-center justify-center text-center overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                        padding: '36px 24px 32px',
                        flexShrink: 0,
                    }}
                >
                    {/* Subtle header shimmer overlays */}
                    <div className="absolute pointer-events-none" style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '-60px', right: '-50px' }} />
                    <div className="absolute pointer-events-none" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', bottom: '-40px', left: '-30px' }} />
                    {/* Gold accent line at bottom of header */}
                    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

                    {/* DNA Icon with gold ring */}
                    <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: isInteracting ? 360 : 0 }}
                        transition={{ type: 'spring', duration: isInteracting ? 3 : 0.7, repeat: isInteracting ? Infinity : 0, ease: 'linear' }}
                        className="relative z-10 flex items-center justify-center mb-3"
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.12)',
                            border: '1.5px solid rgba(212,175,55,0.5)',
                            boxShadow: '0 0 20px rgba(212,175,55,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                        }}
                    >
                        <Icons.DNA className="w-5 h-5 text-white" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10"
                    >
                        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px', margin: 0 }}>Welcome Back</h1>
                        <p style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.65)', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '6px' }}>Sign in to Symbio-NLM</p>
                    </motion.div>
                </div>

                {/* Form Content */}
                <div className="flex-1 flex flex-col" style={{ padding: '30px 28px 26px' }}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 p-3 rounded-xl"
                                    style={{ background: '#FFF5F5', border: '1px solid #FECACA', color: '#B91C1C' }}
                                >
                                    <Icons.AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <p className="text-xs font-medium">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.26 }}
                            className="flex flex-col gap-1.5"
                        >
                            <label htmlFor="login-email" style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A', letterSpacing: '0.02em' }}>
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
                                    <Icons.Mail className="w-4 h-4" style={{ color: '#94A3B8' }} />
                                </span>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setIsInteracting(true)}
                                    onBlur={() => setIsInteracting(false)}
                                    className="w-full outline-none text-sm"
                                    style={{
                                        paddingLeft: '38px',
                                        paddingRight: '14px',
                                        paddingTop: '11px',
                                        paddingBottom: '11px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '10px',
                                        background: '#FFFFFF',
                                        color: '#0F172A',
                                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                    }}
                                    onFocusCapture={(e) => {
                                        e.target.style.borderColor = '#D4AF37';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.14)';
                                    }}
                                    onBlurCapture={(e) => {
                                        e.target.style.borderColor = '#E2E8F0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    placeholder="your@email.com"
                                    required
                                    autoComplete="email"
                                    aria-required="true"
                                />
                            </div>
                        </motion.div>

                        {/* Password Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.34 }}
                            className="flex flex-col gap-1.5"
                        >
                            <div className="flex justify-between items-center">
                                <label htmlFor="login-password" style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A', letterSpacing: '0.02em' }}>
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}
                                    style={{ fontSize: '11px', fontWeight: 500, color: '#1E3A8A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s ease' }}
                                    onMouseEnter={(e) => e.target.style.color = '#D4AF37'}
                                    onMouseLeave={(e) => e.target.style.color = '#1E3A8A'}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
                                    <Icons.Lock className="w-4 h-4" style={{ color: '#94A3B8' }} />
                                </span>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsInteracting(true)}
                                    onBlur={() => setIsInteracting(false)}
                                    className="w-full outline-none text-sm"
                                    style={{
                                        paddingLeft: '38px',
                                        paddingRight: '42px',
                                        paddingTop: '11px',
                                        paddingBottom: '11px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '10px',
                                        background: '#FFFFFF',
                                        color: '#0F172A',
                                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                    }}
                                    onFocusCapture={(e) => {
                                        e.target.style.borderColor = '#D4AF37';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.14)';
                                    }}
                                    onBlurCapture={(e) => {
                                        e.target.style.borderColor = '#E2E8F0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    aria-required="true"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s ease' }}
                                    onMouseEnter={(e) => e.target.style.color = '#64748B'}
                                    onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? <Icons.EyeOff className="w-4 h-4" aria-hidden="true" /> : <Icons.Eye className="w-4 h-4" aria-hidden="true" />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.42 }}
                            style={{ marginTop: '6px' }}
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full font-semibold text-sm flex items-center justify-center gap-2"
                                style={{
                                    background: loading ? '#C8A84B' : 'linear-gradient(135deg, #E6C35C 0%, #D4AF37 100%)',
                                    color: '#0F172A',
                                    borderRadius: '12px',
                                    padding: '12px 20px',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.75 : 1,
                                    boxShadow: '0 4px 14px rgba(212,175,55,0.3)',
                                    transition: 'background 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease',
                                    letterSpacing: '0.02em',
                                    fontWeight: 600,
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #D4AF37 0%, #B38F2D 100%)';
                                        e.currentTarget.style.boxShadow = '0 6px 22px rgba(212,175,55,0.45)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #E6C35C 0%, #D4AF37 100%)';
                                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(212,175,55,0.3)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
                                onMouseUp={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px) scale(1)'; }}
                                aria-busy={loading}
                            >
                                {loading ? (
                                    <>
                                        <Icons.Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
                                        <span>Signing In...</span>
                                    </>
                                ) : 'Sign In'}
                            </button>
                        </motion.div>

                        {/* Footer */}
                        <div
                            className="text-center mt-6 pt-4"
                            style={{ borderTop: '1px solid #F1F5F9' }}
                        >
                            <p style={{ fontSize: '12px', color: '#64748B' }}>
                                Don&apos;t have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToSignup}
                                    className="font-semibold focus:outline-none"
                                    style={{ color: '#1E3A8A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s ease' }}
                                    onMouseEnter={(e) => e.target.style.color = '#D4AF37'}
                                    onMouseLeave={(e) => e.target.style.color = '#1E3A8A'}
                                >
                                    Sign up instead
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {showForgotPassword && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(15,23,42,0.35)',
                                backdropFilter: 'blur(5px)',
                                WebkitBackdropFilter: 'blur(5px)',
                                zIndex: 9999,
                            }}
                            onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                position: 'fixed', top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '100%', maxWidth: '360px',
                                zIndex: 10000, padding: '16px',
                            }}
                        >
                            <div style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '16px',
                                boxShadow: '0 24px 60px rgba(30,58,138,0.2), 0 4px 16px rgba(30,58,138,0.08)',
                                border: '1px solid rgba(30,58,138,0.08)',
                                overflow: 'hidden',
                            }}>
                                {/* Modal header accent */}
                                <div style={{ height: '3px', background: 'linear-gradient(90deg, #1E3A8A, #2563EB, #D4AF37)' }} />
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', boxShadow: '0 4px 12px rgba(30,58,138,0.25)', flexShrink: 0 }}>
                                            <Icons.Mail className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Reset Password</h3>
                                            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>We&apos;ll send you reset instructions</p>
                                        </div>
                                    </div>

                                    {forgotSent ? (
                                        <div className="text-center py-4">
                                            <div className="flex items-center justify-center mx-auto mb-4" style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                                                <Icons.CheckCircle className="w-6 h-6" style={{ color: '#16A34A' }} />
                                            </div>
                                            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>Check Your Email</h4>
                                            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '20px', lineHeight: '1.6' }}>
                                                If an account exists with <strong style={{ color: '#0F172A' }}>{forgotEmail}</strong>, you&apos;ll receive password reset instructions.
                                            </p>
                                            <button
                                                onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                                                className="font-semibold text-sm"
                                                style={{ background: 'linear-gradient(135deg, #E6C35C, #D4AF37)', color: '#0F172A', padding: '9px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', transition: 'box-shadow 0.3s ease, transform 0.15s ease' }}
                                                onMouseEnter={(e) => { e.target.style.boxShadow = '0 6px 18px rgba(212,175,55,0.45)'; e.target.style.transform = 'translateY(-1px)'; }}
                                                onMouseLeave={(e) => { e.target.style.boxShadow = '0 4px 12px rgba(212,175,55,0.3)'; e.target.style.transform = 'translateY(0)'; }}
                                            >
                                                Back to Login
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px', lineHeight: '1.6' }}>
                                                Enter your email address and we&apos;ll send you a link to reset your password.
                                            </p>
                                            <input
                                                type="email"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full outline-none text-sm mb-4"
                                                style={{
                                                    padding: '11px 14px',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    background: '#FFFFFF',
                                                    color: '#0F172A',
                                                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                                }}
                                                onFocusCapture={(e) => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.14)'; }}
                                                onBlurCapture={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                                                    className="text-sm font-medium"
                                                    style={{ flex: 1, padding: '10px', background: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s ease' }}
                                                    onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
                                                    onMouseLeave={(e) => e.target.style.background = '#F8FAFC'}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!forgotEmail) { toast.error('Please enter your email'); return; }
                                                        setForgotLoading(true);
                                                        try {
                                                            await forgotPassword(forgotEmail);
                                                            setForgotSent(true);
                                                            toast.success('Reset email sent!');
                                                        } catch (err) {
                                                            toast.error(err.message);
                                                        } finally {
                                                            setForgotLoading(false);
                                                        }
                                                    }}
                                                    disabled={forgotLoading}
                                                    className="text-sm font-semibold"
                                                    style={{ flex: 1, padding: '10px', background: forgotLoading ? '#C8A84B' : 'linear-gradient(135deg, #E6C35C, #D4AF37)', color: '#0F172A', border: 'none', borderRadius: '10px', cursor: forgotLoading ? 'not-allowed' : 'pointer', opacity: forgotLoading ? 0.75 : 1, boxShadow: '0 4px 12px rgba(212,175,55,0.3)', transition: 'box-shadow 0.3s ease' }}
                                                    onMouseEnter={(e) => { if (!forgotLoading) e.target.style.boxShadow = '0 6px 18px rgba(212,175,55,0.45)'; }}
                                                    onMouseLeave={(e) => { e.target.style.boxShadow = '0 4px 12px rgba(212,175,55,0.3)'; }}
                                                >
                                                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
