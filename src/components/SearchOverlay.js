'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { searchProducts, formatPrice } from '@/lib/products';
import styles from './SearchOverlay.module.css';

export default function SearchOverlay() {
  const { state, dispatch } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (state.searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.searchOpen]);

  useEffect(() => {
    if (state.searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [state.searchOpen]);

  useEffect(() => {
    if (query.length > 1) {
      searchProducts(query).then(setResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const close = () => {
    dispatch({ type: 'SET_SEARCH_OPEN', payload: false });
    setQuery('');
    setResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch({ type: 'ADD_SEARCH_HISTORY', payload: query.trim() });
      close();
    }
  };

  if (!state.searchOpen) return null;

  return (
    <div className={styles.overlay} onClick={close} id="search-overlay">
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <form className={styles.searchBar} onSubmit={handleSubmit}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search products, brands, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            id="search-input"
          />
          <button className={styles.closeBtn} onClick={close} type="button" aria-label="Close search">
            <kbd className={styles.kbd}>ESC</kbd>
          </button>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div className={styles.results}>
            <p className={styles.resultsCount}>{results.length} result{results.length !== 1 ? 's' : ''}</p>
            <div className={styles.resultsList}>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className={styles.resultItem}
                  onClick={close}
                >
                  <div className={styles.resultImg}>
                    <span>IMG</span>
                  </div>
                  <div className={styles.resultInfo}>
                    <p className={styles.resultName}>{product.name}</p>
                    <p className={styles.resultBrand}>{product.brand}</p>
                  </div>
                  <span className={styles.resultPrice}>{formatPrice(product.price)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {query.length < 2 && state.searchHistory.length > 0 && (
          <div className={styles.recent}>
            <p className={styles.recentTitle}>Recent Searches</p>
            <div className={styles.recentList}>
              {state.searchHistory.map((q) => (
                <button
                  key={q}
                  className={styles.recentItem}
                  onClick={() => setQuery(q)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {query.length > 1 && results.length === 0 && (
          <div className={styles.noResults}>
            <p>No products found for &ldquo;{query}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
