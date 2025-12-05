import { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, signup as apiSignup, getMe } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = localStorage.getItem('symbio_nlm_auth_token');
                if (token) {
                    const userData = await getMe();
                    setUser(userData);
                }
            } catch (err) {
                console.error('Failed to load user', err);
                localStorage.removeItem('symbio_nlm_auth_token');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiLogin(email, password);
            setUser(data);
            localStorage.setItem('symbio_nlm_auth_token', data.token);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email, password, name) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiSignup(email, password, name);
            setUser(data);
            localStorage.setItem('symbio_nlm_auth_token', data.token);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('symbio_nlm_auth_token');
        localStorage.removeItem('symbio_nlm_remember');
        // Force redirect to login
        window.location.href = '/login';
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
