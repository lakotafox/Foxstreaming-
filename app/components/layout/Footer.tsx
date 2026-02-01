'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const socialLinks: { name: string; href: string; title?: string; icon: JSX.Element }[] = [];

  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Privacy', path: '#' },
    { label: 'Terms', path: '#' },
    { label: 'Contact', path: '#' },
    { label: 'Support', path: '#' },
  ];

  const techStack = ['Next.js 14', 'React', 'Bun', 'TMDB API'];

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerContent}>
        {/* Main Footer Section */}
        <div className={styles.footerMain}>
          {/* Logo and Branding */}
          <div className={styles.footerBrand}>
            <div className={styles.logoContainer}>
              <div className={styles.logoIcon}>
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff6b35" />
                      <stop offset="50%" stopColor="#f7931e" />
                      <stop offset="100%" stopColor="#ffcc00" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M4 8L16 2L28 8V24L16 30L4 24V8Z"
                    stroke="url(#footerLogoGradient)"
                    strokeWidth="2"
                    fill="rgba(247, 147, 30, 0.1)"
                  />
                  <circle cx="16" cy="16" r="6" fill="url(#footerLogoGradient)" />
                  <path
                    d="M12 16L15 19L20 13"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoTitle}>FOXSTREAM</span>
                <span className={styles.logoTagline}>Stream Beyond Limits</span>
              </div>
            </div>
            <p className={styles.brandDescription}>
              Experience the future of streaming with cutting-edge technology and stunning design.
            </p>
          </div>

          {/* Footer Links */}
          <nav className={styles.footerLinks} aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <button
                key={link.label}
                className={styles.footerLink}
                onClick={() => link.path !== '#' && handleNavigation(link.path)}
                disabled={link.path === '#'}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Social Links */}
          <div className={styles.socialLinks}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className={styles.socialLink}
                aria-label={social.title || `Follow us on ${social.name}`}
                title={social.title || social.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom Footer Section */}
        <div className={styles.footerBottom}>
          <div className={styles.footerLeft}>
            <p className={styles.copyright}>
              © {currentYear} FoxStream • Made with{' '}
              <span className={styles.heart} aria-label="love">♥</span>
            </p>
            <p className={styles.disclaimer}>
              Educational purposes only • Not affiliated with any streaming service
            </p>
          </div>

          <div className={styles.footerRight}>
            <div className={styles.techStack}>
              {techStack.map((tech) => (
                <span key={tech} className={styles.techBadge}>
                  {tech}
                </span>
              ))}
            </div>
            <div className={styles.status}>
              <span className={styles.statusIndicator} />
              <span className={styles.statusText}>All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background */}
      <div className={styles.footerBackground} aria-hidden="true">
        <div className={styles.gradientOrb} />
        <div className={styles.gridPattern} />
      </div>
    </footer>
  );
};

export default Footer;
