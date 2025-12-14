import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../components/AnimatedPage';
import { Icons } from '../components/Icons';
import { toast } from 'sonner';
import { getSequences } from '../utils/sequenceApi.js';
import { deleteAccount, updateProfile, changePassword } from '../utils/auth.js';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    
    // Change password state
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    
    // Preferences state (saved to localStorage)
    const [preferences, setPreferences] = useState({
        emailNotifications: false,
        autoSaveReports: true,
        advancedFeatures: true
    });
    
    const [stats, setStats] = useState({
        totalAnalyses: 0,
        totalSequences: 0,
        totalReports: 0,
        totalLength: 0
    });
    
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        role: 'Bioinformatician',
        institution: 'Research Lab',
        joinedDate: ''
    });

    // Load user data from AuthContext and localStorage
    useEffect(() => {
        if (user) {
            // Get profile metadata from localStorage
            const savedProfile = localStorage.getItem('symbio-user-profile');
            let profileData = {};
            if (savedProfile) {
                try {
                    profileData = JSON.parse(savedProfile);
                } catch (e) {
                    console.log('Could not load saved profile');
                }
            }
            
            setUserData({
                name: user.name || profileData.name || 'DNA Researcher',
                email: user.email || profileData.email || '',
                role: profileData.role || 'Bioinformatician',
                institution: profileData.institution || 'Research Lab',
                joinedDate: user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : profileData.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }
    }, [user]);

    // Load preferences from localStorage
    useEffect(() => {
        const savedPrefs = localStorage.getItem('symbio-preferences');
        if (savedPrefs) {
            try {
                setPreferences(JSON.parse(savedPrefs));
            } catch (e) {
                console.log('Could not load preferences');
            }
        }
    }, []);

    // Save preferences when they change
    const updatePreference = (key, value) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);
        localStorage.setItem('symbio-preferences', JSON.stringify(newPrefs));
        
        if (key === 'advancedFeatures') {
            toast.success(value ? 'Advanced features enabled!' : 'Advanced features disabled');
        }
    };

    // Load stats from backend
    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setIsLoading(true);
        try {
            const response = await getSequences({ page: 1, limit: 1000 });
            const sequences = response.data || [];
            
            let totalSeqs = 0;
            let totalLen = 0;
            
            sequences.forEach(seq => {
                totalSeqs += seq.sequenceCount || 1;
                totalLen += seq.length || 0;
            });

            setStats({
                totalAnalyses: sequences.length,
                totalSequences: totalSeqs,
                totalReports: Math.floor(sequences.length * 0.7),
                totalLength: totalLen
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        toast.loading('Logging out...', { id: 'logout' });
        setTimeout(() => {
            logout();
            toast.success('Logged out successfully', { id: 'logout' });
        }, 500);
    };

    const handleSaveProfile = async () => {
        try {
            // Save to localStorage (for role, institution which aren't in backend)
            localStorage.setItem('symbio-user-profile', JSON.stringify(userData));
            
            // Try to update backend (name only for now)
            try {
                await updateProfile({ name: userData.name });
            } catch (e) {
                console.log('Backend update skipped:', e.message);
            }
            
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile: ' + error.message);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError('Please enter your password');
            return;
        }
        
        setIsDeleting(true);
        setDeleteError('');
        
        try {
            await deleteAccount(deletePassword);
            toast.success('Account deleted successfully');
            setShowDeleteDialog(false);
            logout();
        } catch (error) {
            setDeleteError(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Advanced Features List
    const advancedFeaturesList = [
        { name: 'Codon Usage Analysis', description: 'Analyze codon frequency and bias', available: true },
        { name: 'ORF Prediction', description: 'Find open reading frames in sequences', available: true },
        { name: 'Sequence Alignment', description: 'Align multiple sequences (coming soon)', available: false },
        { name: 'BLAST Integration', description: 'Search NCBI databases (coming soon)', available: false },
        { name: 'Protein Translation', description: 'Translate DNA to amino acids', available: true },
        { name: 'GC Skew Analysis', description: 'Analyze GC distribution patterns', available: true },
    ];

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
                                <p className="text-sm text-gray-600 dark:text-gray-400">{userData.email}</p>
                                <span className="mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                                    {userData.role}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="space-y-3 mb-6">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Icons.Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Files Analyzed</span>
                                            </div>
                                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{stats.totalAnalyses}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Icons.DNA className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Total Sequences</span>
                                            </div>
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{stats.totalSequences.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Icons.FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Total Base Pairs</span>
                                            </div>
                                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{stats.totalLength.toLocaleString()}</span>
                                        </div>
                                    </>
                                )}
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
                                    <p className="text-gray-900 dark:text-white">{userData.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
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
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={preferences.emailNotifications}
                                            onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-save Reports</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Automatically save generated reports</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={preferences.autoSaveReports}
                                            onChange={(e) => updatePreference('autoSaveReports', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Advanced Features</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Enable experimental tools</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={preferences.advancedFeatures}
                                            onChange={(e) => updatePreference('advancedFeatures', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Advanced Features List */}
                            {preferences.advancedFeatures && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                                >
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Available Advanced Features</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {advancedFeaturesList.map((feature, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`p-3 rounded-lg border ${
                                                    feature.available 
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {feature.available ? (
                                                        <Icons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        <Icons.Clock className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <span className={`text-sm font-medium ${
                                                        feature.available 
                                                            ? 'text-emerald-700 dark:text-emerald-300' 
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        {feature.name}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
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
                                <button 
                                    onClick={() => setShowChangePassword(true)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between"
                                >
                                    <span className="text-sm font-medium">Change Password</span>
                                    <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>

                                <button className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left flex items-center justify-between">
                                    <span className="text-sm font-medium">Two-Factor Authentication</span>
                                    <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </motion.div>
                        
                        {/* Danger Zone */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 shadow-sm"
                        >
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>

                            <button 
                                onClick={() => setShowDeleteDialog(true)}
                                className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            >
                                <Icons.Trash className="w-4 h-4" />
                                Delete Account
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            {/* Delete Account Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Icons.AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Account</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            To confirm deletion, please enter your password:
                        </p>
                        
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                        />
                        
                        {deleteError && (
                            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{deleteError}</p>
                        )}
                        
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => { setShowDeleteDialog(false); setDeletePassword(''); setDeleteError(''); }}
                                style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {isDeleting && (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                )}
                                Delete Account
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            {/* Change Password Dialog */}
            {showChangePassword && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Icons.Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
                                <p className="text-sm text-gray-500">Enter your current and new password</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); }}
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                                    placeholder="Enter new password (min 6 characters)"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        
                        {passwordError && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{passwordError}</p>
                        )}
                        
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => { 
                                    setShowChangePassword(false); 
                                    setCurrentPassword(''); 
                                    setNewPassword(''); 
                                    setConfirmPassword(''); 
                                    setPasswordError(''); 
                                }}
                                style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!currentPassword || !newPassword || !confirmPassword) {
                                        setPasswordError('Please fill in all fields');
                                        return;
                                    }
                                    if (newPassword.length < 6) {
                                        setPasswordError('New password must be at least 6 characters');
                                        return;
                                    }
                                    if (newPassword !== confirmPassword) {
                                        setPasswordError('New passwords do not match');
                                        return;
                                    }
                                    
                                    setPasswordLoading(true);
                                    try {
                                        await changePassword(currentPassword, newPassword);
                                        toast.success('Password changed successfully!');
                                        setShowChangePassword(false);
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    } catch (err) {
                                        setPasswordError(err.message);
                                    } finally {
                                        setPasswordLoading(false);
                                    }
                                }}
                                disabled={passwordLoading}
                                style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', backgroundColor: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: passwordLoading ? 'not-allowed' : 'pointer', opacity: passwordLoading ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {passwordLoading && (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                )}
                                Change Password
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatedPage>
    );
}
