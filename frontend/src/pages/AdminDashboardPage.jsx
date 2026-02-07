import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * AdminDashboardPage Component
 * 
 * Admin-only dashboard for:
 * - User management
 * - Usage analytics
 * - System health monitoring
 */
export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Check if user is admin
    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Fetch dashboard data
    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'analytics') {
            fetchAnalytics();
        }
    }, [activeTab, currentPage, searchQuery]);

    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('symbio_token')}`,
        'Content-Type': 'application/json'
    });

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/stats`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(
                `${API_URL}/admin/users?page=${currentPage}&limit=10&search=${searchQuery}`,
                { headers: getAuthHeaders() }
            );
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/sequences/analytics`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ role: newRole })
            });
            if (response.ok) {
                fetchUsers();
            }
        } catch (err) {
            console.error('Failed to update role:', err);
        }
    };

    const deleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                fetchUsers();
                fetchStats();
            }
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage users and view platform analytics
                    </p>
                </div>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                    Admin Only
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {['overview', 'users', 'analytics'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Users"
                            value={stats.overview?.totalUsers || 0}
                            subtitle={`+${stats.overview?.newUsersThisWeek || 0} this week`}
                            icon="👥"
                            color="indigo"
                        />
                        <StatCard
                            title="Total Sequences"
                            value={stats.overview?.totalSequences || 0}
                            subtitle={`+${stats.overview?.newSequencesThisWeek || 0} this week`}
                            icon="🧬"
                            color="green"
                        />
                        <StatCard
                            title="Avg Sequence Length"
                            value={stats.overview?.avgSequenceLength?.toLocaleString() || 0}
                            subtitle="base pairs"
                            icon="📏"
                            color="blue"
                        />
                        <StatCard
                            title="Total Base Pairs"
                            value={formatLargeNumber(stats.overview?.totalBasePairs || 0)}
                            subtitle="analyzed"
                            icon="🔬"
                            color="purple"
                        />
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Users */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Recent Users
                            </h3>
                            <div className="space-y-3">
                                {stats.recent?.users?.map((user, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
                                                {user.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Sequences */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Recent Sequences
                            </h3>
                            <div className="space-y-3">
                                {stats.recent?.sequences?.map((seq, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                {seq.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {seq.length?.toLocaleString()} bp • GC: {seq.gcContent?.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(seq.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Search */}
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((u) => (
                                    <tr key={u._id || u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                                                    {u.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                                                    <div className="text-sm text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={u.role}
                                                onChange={(e) => updateUserRole(u._id || u.id, e.target.value)}
                                                className={`text-xs px-2 py-1 rounded-full border-0 ${
                                                    u.role === 'admin' 
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">
                                                {u.oauthProvider ? u.oauthProvider.charAt(0).toUpperCase() + u.oauthProvider.slice(1) : 'Email'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteUser(u._id || u.id, u.name)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* GC Content Distribution */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            GC Content Distribution
                        </h3>
                        <div className="space-y-3">
                            {analytics.gcDistribution?.map((bucket, idx) => {
                                const labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500 w-20">{labels[idx] || bucket._id}</span>
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4">
                                            <div 
                                                className="bg-indigo-500 h-4 rounded-full"
                                                style={{ width: `${Math.min(100, bucket.count * 10)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                                            {bucket.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Length Distribution */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Sequence Length Distribution
                        </h3>
                        <div className="space-y-3">
                            {analytics.lengthDistribution?.map((bucket, idx) => {
                                const labels = ['<100 bp', '100-1K', '1K-10K', '10K-100K', '100K-1M', '>1M'];
                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500 w-20">{labels[idx] || bucket._id}</span>
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4">
                                            <div 
                                                className="bg-green-500 h-4 rounded-full"
                                                style={{ width: `${Math.min(100, bucket.count * 10)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                                            {bucket.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ORF Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            ORF Detection Stats
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {analytics.orfStats?.map((stat, idx) => (
                                <div key={idx} className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stat.count}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {stat._id ? 'With ORFs' : 'No ORFs'}
                                    </div>
                                    {stat.avgOrfCount && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            Avg: {stat.avgOrfCount.toFixed(1)} ORFs
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// Helper Components
function StatCard({ title, value, subtitle, icon, color }) {
    const colorClasses = {
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <div className="text-sm text-gray-500">{title}</div>
                    <div className="text-xs text-gray-400">{subtitle}</div>
                </div>
            </div>
        </div>
    );
}

function formatLargeNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
}
