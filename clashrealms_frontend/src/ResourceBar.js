import React, { useRef, useEffect, useState } from "react";
import "./ClashRealmsMain.css";

/**
 * Animated Resource Bar for ClashRealms (gold, elixir, gems).
 * Allows visual "collect" to increment and animate resource counters.
 */

// Utility: Animate a number from start to end over ms milliseconds
function useAnimatedNumber(value, duration = 650) {
  const [displayed, setDisplayed] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (value === from.current) return;
    let start, frame;
    const diff = value - from.current;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      let progress = Math.min(elapsed / duration, 1);
      const current = Math.round(from.current + diff * progress);
      setDisplayed(current);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        from.current = value;
      }
    };
    frame = requestAnimationFrame(animate);
    return () => frame && cancelAnimationFrame(frame);
    // eslint-disable-next-line
  }, [value]);
  return displayed;
}

// PUBLIC_INTERFACE
function AnimatedResourceBar({resources, onCollect}) {
  // Animate each resource count
  const gold = useAnimatedNumber(resources.gold);
  const elixir = useAnimatedNumber(resources.elixir);
  const gems = useAnimatedNumber(resources.gems);

  return (
    <div className="cr-resources-bar" style={{ gap: 0 }}>
      <ResourceItem
        icon="⛃"
        className="cr-gold"
        value={gold}
        label="Gold"
        onCollect={() => onCollect("gold")}
      />
      <ResourceItem
        icon="✦"
        className="cr-elixir"
        value={elixir}
        label="Elixir"
        onCollect={() => onCollect("elixir")}
      />
      <ResourceItem
        icon="💎"
        className="cr-gems"
        value={gems}
        label="Gems"
        onCollect={() => onCollect("gems")}
      />
    </div>
  );
}

function ResourceItem({ icon, className, value, label, onCollect }) {
  // Bouncy animation on increment
  const [bump, setBump] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) {
      setBump(true);
      const to = setTimeout(() => setBump(false), 260);
      prev.current = value;
      return () => clearTimeout(to);
    }
    // eslint-disable-next-line
  }, [value]);
  return (
    <span
      className={className + (bump ? " cr-resource-bump" : "")}
      style={{
        display: "inline-block",
        minWidth: 72,
        margin: "0 10px",
        fontWeight: 600,
        transition: "transform 0.2s cubic-bezier(.48,1.65,.34,.95)",
        position: "relative",
        cursor: "pointer"
      }}
      tabIndex={0}
      aria-label={`Collect ${label}`}
      onClick={onCollect}
      onKeyDown={e => e.key === "Enter" && onCollect()}
      title={`Collect more ${label}! (mock)`}
    >
      {icon} <span>{value}</span>
      <span className="cr-resource-collect-btn">+</span>
    </span>
  );
}

export default AnimatedResourceBar;
