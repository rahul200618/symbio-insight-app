import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';

export function Signup({ onSignupSuccess, onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
    const [isInteracting, setIsInteracting] = useState(false);

    const { signup, loading, error: authError } = useAuth();
    const [localError, setLocalError] = useState('');

    // Password strength calculator
    useEffect(() => {
        if (!password) {
            setPasswordStrength({ score: 0, label: '', color: '' });
            return;
        }

        let score = 0;
        if (password.length > 5) score += 1;
        if (password.length > 10) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

        setPasswordStrength({
            score,
            label: labels[score - 1] || 'Weak',
            color: colors[score - 1] || 'bg-red-500'
        });
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            await signup(email, password, name);
            toast.success('Account created successfully!');
            if (onSwitchToLogin) onSwitchToLogin();
        } catch (err) {
            setLocalError(err.message || 'Signup failed');
            toast.error(err.message || 'Signup failed');
        }
    };

    const error = localError || authError;

    const inputStyle = {
        paddingTop: '11px',
        paddingBottom: '11px',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        background: '#FFFFFF',
        color: '#0F172A',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    };

    const onFocusInput = (e) => {
        e.target.style.borderColor = '#D4AF37';
        e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.14)';
    };
    const onBlurInput = (e) => {
        e.target.style.borderColor = '#E2E8F0';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div
            className="fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden font-sans"
            style={{ backgroundColor: '#F6F9FF' }}
        >
            {/* Subtle decorative background elements */}
            <div className="absolute pointer-events-none" style={{ width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(30,58,138,0.04)', filter: 'blur(90px)', top: '-120px', left: '-100px' }} />
            <div className="absolute pointer-events-none" style={{ width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(212,175,55,0.06)', filter: 'blur(80px)', bottom: '-80px', right: '-80px' }} />
            <div className="absolute pointer-events-none" style={{ width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(37,99,235,0.04)', filter: 'blur(70px)', bottom: '20%', left: '5%' }} />

            {/* Main Signup Card */}
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
                    <div className="absolute pointer-events-none" style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '-60px', right: '-50px' }} />
                    <div className="absolute pointer-events-none" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', bottom: '-40px', left: '-30px' }} />
                    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

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
                        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px', margin: 0 }}>Create Account</h1>
                        <p style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.65)', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '6px' }}>Join Symbio-NLM</p>
                    </motion.div>
                </div>

                {/* Form Content */}
                <div className="flex-1 flex flex-col" style={{ padding: '30px 28px 26px' }}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">

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

                        {/* Full Name */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="flex flex-col gap-1.5">
                            <label htmlFor="signup-name" style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A', letterSpacing: '0.02em' }}>Full Name</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Icons.User className="w-4 h-4" style={{ color: '#94A3B8' }} />
                                </span>
                                <input
                                    id="signup-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onFocus={() => setIsInteracting(true)}
                                    onBlur={() => setIsInteracting(false)}
                                    className="w-full outline-none text-sm"
                                    style={{ ...inputStyle, paddingLeft: '38px', paddingRight: '14px' }}
                                    onFocusCapture={onFocusInput}
                                    onBlurCapture={onBlurInput}
                                    placeholder="John Doe"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </motion.div>

                        {/* Email */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="flex flex-col gap-1.5">
                            <label htmlFor="signup-email" style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A', letterSpacing: '0.02em' }}>Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Icons.Mail className="w-4 h-4" style={{ color: '#94A3B8' }} />
                                </span>
                                <input
                                    id="signup-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setIsInteracting(true)}
                                    onBlur={() => setIsInteracting(false)}
                                    className="w-full outline-none text-sm"
                                    style={{ ...inputStyle, paddingLeft: '38px', paddingRight: '14px' }}
                                    onFocusCapture={onFocusInput}
                                    onBlurCapture={onBlurInput}
                                    placeholder="your@email.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }} className="flex flex-col gap-1.5">
                            <label htmlFor="signup-password" style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A', letterSpacing: '0.02em' }}>Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Icons.Lock className="w-4 h-4" style={{ color: '#94A3B8' }} />
                                </span>
                                <input
                                    id="signup-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsInteracting(true)}
                                    onBlur={() => setIsInteracting(false)}
                                    className="w-full outline-none text-sm"
                                    style={{ ...inputStyle, paddingLeft: '38px', paddingRight: '42px' }}
                                    onFocusCapture={onFocusInput}
                                    onBlurCapture={onBlurInput}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s ease' }}
                                    onMouseEnter={(e) => e.target.style.color = '#64748B'}
                                    onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Password Strength Indicator */}
                            {password && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-1">
                                    <div className="flex gap-1 mb-1" style={{ height: '4px' }}>
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className="flex-1 rounded-full transition-all duration-300"
                                                style={{ backgroundColor: level <= passwordStrength.score ? passwordStrength.color : '#E2E8F0' }}
                                            />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '10px', textAlign: 'right', color: passwordStrength.color, fontWeight: 500 }}>
                                        {passwordStrength.label}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.40 }} className="flex flex-col gap-1.5">
                            <label htmlFor="signup-confirm" style={{ fontSize: '11.5px', fontWeight: 600, color: '#0F172A', letterSpacing: '0.02em' }}>Confirm Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Icons.Lock className="w-4 h-4" style={{ color: '#94A3B8' }} />
                                </span>
                                <input
                                    id="signup-confirm"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => setIsInteracting(true)}
                                    onBlur={() => setIsInteracting(false)}
                                    className="w-full outline-none text-sm"
                                    style={{ ...inputStyle, paddingLeft: '38px', paddingRight: '14px' }}
                                    onFocusCapture={onFocusInput}
                                    onBlurCapture={onBlurInput}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }} style={{ marginTop: '4px' }}>
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
                                        <span>Creating Account...</span>
                                    </>
                                ) : 'Sign Up'}
                            </button>
                        </motion.div>

                        {/* Footer */}
                        <div className="text-center mt-6 pt-4" style={{ borderTop: '1px solid #F1F5F9' }}>
                            <p style={{ fontSize: '12px', color: '#64748B' }}>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToLogin}
                                    className="font-semibold focus:outline-none"
                                    style={{ color: '#1E3A8A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s ease' }}
                                    onMouseEnter={(e) => e.target.style.color = '#D4AF37'}
                                    onMouseLeave={(e) => e.target.style.color = '#1E3A8A'}
                                >
                                    Sign in instead
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
