import React, { createContext, useCallback, useContext, useState, useEffect, useRef } from "react";
import "./Snackbar.css";

// CONTEXT: Allows app-wide notification
const SnackbarContext = createContext();

/**
 * PUBLIC_INTERFACE
 * SnackbarProvider: Wrap your app in this component to enable snackbars with useSnackbar().
 */
export function SnackbarProvider({ children }) {
  const [snacks, setSnacks] = useState([]); // {id, message, type, duration}

  // Add new snackbar
  const showSnackbar = useCallback((options) => {
    const id = Math.random().toString(36).slice(2);
    setSnacks(snacks => [
      ...snacks,
      {
        id,
        ...{
          message: typeof options === "string" ? options : options.message,
          type: options.type || "info", // "info", "success", "error"
          duration: options.duration || 3200,
        }
      }
    ]);
    return id;
  }, []);

  // Remove snackbar
  const dismiss = useCallback((id) => {
    setSnacks(snacks => snacks.filter(s => s.id !== id));
  }, []);

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      <>{children}</>
      <SnackbarContainer snacks={snacks} onDismiss={dismiss} />
    </SnackbarContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * useSnackbar: Hook to add notification toasts anywhere
 */
export function useSnackbar() {
  return useContext(SnackbarContext);
}

// The container for the toasts (bottom center overlay)
function SnackbarContainer({ snacks, onDismiss }) {
  return (
    <div className="cr-snackbar-list" role="region" aria-label="Notifications">
      {snacks.map(s => (
        <SnackbarItem key={s.id} {...s} onDismiss={() => onDismiss(s.id)} />
      ))}
    </div>
  );
}

// A single snackbar/toast
function SnackbarItem({ id, message, type, duration, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const timer = useRef();

  useEffect(() => {
    timer.current = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer.current);
  }, [duration]);

  // Remove after fadeout
  useEffect(() => {
    if (!visible) {
      const timeout = setTimeout(onDismiss, 210);
      return () => clearTimeout(timeout);
    }
  }, [visible, onDismiss]);

  // Keyboard: Escape closes
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && visible) setVisible(false);
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [visible]);

  // Focus: Allow tab focus for accessibility
  const snackbarRef = useRef();

  // ARIA: assertive region for errors, polite for info
  const ariaLive = type === "error" ? "assertive" : "polite";

  return (
    <div
      ref={snackbarRef}
      className={`cr-snackbar ${type} ${visible ? "open" : "closed"}`}
      role="status"
      aria-live={ariaLive}
      tabIndex={0}
      style={{ outline: "none" }}
      onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px #3DBB3D")}
      onBlur={e => (e.currentTarget.style.boxShadow = "none")}
      onKeyDown={e => {
        if (e.key === "Escape") setVisible(false);
        if (e.key === "Enter" || e.key === " ") setVisible(false);
      }}
      onClick={() => setVisible(false)}
    >
      {type === "error" && <span className="cr-snackbar-icon" aria-hidden="true">⚠️</span>}
      {type === "success" && <span className="cr-snackbar-icon" aria-hidden="true">✅</span>}
      {type === "info" && <span className="cr-snackbar-icon" aria-hidden="true">ℹ️</span>}
      <span className="cr-snackbar-msg">{message}</span>
      <button className="cr-snackbar-close" aria-label="Dismiss notification" tabIndex={0}
        onClick={e => { e.stopPropagation(); setVisible(false); }}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setVisible(false);}
        }}
      >×</button>
    </div>
  );
}
