import React from 'react';
import { useTranslation } from 'react-i18next';

// ============================================
// HUB PAGE - Editorial Landing
// ============================================

export default function HubPage({ onNavigate }) {
  const { t } = useTranslation(['home', 'common']);

  const categories = [
    {
      id: 'games',
      icon: '🎮',
      title: t('home:categories.games.title'),
      description: t('home:categories.games.description'),
      gradient: 'linear-gradient(135deg, #D4826C 0%, #B86D59 100%)',
      glowColor: 'rgba(212, 130, 108, 0.2)',
      accentColor: '#D4826C',
    },
    {
      id: 'movies',
      icon: '🎬',
      title: t('home:categories.movies.title'),
      description: t('home:categories.movies.description'),
      gradient: 'linear-gradient(135deg, #5B7A94 0%, #4A6480 100%)',
      glowColor: 'rgba(91, 122, 148, 0.2)',
      accentColor: '#5B7A94',
    },
    {
      id: 'series',
      icon: '📺',
      title: t('home:categories.series.title'),
      description: t('home:categories.series.description'),
      gradient: 'linear-gradient(135deg, #8B7355 0%, #73604A 100%)',
      glowColor: 'rgba(139, 115, 85, 0.2)',
      accentColor: '#8B7355',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Film grain texture overlay */}
      <div style={styles.grainOverlay} />
      
      {/* Atmospheric background elements */}
      <div style={styles.atmosphereTop} />
      <div style={styles.atmosphereBottom} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoMark}>◈</div>
          <h1 style={styles.logo}>{t('common:app.title')}</h1>
        </div>
        <p style={styles.tagline}>{t('common:app.tagline')}</p>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h2 style={styles.heroTitle}>
          {t('home:hero.title')}
        </h2>
        <p style={styles.heroSubtitle}>
          {t('home:hero.subtitle')}
        </p>
      </section>

      {/* Categories Grid */}
      <section style={styles.categoriesSection}>
        <h3 style={styles.categoriesTitle}>{t('home:categories.title')}</h3>
        <p style={styles.categoriesSubtitle}>{t('home:categories.subtitle')}</p>
        
        <div style={styles.grid}>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              onNavigate={onNavigate}
              delay={index * 0.1}
            />
          ))}
        </div>
        
        {/* Info Notice */}
        <div style={styles.infoNotice}>
          <span style={styles.infoIcon}>ℹ️</span>
          <p 
            style={styles.infoText}
            dangerouslySetInnerHTML={{ __html: t('home:infoNotice.text') }}
          />
        </div>
      </section>

      {/* How It Works */}
      <section style={styles.howItWorks}>
        <h3 style={styles.sectionTitle}>{t('home:howItWorks.title')}</h3>
        <div style={styles.stepsGrid}>
          {[1, 2, 3].map((step) => (
            <div key={step} style={styles.step}>
              <div style={styles.stepNumber}>{step}</div>
              <h4 style={styles.stepTitle}>
                {t(`home:howItWorks.steps.${step}.title`)}
              </h4>
              <p style={styles.stepDescription}>
                {t(`home:howItWorks.steps.${step}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>{t('common:footer.copyright')}</p>
        <p style={styles.footerCache}>
          {t('home:footer.cacheInfo')}
        </p>
      </footer>

      <style>{animationStyles}</style>
    </div>
  );
}

// ============================================
// CATEGORY CARD COMPONENT
// ============================================

function CategoryCard({ category, onNavigate, delay }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { t } = useTranslation('home');

  return (
    <article
      style={{
        ...styles.card,
        animationDelay: `${delay}s`,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered
          ? `0 12px 32px rgba(43, 40, 37, 0.12), 0 0 40px ${category.glowColor}`
          : '0 4px 12px rgba(43, 40, 37, 0.08)',
        borderColor: isHovered ? category.accentColor : 'var(--border-subtle)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate(category.id)}
    >
      {/* Card accent bar */}
      <div style={{ ...styles.cardAccent, background: category.gradient }} />

      {/* Category icon */}
      <div style={styles.iconContainer}>
        <span style={styles.icon}>{category.icon}</span>
      </div>

      {/* Content */}
      <div style={styles.cardContent}>
        <h3 style={styles.cardTitle}>{category.title}</h3>
        <p style={styles.cardDescription}>{category.description}</p>
      </div>

      {/* CTA Button */}
      <button
        style={{
          ...styles.cardButton,
          background: isHovered ? category.gradient : 'transparent',
          color: isHovered ? 'var(--color-paper)' : category.accentColor,
          borderColor: category.accentColor,
        }}
      >
        <span>{t(`categories.${category.id}.cta`)}</span>
        <span style={styles.arrow}>→</span>
      </button>

      {/* Hover glow effect */}
      {isHovered && (
        <div
          style={{
            ...styles.cardGlow,
            background: `radial-gradient(circle at 50% 50%, ${category.glowColor}, transparent 70%)`,
          }}
        />
      )}
    </article>
  );
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    background: 'var(--color-paper, #FDFCFA)',
    color: 'var(--color-ink, #2B2825)',
    fontFamily: 'var(--font-body, Inter, sans-serif)',
    overflow: 'hidden',
  },

  // Atmospheric effects
  grainOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.015'/%3E%3C/svg%3E")`,
    opacity: 0.6,
    pointerEvents: 'none',
    mixBlendMode: 'multiply',
    zIndex: 1,
  },

  atmosphereTop: {
    position: 'fixed',
    top: '-20%',
    left: '-10%',
    width: '50%',
    height: '50%',
    background: 'radial-gradient(circle, rgba(200, 76, 60, 0.06) 0%, transparent 60%)',
    filter: 'blur(60px)',
    animation: 'float-slow 25s ease-in-out infinite',
    zIndex: 0,
  },

  atmosphereBottom: {
    position: 'fixed',
    bottom: '-20%',
    right: '-10%',
    width: '50%',
    height: '50%',
    background: 'radial-gradient(circle, rgba(91, 122, 148, 0.06) 0%, transparent 60%)',
    filter: 'blur(60px)',
    animation: 'float-slow 30s ease-in-out infinite reverse',
    zIndex: 0,
  },

  // Header
  header: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '48px 24px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '8px',
  },

  logoMark: {
    fontSize: '32px',
    color: 'var(--color-crimson, #C84C3C)',
    animation: 'pulse-subtle 4s ease-in-out infinite',
  },

  logo: {
    fontFamily: 'var(--font-editorial, "Playfair Display", serif)',
    fontSize: '42px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: 0,
    color: 'var(--color-ink, #2B2825)',
  },

  tagline: {
    fontFamily: 'var(--font-ui, "DM Sans", sans-serif)',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--color-slate, #79746E)',
    letterSpacing: '0.02em',
    margin: 0,
  },

  // Hero
  hero: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '40px 24px',
    maxWidth: '800px',
    margin: '0 auto',
  },

  heroTitle: {
    fontFamily: 'var(--font-editorial, "Playfair Display", serif)',
    fontSize: '56px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: 'var(--color-ink, #2B2825)',
    marginBottom: '16px',
    margin: 0,
  },

  heroSubtitle: {
    fontFamily: 'var(--font-body, Inter, sans-serif)',
    fontSize: '18px',
    lineHeight: 1.6,
    color: 'var(--color-graphite, #4A4641)',
    maxWidth: '600px',
    margin: '16px auto 0',
  },

  // Categories Section
  categoriesSection: {
    position: 'relative',
    zIndex: 10,
    padding: '60px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  categoriesTitle: {
    fontFamily: 'var(--font-editorial, "Playfair Display", serif)',
    fontSize: '32px',
    fontWeight: 600,
    textAlign: 'center',
    color: 'var(--color-ink, #2B2825)',
    marginBottom: '8px',
  },

  categoriesSubtitle: {
    fontFamily: 'var(--font-body, Inter, sans-serif)',
    fontSize: '15px',
    textAlign: 'center',
    color: 'var(--color-slate, #79746E)',
    marginBottom: '48px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '32px',
    maxWidth: '1100px',
    margin: '0 auto',
  },

  infoNotice: {
    marginTop: '40px',
    padding: '20px 24px',
    background: 'rgba(212, 163, 72, 0.08)',
    border: '1px solid rgba(212, 163, 72, 0.25)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    maxWidth: '720px',
    margin: '40px auto 0',
  },

  infoIcon: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '2px',
  },

  infoText: {
    fontFamily: 'var(--font-body, Inter, sans-serif)',
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'var(--color-graphite, #4A4641)',
    margin: 0,
  },

  // Category Card
  card: {
    position: 'relative',
    background: 'var(--color-paper, #FDFCFA)',
    border: '1px solid var(--border-subtle, #E8E4DF)',
    borderRadius: '4px',
    padding: '40px 32px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'fadeSlideUp 0.6s ease-out forwards',
    opacity: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },

  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
  },

  iconContainer: {
    marginBottom: '24px',
  },

  icon: {
    fontSize: '56px',
    display: 'inline-block',
    transition: 'transform 0.3s ease',
  },

  cardContent: {
    flex: 1,
    marginBottom: '16px',
  },

  cardTitle: {
    fontFamily: 'var(--font-editorial, "Playfair Display", serif)',
    fontSize: '28px',
    fontWeight: 600,
    color: 'var(--color-ink, #2B2825)',
    marginBottom: '12px',
    lineHeight: 1.3,
  },

  cardDescription: {
    fontFamily: 'var(--font-body, Inter, sans-serif)',
    fontSize: '15px',
    lineHeight: 1.6,
    color: 'var(--color-graphite, #4A4641)',
  },

  cardButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    border: '2px solid',
    borderRadius: '2px',
    fontFamily: 'var(--font-ui, "DM Sans", sans-serif)',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  arrow: {
    fontSize: '18px',
    transition: 'transform 0.3s ease',
  },

  cardGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
  },

  // How It Works
  howItWorks: {
    position: 'relative',
    zIndex: 10,
    padding: '80px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    borderTop: '1px solid var(--border-subtle, #E8E4DF)',
  },

  sectionTitle: {
    fontFamily: 'var(--font-editorial, "Playfair Display", serif)',
    fontSize: '32px',
    fontWeight: 600,
    textAlign: 'center',
    color: 'var(--color-ink, #2B2825)',
    marginBottom: '48px',
  },

  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '40px',
  },

  step: {
    textAlign: 'center',
  },

  stepNumber: {
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
    fontSize: '48px',
    fontWeight: 700,
    color: 'var(--color-crimson, #C84C3C)',
    marginBottom: '16px',
    opacity: 0.3,
  },

  stepTitle: {
    fontFamily: 'var(--font-editorial, "Playfair Display", serif)',
    fontSize: '22px',
    fontWeight: 600,
    color: 'var(--color-ink, #2B2825)',
    marginBottom: '12px',
  },

  stepDescription: {
    fontFamily: 'var(--font-body, Inter, sans-serif)',
    fontSize: '15px',
    lineHeight: 1.6,
    color: 'var(--color-graphite, #4A4641)',
  },

  // Footer
  footer: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '48px 24px',
    borderTop: '1px solid var(--border-subtle, #E8E4DF)',
  },

  footerText: {
    fontFamily: 'var(--font-ui, "DM Sans", sans-serif)',
    fontSize: '13px',
    color: 'var(--color-slate, #79746E)',
    marginBottom: '8px',
  },

  footerCache: {
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
    fontSize: '11px',
    color: 'var(--color-slate, #79746E)',
    opacity: 0.7,
    margin: 0,
  },
};

// ============================================
// ANIMATIONS
// ============================================

const animationStyles = `
  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float-slow {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(20px, -20px) scale(1.05);
    }
  }

  @keyframes pulse-subtle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Hover effects */
  article:hover .icon {
    transform: scale(1.1) rotate(5deg);
  }

  article:hover .arrow {
    transform: translateX(4px);
  }

  /* Dark mode support */
  [data-theme="dark"] {
    --color-paper: #0F0E0D;
    --color-ink: #F5F3F0;
    --color-graphite: #C8C3BC;
    --color-slate: #8B8680;
    --border-subtle: #2B2825;
    --color-crimson: #E8A87C;
  }

  [data-theme="dark"] .grainOverlay {
    mix-blend-mode: screen;
    opacity: 0.03;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .heroTitle {
      font-size: 36px !important;
    }
    
    .grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
