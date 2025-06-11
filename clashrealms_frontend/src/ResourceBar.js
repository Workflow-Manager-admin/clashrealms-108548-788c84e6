import React, { useRef, useEffect, useState } from "react";
import "./ClashRealmsMain.css";

/**
 * Animated Resource Bar for ClashRealms (gold, elixir, gems).
 * Animates visual changes on "collect" mock actions.
 */

/**
 * PUBLIC_INTERFACE
 * useAnimatedNumber - animate a value change smoothly for number display.
 */
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

/**
 * PUBLIC_INTERFACE
 * AnimatedResourceBar – shows gold, elixir, gems with animated counters and mock collect buttons.
 */
function AnimatedResourceBar({ resources, onCollect }) {
  // Animated counts for resources
  const gold = useAnimatedNumber(resources.gold);
  const elixir = useAnimatedNumber(resources.elixir);
  const gems = useAnimatedNumber(resources.gems);

  return (
    <div className="cr-resources-bar" aria-label="Resource Bar">
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

/**
 * ResourceItem – individual resource counter with animated "bump" and collect + button.
 */
function ResourceItem({ icon, className, value, label, onCollect }) {
  const [bump, setBump] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) {
      setBump(true);
      const timeout = setTimeout(() => setBump(false), 265);
      prev.current = value;
      return () => clearTimeout(timeout);
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
      <span className="cr-resource-collect-btn" tabIndex={-1} aria-label={`Collect ${label}`}>+</span>
    </span>
  );
}

export default AnimatedResourceBar;
