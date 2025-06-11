import React, { useEffect, useState, useRef } from "react";

// PUBLIC_INTERFACE
/**
 * BattleReplay: Shows a fake/comical animated battle replay for engagement.
 * Props:
 *   - onReplayEnd: (optional) Called when replay finishes (e.g., for summary or reset)
 * Usage: <BattleReplay />
 *
 * Animates a set of mock battle events (troop deployment, attacks, explosions, resources) with simple transitions.
 */
const TROOP_ICONS = ["👹", "🏹", "🧙", "🛡️", "🤴", "👺"];
const STRUCTURE_ICONS = [
  { type: "cannon", icon: "🎯" },
  { type: "gold", icon: "⛃" },
  { type: "elixir", icon: "✦" },
  { type: "castle", icon: "🏰" }
];
const ANIMATION_TYPES = [
  "move",
  "attack",
  "explode",
  "steal_gold",
  "steal_elixir"
];

function randomEvent(tick, isLast) {
  // Randomly rotate between basic types but last event is always victory/defeat
  if (isLast) {
    return {
      type: "end",
      winner: Math.random() > 0.36 ? "player" : "enemy", // Player "wins" more often for fun
      loot: {
        gold: 30 + Math.floor(Math.random() * 80),
        elixir: 22 + Math.floor(Math.random() * 75)
      }
    };
  }
  const eventType = ANIMATION_TYPES[Math.floor(Math.random() * ANIMATION_TYPES.length)];
  switch (eventType) {
    case "move":
      return {
        type: "move",
        troop: TROOP_ICONS[Math.floor(Math.random() * TROOP_ICONS.length)],
        to: STRUCTURE_ICONS[Math.floor(Math.random() * STRUCTURE_ICONS.length)].type
      };
    case "attack":
      return {
        type: "attack",
        troop: TROOP_ICONS[Math.floor(Math.random() * TROOP_ICONS.length)],
        target: STRUCTURE_ICONS[Math.floor(Math.random() * STRUCTURE_ICONS.length)].type
      };
    case "explode":
      return {
        type: "explode",
        target: STRUCTURE_ICONS[Math.floor(Math.random() * STRUCTURE_ICONS.length)].type
      };
    case "steal_gold":
      return {
        type: "steal_gold",
        amount: 15 + Math.floor(Math.random() * 30)
      };
    case "steal_elixir":
      return {
        type: "steal_elixir",
        amount: 12 + Math.floor(Math.random() * 25)
      };
    default:
      return { type: "move", troop: "👹", to: "castle" };
  }
}

// ASCII for a mini battle field with troop positions (used as visual background)
function mapSvg() {
  return (
    <svg width="95" height="44" viewBox="0 0 95 44" style={{margin:'0 7px 0 0'}}>
      <rect x="0" y="0" width="95" height="44" rx="9" fill="#ffe690" stroke="#e0b742" strokeWidth="1.8"/>
      {/* Structures */}
      <text x="11" y="21" fontSize="1.6em">🎯</text>
      <text x="39" y="15" fontSize="1.32em">⛃</text>
      <text x="71" y="33" fontSize="1.3em">✦</text>
      <text x="39" y="39" fontSize="1.9em">🏰</text>
      {/* Simple battlefield lines (for path anims) */}
      <line x1="19" y1="23" x2="50" y2="35" stroke="#ab920a" strokeDasharray="4" strokeWidth="1.2"/>
      <line x1="50" y1="10" x2="74" y2="34" stroke="#bc56f299" strokeDasharray="5" strokeWidth="1.0"/>
    </svg>
  );
}

