'use client';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getAllProducts, getCategories, getBrands, formatPrice } from '@/lib/products';
import styles from './shop.module.css';
import { useEffect } from 'react';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialCollection = searchParams.get('collection') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllProducts(),
      getCategories(),
      getBrands()
    ]).then(([fetchedProducts, fetchedCategories, fetchedBrands]) => {
      setAllProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setBrands(fetchedBrands);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategory) {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (initialCollection) {
      result = result.filter((p) => p.collection === initialCollection);
    }
    if (selectedBrand) {
      result = result.filter((p) => p.brand === selectedBrand);
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }

    return result;
  }, [selectedCategory, selectedBrand, sortBy, priceRange, initialCollection]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange([0, 100000]);
    setSortBy('featured');
  };

  const activeFilterCount = [selectedCategory, selectedBrand, priceRange[0] > 0, priceRange[1] < 100000].filter(Boolean).length;

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <div className="container">
          <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
            <a href="/">Home</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span>Shop</span>
            {selectedCategory && (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                <span style={{ textTransform: 'capitalize' }}>{selectedCategory}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        {/* Mobile filter toggle */}
        <button className={styles.mobileFilterBtn} onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
          </svg>
          Filters
          {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
        </button>

        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${mobileFiltersOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>Filters</h3>
            {activeFilterCount > 0 && (
              <button className={styles.clearBtn} onClick={clearFilters}>Clear all</button>
            )}
          </div>

          {/* Categories */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Category</h4>
            <div className={styles.filterOptions}>
              <button
                className={`${styles.filterOption} ${!selectedCategory ? styles.filterOptionActive : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  className={`${styles.filterOption} ${selectedCategory === cat.slug ? styles.filterOptionActive : ''}`}
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.name}
                  <span className={styles.filterCount}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Brand</h4>
            <div className={styles.filterOptions}>
              <button
                className={`${styles.filterOption} ${!selectedBrand ? styles.filterOptionActive : ''}`}
                onClick={() => setSelectedBrand('')}
              >
                All Brands
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  className={`${styles.filterOption} ${selectedBrand === brand ? styles.filterOptionActive : ''}`}
                  onClick={() => setSelectedBrand(brand)}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Price Range</h4>
            <div className={styles.priceInputs}>
              <input
                type="number"
                className={`input ${styles.priceInput}`}
                placeholder="Min"
                value={priceRange[0] || ''}
                onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
              />
              <span className={styles.priceDash}>—</span>
              <input
                type="number"
                className={`input ${styles.priceInput}`}
                placeholder="Max"
                value={priceRange[1] === 100000 ? '' : priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 100000])}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={styles.main}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <p className={styles.resultCount}>
              <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}
            </p>
            <select
              className={`input select ${styles.sortSelect}`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', width: '100%' }}>Loading products...</div>
          ) : filtered.length > 0 ? (
            <div className={styles.productGrid}>
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <p>No products match your filters</p>
              <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
