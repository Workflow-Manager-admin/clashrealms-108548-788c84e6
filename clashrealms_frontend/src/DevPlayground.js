import React, { useState } from "react";
import AnimatedResourceBar from "./ResourceBar";
import ConfettiOverlay from "./ConfettiOverlay";
import TutorialOverlay from "./TutorialOverlay";
import SettingsPanel from "./SettingsPanel";
import UserProfileModal from "./UserProfileModal";
import LoadingOverlay from "./LoadingOverlay";
import BattleReplay from "./BattleReplay";
import Minimap from "./Minimap";
import FeedbackWidget from "./FeedbackWidget";
import HelpModal from "./HelpModal";
import Snackbar, { SnackbarProvider } from "./Snackbar";

/**
 * PUBLIC_INTERFACE
 * DevPlayground: A showcase for ClashRealms UI components.
 * Appearance: Overlay modal for developer/tester use.
 * Activation: Only accessible via keyboard shortcut in dev/test environments.
 */
const COMPONENTS = [
  { key: "AnimatedResourceBar", label: "AnimatedResourceBar", render: () => <AnimatedResourceBar resources={{gold: 1137, elixir: 684, gems: 14}} onCollect={()=>{}} /> },
  { key: "ConfettiOverlay", label: "ConfettiOverlay", render: () => <ConfettiOverlay show={true} triggerKey={Date.now()} onDone={()=>{}} durationMs={700}/> },
  { key: "TutorialOverlay", label: "TutorialOverlay", render: () => <TutorialOverlay
      steps={[{title: "Demo", description: "Tutorial Overlay Example", selector: ".cr-header", position: "below"}]}
      currentStep={0}
      onNext={()=>{}}
      onPrev={()=>{}}
      onClose={()=>{}}
    /> },
  { key: "SettingsPanel", label: "SettingsPanel", render: () => <SettingsPanel onClose={()=>{}} /> },
  { key: "UserProfileModal", label: "UserProfileModal", render: () => <UserProfileModal isOpen={true} onClose={()=>{}} onSave={()=>{}} initial={{name: "Tester", avatar: "knight"}} /> },
  { key: "LoadingOverlay", label: "LoadingOverlay", render: () => <LoadingOverlay show={true} message="Loading test overlay..." /> },
  { key: "BattleReplay", label: "BattleReplay", render: () => <BattleReplay /> },
  { key: "Minimap", label: "Minimap", render: () => <Minimap buildings={[
    { key: "goldmine", label: "Gold Mine", level: 2 },
    { key: "armycamp", label: "Army Camp", level: 3 },
    { key: "cannon", label: "Cannon", level: 1 },
    { key: "townhall", label: "Town Hall", level: 4 }
  ]} width={130} height={130} /> },
  { key: "FeedbackWidget", label: "FeedbackWidget", render: () => <FeedbackWidget isOpen={true} onClose={()=>{}} /> },
  { key: "HelpModal", label: "HelpModal", render: () => <HelpModal isOpen={true} onClose={()=>{}} /> },
];

function DevPlayground({ open, onClose }) {
  const [active, setActive] = useState(COMPONENTS[0].key);

  if (!open) return null;
  const CurrentComponent = COMPONENTS.find(c => c.key === active);

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 99998,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(38,38,48,0.86)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Developer Playground"
      tabIndex={-1}
    >
      <div
        style={{
          background: "#fffbea",
          border: "3px solid #F5C542",
          borderRadius: 18,
          minWidth: 350,
          maxWidth: "94vw",
          minHeight: 300,
          maxHeight: "92vh",
          overflow: "auto",
          boxShadow: "0 6px 42px #e7b82322, 0 1.5px 7px #b3a92188",
          padding: "23px 22px 13px 22px",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <div style={{
          fontWeight: 700,
          color: "#4A2E0B",
          fontSize: "1.29em",
          marginBottom: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>Developer Playground</span>
          <button
            style={{
              fontSize: "1.4em",
              borderRadius: 999,
              border: "none",
              background: "#f5c54218",
              marginLeft: 15,
              cursor: "pointer",
              color: "#ab8200",
              width: 32,
              height: 32
            }}
            aria-label="Close Playground"
            onClick={onClose}
            tabIndex={0}
          >×</button>
        </div>
        <div style={{ display: "flex", gap: 13, marginBottom: 13, flexWrap: "wrap" }}>
          {COMPONENTS.map(comp => (
            <button
              key={comp.key}
              style={{
                fontWeight: 500,
                background: comp.key === active ? "#e7ffcf" : "#fff",
                color: "#513c16",
                border: comp.key === active ? "2.6px solid #3DBB3D" : "2px solid #F5C542",
                borderRadius: 12,
                padding: "5px 12px",
                minWidth: 64,
                fontSize: "0.99em",
                marginBottom: 4,
                cursor: "pointer"
              }}
              tabIndex={0}
              onClick={() => setActive(comp.key)}
            >
              {comp.label}
            </button>
          ))}
        </div>
        <div style={{
          background: "#fff",
          borderRadius: 13,
          border: "1.5px solid #F5C542",
          boxShadow: "0 2px 11px #f5c54222",
          flex: 1,
          position: "relative",
          minHeight: 140,
          minWidth: 220,
          maxWidth: 520,
          margin: "0 auto",
          padding: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {CurrentComponent && CurrentComponent.render()}
        </div>
        <div style={{ marginTop: 8, textAlign: "center", color: "#bda72a", fontSize: "0.92em" }}>
          Press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>D</kbd> to toggle this panel.
        </div>
      </div>
    </div>
  );
}

export default DevPlayground;
