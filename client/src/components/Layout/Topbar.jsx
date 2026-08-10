import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearchOutline, IoGridOutline, IoListOutline, IoMoonOutline, IoSunnyOutline, IoMenuOutline } from 'react-icons/io5';
import { useTheme } from '../../hooks/useTheme';
import { useNotes } from '../../hooks/useNotes';
import { SORT_OPTIONS, NOTE_COLORS } from '../../utils/constants';

const selectClass =
  'text-sm bg-transparent border border-ink/15 dark:border-white/15 rounded-full px-3 py-1.5 dark:text-gray-200';

const Topbar = ({ view, setView, onMenuClick }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { filters, setFilters, fetchNotes, categories } = useNotes();

  const handleFilterChange = (patch) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    fetchNotes(next);
  };

  return (
    <div className="sticky top-0 z-20 bg-paper/90 dark:bg-surface-dark/90 backdrop-blur border-b border-ink/10 dark:border-white/10 px-3 sm:px-4 py-3">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-full border border-ink/15 dark:border-white/15 text-ink/70 dark:text-gray-300 shrink-0"
          title="Open menu"
        >
          <IoMenuOutline size={18} />
        </button>

        <button
          onClick={() => navigate('/search')}
          className="flex-1 min-w-[140px] flex items-center gap-2 px-4 py-2 rounded-full bg-ink/5 dark:bg-white/5 text-sm text-ink/50 dark:text-gray-400 text-left"
        >
          <IoSearchOutline size={16} />
          <span className="truncate">Search your notes…</span>
        </button>

        <button onClick={toggleTheme} className="p-2 rounded-full border border-ink/15 dark:border-white/15 text-ink/70 dark:text-gray-300 shrink-0" title="Toggle theme">
          {theme === 'DARK' ? <IoSunnyOutline size={16} /> : <IoMoonOutline size={16} />}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange({ sort: e.target.value })}
          className={`${selectClass} shrink-0`}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filters.color}
          onChange={(e) => handleFilterChange({ color: e.target.value })}
          className={`${selectClass} shrink-0`}
        >
          <option value="">Any color</option>
          {NOTE_COLORS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.name}
            </option>
          ))}
        </select>

        {categories.length > 0 && (
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
            className={`${selectClass} shrink-0`}
          >
            <option value="">Any category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1 border border-ink/15 dark:border-white/15 rounded-full p-1 shrink-0 ml-auto">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-full ${view === 'grid' ? 'bg-accent-500 text-white' : 'text-ink/60 dark:text-gray-400'}`}
          >
            <IoGridOutline size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-full ${view === 'list' ? 'bg-accent-500 text-white' : 'text-ink/60 dark:text-gray-400'}`}
          >
            <IoListOutline size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
