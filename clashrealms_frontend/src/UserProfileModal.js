import React, { useEffect, useRef, useState } from "react";

// Preset SVG avatars (simple shapes or emojis for a minimal project)
const PRESET_AVATARS = [
  { key: "knight", svg: "🛡️" },
  { key: "barbarian", svg: "👹" },
  { key: "archer", svg: "🏹" },
  { key: "wizard", svg: "🧙" },
  { key: "king", svg: "🤴" },
  { key: "goblin", svg: "👺" },
];

// Validate display name (simple: 2-16 chars, only basic safe chars)
function validateName(name) {
  return (
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 16 &&
    /^[a-zA-Z0-9_\-\s]+$/.test(name.trim())
  );
}

// PUBLIC_INTERFACE
/**
 * UserProfileModal: Lets user choose avatar (preset or upload) and set display name.
 * Props:
 *   isOpen: boolean
 *   onClose: close modal callback
 *   onSave: function({ name, avatar }) called on save
 *   initial: { name, avatar }
 */
function UserProfileModal({ isOpen, onClose, onSave, initial = {} }) {
  const [tab, setTab] = useState("preset"); // 'preset' or 'upload'
  const [avatar, setAvatar] = useState(initial.avatar || PRESET_AVATARS[0].key);
  const [customAvatar, setCustomAvatar] = useState(
    initial.avatar && initial.avatar.startsWith("data:image") ? initial.avatar : ""
  );
  const [displayName, setDisplayName] = useState(initial.name || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // For focus trap & access
  const modalRef = useRef();
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle file upload
  function onUploadFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = evt => {
      setCustomAvatar(evt.target.result);
      setAvatar(evt.target.result); // use data URL directly
      setTab("upload");
      setError("");
    };
    reader.onerror = () => setError("Error reading uploaded file.");
    reader.readAsDataURL(file);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!validateName(displayName)) {
      setError("Name must be 2-16 letters/numbers (A-Z, 0-9, _, -).");
      return;
    }
    setSaving(true);
    // Small timeout for user feedback
    setTimeout(() => {
      setSaving(false);
      onSave({ name: displayName.trim(), avatar });
      onClose();
    }, 350);
  }

  function handlePresetSelect(key) {
    setAvatar(key);
    setTab("preset");
    setCustomAvatar("");
    setError("");
  }

  function handleTabChange(tabName) {
    setTab(tabName);
    if (tabName === "preset" && !PRESET_AVATARS.find(a => a.key === avatar)) {
      setAvatar(PRESET_AVATARS[0].key);
    }
    setError("");
  }

  function renderAvatarPreview() {
    if (tab === "upload" && customAvatar) {
      return (
        <span
          style={{
            display: "inline-block",
            width: 64,
            height: 64,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2.5px solid #3DBB3D",
            background: "#fff",
            marginBottom: 3
          }}
          aria-label="Profile Picture Preview"
        >
          <img
            src={customAvatar}
            alt="avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
            draggable={false}
          />
        </span>
      );
    }
    // Preset (emoji) avatar
    const preset =
      PRESET_AVATARS.find(a => a.key === avatar) || PRESET_AVATARS[0];
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#fff",
          border: "2.5px solid #F5C542",
          fontSize: "2.1em",
          marginBottom: 3
        }}
        aria-label="Profile Picture Preview"
      >
        <span role="img" aria-label={preset.key + " avatar"}>
          {preset.svg}
        </span>
      </span>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="cr-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Profile and Avatar Selection"
      tabIndex={-1}
      ref={modalRef}
    >
      <form
        className="cr-popup-card"
        style={{ minWidth: 320, maxWidth: 380 }}
        tabIndex={0}
        onSubmit={handleSave}
      >
        <div className="cr-popup-header" style={{marginBottom:8}}>
          <span>Set Profile & Avatar</span>
          <button
            className="cr-popup-close"
            aria-label="Close profile setup"
            tabIndex={0}
            onClick={onClose}
            type="button"
            onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
            onBlur={e => (e.currentTarget.style.border = "none")}
            style={{marginLeft: 10}}
          >
            ×
          </button>
        </div>
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems:"center"}}>
            {renderAvatarPreview()}
            <div style={{display: "flex", gap: 7, marginBottom: 3}}>
              <button
                type="button"
                className={`cr-btn-primary${tab === "preset" ? "" : " cr-btn-disabled"}`}
                style={{padding: "5px 14px", fontSize: "0.98em"}}
                onClick={() => handleTabChange("preset")}
                tabIndex={0}
                aria-pressed={tab === "preset"}
              >Choose</button>
              <button
                type="button"
                className={`cr-btn-accent${tab === "upload" ? "" : " cr-btn-disabled"}`}
                style={{padding: "5px 14px", fontSize: "0.98em"}}
                onClick={() => handleTabChange("upload")}
                tabIndex={0}
                aria-pressed={tab === "upload"}
              >Upload</button>
            </div>
            {tab === "preset" && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 2, marginBottom: 7
              }}>
                {PRESET_AVATARS.map(a => (
                  <button
                    type="button"
                    key={a.key}
                    aria-label={a.key + " avatar"}
                    className={`cr-btn-primary${avatar === a.key ? " active" : ""}`}
                    style={{
                      fontSize: "1.6em",
                      borderRadius: "50%",
                      width: 48,
                      height: 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: avatar === a.key ? "2.5px solid #3DBB3D" : "2px solid #F5C542",
                      background: avatar === a.key ? "#cff7c7" : "#fff",
                      transition: "border 0.18s"
                    }}
                    onClick={() => handlePresetSelect(a.key)}
                    tabIndex={0}
                  >
                    <span aria-hidden="true">{a.svg}</span>
                  </button>
                ))}
              </div>
            )}
            {tab === "upload" && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  style={{marginTop: 4, marginBottom: 7}}
                  aria-label="Upload avatar"
                  onChange={onUploadFile}
                />
                <div style={{ fontSize: "0.92em", color: "#756042", marginBottom: 7 }}>
                  .png, .jpg, .gif accepted (max ~500 KB; processing is in-browser).
                </div>
              </>
            )}
          </div>
          <label
            htmlFor="cr-profile-displayname"
            style={{ fontWeight: 600, fontSize: "1.06em", display: "block", marginTop: 3}}
          >
            Display Name
          </label>
          <input
            id="cr-profile-displayname"
            value={displayName}
            maxLength={16}
            minLength={2}
            required
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Enter a name"
            style={{
              width: "100%",
              borderRadius: 7,
              padding: "9px 10px",
              fontSize: "1.12em",
              border: "2px solid #F5C542",
              boxSizing: "border-box",
              marginBottom: 7,
              marginTop: 2,
              outline: "none"
            }}
            tabIndex={0}
            aria-label="Display name"
            autoFocus
            onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
            onBlur={e => (e.currentTarget.style.border = "2px solid #F5C542")}
          />
        </div>
        <button
          className="cr-btn-accent"
          type="submit"
          disabled={saving}
          style={{margin: "6px 0 2px 0", fontWeight:600}}
          tabIndex={0}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {error && (
          <div
            style={{
              color: "#ac1b2f",
              background: "#ffe3e3",
              borderRadius: 7,
              padding: "5px 9px",
              marginTop: 2,
              textAlign: "center",
              fontSize: "0.96em"
            }}
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        <div style={{marginTop:7, textAlign: "center", fontSize:"0.94em", color: "#756042"}}>
          Name and avatar are visible to others. Avatar/max size: 200x200px recommended.
        </div>
      </form>
    </div>
  );
}

export default UserProfileModal;
