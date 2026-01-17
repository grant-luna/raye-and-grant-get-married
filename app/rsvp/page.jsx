"use client";

import { useEffect, useRef, useState } from "react";
import Container from "react-bootstrap/Container";

export default function RSVPPage() {
  const [name, setName] = useState("");

  const mirrorRef = useRef(null);
  const arrowRef = useRef(null);

  const showArrow = name.trim().length > 0;

  useEffect(() => {
    if (!mirrorRef.current || !arrowRef.current) return;

    const textWidth = mirrorRef.current.offsetWidth;

    // place arrow: start at center, move right by half the text width + padding
    arrowRef.current.style.left = "50%";
    arrowRef.current.style.transform = showArrow
      ? `translate(${textWidth / 2 + 12}px, -50%)`
      : "translate(0, -50%)";
  }, [name, showArrow]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = name.trim();
    if (!cleaned) return;

    console.log("RSVP name:", cleaned);
  };

  return (
    <main
      style={{
        minHeight: "100svh",
        backgroundColor: "#fbfaf7",
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <Container
        style={{
          paddingTop: 90,
          paddingBottom: 80,
          textAlign: "center",
        }}
      >
        <h1 className="font-header font-header--hero" style={{ marginBottom: 18 }}>
          RSVP
        </h1>

        <p
          className="font-subheader"
          style={{
            fontSize: 14,
            letterSpacing: "0.18em",
            opacity: 0.85,
            marginBottom: 36,
          }}
        >
          Please enter your full name
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 520,
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Hidden centered mirror text for measuring width */}
          <span
            ref={mirrorRef}
            aria-hidden
            style={{
              position: "absolute",
              visibility: "hidden",
              whiteSpace: "pre",
              fontFamily: "var(--font-body)",
              fontSize: 18,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {name || ""}
          </span>

          <input
            type="text"
            name="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="form-control"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(84, 79, 68, 0.35)",
              borderRadius: 0,
              textAlign: "center",
              padding: "14px 48px", // symmetric padding so arrow never overlaps
              fontFamily: "var(--font-body)",
              fontSize: 18,
              color: "#544f44",
              boxShadow: "none",
            }}
          />

          {/* Arrow submit (after text) */}
          <button
            ref={arrowRef}
            type="submit"
            aria-label="Submit RSVP name"
            style={{
              position: "absolute",
              top: "50%",
              opacity: showArrow ? 1 : 0,
              pointerEvents: showArrow ? "auto" : "none",
              transition: "opacity 0.3s ease, transform 0.3s ease",
              background: "none",
              border: "none",
              fontSize: 22,
              color: "#544f44",
              cursor: "pointer",
              lineHeight: 1,
              padding: 0,
            }}
          >
            →
          </button>
        </form>
      </Container>
    </main>
  );
}
