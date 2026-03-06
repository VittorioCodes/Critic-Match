import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [animatingOut, setAnimatingOut] = useState(null); // 'sun' or 'moon'
  const isDark = theme === 'dark';

  const handleToggle = () => {
    // Set which icon is exiting
    setAnimatingOut(isDark ? 'moon' : 'sun');
    
    // Clear animation state after animation completes
    setTimeout(() => setAnimatingOut(null), 500);
    
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      style={styles.button}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div style={styles.iconContainer}>
        {/* Sun icon */}
        <span
          key="sun"
          style={{
            ...styles.icon,
            // Show when light mode OR animating in from bottom-right
            opacity: (!isDark || animatingOut === 'moon') ? 1 : 0,
            transform: animatingOut === 'sun'
              ? 'translate(-120%, 120%) scale(0.3)' // Exiting to bottom-left
              : animatingOut === 'moon'
              ? 'translate(120%, 120%) scale(0.3)'   // Starting position (bottom-right) when entering
              : 'translate(0, 0) scale(1)',          // Centered
            transitionDelay: animatingOut === 'moon' ? '0.1s' : '0s',
          }}
        >
          ☀️
        </span>

        {/* Moon icon */}
        <span
          key="moon"
          style={{
            ...styles.icon,
            // Show when dark mode OR animating in from bottom-right
            opacity: (isDark || animatingOut === 'sun') ? 1 : 0,
            transform: animatingOut === 'moon'
              ? 'translate(-120%, 120%) scale(0.3)' // Exiting to bottom-left
              : animatingOut === 'sun'
              ? 'translate(120%, 120%) scale(0.3)'   // Starting position (bottom-right) when entering
              : 'translate(0, 0) scale(1)',          // Centered
            transitionDelay: animatingOut === 'sun' ? '0.1s' : '0s',
          }}
        >
          🌙
        </span>
      </div>
    </button>
  );
}

const styles = {
  button: {
    position: 'relative',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    background: 'var(--bg-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },

  iconContainer: {
    position: 'relative',
    width: '24px',
    height: '24px',
  },

  icon: {
    position: 'absolute',
    top: '0',
    left: '0',
    fontSize: '20px',
    transition: 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    willChange: 'transform, opacity',
  },
};