function eventDescription(evt) {
  // Human-readable event string
  switch (evt.type) {
    case "move":
      return `${evt.troop} advances towards ${evt.to === "cannon" ? "a Cannon" : evt.to === "gold" ? "the Gold Storage" : evt.to === "elixir" ? "the Elixir Storage" : "the Castle"}!`;
    case "attack":
      return `${evt.troop} attacks ${evt.target === "cannon" ? "a Cannon" : evt.target === "gold" ? "Gold Storage" : evt.target === "elixir" ? "Elixir Storage" : "Castle"}! 💥`;
    case "explode":
      return `Explosion at the ${evt.target === "cannon" ? "Cannon" : evt.target === "gold" ? "Gold" : evt.target === "elixir" ? "Elixir" : "Castle"}! 💣`;
    case "steal_gold":
      return `⚡ Stole ${evt.amount} Gold!`;
    case "steal_elixir":
      return `⚡ Stole ${evt.amount} Elixir!`;
    case "end":
      return evt.winner === "player"
        ? "Victory! 🏆"
        : "Defeat! 💀";
    default:
      return "";
  }
}

function randomMockBattleSequence() {
  // Return an array of mock events (5-8 steps + end)
  const n = 5 + Math.floor(Math.random() * 3);
  const arr = [];
  for (let i = 0; i < n; ++i) arr.push(randomEvent(i, false));
  arr.push(randomEvent(n, true));
  return arr;
}

