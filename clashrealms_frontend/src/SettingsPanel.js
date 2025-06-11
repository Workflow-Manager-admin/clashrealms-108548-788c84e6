import React, { useEffect, useRef, useState } from "react";
import SoundManager from "./SoundManager";

/**
 * PUBLIC_INTERFACE
 * SettingsPanel - Modal to adjust preferences: theme, text size, sound volume, mute.
 * Preferences persist via localStorage.
 * Accessible via keyboard/screenreader, focus is managed inside modal.
 */
function SettingsPanel({ onClose }) {
  // Theme and text size can be advanced, here just offer toggles for demo
  const [volume, setVolume] = useState(SoundManager.getVolume());
  const [muted, setMuted] = useState(SoundManager.getMuted());
  const volumeSlider = useRef();

  // Accessibility: on open, focus the panel
  const panelRef = useRef();
  useEffect(() => {
    if (panelRef.current) panelRef.current.focus();
  }, []);

  function handleMuteToggle(e) {
    const val = !muted;
    setMuted(val);
    SoundManager.setMuted(val);
  }
  function handleVolumeChange(e) {
    const val = e.target.value / 100;
    setVolume(val);
    SoundManager.setVolume(val);
    if (muted && val > 0) {
      setMuted(false);
      SoundManager.setMuted(false);
    }
  }

  return (
    <div className="cr-popup-overlay" role="dialog" aria-modal="true" aria-label="Settings Panel" tabIndex={-1}>
      <div
        className="cr-popup-card"
        tabIndex={0}
        ref={panelRef}
        style={{ minWidth: 300, maxWidth: 440, outline: "none" }}
      >
        <div className="cr-popup-header" style={{marginBottom: "8px"}}>
          <span>Settings</span>
          <button
            className="cr-popup-close"
            aria-label="Close Settings"
            tabIndex={0}
            onClick={() => { SoundManager.play("click"); onClose(); }}
            onKeyDown={e => ((e.key === "Enter" || e.key === " ") && onClose())}
            onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
            onBlur={e => (e.currentTarget.style.border = "none")}
            style={{marginLeft: "10px"}}
          >×</button>
        </div>
        <form className="cr-popup-content" aria-label="Settings Form" style={{display: "flex", flexDirection:"column", gap: 18}}>
          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontWeight: 600, marginBottom: 8 }}>Audio</legend>
            <label style={{display:"flex", alignItems:"center", gap:11}}>
              <input
                type="checkbox"
                checked={muted}
                onChange={handleMuteToggle}
                aria-checked={muted}
                aria-label={muted ? "Unmute all sounds" : "Mute all sounds"}
                style={{width:20, height:20, accentColor:"#3D7BBB"}}
              />
              <span>Mute all game sounds</span>
            </label>
            <label style={{display:"flex", alignItems:"center", gap:11, marginTop:12, userSelect:"none"}}>
              <span>Volume</span>
              <input 
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={handleVolumeChange}
                ref={volumeSlider}
                disabled={muted}
                tabIndex={0}
                aria-label="Adjust sound volume"
                style={{flex:1, marginLeft:10}}
              />
              <span style={{ minWidth: 34, textAlign:"center" }}>{Math.round(volume*100)}%</span>
            </label>
          </fieldset>
          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontWeight: 600, marginBottom: 8 }}>Visual</legend>
            <label style={{display:"flex", alignItems:"center", gap:12 }}>
              <span>Theme</span>
              <select disabled style={{ flex: 1 }} aria-label="Theme" title="Theme selection coming soon">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
              <span style={{color:"#b8bbbd"}}>(soon)</span>
            </label>
            <label style={{display:"flex", alignItems:"center", gap:12, marginTop:10 }}>
              <span>Text Size</span>
              <select disabled style={{ flex: 1 }} aria-label="Text size" title="Text size adjustment coming soon">
                <option>Normal</option>
                <option>Large</option>
                <option>Extra Large</option>
              </select>
              <span style={{color:"#b8bbbd"}}>(soon)</span>
            </label>
          </fieldset>
        </form>
        <div className="cr-hint" style={{marginTop:7, fontSize:"0.95em"}}>
          Audio/visual preferences are saved to your browser and restored next visit.
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
