import React, { useState, Fragment } from "react";
import "./ClashRealmsMain.css";

// Core Navigation items
const NAV_ITEMS = [
  { key: "base", label: "Base" },
  { key: "attack", label: "Attack" },
  { key: "clan", label: "Clan" },
  { key: "shop", label: "Shop" },
];

// PUBLIC_INTERFACE
function ClashRealmsMain() {
  // Navigation state: what screen is active?
  const [activeScreen, setActiveScreen] = useState("base");
  // Control popups
  const [popup, setPopup] = useState(null);

  // Integration points for core modules (placeholders)
  // In real implementations, these would import and render feature modules.
  const renderScreen = () => {
    switch (activeScreen) {
      case "base":
        return (
          <VillageView
            onBuildingClick={() => setPopup("building-upgrade")}
            onTrainTroops={() => setPopup("troop-train")}
          />
        );
      case "attack":
        return <BattleScreen />;
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
      <header className="cr-header">
        <span className="cr-logo">🏰 ClashRealms</span>
        <ResourceBar />
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

function VillageView({ onBuildingClick, onTrainTroops }) {
  // Placeholder: A visually "top-down" grid with interactive buildings.
  // Replace with a canvas or SVG for greater realism in production.
  return (
    <div className="cr-village-view">
      <div className="cr-buildings-grid">
        <button
          className="cr-building cr-building-goldmine"
          onClick={onBuildingClick}
        >
          Gold Mine
        </button>
        <button
          className="cr-building cr-building-armycamp"
          onClick={onTrainTroops}
        >
          Army Camp
        </button>
        <button className="cr-building cr-building-cannon" onClick={onBuildingClick}>
          Cannon
        </button>
        <button className="cr-building cr-building-townhall" onClick={onBuildingClick}>
          Town Hall
        </button>
      </div>
      <div className="cr-helperbar">
        <Hint>Tip: Click buildings to upgrade or train troops!</Hint>
      </div>
    </div>
  );
}

function BattleScreen() {
  // Placeholder for real-time battle UI
  return (
    <div className="cr-battle-screen">
      <h2>Battle!</h2>
      <div className="cr-battlefield-placeholder">
        <span className="emoji">⚔️</span>
        <p>Battles will play out here.</p>
        <button className="cr-btn-disabled" disabled>
          Deploy Troops (Coming Soon)
        </button>
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

// --- Resource Bar Consistent With Theme ---
function ResourceBar() {
  // Placeholder: In production, connect to resource/management state
  return (
    <div className="cr-resources-bar">
      <span className="cr-gold">⛃ 1000</span>
      <span className="cr-elixir">✦ 750</span>
      <span className="cr-gems">💎 50</span>
    </div>
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
