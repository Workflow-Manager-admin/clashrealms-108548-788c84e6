import React, { useRef, useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * ConfettiOverlay: Lightweight festive/confetti burst animation using Canvas.
 * Props: show (boolean), onDone (callback), triggerKey (changes to trigger effect), durationMs (hide after Xms)
 * Usage: Render where you want the celebration to appear/full screen, toggle show=true to fire.
 */
function ConfettiOverlay({ show, onDone, triggerKey, durationMs = 1350 }) {
  const ref = useRef();
  // Unique triggerKey allows triggering even if show:true multiple times

  useEffect(() => {
    if (!show) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // Resize
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti particle config
    const colors = ["#F7E164", "#3D7BBB", "#bc56f2", "#ff5f43", "#E87A41"];
    const count = 58;
    let particles = [];
    for (let i = 0; i < count; ++i) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -48 - Math.random() * 60,
        r: 5 + Math.random() * 8,
        color: colors[i % colors.length],
        dx: -2 + Math.random() * 4,
        dy: 2.3 + Math.random() * 2,
        rotate: Math.random() * 360,
        dRotate: (0.9 + Math.random() * 1.5) * (Math.random() < 0.5 ? 1 : -1)
      });
    }

    let running = true;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.save();
        ctx.beginPath();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotate * Math.PI) / 180);
        ctx.arc(0, 0, p.r, 0, 2 * Math.PI, false);
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#f3e868";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        // Move
        p.x += p.dx;
        p.y += p.dy;
        p.rotate += p.dRotate;
        // Sway horizontally a little
        p.x += Math.sin(p.y / 18) * 0.8;
      });
      if (running) requestAnimationFrame(draw);
    }
    draw();

    // End after given duration
    const timeout = setTimeout(() => {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onDone && onDone();
    }, durationMs);

    // Clean up
    return () => {
      running = false;
      clearTimeout(timeout);
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    // eslint-disable-next-line
  }, [show, triggerKey]);

  if (!show) return null;
  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
        zIndex: 9999
      }}
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

export default ConfettiOverlay;
