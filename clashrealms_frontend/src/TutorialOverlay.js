import React, { useEffect } from "react";
import "./TutorialOverlay.css";

/**
 * PUBLIC_INTERFACE
 * TutorialOverlay: Provides a multi-step UI tutorial with highlighted areas and modal tips.
 * Props:
 *   - steps: array of { title, description, selector, position }
 *   - currentStep: index of active step
 *   - onNext: function to go to next step
 *   - onPrev: function to go to previous step
 *   - onClose: function to close tutorial
 */
function TutorialOverlay({ steps, currentStep, onNext, onPrev, onClose }) {
  const step = steps[currentStep];

  // Scroll and focus target on each step
  useEffect(() => {
    if (!step) return;
    if (step.selector) {
      const el = document.querySelector(step.selector);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.focus && el.focus();
      }
    }
  }, [step]);

  // Overlay highlight position
  let highlightRect = null;
  if (step && step.selector) {
    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      highlightRect = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      };
    }
  }

  return (
    <div className="cr-tutorial-overlay">
      {/* Shaded background */}
      <div className="cr-tutorial-bg"></div>

      {/* Highlight area */}
      {highlightRect && (
        <div
          className="cr-tutorial-highlight"
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height
          }}
        ></div>
      )}
      {/* Step modal */}
      <div
        className="cr-tutorial-tip"
        style={
          highlightRect && step.position === "right"
            ? {
                top: highlightRect.top,
                left: highlightRect.left + highlightRect.width + 16
              }
            : highlightRect && step.position === "below"
            ? {
                top: highlightRect.top + highlightRect.height + 16,
                left: highlightRect.left
              }
            : { }
        }
      >
        <div className="cr-tutorial-title">{step?.title}</div>
        <div className="cr-tutorial-desc">{step?.description}</div>
        <div className="cr-tutorial-controls">
          {currentStep > 0 && (
            <button className="cr-btn-accent" onClick={onPrev}>
              ← Back
            </button>
          )}
          <button
            className="cr-btn-primary"
            onClick={currentStep === steps.length - 1 ? onClose : onNext}
            style={{ marginLeft: 8 }}
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next →"}
          </button>
          <button
            className="cr-btn-accent"
            style={{ marginLeft: 12 }}
            onClick={onClose}
            tabIndex={-1}
          >Skip Tutorial</button>
        </div>
      </div>
    </div>
  );
}

export default TutorialOverlay;
