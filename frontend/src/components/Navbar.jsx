import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiMenu, FiFilm, FiBookmark } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { getSearchSuggestions, img } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { useWatchlist } from '../hooks/useWatchlist';

const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Browse',   to: '/browse' },
  { label: 'Telugu',   to: '/browse?lang=telugu' },
  { label: 'Hindi',    to: '/browse?lang=hindi' },
  { label: 'Tamil',    to: '/browse?lang=tamil' },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState('');
  const [menuOpen, setMenuOpen]     = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const debouncedQuery = useDebounce(query, 300);
  const { count: watchlistCount }   = useWatchlist();

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
    setQuery('');
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (s) => {
    navigate(`/movie/${s.id}`);
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* ── Logo ── */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#ff10a0,#8b5cf6)' }}
        >
          <FiFilm className="text-white text-lg" />
        </div>
        <span className="font-display font-bold text-lg hidden sm:block">
          <span className="gradient-text">CineVerse</span>
          <span className="text-white"> AI</span>
        </span>
      </Link>

      {/* ── Desktop Nav ── */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              location.pathname === link.to
                ? 'text-white bg-white/10'
                : 'text-gray-400 hover:text-white hover:bg-white/8'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* ── Right Controls ── */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div
                key="search-open"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSearch} className="relative">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search movies, actors..."
                    className="input-field pr-10 h-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setQuery(''); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </form>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {suggestions?.results?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute top-full mt-2 left-0 right-0 glass rounded-xl overflow-hidden z-50 shadow-2xl border border-white/8"
                    >
                      {suggestions.results.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleSuggestionClick(s)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="w-8 h-12 rounded overflow-hidden flex-shrink-0 bg-cinema-muted">
                            {s.poster_path ? (
                              <img src={img(s.poster_path, 'w92')} alt={s.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <FiFilm size={14} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{s.title}</p>
                            <p className="text-xs text-gray-500">{s.year} · {s.media_type}</p>
                          </div>
                          {s.vote_average > 0 && (
                            <span className="rating-badge text-xs flex-shrink-0">★ {s.vote_average?.toFixed(1)}</span>
                          )}
                        </button>
                      ))}
                      <button
                        onClick={handleSearch}
                        className="w-full p-3 text-sm text-brand-400 hover:bg-white/5 text-left border-t border-white/5 transition-colors"
                      >
                        See all results for "{query}" →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.button
                key="search-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-all"
                aria-label="Open search"
              >
                <FiSearch size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Watchlist icon with count badge */}
        <Link
          to="/watchlist"
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-all"
          aria-label={`Watchlist (${watchlistCount} items)`}
        >
          <FiBookmark size={18} />
          {watchlistCount > 0 && (
            <motion.span
              key={watchlistCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-0.5"
              style={{ background: 'linear-gradient(135deg,#ff10a0,#8b5cf6)' }}
            >
              {watchlistCount > 99 ? '99+' : watchlistCount}
            </motion.span>
          )}
        </Link>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-all"
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="absolute top-16 left-0 right-0 glass-dark border-b border-white/5 p-4 flex flex-col gap-1 md:hidden z-40"
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/8 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/watchlist"
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
            >
              <FiBookmark size={14} />
              Watchlist
              {watchlistCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#ff10a0,#8b5cf6)' }}>
                  {watchlistCount}
                </span>
              )}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
