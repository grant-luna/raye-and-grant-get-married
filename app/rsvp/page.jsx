"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "react-bootstrap/Container";

const MOCK_PARTIES = [
  { id: "p1", name: "Luna Party" },
  { id: "p2", name: "Smith Party" },
];

const MOCK_GUESTS = [
  { id: "g1", first_name: "Grant", last_name: "Luna", party_id: "p1" },
  { id: "g2", first_name: "Raye", last_name: "Robinson", party_id: "p1" },
  { id: "g3", first_name: "John", last_name: "Smith", party_id: "p2" },
  { id: "g4", first_name: "Jane", last_name: "Smith", party_id: "p2" },
];

function fullName(g) {
  return `${g.first_name} ${g.last_name}`.trim();
}

function similarityScore(input, candidate) {
  const clean = (s) => s.toLowerCase().replace(/[^a-z\s]/g, "").trim();

  const A = clean(input);
  const B = clean(candidate);
  if (!A || !B) return 0;
  if (A === B) return 1;

  const aTokens = A.split(/\s+/).filter(Boolean);
  const bTokens = B.split(/\s+/).filter(Boolean);

  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);

  let overlap = 0;
  for (const t of aSet) if (bSet.has(t)) overlap++;

  const tokenScore = overlap / Math.max(aSet.size, bSet.size);

  const prefixLen = Math.min(A.length, B.length);
  let prefixMatch = 0;
  for (let i = 0; i < prefixLen; i++) {
    if (A[i] === B[i]) prefixMatch++;
    else break;
  }
  const prefixScore = prefixMatch / Math.max(A.length, B.length);

  return Math.min(1, tokenScore * 0.7 + prefixScore * 0.3);
}

function pct(n) {
  return Math.round(n * 100);
}

