import React from "react";
import ClashRealmsMain from "./ClashRealmsMain";
import "./App.css";
import { SnackbarProvider } from "./Snackbar";

// PUBLIC_INTERFACE
function App() {
  return (
    <React.StrictMode>
      <SnackbarProvider>
        <ClashRealmsMain />
      </SnackbarProvider>
    </React.StrictMode>
  );
}

export default App;