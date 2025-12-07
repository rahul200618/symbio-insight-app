import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../components/AnimatedPage';
import { Icons } from '../components/Icons';
import { toast } from 'sonner';

export function ProfilePage() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        name: 'DNA Researcher',
        email: 'researcher@symbio.com',
        role: 'Senior Bioinformatician',
        institution: 'Symbio Research Lab',
        joinedDate: 'January 2024',
        totalAnalyses: 127,
        totalSequences: 3456,
        totalReports: 89
    });

    const handleLogout = () => {
        toast.loading('Logging out...', { id: 'logout' });
        setTimeout(() => {
            localStorage.removeItem('token');
            toast.success('Logged out successfully', { id: 'logout' });
            navigate('/login');
        }, 500);
    };

    const handleSaveProfile = () => {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
    };

    return (
        <AnimatedPage animation="fade">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                            {/* Avatar */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                                    <Icons.User className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{userData.name}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{userData.role}</p>
                            </div>

                            {/* Stats */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Icons.Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Analyses</span>
                                    </div>
                                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{userData.totalAnalyses}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Icons.DNA className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Sequences</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{userData.totalSequences}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Icons.FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Reports</span>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{userData.totalReports}</span>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <Icons.LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Column - Account Details & Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Account Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-4 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors font-medium"
                                >
                                    {isEditing ? 'Cancel' : 'Edit Profile'}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={userData.name}
                                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 dark:text-white">{userData.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={userData.email}
                                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 dark:text-white">{userData.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={userData.role}
                                            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 dark:text-white">{userData.role}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Institution
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={userData.institution}
                                            onChange={(e) => setUserData({ ...userData, institution: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 dark:text-white">{userData.institution}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Member Since
                                    </label>
                                    <p className="text-gray-600 dark:text-gray-400">{userData.joinedDate}</p>
                                </div>

                                {isEditing && (
                                    <button
                                        onClick={handleSaveProfile}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                                    >
                                        Save Changes
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Preferences */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Preferences</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Receive analysis completion emails</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-save Reports</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Automatically save generated reports</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Advanced Features</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Enable experimental tools</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>
                        </motion.div>

                        {/* Security */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Security</h3>

                            <div className="space-y-4">
                                <button className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between">
                                    <span className="text-sm font-medium">Change Password</span>
                                    <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>

                                <button className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between">
                                    <span className="text-sm font-medium">Two-Factor Authentication</span>
                                    <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}
