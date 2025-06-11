import React, { useState, Fragment, useRef, useEffect } from "react";
import "./ClashRealmsMain.css";
import AnimatedResourceBar from "./ResourceBar";
import ConfettiOverlay from "./ConfettiOverlay";
import TutorialOverlay from "./TutorialOverlay";
import "./TutorialOverlay.css";

// Core Navigation items
const NAV_ITEMS = [
  { key: "base", label: "Base" },
  { key: "attack", label: "Attack" },
  { key: "clan", label: "Clan" },
  { key: "shop", label: "Shop" },
];

/**
 * Utility: Safe localStorage load
 */
function loadLocal(key, fallback) {
  try {
    const val = window.localStorage.getItem(key);
    if (!val) return fallback;
    return JSON.parse(val);
  } catch (err) {
    return fallback;
  }
}
/**
 * Utility: Safe localStorage save
 */
function saveLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // ignore
  }
}

// Initial resource values
const RESOURCE_DEFAULTS = {
  gold: 1000,
  elixir: 750,
  gems: 50
};

const BUILDING_UPGRADE_INFO = {
  goldmine: { baseTime: 7, baseGold: 80 },
  armycamp: { baseTime: 8, baseElixir: 100 },
  cannon: { baseTime: 10, baseGold: 100 },
  townhall: { baseTime: 15, baseGold: 300 }
};

const TROOP_UPGRADE_INFO = {
  barbarian: { baseTime: 6, baseElixir: 60 },
  archer: { baseTime: 7, baseElixir: 85 }
};

// Initial buildings state
const initialBuildings = [
  { key: "goldmine", label: "Gold Mine", progress: 0, upgrading: false, level: 1, finish: null, cooldown: null },
  { key: "armycamp", label: "Army Camp", progress: 0, upgrading: false, level: 1, finish: null, cooldown: null },
  { key: "cannon", label: "Cannon", progress: 0, upgrading: false, level: 1, finish: null, cooldown: null },
  { key: "townhall", label: "Town Hall", progress: 0, upgrading: false, level: 1, finish: null, cooldown: null },
];

// Initial mock troop levels
const initialTroops = [
  { key: "barbarian", label: "Barbarian", level: 1, upgrading: false, progress: 0, finish: null, cooldown: null },
  { key: "archer", label: "Archer", level: 1, upgrading: false, progress: 0, finish: null, cooldown: null }
];

/**
 * PUBLIC_INTERFACE
 * ClashRealmsMain: Main game container.
 */