function BattleReplay({ onReplayEnd }) {
  const [events] = useState(() => randomMockBattleSequence());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [running, setRunning] = useState(true);
  const timerRef = useRef();

  useEffect(() => {
    if (!running || finished) return;
    if (currentIndex >= events.length - 1) {
      timerRef.current = setTimeout(() => {
        setFinished(true);
        setRunning(false);
        if (onReplayEnd) onReplayEnd();
      }, 1100); // let final state show a moment
      return;
    }
    timerRef.current = setTimeout(() => {
      setCurrentIndex(idx => idx + 1);
    }, 1050);
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, finished, running, events, onReplayEnd]);

  // Replay/summary display
  function reset() {
    setCurrentIndex(0);
    setFinished(false);
    setRunning(true);
  }

  // Animate the current event visually
  const event = events[currentIndex];
  let animNode = null;
  switch (event.type) {
    case "move":
      animNode = (
        <span style={{
          position: 'absolute',
          left: 12 + (event.to === "gold" ? 26 : event.to === "elixir" ? 51 : event.to === "castle" ? 40 : 0),
          top: event.to === "cannon" ? 13 : event.to === "gold" ? 7 : event.to === "elixir" ? 31 : 35,
          fontSize: '2em',
          transition: "left 0.87s cubic-bezier(.49,2,.3,1.02), top .74s cubic-bezier(.38,1.1,.39,1.03)"
        }}>{event.troop}</span>
      );
      break;
    case "attack":
      animNode = (
        <span style={{
          position: 'absolute',
          left: 12 + (event.target === "gold" ? 26 : event.target === "elixir" ? 51 : event.target === "castle" ? 40 : 0),
          top: event.target === "cannon" ? 13 : event.target === "gold" ? 7 : event.target === "elixir" ? 31 : 35,
          fontSize: '2em',
          animation: "battle-flash .25s 2 alternate"
        }}>{event.troop}
          <span style={{
            fontSize: '1.1em',
            marginLeft: 5
          }}>💥</span>
        </span>
      );
      break;
    case "explode":
      animNode = (
        <span style={{
          position: 'absolute',
          left: 12 + (event.target === "gold" ? 26 : event.target === "elixir" ? 51 : event.target === "castle" ? 40 : 0),
          top: event.target === "cannon" ? 13 : event.target === "gold" ? 7 : event.target === "elixir" ? 31 : 36,
          fontSize: '2em',
          animation: "battle-explode .33s cubic-bezier(.58,2,.33,.97) 1"
        }}>💣</span>
      );
      break;
    case "steal_gold":
      animNode = (
        <span style={{
          position: 'absolute',
          left: 53,
          top: 4,
          fontSize: '1.4em',
          color: "#d4bd3d",
          animation: "battle-popup-up 0.9s"
        }}>
          +{event.amount} ⛃
        </span>
      );
      break;
    case "steal_elixir":
      animNode = (
        <span style={{
          position: 'absolute',
          left: 73,
          top: 31,
          fontSize: '1.4em',
          color: "#bc56f2",
          animation: "battle-popup-up 0.9s"
        }}>
          +{event.amount} ✦
        </span>
      );
      break;
    case "end":
      animNode = (
        <span
          style={{
            position: 'absolute',
            left: 40,
            top: 17,
            fontSize: '2.4em',
            animation: "battle-flash .32s 2 alternate"
          }}
        >{event.winner === "player" ? "🏆" : "💀"}
        </span>
      );
      break;
    default:
      animNode = null;
  }

  return (
    <div
      className="cr-battle-replay-ctr"
      style={{
        width: 320, maxWidth: "90vw",
        margin: "0 auto",
        padding: "16px 0",
        position: "relative"
      }}
      aria-label="Battle Replay"
      tabIndex={-1}
    >
      <div style={{
        background: "#fffcea",
        borderRadius: 19,
        border: "1.8px solid #e0b742",
        position: "relative",
        minHeight: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 13px auto",
        boxShadow: "0 3px 18px #dbc44117"
      }}>
        {/* Map SVG as background */}
        <div style={{ position: "relative", width: 95, height: 44 }}>
          {mapSvg()}
          {animNode}
        </div>
        {/* Currently described event */}
        <span style={{ marginLeft: 17, minHeight: 44, display: "inline-flex", alignItems: "center", fontSize: "1.08em", color: "#774809", fontWeight: 600, textShadow: "0 1.4px 5px #f5c54218" }}>
          {eventDescription(event)}
        </span>
      </div>

      {/* Progress event list */}
      <ol
        style={{
          margin: 0,
          padding: "0 8px 0 36px",
          fontSize: "1.03em",
          color: "#5b4412",
          minHeight: 88,
          lineHeight: 1.7,
          maxWidth: 290,
          listStyle: "decimal",
          wordBreak: "break-word"
        }}
        aria-live="polite"
      >
        {events.map((evt, idx) => (
          <li
            key={idx}
            style={{
              opacity: idx < currentIndex ? 0.5 : idx === currentIndex ? 1 : 0.42,
              fontWeight: idx === currentIndex ? 700 : 400,
              transition: "opacity 0.45s"
            }}
            aria-current={idx === currentIndex}
          >
            {eventDescription(evt)}
          </li>
        ))}
      </ol>

      {/* Summary/results at end */}
      {finished && (
        <div
          style={{
            marginTop: 13,
            padding: "12px 9px 5px 12px",
            background: "#f9f6e2",
            borderRadius: 13,
            border: "1.2px solid #e0b742"
          }}
        >
          <h4 style={{margin:"0 0 7px 0", color:"#43792b", fontWeight:700}}>
            {event.winner === "player" ? "Victory!" : "Defeat"}
          </h4>
          <div style={{fontSize:"1.07em", color:"#674f21"}}>
            Gold: <span style={{color:"#d4bd3d"}}>+{event.loot.gold}</span>,
            Elixir: <span style={{color:"#bc56f2"}}>+{event.loot.elixir}</span>
          </div>
          <button
            className="cr-btn-accent"
            style={{marginTop:7, fontSize:"1.06em"}}
            onClick={reset}
          >Replay</button>
        </div>
      )}

      {/* Simple animations for battle (CSS inlined for component scope) */}
      <style>{`
      @keyframes battle-popup-up {
        0% { opacity: 0; transform: translateY(0px) scale(0.97);}
        16% { opacity: 1; transform: translateY(-4px) scale(1.03);}
        92% { opacity: 1; transform: translateY(-24px) scale(.98);}
        100% { opacity: 0; transform: translateY(-32px) scale(.94);}
      }
      @keyframes battle-flash {
        0% { filter: brightness(1);}
        100% { filter: brightness(2.0) drop-shadow(0 0 10px #fff57a);}
      }
      @keyframes battle-explode {
        0% { transform: scale(0.85) rotate(-14deg);}
        80% { transform: scale(1.5) rotate(14deg);}
        100% { opacity: 0.4; transform: scale(0.61) rotate(-10deg);}
      }
      `}</style>
    </div>
  );
}

export default BattleReplay;
