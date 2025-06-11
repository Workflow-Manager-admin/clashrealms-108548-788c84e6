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
    this._audio.click = new Audio(clickSfx);
    this._audio.upgrade = new Audio(upgradeSfx);
    Object.values(this._audio).forEach(
      a => { if (a) { a.volume = this._preferences.soundVolume; } }
    );
    this._preferences._initiated = true;
  }

  static setMuted(muted) {
    this._preferences.soundMuted = !!muted;
    this._savePrefs();
  }

  static setVolume(vol) {
    let clamped = Math.max(0, Math.min(1, vol));
    this._preferences.soundVolume = clamped;
    Object.values(this._audio).forEach(a => { if (a) a.volume = clamped; });
    this._savePrefs();
  }

  static getMuted() {
    this.init();
    return this._preferences.soundMuted;
  }

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
    let audio;
    if (type === "click") audio = new Audio(clickSfx);
    else if (type === "upgrade") audio = new Audio(upgradeSfx);
    else return;
    // Set volume
    audio.volume = this._preferences.soundVolume;
    // Do not play if reduced motion is requested (accessibility)
    // Instead of reduced motion, check prefers-reduced-motion for accessibility, skip SFX
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    // Play only if allowed
    try {
      audio.play();
    } catch {}
  }
}

// On module load, initialize from persisted state
SoundManager.init();

export default SoundManager;
