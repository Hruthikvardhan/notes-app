import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { debounce } from '../utils/helpers';
import { SEARCH_DEBOUNCE_MS } from '../utils/constants';

// Debounced search hook, backed by the /api/notes/search text-index endpoint
export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedRef = useRef(null);

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/notes/search', { params: { search: q } });
      setResults(data.data.notes);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!debouncedRef.current) {
      debouncedRef.current = debounce(runSearch, SEARCH_DEBOUNCE_MS);
    }
    debouncedRef.current(query);
  }, [query, runSearch]);

  return { query, setQuery, results, loading };
};
