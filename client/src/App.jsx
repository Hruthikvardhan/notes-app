import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './ErrorBoundary.jsx';
import { useAuth } from './hooks/useAuth';

import Layout from './components/Layout/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Notes from './pages/Notes.jsx';
import Search from './pages/Search.jsx';
import Archive from './pages/Archive.jsx';
import Trash from './pages/Trash.jsx';
import Profile from './pages/Profile.jsx';
import PublicNotes from './pages/PublicNotes.jsx';
import NotFound from './pages/NotFound.jsx';
import NoteEditor from './components/Notes/NoteEditor.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/40 dark:text-gray-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const App = () => (
  <ErrorBoundary>
    <Toaster position="top-center" toastOptions={{ style: { fontSize: 14 } }} />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/public" element={<PublicNotes />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/pinned" element={<Notes />} />
        <Route path="/notes/new" element={<NoteEditor />} />
        <Route path="/notes/:id/edit" element={<NoteEditor />} />
        <Route path="/search" element={<Search />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Navigate to="/notes" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </ErrorBoundary>
);

export default App;
