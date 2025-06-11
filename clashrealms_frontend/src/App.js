import React, { useState, useCallback, useEffect } from "react";
import ClashRealmsMain from "./ClashRealmsMain";
import "./App.css";
import { SnackbarProvider } from "./Snackbar";
import DevPlayground from "./DevPlayground";

// PUBLIC_INTERFACE
function App() {
  // Hidden Dev Playground
  const [showPlayground, setShowPlayground] = useState(false);

  // Listen for Ctrl+Alt+D to show/hide dev playground (dev/test mode only!)
  const handleKeydown = useCallback((e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "d") {
      setShowPlayground(val => !val);
    }
  }, []);

  useEffect(() => {
    // Only enable in development or if window.DEV_PLAYGROUND === true
    // (Do not expose in production builds!)
    if (
      process.env.NODE_ENV === "development" ||
      window.DEV_PLAYGROUND === true
    ) {
      window.addEventListener("keydown", handleKeydown);
      return () => window.removeEventListener("keydown", handleKeydown);
    }
  }, [handleKeydown]);

  return (
    <React.StrictMode>
      <SnackbarProvider>
        <ClashRealmsMain />
        {/* Hidden Dev Playground Overlay */}
        {showPlayground && (
          <DevPlayground open={showPlayground} onClose={() => setShowPlayground(false)} />
        )}
      </SnackbarProvider>
    </React.StrictMode>
  );
}

export default App;