import clickSfx from "./assets/sfx/click.mp3";
import upgradeSfx from "./assets/sfx/upgrade.mp3";

// PUBLIC_INTERFACE
/**
 * SoundManager - Controls UI/game sounds with persistent settings (localStorage) and accessibility respect.
 *
 * Usage:
 *  import SoundManager from "./SoundManager";
 *  SoundManager.play("click");
 *
 * Supported sounds: click, upgrade
 * Preferences: soundMuted (boolean), soundVolume (0-1)
 */
class SoundManager {
  // Audio elements are reused for instant playback and mute/volume updates
  static _audio = {
    click: null,
    upgrade: null,
  };

  static _preferences = {
    soundMuted: false,
    soundVolume: 0.7,
    _initiated: false,
  };

  static init() {
    if (this._preferences._initiated) return;
    let prefs = {};
    try {
      prefs = JSON.parse(window.localStorage.getItem("cr_sound_prefs")) || {};
    } catch {}
    this._preferences.soundMuted = !!prefs.soundMuted;
    this._preferences.soundVolume =
      typeof prefs.soundVolume === "number" && prefs.soundVolume >= 0 && prefs.soundVolume <= 1
        ? prefs.soundVolume
        : 0.7;
    // Preload and reuse audio elements so volume/mute is instant
    this._audio.click = new window.Audio(clickSfx);
    this._audio.click.preload = "auto";
    this._audio.click.volume = this._preferences.soundVolume;
    this._audio.upgrade = new window.Audio(upgradeSfx);
    this._audio.upgrade.preload = "auto";
    this._audio.upgrade.volume = this._preferences.soundVolume;
    this._preferences._initiated = true;
  }

  // PUBLIC_INTERFACE
  static setMuted(muted) {
    this.init();
    this._preferences.soundMuted = !!muted;
    // Instantly pause and reset all SFX if muting
    if (this._preferences.soundMuted) {
      Object.values(this._audio).forEach(a => {
        if (a) {
          a.pause();
          try { a.currentTime = 0; } catch {}
        }
      });
    }
    this._savePrefs();
  }

  // PUBLIC_INTERFACE
  static setVolume(vol) {
    this.init();
    let clamped = Math.max(0, Math.min(1, vol));  
    this._preferences.soundVolume = clamped;
    Object.values(this._audio).forEach(a => { if (a) a.volume = clamped; });
    // If volume > 0 and was muted, unmute
    if (clamped > 0 && this._preferences.soundMuted) {
      this._preferences.soundMuted = false;
    }
    this._savePrefs();
  }

  // PUBLIC_INTERFACE
  static getMuted() {
    this.init();
    return this._preferences.soundMuted;
  }

  // PUBLIC_INTERFACE
  static getVolume() {
    this.init();
    return this._preferences.soundVolume;
  }

  static _savePrefs() {
    // Save to localStorage
    window.localStorage.setItem(
      "cr_sound_prefs",
      JSON.stringify({
        soundMuted: this._preferences.soundMuted,
        soundVolume: this._preferences.soundVolume,
      })
    );
  }

  // PUBLIC_INTERFACE
  static play(type) {
    this.init();
    if (this._preferences.soundMuted) return;
    // Accessibility: skip if user wants reduced motion
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let audio = (type === "click") ? this._audio.click :
                (type === "upgrade") ? this._audio.upgrade :
                null;
    if (!audio) return;
    // On rapid repeat: reset to 0 and replay immediately
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
    audio.volume = this._preferences.soundVolume;
    // Browser: Some require user gesture for play (handled OK on UI interaction)
    try {
      audio.play();
    } catch {}
  }
}

// On module load, initialize from persisted state
SoundManager.init();

export default SoundManager;
