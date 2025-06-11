import React, { useEffect, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * LoadingOverlay: Animated full-screen loading indicator with fade/scale entrance and skeleton shimmer.
 * Props:
 *   - show: Boolean, controls visibility
 *   - message: Optional loading message
 *   - duration: Show for at least N ms before allowing hide (optional)
 */
function LoadingOverlay({ show, message = "Loading…", duration = 420 }) {
  const [visible, setVisible] = React.useState(show);
  const lastShowTime = useRef(Date.now());

  useEffect(() => {
    if (show) {
      setVisible(true);
      lastShowTime.current = Date.now();
    } else {
      const elapsed = Date.now() - lastShowTime.current;
      // Optional: always show for at least {duration} ms to prevent flicker
      if (elapsed < duration) {
        const to = setTimeout(() => setVisible(false), duration - elapsed);
        return () => clearTimeout(to);
      }
      setVisible(false);
    }
  }, [show, duration]);

  if (!visible) return null;
  return (
    <div
      className={`cr-loading-overlay${show ? " open" : ""}`}
      aria-live="polite"
      aria-label="Loading"
      tabIndex={-1}
    >
      <div className="cr-loading-card">
        <span className="cr-loading-spinner" aria-hidden="true"></span>
        <span className="cr-loading-message">{message}</span>
      </div>
    </div>
  );
}

export default LoadingOverlay;
