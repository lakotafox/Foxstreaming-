'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsScrolled } from '@/app/lib/hooks/useScrollPosition';
import { useIsMobile } from '@/app/lib/hooks/useMediaQuery';
import styles from './Navigation.module.css';
import MobileBottomNav from './MobileBottomNav';

interface NavigationProps {
  transparent?: boolean;
  onSearch?: (query: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  transparent = false,
  onSearch 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const isScrolled = useIsScrolled(50);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    // Always navigate to search page when clicking the search button
    router.push('/search');
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  };

  const navClasses = [
    styles.navigation,
    (isScrolled || !transparent) ? styles.scrolled : '',
    mobileMenuOpen ? styles.menuOpen : '',
  ].filter(Boolean).join(' ');

  const primaryNavItems = [
    { path: '/', label: 'Home' },
    { path: '/movies', label: 'Movies' },
    { path: '/series', label: 'Series' },
    { path: '/anime', label: 'Anime' },
    { path: '/livetv', label: 'Live TV' },
    { path: '/watchlist', label: 'Watchlist' },
  ];

  const secondaryNavItems = [
    { path: '/settings', label: 'Settings' },
    { path: '/about', label: 'About' },
    { path: '/reverse-engineering', label: 'How It Works' },
  ];

  // SVG Icons as components for cleaner code
  const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );

  return (
    <>
      <nav className={navClasses} role="navigation" aria-label="Main navigation">
        <div className={styles.navContainer}>
          {/* Logo */}
          <button className={styles.logo} onClick={handleLogoClick} aria-label="FoxStream home">
            <div className={styles.logoIcon}>
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b35" />
                    <stop offset="50%" stopColor="#f7931e" />
                    <stop offset="100%" stopColor="#ffcc00" />
                  </linearGradient>
                </defs>
                <path d="M5 9L16 3L27 9V23L16 29L5 23V9Z" stroke="url(#navLogoGradient)" strokeWidth="2" fill="rgba(247, 147, 30, 0.1)" />
                <circle cx="16" cy="16" r="5.5" fill="url(#navLogoGradient)" />
                <path d="M13 16L15 18.5L19 13.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={styles.logoText}>FOXSTREAM</span>
          </button>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className={styles.navLinks}>
              {primaryNavItems.map((item) => (
                <button
                  key={item.path}
                  className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              ))}
              
              {/* More Dropdown */}
              <div className={styles.moreDropdown} ref={moreMenuRef}>
                <button
                  className={`${styles.navLink} ${styles.moreButton}`}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  aria-expanded={moreMenuOpen}
                >
                  More <ChevronIcon open={moreMenuOpen} />
                </button>
                {moreMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    {secondaryNavItems.map((item) => (
                      <button
                        key={item.path}
                        className={`${styles.dropdownItem} ${isActive(item.path) ? styles.active : ''}`}
                        onClick={() => handleNavigation(item.path)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.navActions}>
            {!isMobile && (
              <>
                <button className={styles.searchButton} onClick={toggleSearch} aria-label="Search">
                  <SearchIcon />
                </button>
                <button
                  className={styles.profileButton}
                  onClick={() => handleNavigation('/settings')}
                  aria-label="Settings & Sync"
                  title="Settings & Sync"
                >
                  <UserIcon />
                </button>
              </>
            )}
            
            {isMobile && (
              <button
                className={`${styles.hamburgerButton} ${mobileMenuOpen ? styles.open : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <span />
                <span />
                <span />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar (Desktop) */}
        {searchOpen && !isMobile && (
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <input
                id="nav-search-input"
                type="search"
                className={styles.searchInput}
                placeholder="Search movies, series, anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className={styles.searchSubmit} aria-label="Search">
                <SearchIcon />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
            <div className={styles.mobileMenuContent}>
              <div className={styles.mobileSection}>
                {primaryNavItems.map((item) => (
                  <button
                    key={item.path}
                    className={`${styles.mobileLink} ${isActive(item.path) ? styles.active : ''}`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className={styles.mobileDivider} />

              <div className={styles.mobileSection}>
                {secondaryNavItems.map((item) => (
                  <button
                    key={item.path}
                    className={`${styles.mobileLink} ${styles.secondary} ${isActive(item.path) ? styles.active : ''}`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

            </div>
          </div>
        )}
      </nav>

      {isMobile && <MobileBottomNav />}
    </>
  );
};

export default Navigation;
