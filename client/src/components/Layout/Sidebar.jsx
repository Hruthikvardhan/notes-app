import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoDocumentTextOutline,
  IoPinOutline,
  IoArchiveOutline,
  IoTrashOutline,
  IoSettingsOutline,
  IoAddCircleOutline,
  IoFolderOutline,
  IoLogOutOutline,
  IoAdd,
  IoClose,
} from "react-icons/io5";
import { useAuth } from "../../hooks/useAuth";
import { useNotes } from "../../hooks/useNotes";
import { getInitials } from "../../utils/helpers";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { NOTE_COLORS } from "../../utils/constants";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent-500 text-white"
      : "text-ink/70 dark:text-gray-300 hover:bg-ink/5 dark:hover:bg-white/5"
  }`;

const Sidebar = ({ mobileOpen = false, onMobileClose = () => {} }) => {
  const { user, logout } = useAuth();
  const { categories, createCategory } = useNotes();
  const navigate = useNavigate();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#5B7FDB");
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavigate = () => {
    onMobileClose();
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSaving(true);
    try {
      await createCategory({ name: categoryName.trim(), color: categoryColor });
      setCategoryName("");
      setCategoryColor("#5B7FDB");
      setShowCategoryModal(false);
    } catch {
      /* toast already shown on failure */
    } finally {
      setSaving(false);
    }
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-6 md:mb-6">
        <Link to="/profile" onClick={handleNavigate} className="flex items-center gap-3 px-2 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-accent-500 text-white flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
            {user?.profilePic ? (
              <img src={user.profilePic} className="w-full h-full object-cover" alt="" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-ink/40 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={onMobileClose}
          className="md:hidden p-2 rounded-full text-ink/50 dark:text-gray-400 hover:bg-ink/5 dark:hover:bg-white/5 shrink-0"
        >
          <IoClose size={20} />
        </button>
      </div>

      <Link
        to="/notes/new"
        onClick={handleNavigate}
        className="flex items-center gap-2 mb-6 px-3 py-2 rounded-full bg-accent-500 text-white text-sm font-medium justify-center"
      >
        <IoAddCircleOutline size={18} /> New note
      </Link>

      <nav className="flex flex-col gap-1">
        <NavLink to="/notes" end onClick={handleNavigate} className={linkClass}>
          <IoDocumentTextOutline size={18} /> All notes
        </NavLink>
        <NavLink to="/notes/pinned" onClick={handleNavigate} className={linkClass}>
          <IoPinOutline size={18} /> Pinned
        </NavLink>
        <NavLink to="/archive" onClick={handleNavigate} className={linkClass}>
          <IoArchiveOutline size={18} /> Archived
        </NavLink>
        <NavLink to="/trash" onClick={handleNavigate} className={linkClass}>
          <IoTrashOutline size={18} /> Trash
        </NavLink>
      </nav>

      <div className="mt-6">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-xs font-semibold uppercase text-ink/30 dark:text-gray-600">Categories</p>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="p-1 rounded-full text-ink/40 dark:text-gray-500 hover:text-accent-500 hover:bg-ink/5 dark:hover:bg-white/5"
            title="New category"
            type="button"
          >
            <IoAdd size={16} />
          </button>
        </div>
        {categories.length > 0 ? (
          <nav className="flex flex-col gap-1">
            {categories.map((c) => (
              <NavLink key={c._id} to={`/notes?category=${c._id}`} onClick={handleNavigate} className={linkClass}>
                <IoFolderOutline size={18} style={{ color: c.color }} /> {c.name}
              </NavLink>
            ))}
          </nav>
        ) : (
          <p className="px-3 text-xs text-ink/30 dark:text-gray-600">No categories yet</p>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-1 pt-6">
        <NavLink to="/profile" onClick={handleNavigate} className={linkClass}>
          <IoSettingsOutline size={18} /> Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left transition-colors"
        >
          <IoLogOutOutline size={18} /> Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible, static */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-ink/10 dark:border-white/10 p-4">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — slide-in drawer with overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              className="fixed top-0 left-0 z-50 flex flex-col w-72 max-w-[85vw] h-screen bg-paper dark:bg-surface-dark p-4 md:hidden overflow-y-auto"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="New category">
        <form onSubmit={handleCreateCategory}>
          <label className="text-xs font-medium text-ink/60 dark:text-gray-400">Name</label>
          <input
            autoFocus
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Work"
            className="w-full mb-4 mt-1 px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent outline-none focus:border-accent-500 dark:text-gray-100"
          />

          <label className="text-xs font-medium text-ink/60 dark:text-gray-400">Color</label>
          <div className="flex flex-wrap gap-2 mt-2 mb-6">
            {NOTE_COLORS.filter((c) => c.value !== "#FFFFFF").map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                onClick={() => setCategoryColor(c.value)}
                className={`w-7 h-7 rounded-full border-2 ${
                  categoryColor === c.value ? "border-accent-500" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !categoryName.trim()}>
              {saving ? "Creating…" : "Create category"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Sidebar;
