import React, { useState, useRef, useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * FeedbackWidget: Modal to collect user feedback and optional rating, stores to localStorage.
 * Props:
 *   - isOpen: boolean (show/hide modal)
 *   - onClose: function (close modal)
 */
function FeedbackWidget({ isOpen, onClose }) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const feedbackRef = useRef();

  // Trap focus for accessibility
  useEffect(() => {
    if (isOpen && feedbackRef.current) {
      feedbackRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Save feedback to localStorage
  function handleSubmit(e) {
    e.preventDefault();
    if (!feedback.trim()) {
      setErrorMsg("Feedback can't be empty.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    setTimeout(() => {
      // Store as array in localStorage
      let prev = [];
      try {
        prev = JSON.parse(window.localStorage.getItem("cr_feedback") || "[]");
      } catch {}
      const entry = {
        text: feedback.trim(),
        rating: Number(rating),
        created: Date.now()
      };
      const updated = [...prev, entry];
      try {
        window.localStorage.setItem("cr_feedback", JSON.stringify(updated));
      } catch {}
      setSuccess(true);
      setSubmitting(false);
      setFeedback("");
      setRating(0);
    }, 350); // simulate async
  }

  function renderStars() {
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            type="button"
            aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
            key={n}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.7em",
              color: n <= rating ? "#f5c542" : "#ccc",
              cursor: "pointer",
              transition: "color 0.17s",
              outline: "none",
              lineHeight: "1"
            }}
            tabIndex={0}
            onClick={() => setRating(n)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") setRating(n);
            }}
            onFocus={e => (e.currentTarget.style.color = "#ffd72b")}
            onBlur={e => (e.currentTarget.style.color = n <= rating ? "#f5c542" : "#ccc")}
          >★</button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="cr-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Feedback Widget"
      tabIndex={-1}
      style={{ zIndex: 6000 }}
    >
      <form
        className="cr-popup-card"
        style={{ minWidth: 310, maxWidth: 380 }}
        tabIndex={0}
        onSubmit={handleSubmit}
      >
        <div className="cr-popup-header" style={{ marginBottom: 6 }}>
          <span>Send Feedback</span>
          <button
            className="cr-popup-close"
            aria-label="Close feedback modal"
            tabIndex={0}
            type="button"
            onClick={onClose}
            onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
            onBlur={e => (e.currentTarget.style.border = "none")}
            style={{ marginLeft: 10 }}
          >×</button>
        </div>
        {success ? (
          <div style={{ textAlign: "center", fontSize: "1.07em", color: "#3DBB3D", padding: "20px 0" }}>
            Thank you for your feedback! <br /><span aria-label="Thumbs up" style={{ fontSize: "1.6em" }}>👍</span>
            <button
              className="cr-btn-primary"
              type="button"
              style={{ marginTop: 13 }}
              onClick={() => { setSuccess(false); onClose(); }}
              tabIndex={0}
            >Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 9, color: "#4A2E0B", fontWeight: 600 }}>
              We’d love to hear your thoughts on the ClashRealms demo!
            </div>
            <label htmlFor="cr-feedback-text" style={{ fontWeight: 500 }}>
              Your Feedback
            </label>
            <textarea
              id="cr-feedback-text"
              ref={feedbackRef}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Enter your feedback here..."
              rows={4}
              required
              style={{
                width: "100%",
                borderRadius: 7,
                padding: "8px 10px",
                fontSize: "1em",
                border: "2px solid #F5C542",
                boxSizing: "border-box",
                marginBottom: 11,
                resize: "vertical",
                outline: "none"
              }}
              tabIndex={0}
              aria-label="Feedback input"
              onFocus={e => (e.currentTarget.style.border = "2px solid #3DBB3D")}
              onBlur={e => (e.currentTarget.style.border = "2px solid #F5C542")}
              disabled={submitting}
            />
            <label style={{ fontWeight: 500, marginTop: 2, marginBottom: 7, display: "inline-block" }}>
              Optional: Rate Demo
            </label>
            <div style={{ marginBottom: 11 }}>{renderStars()}</div>
            <button
              className="cr-btn-accent"
              type="submit"
              disabled={submitting || !feedback.trim()}
              style={{ fontWeight: 600, marginTop: 6, minWidth: 80 }}
              tabIndex={0}
            >
              {submitting ? "Sending..." : "Submit"}
            </button>
            {errorMsg && (
              <div style={{
                color: "#ac1b2f",
                background: "#ffe3e3",
                borderRadius: 7,
                padding: "5px 9px",
                marginTop: 6,
                textAlign: "center",
                fontSize: "0.96em"
              }}
                aria-live="assertive"
              >
                {errorMsg}
              </div>
            )}
            <div style={{ marginTop: 8, textAlign: "center", fontSize: "0.94em", color: "#756042" }}>
              Your feedback is saved in your browser.<br />
              No data is sent to any server.
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default FeedbackWidget;
