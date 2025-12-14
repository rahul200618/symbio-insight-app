const API_URL = 'http://localhost:3002/api/auth';

// Helper to get token
const getToken = () => localStorage.getItem('symbio_nlm_auth_token');

// Register new user
export const signup = async (email, password, name) => {
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        return data;
    } catch (error) {
        // Handle network errors
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
};

// Login user
export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error) {
        // Handle network errors
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
};

// Get current user
export const getMe = async () => {
    const token = getToken();
    if (!token) throw new Error('No token found');

    try {
        const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch user');
        }

        return data;
    } catch (error) {
        // Handle network errors
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
};

// Update user profile
export const updateProfile = async (profileData) => {
    const token = getToken();
    if (!token) throw new Error('No token found');

    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
};

// Delete user account
export const deleteAccount = async (password) => {
    const token = getToken();
    if (!token) throw new Error('No token found');

    try {
        const response = await fetch(`${API_URL}/account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete account');
        }

        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
    const token = getToken();
    if (!token) throw new Error('No token found');

    try {
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to change password');
        }

        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
};

// Forgot password - send reset email
export const forgotPassword = async (email) => {
    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send reset email');
        }

        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
};

// Email validation
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
    return {
        isValid: password.length >= 8,
        hasMinLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
};
