import React, { useEffect, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * HelpModal: Modal dialog for in-app help/FAQ.
 * Props:
 *   - isOpen: boolean (show/hide)
 *   - onClose: function (close modal)
 * Accessibility: Focus trap, ESC to close, ARIA labels.
 */
function HelpModal({ isOpen, onClose }) {
  const modalRef = useRef();

  // Focus trap on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
    function handleKey(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey, { capture: true });
    return () => document.removeEventListener("keydown", handleKey, { capture: true });
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="cr-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="ClashRealms Help and FAQ"
      tabIndex={-1}
      ref={modalRef}
      style={{ zIndex: 8000 }}
    >
      <div className="cr-popup-card" style={{ minWidth: 310, maxWidth: 420, outline: "none" }}>
        <div className="cr-popup-header" style={{ marginBottom: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span role="img" aria-label="Help">❓</span>
            ClashRealms Help & FAQ
          </span>
          <button
            className="cr-popup-close"
            aria-label="Close Help"
            tabIndex={0}
            type="button"
            onClick={onClose}
            onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
            onBlur={e => (e.currentTarget.style.border = "none")}
            style={{ marginLeft: 10 }}
          >×</button>
        </div>
        <div className="cr-popup-content" style={{ maxHeight: "58vh", overflowY: "auto" }}>
          <HelpFAQContent />
        </div>
      </div>
    </div>
  );
}

// Main FAQ/help content
function HelpFAQContent() {
  return (
    <div>
      <section style={{ marginBottom: 18 }}>
        <h3 style={{ color: "#4A2E0B", fontWeight: 700, margin: "4px 0 7px 0" }}>Overview</h3>
        <p style={{ color: "#756042", fontSize: "1.08em" }}>
          ClashRealms is a streamlined mobile strategy game where you build your village, upgrade buildings, train troops, and battle for glory. Play at your own pace—everything is saved in your browser!
        </p>
      </section>
      <section style={{ marginBottom: 14 }}>
        <h4 style={{ color: "#3DBB3D", fontWeight: 600, marginBottom: 5 }}>Game Features</h4>
        <ul style={{ color: "#4A2E0B", fontSize: "1.01em", marginBottom: 0 }}>
          <li><b>Base Building:</b> Tap buildings to upgrade—improves production and defense.</li>
          <li><b>Resource Management:</b> Collect and spend Gold, Elixir, and Gems.</li>
          <li><b>Troop Training:</b> Tap <b>Army Camp</b> ➔ "Train/Upgrade Troops" to improve your army.</li>
          <li><b>Battles:</b> Attack for rewards! Use your trained troops for mock battles.</li>
          <li><b>Clan System:</b> <span style={{color:"#b59921"}}>Coming soon!</span></li>
        </ul>
      </section>
      <section style={{ marginBottom: 12 }}>
        <h4 style={{ color: "#4A2E0B", fontWeight: 600, marginBottom: 5 }}>Navigation</h4>
        <ul style={{ color: "#38210D", fontSize: "0.98em" }}>
          <li>
            <b>Top Bar:</b> See resources, undo/redo actions, access feedback, profile, settings, and help (<span style={{ fontWeight: 600, color: "#3DBB3D" }}>?</span>).
          </li>
          <li>
            <b>Bottom Navigation:</b> Switch between Base, Attack, Clan, and Shop screens.
          </li>
        </ul>
      </section>
      <section style={{ marginBottom: 14 }}>
        <h4 style={{ color: "#3DBB3D", fontWeight: 600, marginBottom: 5 }}>Main UI Concepts</h4>
        <ul style={{ color: "#4A2E0B", fontSize: "0.97em" }}>
          <li>
            <b>Upgrade Buildings:</b> Tap a building card to upgrade (if enough resources). Upgrades show a timer/progress bar.
          </li>
          <li>
            <b>Collect Resources:</b> Tap <b>+</b> next to Gold, Elixir, or Gems in the top bar to collect more (mock/demo).
          </li>
          <li>
            <b>Train Troops:</b> Use "Train/Upgrade Troops" in Army Camp for better battle results.
          </li>
          <li>
            <b>Undo/Redo:</b> Use <b>Undo</b> and <b>Redo</b> buttons in the top bar (or use <kbd>Ctrl+Z</kbd>/<kbd>Ctrl+Y</kbd>).
          </li>
          <li>
            <b>Feedback:</b> Send feedback via the feedback <span role="img" aria-label="feedback">💬</span> button.
          </li>
        </ul>
      </section>
      <section>
        <h4 style={{ color: "#4A2E0B", fontWeight: 600, marginBottom: 5 }}>FAQ</h4>
        <dl style={{ color: "#38210D", fontSize: "0.96em" }}>
          <dt style={{ fontWeight: 500 }}><b>Is my progress saved?</b></dt>
          <dd>Yes, all game data is saved in your browser (locally). You can close or refresh anytime.</dd>
          <dt style={{ fontWeight: 500, marginTop: 9 }}><b>I can't upgrade/build?</b></dt>
          <dd>You need enough resources. Collect more or wait for upgrades to finish.</dd>
          <dt style={{ fontWeight: 500, marginTop: 9 }}><b>Can I play on mobile?</b></dt>
          <dd>Yes! The interface is designed to work on all mobile browsers and touch screens.</dd>
          <dt style={{ fontWeight: 500, marginTop: 9 }}><b>How do I reset my game?</b></dt>
          <dd>Reset is not directly supported; clear your browser's local storage to start over.</dd>
        </dl>
      </section>
      <section style={{ marginTop: 11, color: "#b59921", fontWeight: 500 }}>
        Need more help? Replay the interactive tutorial—tap <span style={{fontWeight:600}}>?</span> in the top bar.
      </section>
    </div>
  );
}

export default HelpModal;
