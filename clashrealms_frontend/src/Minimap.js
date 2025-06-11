import React from "react";

/**
 * PUBLIC_INTERFACE
 * Minimap: A small schematic/overview thumbnail of the entire village.
 * Props:
 *  - buildings: array of building state objects (with key, level, etc)
 *  - width, height: size of the minimap in px
 * 
 * Usage: <Minimap buildings={...} width={130} height={130} />
 */
function Minimap({ buildings = [], width = 130, height = 130 }) {
  // Layout schematic: For simplicity, arrange 4 buildings in a grid (1:1 to main UI order)
  // This can be enhanced to match actual spatial layout if logic exists.
  // Building icons (match main grid conceptually)
  const buildingIcons = {
    goldmine: "⛏️",
    armycamp: "⚔️",
    cannon: "🎯",
    townhall: "🏰"
  };

  // Grid mapping: top left, top right, bottom left, bottom right
  const positions = [
    { x: 0.15, y: 0.15 }, // top left
    { x: 0.74, y: 0.17 }, // top right
    { x: 0.21, y: 0.71 }, // bottom left
    { x: 0.74, y: 0.7 }   // bottom right
  ];

  return (
    <div
      className="cr-minimap-overview"
      style={{
        width,
        height,
        background: "linear-gradient(135deg, #fffcea 70%, #ffe690 100%)",
        border: "2px solid #e0b742",
        borderRadius: 16,
        boxShadow: "0 2px 14px #dac44133",
        position: "relative",
        margin: 2,
        overflow: "hidden",
        touchAction: "manipulation",
        userSelect: "none"
      }}
      aria-label="Village Minimap Overview"
      tabIndex={0}
    >
      {/* Grid/map squares for minimal schematic */}
      <svg width={width} height={height} style={{position:"absolute",top:0,left:0,zIndex:0}}>
        <rect x={0} y={0} width={width} height={height}
          fill="url(#cr-mm-bg)" stroke="#ecd853" strokeWidth="1.5" rx="13"/>
        {/* Crossing lines for grid */}
        <line x1={width/2} y1={10} x2={width/2} y2={height-10} stroke="#f5c54255" strokeWidth="2"/>
        <line x1={10} y1={height/2} x2={width-10} y2={height/2} stroke="#f5c54255" strokeWidth="2"/>
      </svg>

      {buildings.map((b, i) => {
        const pos = positions[i] || { x:0.4, y:0.4 };
        const icon = buildingIcons[b.key] || "🏠";
        return (
          <div
            key={b.key}
            style={{
              position: "absolute",
              left: Math.round(pos.x * width),
              top: Math.round(pos.y * height),
              transform: "translate(-50%, -50%)",
              width: 32,
              height: 32,
              background: "#fff9e0",
              border: "2.5px solid #F5C542",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.48em",
              fontWeight: 700,
              color: "#4A2E0B",
              zIndex: 1,
              boxShadow: b.upgrading ? "0 0 8px #3DBB3D88" : "none",
              opacity: b.upgrading ? 0.9 : 1,
              transition: "border 0.14s, box-shadow 0.16s"
            }}
            title={b.label + (b.level ? ` Lv.${b.level}` : "")}
            aria-label={b.label + (b.level ? ` (Level ${b.level})` : "")}
            tabIndex={-1}
          >
            <span role="img" aria-hidden="true">{icon}</span>
          </div>
        );
      })}
      {/* Minimap border/label */}
      <span
        style={{
          position: "absolute",
          left: 8,
          bottom: 3,
          fontSize: "0.92em",
          color: "#b5982a",
          fontWeight: 600,
          letterSpacing: ".5px",
          opacity: 0.77
        }}
        aria-hidden="true"
      >
        Overview
      </span>
    </div>
  );
}

export default Minimap;
