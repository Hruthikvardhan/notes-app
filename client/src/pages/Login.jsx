import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/UI/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back');
      navigate('/notes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-surface-dark p-4">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-surface-darkCard rounded-2xl shadow-note p-6 sm:p-8"
      >
        <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-ink/50 dark:text-gray-400 mb-6">Sign in to keep writing.</p>

        <label className="text-xs font-medium text-ink/60 dark:text-gray-400">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full mb-4 mt-1 px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent outline-none focus:border-accent-500"
        />

        <label className="text-xs font-medium text-ink/60 dark:text-gray-400">Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="w-full mb-6 mt-1 px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent outline-none focus:border-accent-500"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-sm text-ink/50 dark:text-gray-400 mt-4 text-center">
          No account?{' '}
          <Link to="/register" className="text-accent-500 font-medium">
            Create one
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default Login;