function ClashRealmsMain() {
  // Navigation state: what screen is active?
  const [activeScreen, setActiveScreen] = useState("base");

  // --- TUTORIAL state ---
  const [tutorialStep, setTutorialStep] = useState(null);

  // Control popups and pass context for popups
  const [popup, setPopup] = useState(null);
  const [popupData, setPopupData] = useState({});

  // --- LOCAL STORAGE: Load resources, buildings, troop upgrades ---
  const [resourceCounts, setResourceCounts] = useState(() =>
    loadLocal("cr_resources", RESOURCE_DEFAULTS)
  );
  const [persistLoaded, setPersistLoaded] = useState(false);

  // --- Show tutorial on first launch ---
  useEffect(() => {
    if (window.localStorage) {
      const seenGuide = window.localStorage.getItem("cr_seen_tutorial");
      if (!seenGuide) setTutorialStep(0); // show on first launch
    }
  }, []);

  // Buildings state with upgrades and cooldowns
  const [buildingStates, setBuildingStates] = useState(() =>
    loadLocal("cr_buildings", initialBuildings)
  );
  // Troop upgrades/training state (persisted)
  const [troopUpgrades, setTroopUpgrades] = useState(() =>
    loadLocal("cr_troops", initialTroops)
  );

  useEffect(() => {
    setPersistLoaded(true);
  }, []);

  // Save resources to localStorage any time they change (after first load)
  useEffect(() => {
    if (persistLoaded) saveLocal("cr_resources", resourceCounts);
  }, [resourceCounts, persistLoaded]);

  // Save buildings to localStorage any time they change
  useEffect(() => {
    if (persistLoaded) saveLocal("cr_buildings", buildingStates);
  }, [buildingStates, persistLoaded]);

  // Save troop upgrades to localStorage any time they change
  useEffect(() => {
    if (persistLoaded) saveLocal("cr_troops", troopUpgrades);
  }, [troopUpgrades, persistLoaded]);

  // Confetti state: what event caused celebration?
  const [confetti, setConfetti] = useState({ show: false, key: 0, message: "" });
  const confettiNextKey = useRef(1);

  // Handler: Animate resource "collection" (mock increment)
  function handleCollectResource(type) {
    setResourceCounts(res => {
      let delta = 0;
      if (type === "gold") delta = 8 + Math.floor(Math.random() * 24);
      if (type === "elixir") delta = 7 + Math.floor(Math.random() * 16);
      if (type === "gems") delta = 1 + Math.floor(Math.random() * 2);
      if (type === "gems") {
        setTimeout(() => {
          setConfetti({ show: true, key: confettiNextKey.current++, message: "Gems Collected!" });
        }, 100);
      }
      // Save immediately to ensure persistence
      const updated = { ...res, [type]: res[type] + delta };
      saveLocal("cr_resources", updated);
      return updated;
    });
  }

  // Celebrate for mock major events (building upgrade, battle win, etc)
  function celebrate(message = "Congratulations!") {
    setConfetti({ show: true, key: confettiNextKey.current++, message });
  }

  // --- Upgrade simulation logic for buildings ---
  function triggerBuildingUpgrade(idx) {
    setBuildingStates(list => {
      return list.map((b, i) => {
        if (i !== idx) return b;
        if (b.upgrading || b.cooldown) return b;
        const upgradeInfo = BUILDING_UPGRADE_INFO[b.key] || {};
        let { baseGold = 0, baseElixir = 0, baseTime = 6 } = upgradeInfo;
        baseGold *= b.level;
        baseElixir *= b.level;
        baseTime = Math.round(baseTime * (1.2 ** (b.level - 1)));

        // Only spend if resource is available
        let allowed = true;
        setResourceCounts(res => {
          if (baseGold > 0 && res.gold < baseGold) allowed = false;
          if (baseElixir > 0 && res.elixir < baseElixir) allowed = false;
          if (!allowed) return res;
          return {
            ...res,
            gold: Math.max(0, res.gold - (baseGold || 0)),
            elixir: Math.max(0, res.elixir - (baseElixir || 0))
          };
        });
        if (!allowed) return b;
        // Set upgrading flag and cooldown
        return {
          ...b,
          upgrading: true,
          progress: 0,
          cooldown: baseTime,
          finish: Date.now() + baseTime * 1000
        };
      });
    });
  }

  // Troop upgrade handler
  function triggerTroopUpgrade(idx) {
    setTroopUpgrades(list => {
      return list.map((t, i) => {
        if (i !== idx) return t;
        if (t.upgrading || t.cooldown) return t;
        const upgradeInfo = TROOP_UPGRADE_INFO[t.key] || {};
        let { baseElixir = 0, baseTime = 6 } = upgradeInfo;
        baseElixir *= t.level;
        baseTime = Math.round(baseTime * (1.24 ** (t.level - 1)));

        // Only spend if resource is available
        let allowed = true;
        setResourceCounts(res => {
          if (res.elixir < baseElixir) allowed = false;
          if (!allowed) return res;
          return {
            ...res,
            elixir: Math.max(0, res.elixir - baseElixir)
          };
        });
        if (!allowed) return t;
        // Set upgrading flag and cooldown
        return {
          ...t,
          upgrading: true,
          progress: 0,
          cooldown: baseTime,
          finish: Date.now() + baseTime * 1000
        };
      });
    });
  }

  // Ticking effect for upgrades/cooldowns
  useEffect(() => {
    let raf;
    function updateUpgrades() {
      // BUILDINGS
      setBuildingStates(prev => {
        return prev.map(b => {
          if (!b.upgrading && !b.cooldown) return b;
          if (b.finish && Date.now() >= b.finish) {
            // Complete upgrade
            return {
              ...b,
              upgrading: false,
              progress: 100,
              cooldown: null,
              finish: null,
              level: (b.level || 1) + 1
            };
          }
          if (b.upgrading) {
            const total = b.cooldown || 8;
            const left = Math.max(0, ((b.finish || 0) - Date.now()) / 1000);
            const progress = 100 - (left / total) * 100;
            return { ...b, progress, upgrading: true };
          }
          return b;
        });
      });
      // TROOPS
      setTroopUpgrades(prev => {
        return prev.map(t => {
          if (!t.upgrading && !t.cooldown) return t;
          if (t.finish && Date.now() >= t.finish) {
            // Complete troop upgrade
            return {
              ...t,
              upgrading: false,
              progress: 100,
              cooldown: null,
              finish: null,
              level: (t.level || 1) + 1
            };
          }
          if (t.upgrading) {
            const total = t.cooldown || 6;
            const left = Math.max(0, ((t.finish || 0) - Date.now()) / 1000);
            const progress = 100 - (left / total) * 100;
            return { ...t, progress, upgrading: true };
          }
          return t;
        });
      });
      raf = requestAnimationFrame(updateUpgrades);
    }
    raf = requestAnimationFrame(updateUpgrades);
    return () => raf && cancelAnimationFrame(raf);
  }, []);

  // --- Integration points for core modules ---
  const renderScreen = () => {
    switch (activeScreen) {
      case "base":
        return (
          <VillageView
            buildingStates={buildingStates}
            setBuildingStates={setBuildingStates}
            onBuildingClick={triggerBuildingUpgrade}
            onTrainTroops={() => {
              setPopup("troop-train");
              setPopupData({});
            }}
            onCelebrate={celebrate}
            resourceCounts={resourceCounts}
            BUILDING_UPGRADE_INFO={BUILDING_UPGRADE_INFO}
            triggerBuildingUpgrade={triggerBuildingUpgrade}
          />
        );
      case "attack":
        return <BattleScreen onWin={() => celebrate("Victory in Battle!")} />;
      case "clan":
        return <ClanScreen />;
      case "shop":
        return <ShopScreen />;
      default:
        return null;
    }
  };

  // ---- TUTORIAL steps configuration ----
  const tutorialSteps = [
    {
      title: "Welcome to ClashRealms!",
      description: "In this game, you build and upgrade your village, train troops, and battle for glory. Let's explore the basics together.",
      selector: ".cr-header", // highlight top bar
      position: "below"
    },
    {
      title: "Your Resources",
      description: "This bar shows your Gold, Elixir, and Gems. Tap + to collect more (mock). Use resources to build and upgrade.",
      selector: ".cr-resources-bar",
      position: "below"
    },
    {
      title: "Navigation Bar",
      description: "Use this menu to switch between your Base, Attack, Clan, and Shop screens. Let's start at your Base!",
      selector: ".cr-bottom-nav",
      position: "above"
    },
    {
      title: "Upgrading Buildings",
      description: "Click building cards to upgrade! Upgrading improves production and defense. Try Town Hall, Gold Mine, or Cannon.",
      selector: ".cr-buildings-grid",
      position: "below"
    },
    {
      title: "Troop Training",
      description: "Tap Army Camp and use Train/Upgrade to boost your troops. Higher level troops help you win battles.",
      selector: ".cr-building-armycamp",
      position: "right"
    },
    {
      title: "Cooldown Timers",
      description: "When you upgrade, a progress bar and timer will appear. When full, your building or troop reaches a new level!",
      selector: ".cr-upgrade-progress-bar",
      position: "below"
    },
    {
      title: "Need Help Later?",
      description: "You can view this guide anytime by tapping the '?' help button in the top bar.",
      selector: "#cr-help-tutorial-btn",
      position: "right"
    }
  ];

  // Manual tutorial trigger and finish logic
  function startTutorial() {
    setTutorialStep(0);
  }
  function closeTutorial() {
    setTutorialStep(null);
    if (window.localStorage)
      window.localStorage.setItem("cr_seen_tutorial", "true");
  }

  return (
    <div className="cr-app-theme">
      {/* Confetti celebration overlay */}
      <ConfettiOverlay
        show={confetti.show}
        triggerKey={confetti.key}
        onDone={() => setConfetti({ ...confetti, show: false })}
      />

      <header
        className="cr-header"
        tabIndex={0}
        role="banner"
        aria-label="Game Header and Resource Bar"
        style={{ outline: "none" }}
        onKeyDown={e => {
          if (e.key === "Tab") {
            // Visually indicate header focus ring on keyboard nav
            e.currentTarget.style.boxShadow = "0 0 0 3px #3DBB3D";
          }
        }}
        onBlur={e => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span className="cr-logo" aria-label="ClashRealms Home">🏰 ClashRealms</span>
        <AnimatedResourceBar
          resources={resourceCounts}
          onCollect={handleCollectResource}
        />
        {/* Help/tutorial launch button */}
        <button
          id="cr-help-tutorial-btn"
          className="cr-btn-accent"
          style={{
            marginLeft: 12,
            fontSize: 18,
            padding: "5px 13px",
            borderRadius: 12,
            alignSelf: "center",
            outline: "none",
            border: "2px solid transparent"
          }}
          aria-label="Show Tutorial"
          onClick={startTutorial}
          tabIndex={0}
          onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
          onBlur={e => (e.currentTarget.style.border = "2px solid transparent")}
        >
          ?
        </button>
      </header>

      <main className="cr-main-content" tabIndex={0} role="main" aria-label="Main Game Content">
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
        <Popup onClose={() => setPopup(null)} title="Upgrade Troops">
          <TroopTrainingPopup
            troopUpgrades={troopUpgrades}
            triggerTroopUpgrade={triggerTroopUpgrade}
            resourceCounts={resourceCounts}
            TROOP_UPGRADE_INFO={TROOP_UPGRADE_INFO}
          />
        </Popup>
      )}

      {/* Step-by-Step Guided Tutorial Overlay */}
      {tutorialStep !== null && (
        <TutorialOverlay
          steps={tutorialSteps}
          currentStep={tutorialStep}
          onNext={() => setTutorialStep(s => Math.min(s + 1, tutorialSteps.length - 1))}
          onPrev={() => setTutorialStep(s => Math.max(s - 1, 0))}
          onClose={closeTutorial}
        />
      )}
    </div>
  );
}

