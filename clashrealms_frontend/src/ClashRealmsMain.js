import React, { useState, Fragment, useRef } from "react";
import "./ClashRealmsMain.css";
import AnimatedResourceBar from "./ResourceBar";
import ConfettiOverlay from "./ConfettiOverlay";

// Core Navigation items
const NAV_ITEMS = [
  { key: "base", label: "Base" },
  { key: "attack", label: "Attack" },
  { key: "clan", label: "Clan" },
  { key: "shop", label: "Shop" },
];

/**
 * PUBLIC_INTERFACE
 * ClashRealmsMain: Main game container.
 */
function ClashRealmsMain() {
  // Navigation state: what screen is active?
  const [activeScreen, setActiveScreen] = useState("base");
  // Control popups
  const [popup, setPopup] = useState(null);

  // Resource state for animated resource bar
  const [resourceCounts, setResourceCounts] = useState({
    gold: 1000,
    elixir: 750,
    gems: 50
  });

  // Confetti state: what event caused celebration?
  const [confetti, setConfetti] = useState({ show: false, key: 0, message: "" });
  const confettiNextKey = useRef(1);

  // Handler: Animate resource "collection" (mock increment)
  function handleCollectResource(type) {
    setResourceCounts(res => {
      // Choose a pseudo-random collect amount for demo
      let delta = 0;
      if (type === "gold") delta = 8 + Math.floor(Math.random() * 24);
      if (type === "elixir") delta = 7 + Math.floor(Math.random() * 16);
      if (type === "gems") delta = 1 + Math.floor(Math.random() * 2);
      // If gems collect, treat as level-up-like celebration (for demo)
      if (type === "gems") {
        setTimeout(() => {
          setConfetti({ show: true, key: confettiNextKey.current++, message: "Gems Collected!" });
        }, 100); // short delay to sync visual
      }
      return {
        ...res,
        [type]: res[type] + delta
      };
    });
  }

  // Celebrate for mock major events (building upgrade, battle win, etc)
  function celebrate(message = "Congratulations!") {
    setConfetti({ show: true, key: confettiNextKey.current++, message });
  }

  // Integration points for core modules (placeholders)
  // In real implementations, these would import and render feature modules.
  const renderScreen = () => {
    switch (activeScreen) {
      case "base":
        return (
          <VillageView
            // Show pop-up + celebrate effect when upgrading any building
            onBuildingClick={() => {
              celebrate("Building Upgraded!");
              setPopup("building-upgrade");
            }}
            onTrainTroops={() => setPopup("troop-train")}
            onCelebrate={celebrate}
          />
        );
      case "attack":
        // Battle screen: trigger confetti on (mock) win
        return (
          <BattleScreen onWin={() => celebrate("Victory in Battle!")} />
        );
      case "clan":
        return <ClanScreen />;
      case "shop":
        return <ShopScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="cr-app-theme">
      {/* Confetti celebration overlay */}
      <ConfettiOverlay
        show={confetti.show}
        triggerKey={confetti.key}
        onDone={() => setConfetti({ ...confetti, show: false })}
      />

      <header className="cr-header">
        <span className="cr-logo">🏰 ClashRealms</span>
        <AnimatedResourceBar
          resources={resourceCounts}
          onCollect={handleCollectResource}
        />
      </header>

      <main className="cr-main-content">
        {renderScreen()}
      </main>

      <BottomNav
        navItems={NAV_ITEMS}
        active={activeScreen}
        onChange={setActiveScreen}
      />

      {/* Pop-up Menus */}
      {popup === "building-upgrade" && (
        <Popup onClose={() => setPopup(null)} title="Upgrade Building">
          <BuildingUpgradePopup />
        </Popup>
      )}
      {popup === "troop-train" && (
        <Popup onClose={() => setPopup(null)} title="Train Troops">
          <TroopTrainingPopup />
        </Popup>
      )}

      {/* Modular integration points for core features; could use context/providers for real modules */}
      {/* Base Building, Resource Management, Troop Training, Multiplayer Battles, Clan System, In-App Purchases, Leaderboards */}
    </div>
  );
}

// --- UI Components (simplified stubs, integration points for feature modules) ---

function VillageView({ onBuildingClick, onTrainTroops, onCelebrate }) {
  // Interactive per-building upgrade progress (frontend-only mock for now)
  // We'll show one as "Upgrading" for demo (could be randomized in real app)
  const initial = [
    { key: "goldmine", label: "Gold Mine", progress: 0, upgrading: false },
    { key: "armycamp", label: "Army Camp", progress: 0, upgrading: false },
    { key: "cannon", label: "Cannon", progress: 0, upgrading: false },
    { key: "townhall", label: "Town Hall", progress: 0, upgrading: false },
  ];
  const [buildingStates, setBuildingStates] = React.useState(initial);
  // Celebrate after a full upgrade (upgrade completion detection)
  const prevProgress = useRef(buildingStates.map(b => b.progress));

  // Handler for "upgrade" interactions (mock: start progress bar)
  const handleBuildingClick = idx => {
    setBuildingStates(bs =>
      bs.map((b, i) =>
        i === idx
          ? { ...b, upgrading: true, progress: 0 }
          : b
      )
    );
    // integration: fire upgrade effect in parent
    onBuildingClick && onBuildingClick();
  };

  // Animate progress if any building "upgrading"
  React.useEffect(() => {
    let running = true;
    let frame;
    const tick = () => {
      setBuildingStates(bs =>
        bs.map(b => {
          if (!b.upgrading) return b;
          const next = { ...b, progress: Math.min(100, b.progress + 1.3 + Math.random() * 2.5) };
          if (next.progress >= 100) {
            next.progress = 100;
            next.upgrading = false;
          }
          return next;
        })
      );
      if (buildingStates.some(b => b.upgrading)) {
        frame = setTimeout(tick, 32);
      }
    };
    if (buildingStates.some(b => b.upgrading) && running) {
      frame = setTimeout(tick, 32);
    }
    return () => {
      running = false;
      if (frame) clearTimeout(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingStates]);

  // Detect when an upgrade completes to flash confetti
  React.useEffect(() => {
    buildingStates.forEach((b, idx) => {
      if (
        prevProgress.current[idx] < 100 &&
        b.progress === 100 &&
        !b.upgrading
      ) {
        // Celebrate for demo
        onCelebrate && onCelebrate(`${b.label} upgraded!`);
      }
    });
    prevProgress.current = buildingStates.map(b => b.progress);
    // eslint-disable-next-line
  }, [buildingStates]);

  return (
    <div className="cr-village-view">
      <div className="cr-buildings-grid">
        {buildingStates.map((b, idx) => (
          <button
            key={b.key}
            className={`cr-building cr-building-${b.key} ${b.upgrading ? "is-upgrading" : ""}`}
            onClick={b.key === "armycamp" ? onTrainTroops : () => handleBuildingClick(idx)}
            disabled={b.upgrading}
            tabIndex={0}
            aria-label={
              b.label +
              (b.upgrading
                ? " upgrading, please wait"
                : b.key === "armycamp"
                  ? ", click to train troops"
                  : ", click to upgrade"
              )
            }
          >
            <span>
              {b.label}
              {b.upgrading && (
                <span className="cr-upgrade-progress-ctr">
                  <span className="cr-upgrade-progress-bar">
                    <span
                      className="cr-upgrade-progress-bar-inner"
                      style={{ width: `${b.progress}%` }}
                    ></span>
                  </span>
                  <span className="cr-upgrade-progress-label">
                    {b.progress < 100 ? `Upgrading... ${Math.round(b.progress)}%` : `Upgrade Complete!`}
                  </span>
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
      <div className="cr-helperbar">
        <Hint>
          Tip: Click buildings to trigger upgrade animations!{" "}
          <span style={{ color: "#4A2E0B", fontWeight: 500 }}>
            Try town hall or gold mine.
          </span>
        </Hint>
      </div>
    </div>
  );
}

function BattleScreen({ onWin }) {
  // Mock: Pretend user can "win" a mock battle
  const [won, setWon] = useState(false);

  function handleWin() {
    setWon(true);
    onWin && onWin();
    setTimeout(() => setWon(false), 1400); // reset button
  }

  return (
    <div className="cr-battle-screen">
      <h2>Battle!</h2>
      <div className="cr-battlefield-placeholder">
        <span className="emoji">⚔️</span>
        <p>Battles will play out here.</p>
        {!won ? (
          <button className="cr-btn-accent" style={{minWidth:95}} onClick={handleWin}>
            Mock Win Battle
          </button>
        ) : (
          <span className="cr-upgrade-progress-label" style={{fontSize:'1.09em',color:'#3DBB3D'}}>Victory!</span>
        )}
      </div>
    </div>
  );
}

function ClanScreen() {
  return (
    <div className="cr-clan-screen">
      <h2>Clans</h2>
      <p>Clan features coming soon. Join or create a clan, chat, and participate in clan wars.</p>
    </div>
  );
}

function ShopScreen() {
  return (
    <div className="cr-shop-screen">
      <h2>Shop</h2>
      <p>Buy resources, gems, and special items.</p>
      <button className="cr-btn-primary" disabled>
        In-App Purchases Integration Placeholder
      </button>
    </div>
  );
}

// --- Pop-up Menus (just basic stubs/placeholders for now) ---
function Popup({ title, children, onClose }) {
  return (
    <div className="cr-popup-overlay">
      <div className="cr-popup-card">
        <div className="cr-popup-header">
          <span>{title}</span>
          <button className="cr-popup-close" onClick={onClose}>×</button>
        </div>
        <div className="cr-popup-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function BuildingUpgradePopup() {
  return (
    <Fragment>
      <p>Upgrade this building to improve its stats!</p>
      <button className="cr-btn-accent" disabled>
        Upgrade (Feature In Progress)
      </button>
    </Fragment>
  );
}

function TroopTrainingPopup() {
  return (
    <Fragment>
      <p>Train more troops for your next battle.</p>
      <button className="cr-btn-accent" disabled>
        Train Troops (Feature In Progress)
      </button>
    </Fragment>
  );
}

// --- Reusable bottom navigation ---
function BottomNav({ navItems, active, onChange }) {
  return (
    <nav className="cr-bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.key}
          className={`cr-bottom-nav-btn${active === item.key ? " active" : ""}`}
          onClick={() => onChange(item.key)}
        >
          {iconForNav(item.key)}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}



// --- Misc --- 
function Hint({ children }) {
  return <div className="cr-hint">{children}</div>;
}

function iconForNav(key) {
  switch (key) {
    case "base":
      return <span className="cr-nav-icon" role="img" aria-label="Base">🏡</span>;
    case "attack":
      return <span className="cr-nav-icon" role="img" aria-label="Attack">⚔️</span>;
    case "clan":
      return <span className="cr-nav-icon" role="img" aria-label="Clan">🤝</span>;
    case "shop":
      return <span className="cr-nav-icon" role="img" aria-label="Shop">🛒</span>;
    default:
      return null;
  }
}

export default ClashRealmsMain;
