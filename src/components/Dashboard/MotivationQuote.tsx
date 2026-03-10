import { useState, useEffect } from 'react';
import { MOTIVATION_QUOTES } from '../../utils/constants';

const INTERVAL = 30_000;

export function MotivationQuote() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * MOTIVATION_QUOTES.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % MOTIVATION_QUOTES.length);
        setVisible(true);
      }, 400);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const quote = MOTIVATION_QUOTES[idx];

  return (
    <div className="glass-card border border-primary-500/15 p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500 to-accent-500 rounded-l" />
      <div
        className="transition-opacity"
        style={{ opacity: visible ? 1 : 0, transitionDuration: '400ms' }}
      >
        <p className="text-sm text-gray-300 leading-relaxed italic pl-3">
          "{quote.text}"
        </p>
        <p className="text-xs text-gray-500 mt-2 pl-3">— {quote.author}</p>
      </div>
    </div>
  );
}