export default function RSVPPage() {
  const [step, setStep] = useState("search"); // "search" | "party"
  const [query, setQuery] = useState("");
  const [match, setMatch] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // refs for arrow positioning
  const mirrorRef = useRef(null);
  const arrowBtnRef = useRef(null);
  const inputRef = useRef(null);

  const showArrow = query.trim().length > 0;
  const ARROW_GAP_PX = 18;

  // Position arrow after centered text, clamped for mobile
  useEffect(() => {
    if (!mirrorRef.current || !arrowBtnRef.current || !inputRef.current) return;

    const positionArrow = () => {
      const textWidth = mirrorRef.current?.offsetWidth ?? 0;
      const inputWidth = inputRef.current?.offsetWidth ?? 0;

      const desiredOffset = textWidth / 2 + ARROW_GAP_PX;

      const paddingSide = 16;
      const maxOffset = Math.max(0, inputWidth / 2 - paddingSide - 10);

      const offset = Math.min(desiredOffset, maxOffset);

      arrowBtnRef.current.style.left = "50%";
      arrowBtnRef.current.style.top = "50%";
      arrowBtnRef.current.style.transform = showArrow
        ? `translate(-50%, -50%) translateX(${offset}px)`
        : "translate(-50%, -50%) translateX(0)";
    };

    positionArrow();
    const raf = requestAnimationFrame(positionArrow);
    return () => cancelAnimationFrame(raf);
  }, [query, showArrow, step]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    let best = null;
    for (const g of MOCK_GUESTS) {
      const score = similarityScore(q, fullName(g));
      if (!best || score > best.score) best = { guest: g, score };
    }
    if (!best) return;

    const party =
      MOCK_PARTIES.find((p) => p.id === best.guest.party_id) || {
        id: best.guest.party_id,
        name: "Your Party",
      };

    const partyGuests = MOCK_GUESTS.filter((g) => g.party_id === party.id);

    setMatch({
      party,
      guests: partyGuests,
      matchedGuest: best.guest,
      confidence: best.score,
    });

    // ✅ Unchecked by default
    setSelectedIds(new Set());
    setStep("party");
  };

  const handleNotYou = () => {
    setStep("search");
    setMatch(null);
    setSelectedIds(new Set());
    // keep query so they can edit
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    if (!match) return;
    const selectedGuests = match.guests.filter((g) => selectedIds.has(g.id));
    console.log("Party:", match.party);
    console.log("Selected guests:", selectedGuests);
  };

  const confidenceText = useMemo(() => {
    if (!match) return "";
    const c = match.confidence;
    if (c >= 0.9) return "We found your party";
    if (c >= 0.75) return "We think we found your party";
    return "We found a possible match";
  }, [match]);

  // Shared “wedding site” typography feel
  const ink = "#544f44";
  const thinRule = "rgba(84, 79, 68, 0.35)";

  const navBtnBase = {
    background: "none",
    border: "none",
    padding: 0,
    color: ink,
    cursor: "pointer",
    fontSize: 13,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontFamily: "var(--font-body)",
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    opacity: 0.9,
    lineHeight: 1.1,
  };

  const ArrowLine = ({ side = "left" }) => (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {side === "left" ? (
        <>
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
          <span style={{ width: 44, height: 1, background: ink, opacity: 0.65 }} />
        </>
      ) : (
        <>
          <span style={{ width: 44, height: 1, background: ink, opacity: 0.65 }} />
          <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
        </>
      )}
    </span>
  );

  return (
    <main
      style={{
        minHeight: "100svh",
        backgroundColor: "#fbfaf7",
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <Container style={{ paddingTop: 90, paddingBottom: 80, textAlign: "center" }}>
        <h1
          className="font-header"
          style={{
            fontSize: "clamp(56px, 6vw, 72px)",
            marginBottom: 18,
          }}
        >
          RSVP
        </h1>

        {step === "search" ? (
          <>
            <p
              className="font-subheader"
              style={{
                fontSize: 14,
                letterSpacing: "0.18em",
                opacity: 0.85,
                marginBottom: 36,
                textTransform: "uppercase",
              }}
            >
              Please enter your full name
            </p>

            <form
              onSubmit={handleSearchSubmit}
              style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}
            >
              {/* Mirror text for measuring width */}
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
                {query || ""}
              </span>

              <input
                ref={inputRef}
                type="text"
                name="fullName"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="name"
                className="form-control"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${thinRule}`,
                  borderRadius: 0,
                  textAlign: "center",
                  padding: "14px 16px",
                  fontFamily: "var(--font-body)",
                  fontSize: 18,
                  color: ink,
                  boxShadow: "none",
                }}
              />

              <button
                ref={arrowBtnRef}
                type="submit"
                aria-label="Search"
                style={{
                  position: "absolute",
                  opacity: showArrow ? 1 : 0,
                  pointerEvents: showArrow ? "auto" : "none",
                  transition: "opacity 0.25s ease, transform 0.25s ease",
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: ink,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                →
              </button>
            </form>
          </>
        ) : (
          <>
            <p
              className="font-subheader"
              style={{
                fontSize: 14,
                letterSpacing: "0.18em",
                opacity: 0.85,
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              {confidenceText}
            </p>

            <p
              className="font-subheader"
              style={{
                fontSize: 14,
                letterSpacing: "0.18em",
                opacity: 0.85,
                marginBottom: 26,
                textTransform: "uppercase",
                lineHeight: 1.8,
              }}
            >
              Please select the people in your party
              <br />
              who will be attending
            </p>

            <div
              className="font-subheader"
              style={{
                fontSize: 13,
                letterSpacing: "0.16em",
                opacity: 0.65,
                marginBottom: 22,
                textTransform: "uppercase",
              }}
            >
              {match?.party?.name}
              {match?.confidence != null ? `  ·  ${pct(match.confidence)}%` : ""}
            </div>

            {/* ✅ Centered guests + centered checkboxes (mobile-first) */}
            <div
              style={{
                maxWidth: 520,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              {match?.guests?.map((g) => {
                const checked = selectedIds.has(g.id);
                return (
                  <label
                    key={g.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 18,
                      cursor: "pointer",
                      userSelect: "none",
                      width: "100%",
                    }}
                  >
                    {/* Custom checkbox to match the thin square look */}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelected(g.id)}
                      style={{
                        width: 22,
                        height: 22,
                        appearance: "none",
                        WebkitAppearance: "none",
                        border: `1px solid ${thinRule}`,
                        background: "transparent",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      className="font-subheader"
                      style={{
                        fontSize: 18,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: ink,
                      }}
                    >
                      {fullName(g)}
                    </span>

                    {/* Add a subtle check indicator (only visible when checked) */}
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        opacity: 0,
                        pointerEvents: "none",
                      }}
                    />
                    <style jsx>{`
                      input[type="checkbox"]:checked {
                        border-color: rgba(84, 79, 68, 0.55);
                      }
                      input[type="checkbox"]:checked::after {
                        content: "";
                        width: 10px;
                        height: 10px;
                        background: ${ink};
                        opacity: 0.7;
                        display: block;
                      }
                    `}</style>
                  </label>
                );
              })}
            </div>

            {/* ✅ Bottom nav, swapped to match screenshot: left = Not you? go back, right = Continue */}
            <div
              style={{
                maxWidth: 720,
                margin: "34px auto 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                paddingInline: 6,
              }}
            >
              <button
                type="button"
                onClick={handleNotYou}
                style={navBtnBase}
              >
                <ArrowLine side="left" />
                <span>Not you? go back</span>
              </button>

              <button
                type="button"
                onClick={handleContinue}
                disabled={selectedIds.size === 0}
                style={{
                  ...navBtnBase,
                  opacity: selectedIds.size === 0 ? 0.35 : 0.9,
                  cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
                }}
              >
                <span>Continue</span>
                <ArrowLine side="right" />
              </button>
            </div>
          </>
        )}
      </Container>
    </main>
  );
}
