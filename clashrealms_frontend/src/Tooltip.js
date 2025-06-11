import React, { useRef, useState, useEffect } from "react";
import "./Tooltip.css";

/**
 * PUBLIC_INTERFACE
 * Tooltip: Shows a contextual popup on hover, focus, or touch/press.
 * Props:
 *   - content: Tooltip text/content (React node)
 *   - children: Element to wrap
 *   - direction: "top" | "bottom" | "left" | "right" (default "top")
 *   - ariaLabel: Optional aria-label for accessibility
 *   - delay: ms delay before showing tooltip (default 250)
 */
function Tooltip({
  content,
  children,
  direction = "top",
  ariaLabel,
  delay = 250,
  tabIndex = 0,
  ...rest
}) {
  const [visible, setVisible] = useState(false);
  const [tapActive, setTapActive] = useState(false); // For touch devices
  const showTimeout = useRef(null);
  const nodeRef = useRef();
  const triggerRef = useRef();

  // Clear timers on unmount
  useEffect(() => () => clearTimeout(showTimeout.current), []);

  // Show/hide
  const show = () => {
    clearTimeout(showTimeout.current);
    showTimeout.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimeout(showTimeout.current);
    setVisible(false);
    setTapActive(false);
  };

  // Touch/tap support (one tap shows/hides)
  const handleTouch = (e) => {
    // Only on first tap
    if (!tapActive) {
      setVisible(true);
      setTapActive(true);
      // Hide on scroll or second tap outside
      const hideOnTouch = (evt) => {
        if (nodeRef.current && !nodeRef.current.contains(evt.target)) {
          setVisible(false);
          setTapActive(false);
          document.removeEventListener("touchstart", hideOnTouch);
        }
      };
      document.addEventListener("touchstart", hideOnTouch, { passive: true });
    }
    // Let default tap go thru (to click etc)
  };

  // Hide tooltip on escape (keyboard accessibility)
  useEffect(() => {
    if (!visible) return;
    const onEsc = (e) => {
      if (e.key === "Escape") hide();
    };
    document.addEventListener("keydown", onEsc, { capture: true });
    return () => document.removeEventListener("keydown", onEsc, { capture: true });
  }, [visible]);

  // Place tooltip near the child (auto positioned)
  return (
    <span
      className="cr-tooltip-trigger"
      tabIndex={tabIndex}
      ref={triggerRef}
      aria-label={ariaLabel}
      aria-describedby={visible ? "cr-tooltip-box" : undefined}
      onMouseEnter={show}
      onFocus={show}
      onMouseLeave={hide}
      onBlur={hide}
      onTouchStart={handleTouch}
      {...rest}
      style={{ outline: "none", position: "relative", ...rest.style }}
    >
      {children}
      {visible && (
        <span
          className={`cr-tooltip-box cr-tooltip-${direction}`}
          id="cr-tooltip-box"
          ref={nodeRef}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}

export default Tooltip;
