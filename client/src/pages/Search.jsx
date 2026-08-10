import React from 'react';
import { IoSearchOutline, IoSearchCircleOutline } from 'react-icons/io5';
import { useSearch } from '../hooks/useSearch';
import { highlightMatch } from '../utils/helpers';
import EmptyState from '../components/UI/EmptyState';

const HighlightedText = ({ text, query }) => {
  const parts = highlightMatch(text, query);
  if (typeof parts === 'string') return <>{parts}</>;
  return (
    <>
      {parts.map((p) =>
        p.highlight ? (
          <mark key={p.key} className="bg-accent-100 text-accent-600 rounded px-0.5">
            {p.text}
          </mark>
        ) : (
          <span key={p.key}>{p.text}</span>
        )
      )}
    </>
  );
};

const Search = () => {
  const { query, setQuery, results, loading } = useSearch();

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-ink/5 dark:bg-white/5 mb-6">
        <IoSearchOutline size={18} className="text-ink/40 dark:text-gray-500" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, content, or tags…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {loading && <p className="text-sm text-ink/40 dark:text-gray-500 text-center">Searching…</p>}

      {!loading && query && results.length === 0 && (
        <EmptyState
          icon={IoSearchCircleOutline}
          title="No results"
          description={`Nothing matched “${query}”. Try a different word.`}
        />
      )}

      <ul className="space-y-3">
        {results.map((note) => (
          <li key={note._id} className="p-4 rounded-note border border-ink/10 dark:border-white/10" style={{ backgroundColor: note.color }}>
            <h3 className="font-display font-semibold">
              <HighlightedText text={note.title} query={query} />
            </h3>
            <p className="text-sm opacity-70 mt-1 line-clamp-2">
              <HighlightedText text={note.contentText || note.content} query={query} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
