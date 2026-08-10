import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { IoMoonOutline, IoSunnyOutline, IoDownloadOutline, IoTrashOutline } from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { getInitials } from '../utils/helpers';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import api from '../utils/api';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get('/user/stats').then(({ data }) => setStats(data.data.stats));
    api.get('/user/activity').then(({ data }) => setActivity(data.data.logs));
  }, []);

  const saveProfile = async () => {
    try {
      const { data } = await api.put('/auth/update', form);
      updateUser(data.data.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    }
  };

  const changePassword = async () => {
    try {
      await api.put('/auth/change-password', passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.data.user);
      toast.success('Avatar updated');
    } catch {
      toast.error('Avatar upload failed');
    }
  };

  const exportNotes = async () => {
    const { data } = await api.get('/notes', { params: { limit: 1000 } });
    const blob = new Blob([JSON.stringify(data.data.notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleThemePref = async (newTheme) => {
    setTheme(newTheme);
    await api.put('/user/preferences', { theme: newTheme }).catch(() => {});
  };

  const deleteAccount = async () => {
    await api.delete('/user/account');
    await logout();
    toast.success('Account deleted');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8">
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-accent-500 text-white flex items-center justify-center text-lg font-semibold overflow-hidden">
            {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" alt="" /> : getInitials(user?.name)}
          </div>
          <label className="text-sm text-accent-500 font-medium cursor-pointer">
            Change photo
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </label>
        </div>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Name"
          className="w-full mb-2 px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
        />
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="Bio"
          rows={3}
          className="w-full mb-2 px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
        />
        <Button onClick={saveProfile}>Save profile</Button>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Password</h2>
        <input
          type="password"
          placeholder="Current password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
          className="w-full mb-2 px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
        />
        <input
          type="password"
          placeholder="New password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
          className="w-full mb-2 px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
        />
        <Button variant="secondary" onClick={changePassword}>
          Change password
        </Button>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Appearance</h2>
        <div className="flex gap-2">
          <Button variant={theme === 'LIGHT' ? 'primary' : 'secondary'} icon={IoSunnyOutline} onClick={() => toggleThemePref('LIGHT')}>
            Light
          </Button>
          <Button variant={theme === 'DARK' ? 'primary' : 'secondary'} icon={IoMoonOutline} onClick={() => toggleThemePref('DARK')}>
            Dark
          </Button>
        </div>
      </section>

      {stats && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">Statistics</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="p-4 rounded-note bg-ink/5 dark:bg-white/5">
              <p className="text-lg sm:text-2xl font-semibold dark:text-gray-100">{stats.totalNotes}</p>
              <p className="text-xs text-ink/50 dark:text-gray-400">Total notes</p>
            </div>
            <div className="p-4 rounded-note bg-ink/5 dark:bg-white/5">
              <p className="text-lg sm:text-2xl font-semibold dark:text-gray-100">{stats.notesThisMonth}</p>
              <p className="text-xs text-ink/50 dark:text-gray-400">This month</p>
            </div>
            <div className="p-4 rounded-note bg-ink/5 dark:bg-white/5">
              <p className="text-lg sm:text-2xl font-semibold dark:text-gray-100">{stats.totalWords}</p>
              <p className="text-xs text-ink/50 dark:text-gray-400">Words written</p>
            </div>
          </div>
        </section>
      )}

      {activity.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">Recent activity</h2>
          <ul className="space-y-2 text-sm">
            {activity.map((log) => (
              <li key={log._id} className="flex justify-between text-ink/60 dark:text-gray-400">
                <span>
                  {log.action.toLowerCase()} “{log.noteTitle}”
                </span>
                <span className="text-ink/30 dark:text-gray-600">{format(new Date(log.timestamp), 'MMM d, HH:mm')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <Button variant="ghost" icon={IoDownloadOutline} onClick={exportNotes}>
          Export notes as JSON
        </Button>
      </section>

      <section className="pt-4 border-t border-ink/10 dark:border-white/10">
        <Button variant="danger" icon={IoTrashOutline} onClick={() => setConfirmDelete(true)}>
          Delete account
        </Button>
      </section>

      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete account?">
        <p className="text-sm text-ink/60 dark:text-gray-400 mb-4">
          This permanently deletes your account and every note you've written. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteAccount}>
            Yes, delete everything
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
