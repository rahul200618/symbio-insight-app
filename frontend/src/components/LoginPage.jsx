import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from './Icons';
import { login, register } from '../utils/api';

export function LoginPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!email || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (!isLogin && !name) {
            setError('Please enter your name');
            setIsLoading(false);
            return;
        }

        try {
            let data;
            if (isLogin) {
                data = await login(email, password);
            } else {
                data = await register(name, email, password);
            }

            // Success
            onLogin(data.user);

        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-400/20 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 blur-[100px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "outBack" }}
                className="relative z-10 w-full max-w-md"
            >
                {/* The Box */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-center relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <div className="absolute top-[-50%] left-[-20%] w-[200px] h-[200px] rounded-full bg-white blur-3xl"></div>
                            <div className="absolute bottom-[-50%] right-[-20%] w-[200px] h-[200px] rounded-full bg-white blur-3xl"></div>
                        </div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30"
                        >
                            <Icons.DNA className="w-8 h-8 text-white" />
                        </motion.div>

                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            Symbio-Insight
                        </h2>
                        <p className="text-purple-100 text-sm font-medium">
                            Advanced DNA Sequence Analysis
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="p-8 pt-10">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h3>

                        <AnimatePresence mode="wait">
                            <motion.form
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {!isLogin && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                                            Full Name
                                        </label>
                                        <div className="relative group">
                                            <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all dark:text-white placeholder-gray-400 font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <Icons.Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all dark:text-white placeholder-gray-400 font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all dark:text-white placeholder-gray-400 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            <Icons.Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {isLogin && (
                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600 transition-colors" />
                                            <span className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 transition-colors font-medium">Remember me</span>
                                        </label>
                                        <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                                            Forgot password?
                                        </a>
                                    </div>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 font-medium"
                                    >
                                        <Icons.AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-base"
                                >
                                    {isLoading ? (
                                        <Icons.Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                            <Icons.ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>
                        </AnimatePresence>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/50">
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                    }}
                                    className="ml-2 font-bold text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
                    &copy; {new Date().getFullYear()} Symbio-Insight. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}
