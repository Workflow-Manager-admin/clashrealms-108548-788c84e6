import React, { useState, Fragment, useRef, useEffect } from "react";
import "./ClashRealmsMain.css";
import AnimatedResourceBar from "./ResourceBar";
import ConfettiOverlay from "./ConfettiOverlay";
import TutorialOverlay from "./TutorialOverlay";
import "./TutorialOverlay.css";
import { useSnackbar } from "./Snackbar";
import SoundManager from "./SoundManager";
import SettingsPanel from "./SettingsPanel";
import UserProfileModal from "./UserProfileModal";
import LoadingOverlay from "./LoadingOverlay";
import BattleReplay from "./BattleReplay";
import Minimap from "./Minimap";

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
// Utility: Load user profile (name, avatar)
function loadUserProfile() {
  try {
    const data = window.localStorage.getItem("cr_user_profile");
    if (!data) return { name: "", avatar: "knight" };
    return JSON.parse(data);
  } catch {
    return { name: "", avatar: "knight" };
  }
}
// Utility: Save user profile
function saveUserProfile(profile) {
  try {
    window.localStorage.setItem("cr_user_profile", JSON.stringify(profile));
  } catch {}
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

  // Screen loading state (for animated transitions)
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [pendingScreen, setPendingScreen] = useState(null);

  // --- Snackbar hook ---
  const showSnackbar = useSnackbar();

  // --- TUTORIAL state ---
  const [tutorialStep, setTutorialStep] = useState(null);

  // Control popups and pass context for popups
  const [popup, setPopup] = useState(null);
  const [popupData, setPopupData] = useState({});
  // Settings Panel control
  const [showSettings, setShowSettings] = useState(false);

  // --- USER PROFILE (avatar, display name), persisted
  const [userProfile, setUserProfile] = useState(() => loadUserProfile());
  const [showProfileModal, setShowProfileModal] = useState(false);

  // --- LOCAL STORAGE: Load resources, buildings, troop upgrades ---
  const [resourceCounts, setResourceCounts] = useState(() =>
    loadLocal("cr_resources", RESOURCE_DEFAULTS)
  );
  const [persistLoaded, setPersistLoaded] = useState(false);

  // --- Show tutorial on first launch or show avatar/name selection popup if profile missing
  useEffect(() => {
    if (window.localStorage) {
      const seenGuide = window.localStorage.getItem("cr_seen_tutorial");
      if (!seenGuide) setTutorialStep(0); // show on first launch
      // On first run, or if profile is missing, force open user profile
      let prof = window.localStorage.getItem("cr_user_profile");
      if (!prof) setShowProfileModal(true);
      else {
        // In case profile is missing name or avatar
        try {
          const parsed = JSON.parse(prof);
          if (!parsed.name || !parsed.avatar) setShowProfileModal(true);
        } catch {
          setShowProfileModal(true);
        }
      }
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

  // Save user profile to localStorage any time it changes
  useEffect(() => {
    saveUserProfile(userProfile);
  }, [userProfile]);

  // Confetti state: what event caused celebration?
  const [confetti, setConfetti] = useState({ show: false, key: 0, message: "" });
  const confettiNextKey = useRef(1);

  // Handler: Animate resource "collection" (mock increment)
  function handleCollectResource(type) {
    SoundManager.play("click");
    setResourceCounts(res => {
      let delta = 0;
      if (type === "gold") delta = 8 + Math.floor(Math.random() * 24);
      if (type === "elixir") delta = 7 + Math.floor(Math.random() * 16);
      if (type === "gems") delta = 1 + Math.floor(Math.random() * 2);
      if (type === "gems") {
        setTimeout(() => {
          setConfetti({ show: true, key: confettiNextKey.current++, message: "Gems Collected!" });
          showSnackbar &&
            showSnackbar({ message: "Gems collected! 💎", type: "success" });
        }, 100);
      } else if (type === "gold") {
        showSnackbar && showSnackbar({ message: "Gold collected! ⛃", type: "info" });
      } else if (type === "elixir") {
        showSnackbar &&
          showSnackbar({ message: "Elixir collected! ✦", type: "info" });
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
    showSnackbar && showSnackbar({ message, type: "success" });
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
        if (!allowed) {
          showSnackbar && showSnackbar({
            message: "Not enough resources to upgrade!",
            type: "error"
          });
          return b;
        }
        // Set upgrading flag and cooldown
        showSnackbar &&
          showSnackbar({
            message: `Upgrading ${b.label}...`,
            type: "info"
          });
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
        if (!allowed) {
          showSnackbar &&
            showSnackbar({
              message: "Not enough elixir to upgrade troop!",
              type: "error"
            });
          return t;
        }
        showSnackbar &&
          showSnackbar({
            message: `Upgrading ${t.label}...`,
            type: "info"
          });
        SoundManager.play("upgrade");
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
            isScreenLoading={isScreenLoading}
          />
        );
      case "attack":
        return <BattleScreen onWin={() => celebrate("Victory in Battle!")} isScreenLoading={isScreenLoading} />;
      case "clan":
        return <ClanScreen isScreenLoading={isScreenLoading} />;
      case "shop":
        return <ShopScreen isScreenLoading={isScreenLoading} />;
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

  // --- Render user avatar/name as a mini profile/profile button in the header ---
  function renderProfileButton() {
    let avatarNode;
    if (userProfile.avatar && userProfile.avatar.startsWith("data:image")) {
      // custom uploaded
      avatarNode = (
        <img
          src={userProfile.avatar}
          alt="avatar"
          style={{
            width: 36, height: 36, borderRadius: "50%",
            objectFit: "cover", border: "2px solid #3DBB3D", background: "#fff", marginRight: 6
          }}
          draggable={false}
        />
      );
    } else {
      // preset avatar
      let preset = null;
      // Matching to array from the modal file; could be DRY'd but this is robust and won't ever break.
      const emojiMap = {
        knight: "🛡️",
        barbarian: "👹",
        archer: "🏹",
        wizard: "🧙",
        king: "🤴",
        goblin: "👺"
      };
      preset = (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#fff",
            border: "2px solid #F5C542",
            fontSize: "1.4em",
            marginRight: 6
          }}
          aria-label="Profile Picture"
        >
          <span role="img">{emojiMap[userProfile.avatar] || "🛡️"}</span>
        </span>
      );
    }
    return (
      <button
        className="cr-btn-primary"
        aria-label="Edit Profile and Avatar"
        style={{
          display: "flex", alignItems: "center", marginLeft: 9, fontSize: 16,
          borderRadius: 21, padding: "3px 10px 3px 2px", outline: "none", border: "2px solid #3DBB3D",
          background: "#fffcea", color: "#4A2E0B", fontWeight: 500, gap: 3, minWidth:0
        }}
        onClick={() => {
          SoundManager.play("click");
          setShowProfileModal(true);
        }}
        tabIndex={0}
        onFocus={e => (e.currentTarget.style.border = "2px solid #31c333")}
        onBlur={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
        title="Edit your profile/appearance"
      >
        {avatarNode}
        <span
          style={{
            maxWidth: 66,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "left",
            color: "#38210D",
            fontSize: "1.06em"
          }}
        >
          {userProfile.name ? userProfile.name : <span style={{ color: "#bba02a" }}>Set Name</span>}
        </span>
      </button>
    );
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
        style={{ outline: "none", gap: 6, display: "flex" }}
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
        {renderProfileButton()}
        {/* Settings Button */}
        <button
          id="cr-settings-btn"
          className="cr-btn-accent"
          style={{
            marginLeft: 9,
            fontSize: 18,
            padding: "5.5px 12px 5px 12px",
            borderRadius: 11,
            alignSelf: "center",
            outline: "none",
            border: "2px solid transparent"
          }}
          aria-label="Open Settings"
          onClick={() => { SoundManager.play("click"); setShowSettings(true); }}
          tabIndex={0}
          onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
          onBlur={e => (e.currentTarget.style.border = "2px solid transparent")}
        >
          <span role="img" aria-label="Settings" style={{fontSize:"1.18em"}}>⚙️</span>
        </button>
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
          onClick={() => { SoundManager.play("click"); startTutorial(); }}
          tabIndex={0}
          onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
          onBlur={e => (e.currentTarget.style.border = "2px solid transparent")}
        >
          ?
        </button>
      </header>

      <main className="cr-main-content" tabIndex={0} role="main" aria-label="Main Game Content">
        {/* Animated cross-fade transitions between content loads */}
        <div
          style={{
            position: "relative",
            minHeight: "320px",
            width: "100%",
            transition: "opacity 0.38s cubic-bezier(.36,1.12,.12,1.06)",
            opacity: isScreenLoading ? 0.56 : 1
          }}
          aria-busy={isScreenLoading}
        >
          {isScreenLoading ? (
            <ScreenSkeleton screen={pendingScreen || activeScreen} />
          ) : (
            renderScreen()
          )}
        </div>
      </main>

      <BottomNav
        navItems={NAV_ITEMS}
        active={activeScreen}
        onChange={key => {
          if (key === activeScreen || isScreenLoading) return;
          setIsScreenLoading(true);
          setPendingScreen(key);
          // Simulate a minimum 700ms load for effect—replace with real async if needed
          setTimeout(() => {
            setActiveScreen(key);
            setIsScreenLoading(false);
            setPendingScreen(null);
          }, 700);
        }}
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
      {/* User Profile Modal (avatar/name picker) */}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          initial={userProfile}
          onSave={data => {
            setUserProfile({ ...userProfile, ...data });
            showSnackbar && showSnackbar({ message: "Profile saved!", type: "success" });
          }}
        />
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
      {/* Global animated loader for screen transitions: Covers whole UI during nav/content loads */}
      <LoadingOverlay show={isScreenLoading} message="Switching screen…" />

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



function VillageView({
  buildingStates,
  setBuildingStates,
  onBuildingClick,
  onTrainTroops,
  onCelebrate,
  resourceCounts,
  BUILDING_UPGRADE_INFO,
  triggerBuildingUpgrade,
  isScreenLoading
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
      {/* Village Minimap Overview */}
      <Minimap buildings={buildingStates} width={130} height={130} />
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
      {/* Global animated loader for screen transitions: Covers whole UI during nav/content loads */}
      <LoadingOverlay show={isScreenLoading} message="Switching screen…" />

    </div>
  );
}

// --- Other screens & popups ---

function BattleScreen({ onWin, isScreenLoading }) {
  // Display a mock battle replay for user engagement
  // Optionally, you could propagate onWin when a replay ends with victory

  return (
    <div
      className="cr-battle-screen"
      role="region"
      aria-label="Battle Screen"
      tabIndex={0}
      style={{ outline: "none" }}
    >
      <h2>Battle!</h2>
      <BattleReplay onReplayEnd={() => onWin && onWin()} />
      {/* Global animated loader for screen transitions: Covers whole UI during nav/content loads */}
      <LoadingOverlay show={isScreenLoading} message="Switching screen…" />
    </div>
  );
}

/**
 * LeaderboardsSection: Shows mock leaderboard for Top Players and Top Clans.
 * Uses dummy arrays and stylized rows for ranking, name, trophies/score, and relevant stats.
 * PUBLIC_INTERFACE
 */
function LeaderboardsSection() {
  // Dummy data
  const playerEmojis = ["👑", "🧙", "👹", "🏹", "🛡️", "🤴", "👺"];
  const clanEmojis = ["🛡️", "🔥", "💎", "⚔️", "☠️", "🏰", "🦅"];

  const topPlayers = [
    { rank: 1, name: "KingMax", trophies: 4120, emoji: "👑", level: 21 },
    { rank: 2, name: "Archie", trophies: 3990, emoji: "🏹", level: 19 },
    { rank: 3, name: "MegaGob", trophies: 3821, emoji: "👺", level: 18 },
    { rank: 4, name: "TheWizard", trophies: 3580, emoji: "🧙", level: 17 },
    { rank: 5, name: "ShieldHero", trophies: 3471, emoji: "🛡️", level: 17 },
    { rank: 6, name: "Barbro", trophies: 3265, emoji: "👹", level: 16 },
    { rank: 7, name: "Valor", trophies: 3163, emoji: "🤴", level: 16 },
    { rank: 8, name: "Ranger", trophies: 3037, emoji: "🏹", level: 15 },
    { rank: 9, name: "Defender", trophies: 2959, emoji: "🛡️", level: 15 },
    { rank: 10, name: "ElixirBoy", trophies: 2832, emoji: "💎", level: 14 },
  ];

  const topClans = [
    { rank: 1, name: "Vault Legion", badge: "🏰", points: 24407, members: 41 },
    { rank: 2, name: "StormFire", badge: "🔥", points: 21980, members: 37 },
    { rank: 3, name: "CrystalWings", badge: "💎", points: 20532, members: 39 },
    { rank: 4, name: "Night Owls", badge: "🦅", points: 20233, members: 40 },
    { rank: 5, name: "Warriors", badge: "⚔️", points: 18922, members: 45 },
    { rank: 6, name: "IronGuard", badge: "🛡️", points: 18565, members: 43 },
    { rank: 7, name: "DeadlyArrows", badge: "🏹", points: 18109, members: 38 },
    { rank: 8, name: "Elixir Elite", badge: "💎", points: 17540, members: 36 },
    { rank: 9, name: "ShadowTribe", badge: "☠️", points: 17288, members: 38 },
    { rank: 10, name: "Fusion", badge: "🔥", points: 15813, members: 30 },
  ];

  // Renders a stylized leaderboard table (used for both player and clan leaderboards)
  function LeaderboardTable({ data, type }) {
    return (
      <div
        className="cr-leaderboard-table"
        aria-label={type === "player" ? "Top Players" : "Top Clans"}
        style={{
          background: "var(--cr-bg-card, #fff9e0)",
          border: "2px solid var(--cr-primary, #F5C542)",
          borderRadius: 17,
          boxShadow: "0 2px 16px var(--cr-shadow)",
          margin: "0 auto 28px auto",
          width: "100%",
          maxWidth: 480,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            fontWeight: 700,
            color: "var(--cr-secondary)",
            fontSize: "1.07em",
            borderBottom: "2px solid #ecd85377",
            background:
              type === "player"
                ? "linear-gradient(90deg,#fffded 60%,#fde8cd 100%)"
                : "linear-gradient(90deg,#fffded 40%,#e8dfbc 100%)",
            padding: "7px 0",
          }}
        >
          <span style={{ flex: "0 0 42px", textAlign: "center" }}>#</span>
          <span style={{ flex: type === "player" ? 2.2 : 2, minWidth: 95 }}>
            {type === "player" ? "Player" : "Clan"}
          </span>
          {type === "player" ? (
            <>
              <span style={{ flex: 0.7, minWidth: 55, textAlign: "center" }}>Lvl</span>
              <span style={{ flex: 1, minWidth: 56, textAlign: "center" }}>🏆 Trophies</span>
            </>
          ) : (
            <>
              <span style={{ flex: 0.9, minWidth: 60, textAlign: "center" }}>Pts</span>
              <span style={{ flex: 0.7, minWidth: 55, textAlign: "center" }}>Members</span>
            </>
          )}
        </div>
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {data.map((row, idx) => (
            <li
              key={row.rank}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "7px 0",
                borderBottom: idx < data.length - 1 ? "1.5px solid #ecd8532c" : "none",
                background:
                  row.rank === 1
                    ? "linear-gradient(90deg, #fff8d5 62%, #ffe02f24 100%)"
                    : row.rank === 2
                    ? "linear-gradient(90deg,#fffbe8 50%, #ffedbc1a 100%)"
                    : row.rank === 3
                    ? "linear-gradient(90deg,#fffbe3 40%, #fde5ca09 100%)"
                    : undefined,
                fontWeight: row.rank <= 3 ? 700 : 500,
                color: row.rank <= 3 ? "#b49b26" : "#38210D",
                fontSize: row.rank === 1 ? "1.13em" : "1.04em",
              }}
            >
              <span
                aria-label={`Rank ${row.rank}`}
                style={{
                  flex: "0 0 42px",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: row.rank <= 3 ? "1.18em" : "1em",
                  color:
                    row.rank === 1
                      ? "#e7ba0d"
                      : row.rank === 2
                      ? "#b9b9b9"
                      : row.rank === 3
                      ? "#a87633"
                      : "#8d791e",
                }}
              >
                {row.rank}
              </span>
              <span
                style={{
                  flex: type === "player" ? 2.2 : 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 80,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ fontSize: "1.3em" }}>{row.emoji || row.badge}</span>
                <span>{row.name}</span>
              </span>
              {type === "player" ? (
                <>
                  <span style={{ flex: 0.7, textAlign: "center", minWidth: 42 }}>{row.level}</span>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "center",
                      minWidth: 45,
                      color: "#f5c542",
                      fontWeight: 800,
                    }}
                  >
                    {row.trophies}
                  </span>
                </>
              ) : (
                <>
                  <span
                    style={{
                      flex: 0.9,
                      textAlign: "center",
                      minWidth: 48,
                      color: "#f5c542",
                      fontWeight: 800,
                    }}
                  >
                    {row.points}
                  </span>
                  <span style={{ flex: 0.7, textAlign: "center", minWidth: 40, color: "#3DBB3D", fontWeight: 700 }}>
                    {row.members}
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // Section with tabs if desired later (now just shows both lists)
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "9px 0" }}>
      <h2 style={{ color: "var(--cr-secondary)", fontWeight: 800, fontSize: "2em", margin: "5px 0 17px 0", textAlign: "center" }}>
        🏆 Leaderboards
      </h2>
      <section aria-label="Top Players" style={{ marginBottom: 18 }}>
        <h3
          style={{
            color: "#ffe54f",
            fontWeight: 600,
            margin: "0 0 3px 0",
            fontSize: "1.18em",
            letterSpacing: ".4px",
            textShadow: "0 1.4px 10px #ffe34315",
            textAlign: "left",
          }}
        >
          Top Players
        </h3>
        <LeaderboardTable data={topPlayers} type="player" />
      </section>
      <section aria-label="Top Clans">
        <h3
          style={{
            color: "#ffd9a4",
            fontWeight: 600,
            margin: "10px 0 3px 0",
            fontSize: "1.16em",
            letterSpacing: ".4px",
            textShadow: "0 1.4px 9px #ffa47d18",
            textAlign: "left",
          }}
        >
          Top Clans
        </h3>
        <LeaderboardTable data={topClans} type="clan" />
      </section>
      <div className="cr-hint" style={{marginTop: 10, fontSize: "1em", color:"#b48e2a", textAlign: "center"}}>
        More competitive features coming soon!
      </div>
    </div>
  );
}

// Clan Screen now hosts leaderboards area
function ClanScreen({ isScreenLoading }) {
  return (
    <div className="cr-clan-screen" tabIndex={0} role="region" aria-label="Clan Screen">
      <LeaderboardsSection />
      {/* Global animated loader for screen transitions: Covers whole UI during nav/content loads */}
      <LoadingOverlay show={isScreenLoading} message="Switching screen…" />
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * ShopScreen: Themed mobile-friendly shop UI with mock offers, gem packs, and confirmation dialogs.
 */
function ShopScreen({ isScreenLoading }) {
  const [confirmation, setConfirmation] = React.useState(null); // { offer }
  const [purchased, setPurchased] = React.useState(null);
  const [preview, setPreview] = React.useState(null);

  // Dummy shop offers (could expand for wider realism)
  const offers = [
    {
      id: "gems_small",
      name: "Small Gem Pack",
      desc: "60 Gems",
      price: "$0.99",
      gems: 60,
      icon: "💎",
      bonus: null,
      highlight: false
    },
    {
      id: "gems_medium",
      name: "Medium Gem Pack",
      desc: "250 Gems +10% Bonus",
      price: "$3.99",
      gems: 250,
      icon: "💎",
      bonus: "+25 Bonus!",
      highlight: false
    },
    {
      id: "gems_large",
      name: "Large Gem Chest",
      desc: "800 Gems +28% Bonus",
      price: "$9.99",
      gems: 800,
      icon: "💼",
      bonus: "+175 Bonus!",
      highlight: true
    },
    {
      id: "builder",
      name: "Builder Boost",
      desc: "Upgrade Time -50% (1d)",
      price: "$2.29",
      gems: null,
      icon: "⏳",
      bonus: null,
      highlight: false
    },
    {
      id: "special_skin",
      name: "Mystic Tower Skin",
      desc: "Exclusive building style",
      price: "$1.49",
      gems: null,
      icon: "🏰",
      bonus: "Limited!",
      highlight: false
    }
  ];

  // Handler for clicking an offer (preview/confirm)
  function handleOfferClick(offer) {
    setPreview(offer);
  }

  // Handler for confirming purchase (mock/virtual)
  function handlePurchase(offer) {
    setConfirmation(null);
    setPreview(null);
    setPurchased(offer);
    setTimeout(() => setPurchased(null), 1600);
  }

  // UI for each offer card
  function OfferCard({ offer }) {
    return (
      <div
        className="shop-offer-card"
        tabIndex={0}
        aria-label={`Buy ${offer.name}`}
        style={{
          background: offer.highlight
            ? "linear-gradient(100deg, #fffbe2 80%, #ffe9a4 100%)"
            : "#fffcea",
          border:
            offer.highlight
              ? "2.4px solid #3DBB3D"
              : "2px solid #e0b742",
          boxShadow: offer.highlight
            ? "0 2px 13px #54e24219, 0 0 7px #3DBB3D22"
            : "0 2px 13px #dac44113",
          borderRadius: 17,
          padding: "18px 13px 14px 13px",
          marginBottom: 14,
          marginTop: offer.highlight ? 9 : 0,
          display: "flex",
          alignItems: "center",
          gap: 15,
          position: "relative",
          outline: "none",
          cursor: "pointer",
          minHeight: 70,
          transition: "border .17s, box-shadow .13s",
        }}
        onClick={() => handleOfferClick(offer)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleOfferClick(offer); }}
        onFocus={e => (e.currentTarget.style.border = "2.4px solid #3DBB3D")}
        onBlur={e => (e.currentTarget.style.border = offer.highlight ? "2.4px solid #3DBB3D" : "2px solid #e0b742")}
      >
        <span
          style={{
            fontSize: "2.17em",
            background: "#fff",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2.4px solid #F5C542",
            marginRight: 2,
            boxShadow: offer.highlight ? "0 0 7px #3DBB3D66" : undefined,
          }}
          aria-hidden="true"
        >
          {offer.icon}
        </span>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontWeight: 700, color: "#4A2E0B", fontSize: "1.09em" }}>{offer.name}</div>
          <div style={{ fontSize: "0.98em", color: "#756042" }}>{offer.desc}</div>
          {offer.bonus && <div style={{ color: "#3DBB3D", fontSize: "0.96em", fontWeight: 600 }}>{offer.bonus}</div>}
        </div>
        <div style={{ fontSize: "1.1em", fontWeight: 700, color: "#b4951d", marginLeft: 5 }}>
          {offer.price}
        </div>
        {offer.highlight && (
          <span
            style={{
              position: "absolute",
              right: 7,
              top: -13,
              fontSize: "0.99em",
              color: "#fff",
              background: "#3DBB3D",
              borderRadius: 12,
              padding: "1px 8px",
              fontWeight: 700,
              letterSpacing: "0.1px",
              boxShadow: "0 2px 8px #3DBB3D22"
            }}
          >Most Popular</span>
        )}
      </div>
    );
  }

  // Preview and confirmation popup
  function ShopModal({ offer, onClose, onConfirm }) {
    return (
      <div className="cr-popup-overlay" role="dialog" aria-modal="true" aria-label="Offer Preview / Purchase" tabIndex={-1}>
        <div className="cr-popup-card" style={{minWidth:300, maxWidth: 360, textAlign: "center"}}>
          <div className="cr-popup-header">
            <span>Confirm Purchase</span>
            <button className="cr-popup-close"
              aria-label="Close"
              tabIndex={0}
              onClick={onClose}
              style={{marginLeft:7}}
              onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
              onBlur={e => (e.currentTarget.style.border = "none")}
              onKeyDown={e => ((e.key === "Enter" || e.key === " ") && onClose())}>
              ×
            </button>
          </div>
          <div style={{margin:"13px auto"}}>
            <span style={{
              fontSize: "2.6em",
              background: "#fff",
              borderRadius: "50%",
              width: 64,
              height: 64,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2.5px solid #F5C542",
              margin: "0 0 7px 0"
            }}>{offer.icon}</span>
            <div style={{fontWeight:800, fontSize:"1.19em", marginTop:6}}>{offer.name}</div>
            <div style={{color:"#837031", fontSize:"1em", marginBottom:3}}>{offer.desc}</div>
            {offer.bonus && <div style={{ color:"#3DBB3D", fontWeight:700, fontSize:"0.98em" }}>{offer.bonus}</div>}
          </div>
          <div style={{ marginTop: 7, fontWeight: 700, fontSize:"1.04em" }}>Price: <span style={{color:"#b38d34"}}>{offer.price}</span></div>
          <button className="cr-btn-accent"
            style={{
              padding: "9px 34px",
              fontSize: "1.11em",
              fontWeight: 700,
              margin: "10px auto 0 auto"
            }}
            onClick={() => onConfirm(offer)}
            tabIndex={0}
            aria-label={`Confirm purchase for ${offer.name}`}
          >
            Buy Now (Demo)
          </button>
          <div className="cr-hint" style={{marginTop:7, color:"#827151", fontSize:"0.96em"}}>
            Purchases are for demo only. No real money required.
          </div>
        </div>
      </div>
    );
  }

  // For mock "purchased" state effect
  function PurchaseSuccess({ offer }) {
    return (
      <div className="cr-popup-overlay" style={{pointerEvents:"none"}}>
        <div className="cr-popup-card" style={{
          minWidth:220,
          maxWidth:320,
          gap: 8,
          textAlign: "center",
          background: "linear-gradient(90deg,#cff7c7 60%, #fffbe1 100%)",
          borderColor: "#3DBB3D"
        }}>
          <div style={{fontSize: "2em", color:"#3DBB3D"}}>✅</div>
          <div style={{fontWeight:700, fontSize: "1.11em"}}>Purchased!</div>
          <div style={{marginTop: 0, fontSize:"0.97em"}}>
            {offer.icon} <span style={{fontWeight:600}}>{offer.name}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cr-shop-screen" tabIndex={0} role="region" aria-label="Shop Screen">
      <h2 style={{color:"#4A2E0B", fontWeight:800, fontSize:"2.2em"}}>🛒 Shop</h2>
      <div style={{color:"#837031", fontWeight:500, margin:"0 0 22px 0", fontSize:"1.09em"}}>
        Pick a pack to boost your progress!
      </div>
      <div style={{
        maxWidth: 370,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 0
      }}>
        {offers.map(offer => (
          <OfferCard offer={offer} key={offer.id} />
        ))}
      </div>
      <div className="cr-hint" style={{marginTop: 20, color:"#baac76", fontSize:"0.99em"}}>
        All purchases are for demo purposes only.<br />
        No real payments are processed.
      </div>
      {/* Confirmation and Preview Popups */}
      {preview && (
        <ShopModal
          offer={preview}
          onClose={() => setPreview(null)}
          onConfirm={offer => {
            setConfirmation(offer);
            setTimeout(() => handlePurchase(offer), 1000);
          }}
        />
      )}
      {confirmation && (
        <PurchaseSuccess offer={confirmation} />
      )}
      {purchased && (
        <PurchaseSuccess offer={purchased} />
      )}

      {/* Global animated loader for screen transitions: Covers whole UI during nav/content loads */}
      <LoadingOverlay show={isScreenLoading} message="Switching screen…" />
      {/* Local shop styling */}
      <style>{`
      .shop-offer-card:active { background: #fff4ce; transform: scale(0.99);}
      @media (max-width: 450px) {
        .shop-offer-card { font-size: 0.97em; min-height:52px; }
      }
      `}</style>
    </div>
  );
}

// --- Pop-up Menus ---

function Popup({ title, children, onClose, isScreenLoading }) {
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
      {/* Global animated loader for screen transitions: Covers whole UI during nav/content loads */}
      <LoadingOverlay show={isScreenLoading} message="Switching screen…" />

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

/** Simple screen shimmer skeletons for major screens, with enhanced animation for polish */
function ScreenSkeleton({ screen }) {
  // Cross-screen shimmer effect for transitions
  let skeletonTheme = {
    borderRadius: 18,
    boxShadow: "0 4px 24px #f5c54228",
    border: "2px solid #f5c54222",
    animation: "loading-pop-scale 0.37s cubic-bezier(.16,.75,.38,1.49)"
  };

  switch (screen) {
    case "base":
      return (
        <div
          className="cr-village-view"
          style={{
            opacity: 0.98,
            animation: "loading-fade-in 0.5s",
            pointerEvents: "none",
            userSelect: "none"
          }}
          aria-hidden="true"
        >
          <div className="cr-buildings-grid">
            {[1, 2, 3, 4].map((n, i) => (
              <div
                key={i}
                className="cr-skeleton-ui"
                style={{
                  ...skeletonTheme,
                  width: 120,
                  height: 110,
                  margin: 8,
                  animationDelay: `${0.1 * i}s`
                }}
              ></div>
            ))}
          </div>
          <div
            className="cr-skeleton-ui"
            style={{
              ...skeletonTheme,
              width: 265,
              height: 23,
              margin: "18px auto 9px auto",
              animationDelay: "0.45s"
            }}
          />
        </div>
      );
    case "attack":
      return (
        <div
          className="cr-battle-screen"
          style={{ maxWidth: 476, margin: "0 auto", pointerEvents: "none", opacity: 0.98, animation: "loading-fade-in 0.5s" }}
          aria-hidden="true"
        >
          <div className="cr-skeleton-ui" style={{ ...skeletonTheme, width: 260, height: 68, margin: "55px auto" }} />
          <div className="cr-skeleton-ui" style={{ ...skeletonTheme, width: 110, height: 32, margin: "22px auto" }} />
        </div>
      );
    case "clan":
      return (
        <div
          className="cr-clan-screen"
          style={{ maxWidth: 476, margin: "0 auto", pointerEvents: "none", opacity: 0.98, animation: "loading-fade-in 0.5s" }}
          aria-hidden="true"
        >
          <div className="cr-skeleton-ui" style={{ ...skeletonTheme, width: 250, height: 34, margin: "37px auto 0 auto" }} />
          <div className="cr-skeleton-ui" style={{ ...skeletonTheme, width: 195, height: 24, margin: "19px auto" }} />
        </div>
      );
    case "shop":
      return (
        <div
          className="cr-shop-screen"
          style={{ maxWidth: 476, margin: "0 auto", pointerEvents: "none", opacity: 0.98, animation: "loading-fade-in 0.5s" }}
          aria-hidden="true"
        >
          <div className="cr-skeleton-ui" style={{ ...skeletonTheme, width: 201, height: 31, margin: "32px auto 0 auto" }} />
          <div className="cr-skeleton-ui" style={{ ...skeletonTheme, width: 130, height: 22, margin: "17px auto" }} />
        </div>
      );
    default:
      return <div />;
  }
}



// Ensure no stray isScreenLoading references below this line!

export default ClashRealmsMain;
