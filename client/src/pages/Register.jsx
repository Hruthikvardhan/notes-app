import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/UI/Button';

const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
const COLORS = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#16A34A'];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(form.password), [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created');
      navigate('/notes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <h1 className="font-display text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-sm text-ink/50 dark:text-gray-400 mb-6">A quiet place for your notes.</p>

        <label className="text-xs font-medium text-ink/60 dark:text-gray-400">Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full mb-4 mt-1 px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent outline-none focus:border-accent-500"
        />

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
          minLength={6}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent outline-none focus:border-accent-500"
        />
        {form.password && (
          <div className="mt-2 mb-6">
            <div className="h-1.5 w-full rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${(strength / 5) * 100}%`, backgroundColor: COLORS[strength] }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: COLORS[strength] }}>
              {LABELS[strength]}
            </p>
          </div>
        )}
        {!form.password && <div className="mb-6" />}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-sm text-ink/50 dark:text-gray-400 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-500 font-medium">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default Register;