/**
 * NOTE: If you are using PUBLIC_URL in your code, use process.env.PUBLIC_URL instead.
 * 
 * (Build Fix: Scan and ensure NO code or config references PUBLIC_URL as a raw variable)
 */
// [Build Fix for PUBLIC_URL]
// If any usage such as src={PUBLIC_URL + '/...'} exists, change it to src={process.env.PUBLIC_URL + '/...'}

// --- UI Components ---

function VillageView({
  buildingStates,
  setBuildingStates,
  onBuildingClick,
  onTrainTroops,
  onCelebrate,
  resourceCounts,
  BUILDING_UPGRADE_INFO,
  triggerBuildingUpgrade
}) {
  // Celebrate after a full upgrade (completion detection)
  const prevProgress = useRef(buildingStates.map(b => b.progress));
  useEffect(() => {
    buildingStates.forEach((b, idx) => {
      if (
        prevProgress.current[idx] < 100 &&
        b.progress === 100 &&
        !b.upgrading
      ) {
        onCelebrate && onCelebrate(`${b.label} upgraded!`);
      }
    });
    prevProgress.current = buildingStates.map(b => b.progress);
    // eslint-disable-next-line
  }, [buildingStates, onCelebrate]);

  return (
    <div className="cr-village-view">
      <div
        className="cr-buildings-grid"
        tabIndex={0}
        role="region"
        aria-label="Buildings Grid"
        aria-describedby="buildings-access-desc"
        style={{ outline: "none" }}
        onKeyDown={e => {
          if (e.key === "Tab") {
            e.currentTarget.style.boxShadow = "0 0 0 3px #3DBB3D";
          }
        }}
        onBlur={e => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span id="buildings-access-desc" style={{ position: "absolute", left: "-9999px" }}>
          Use TAB and arrow keys to navigate buildings. Press ENTER to upgrade or open training.
        </span>
        {buildingStates.map((b, idx) => {
          // Info for upgrade cost/time for this building's current level
          const ug = BUILDING_UPGRADE_INFO[b.key];
          const goldCost = ug && ug.baseGold ? ug.baseGold * (b.level || 1) : null;
          const elixirCost = ug && ug.baseElixir ? ug.baseElixir * (b.level || 1) : null;
          const seconds = ug ? Math.round(ug.baseTime * (1.2 ** ((b.level || 1) - 1))) : 7;

          let canUpgrade =
            !b.upgrading &&
            !b.cooldown &&
            ((goldCost == null || resourceCounts.gold >= goldCost) &&
              (elixirCost == null || resourceCounts.elixir >= elixirCost));

          // For Army Camp, button triggers troop upgrade popup instead of own upgrade
          if (b.key === "armycamp") {
            return (
              <button
                key={b.key}
                className={`cr-building cr-building-${b.key} ${b.upgrading ? "is-upgrading" : ""}`}
                onClick={onTrainTroops}
                tabIndex={0}
                aria-label="Train Troops at Army Camp"
                role="button"
                data-tutorial="armycamp"
                aria-pressed="false"
                style={{ outline: "none", border: "2px solid transparent" }}
                onFocus={e => (e.currentTarget.style.border = "2px solid #F5C542")}
                onBlur={e => (e.currentTarget.style.border = "2px solid transparent")}
                onKeyDown={e => {
                  if (["Enter", " "].includes(e.key)) { e.preventDefault(); onTrainTroops(); }
                  // Arrow key navigation
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    const next = e.currentTarget.parentElement.nextSibling;
                    if (next && next.querySelector("button")) {
                      next.querySelector("button").focus();
                    }
                  }
                  if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const prev = e.currentTarget.parentElement.previousSibling;
                    if (prev && prev.querySelector("button")) {
                      prev.querySelector("button").focus();
                    }
                  }
                }}
              >
                <span>
                  {b.label}{b.level && b.level > 1 ? ` Lv.${b.level}` : ""}
                  <br />
                  <button
                    type="button"
                    className="cr-btn-accent"
                    style={{ marginTop: 8, fontSize: '0.93em', fontWeight: 500, outline: "none", border: "2px solid transparent" }}
                    onClick={onTrainTroops}
                    tabIndex={0}
                    aria-label="Open Train/Upgrade Troops"
                    onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
                    onBlur={e => (e.currentTarget.style.border = "2px solid transparent")}
                  >
                    ⚔️ Train/Upgrade Troops
                  </button>
                </span>
              </button>
            );
          }

          // Default buildings (can be upgraded directly)
          return (
            <div key={b.key} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <button
                className={`cr-building cr-building-${b.key} ${b.upgrading ? "is-upgrading" : ""}`}
                onClick={() => triggerBuildingUpgrade(idx)}
                disabled={!canUpgrade}
                tabIndex={0}
                aria-label={
                  b.label +
                  (b.upgrading
                    ? " upgrading, please wait"
                    : ", click to upgrade"
                  )
                }
                type="button"
                data-tutorial={b.key}
                aria-disabled={!canUpgrade}
                role="button"
                style={{ outline: "none", border: "2px solid transparent" }}
                onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
                onBlur={e => (e.currentTarget.style.border = "2px solid transparent")}
                onKeyDown={e => {
                  if (["Enter", " "].includes(e.key)) { e.preventDefault(); triggerBuildingUpgrade(idx); }
                  // Arrow key navigation
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    const next = e.currentTarget.parentElement.nextSibling;
                    if (next && next.querySelector("button")) {
                      next.querySelector("button").focus();
                    }
                  }
                  if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const prev = e.currentTarget.parentElement.previousSibling;
                    if (prev && prev.querySelector("button")) {
                      prev.querySelector("button").focus();
                    }
                  }
                }}
              >
                <span>
                  {b.label}{b.level && b.level > 1 ? ` Lv.${b.level}` : ""}
                  <br />
                  <span style={{ fontSize: '0.91em', fontWeight: 'normal', color: "#756042" }}>
                    {goldCost ? <><span className="cr-gold">⛃{goldCost}</span>{" "}</> : ""}
                    {elixirCost ? <><span className="cr-elixir">✦{elixirCost}</span> </> : ""}
                    <span>⏳{seconds}s</span>
                  </span>
                  {(b.upgrading || b.cooldown) && (
                    <span className="cr-upgrade-progress-ctr">
                      <span className="cr-upgrade-progress-bar" data-tutorial="progress-bar">
                        <span
                          className="cr-upgrade-progress-bar-inner"
                          style={{ width: `${b.progress ?? 0}%` }}
                        ></span>
                      </span>
                      <span className="cr-upgrade-progress-label">
                        {b.upgrading && b.progress < 100
                          ? `Upgrading... ${Math.round(b.progress)}%`
                          : b.progress === 100
                            ? "Upgrade Complete!"
                            : b.cooldown
                              ? `Cooldown: ${b.cooldown}s`
                              : ""}
                      </span>
                    </span>
                  )}
                  {!b.upgrading && !b.cooldown && (
                    <span style={{ display: "block", fontSize: "0.97em", marginTop: 2 }}>
                      Lv.{b.level}
                      {canUpgrade ? (
                        <span style={{ marginLeft: 6, color: "#3DBB3D" }}>(Ready!)</span>
                      ) : (
                        <span style={{ marginLeft: 6, color: "#ac1b2f" }}>(Waiting)</span>
                      )}
                    </span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <div className="cr-helperbar">
        <Hint>
          Tip: Click buildings to upgrade!{" "}
          <span style={{ color: "#4A2E0B", fontWeight: 500 }}>
            Try town hall or gold mine.
          </span>
        </Hint>
      </div>
    </div>
  );
}

// --- Other screens & popups ---

function BattleScreen({ onWin }) {
  // Mock: Pretend user can "win" a mock battle
  const [won, setWon] = useState(false);

  function handleWin() {
    setWon(true);
    onWin && onWin();
    setTimeout(() => setWon(false), 1400); // reset button
  }

  return (
    <div
      className="cr-battle-screen"
      role="region"
      aria-label="Battle Screen"
      tabIndex={0}
      style={{ outline: "none" }}
    >
      <h2>Battle!</h2>
      <div className="cr-battlefield-placeholder" aria-live="polite">
        <span className="emoji" aria-label="Battle Emoji">⚔️</span>
        <p>Battles will play out here.</p>
        {!won ? (
          <button
            className="cr-btn-accent"
            style={{ minWidth: 95, outline: "none", border: "2px solid transparent" }}
            onClick={handleWin}
            tabIndex={0}
            aria-label="Simulate Win Battle"
            onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
            onBlur={e => (e.currentTarget.style.border = "2px solid transparent")}
          >
            Mock Win Battle
          </button>
        ) : (
          <span
            className="cr-upgrade-progress-label"
            style={{ fontSize: '1.09em', color: '#3DBB3D' }}
            aria-live="assertive"
          >Victory!</span>
        )}
      </div>
    </div>
  );
}

function ClanScreen() {
  return (
    <div className="cr-clan-screen" tabIndex={0} role="region" aria-label="Clan Screen">
      <h2>Clans</h2>
      <p>Clan features coming soon. Join or create a clan, chat, and participate in clan wars.</p>
    </div>
  );
}

function ShopScreen() {
  return (
    <div className="cr-shop-screen" tabIndex={0} role="region" aria-label="Shop Screen">
      <h2>Shop</h2>
      <p>Buy resources, gems, and special items.</p>
      <button
        className="cr-btn-primary"
        disabled
        aria-disabled="true"
        aria-label="In-App Purchases Disabled"
      >
        In-App Purchases Integration Placeholder
      </button>
    </div>
  );
}

// --- Pop-up Menus ---

function Popup({ title, children, onClose }) {
  // Focus management: focus dialog on open, return focus on close
  const popupRef = React.useRef(null);
  useEffect(() => {
    if (popupRef.current) popupRef.current.focus();
  }, []);
  return (
    <div
      className="cr-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      ref={popupRef}
      style={{ outline: "none" }}
    >
      <div className="cr-popup-card">
        <div className="cr-popup-header">
          <span>{title}</span>
          <button
            className="cr-popup-close"
            onClick={onClose}
            aria-label="Close popup"
            tabIndex={0}
            onKeyDown={e => (e.key === "Enter" || e.key === " " ? onClose() : null)}
            onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
            onBlur={e => (e.currentTarget.style.border = "none")}
          >×</button>
        </div>
        <div className="cr-popup-content">{children}</div>
      </div>
    </div>
  );
}

function BuildingUpgradePopup() {
  // Deprecated (moved to inline upgrades), but kept for future expansion
  return (
    <Fragment>
      <p>Use the main screen to upgrade buildings by clicking the building cards.</p>
    </Fragment>
  );
}

function TroopTrainingPopup({ troopUpgrades, triggerTroopUpgrade, resourceCounts, TROOP_UPGRADE_INFO }) {
  return (
    <Fragment>
      <p style={{ marginBottom: 7, fontSize: '1.1em' }}>Upgrade your troops to become stronger in battles!</p>
      {troopUpgrades.map((t, idx) => {
        const info = TROOP_UPGRADE_INFO[t.key] || {};
        const elixirCost = info.baseElixir ? info.baseElixir * (t.level || 1) : 0;
        const seconds = info.baseTime ? Math.round(info.baseTime * (1.24 ** ((t.level || 1) - 1))) : 10;
        const canUpgrade =
          !t.upgrading &&
          !t.cooldown &&
          (!elixirCost || resourceCounts.elixir >= elixirCost);
        return (
          <div
            key={t.key}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 12,
              background: "#fffcea",
              borderRadius: 11,
              border: "1.4px solid #e0b742",
              boxShadow: "0 1px 3px #dac44113",
              padding: "11px 9px"
            }}
            role="group"
            aria-label={`Upgrade Troop: ${t.label}`}
          >
            <span style={{ minWidth: 82 }}>
              {t.label} <span style={{ color: "#91ad0a", fontSize: '0.89em' }}>
                Lv.{t.level}
              </span>
              <br />
              <span style={{ fontSize: "0.97em", color: "#944ff9" }}>
                ✦{elixirCost}</span>{" "}
              <span style={{ fontSize: "0.96em" }}>⏳{seconds}s</span>
            </span>
            <div style={{ flex: 1, marginLeft: 13 }}>
              {t.upgrading || t.cooldown ? (
                <div>
                  <div className="cr-upgrade-progress-bar" style={{ marginBottom: 3 }}>
                    <span
                      className="cr-upgrade-progress-bar-inner"
                      style={{ width: `${t.progress ?? 0}%` }}
                      aria-valuenow={Math.round(t.progress ?? 0)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      role="progressbar"
                      aria-label="Upgrade Progress"
                    ></span>
                  </div>
                  <span className="cr-upgrade-progress-label" style={{ whiteSpace: "nowrap" }}>
                    {t.upgrading ? `Upgrading... ${Math.round(t.progress ?? 0)}%`
                      : t.progress === 100
                        ? "Upgrade Complete!"
                        : t.cooldown
                          ? `Cooldown: ${t.cooldown}s`
                          : ""}
                  </span>
                </div>
              ) : (
                <button
                  className={`cr-btn-accent${!canUpgrade ? ' cr-btn-disabled' : ''}`}
                  disabled={!canUpgrade}
                  onClick={() => triggerTroopUpgrade(idx)}
                  style={{ minWidth: 74, padding: "5px 14px", fontSize: '1em', fontWeight: 600, outline: "none", border: "2px solid transparent" }}
                  tabIndex={0}
                  aria-label={`Upgrade ${t.label}`}
                  onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
                  onBlur={e => (e.currentTarget.style.border = "2px solid transparent")}
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div className="cr-hint" style={{ marginTop: 8 }}>
        Higher-level troops perform better in battles.
      </div>
    </Fragment>
  );
}

// --- Reusable bottom navigation ---
function BottomNav({ navItems, active, onChange }) {
  return (
    <nav
      className="cr-bottom-nav"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      {navItems.map((item, idx) => (
        <button
          key={item.key}
          className={`cr-bottom-nav-btn${active === item.key ? " active" : ""}`}
          onClick={() => onChange(item.key)}
          aria-current={active === item.key ? "page" : undefined}
          aria-label={item.label}
          role="tab"
          tabIndex={0}
          style={{ outline: "none", border: "2px solid transparent" }}
          onFocus={e => (e.currentTarget.style.border = "2px solid #F5C542")}
          onBlur={e => (e.currentTarget.style.border = "2px solid transparent")}
          onKeyDown={e => {
            if (["Enter", " "].includes(e.key)) { e.preventDefault(); onChange(item.key); }
            // Left/right arrow keys for navigation
            if (e.key === "ArrowRight") {
              e.preventDefault();
              const btns = Array.from(e.currentTarget.parentNode.children);
              btns[(idx + 1) % btns.length].focus();
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              const btns = Array.from(e.currentTarget.parentNode.children);
              btns[(idx === 0 ? btns.length : idx) - 1].focus();
            }
          }}
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
