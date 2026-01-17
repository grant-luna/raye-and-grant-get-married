"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "react-bootstrap/Container";

/**
 * MOCK DB SHAPE (matches your Neon tables)
 * parties: { id, name }
 * guests:  { id, first_name, last_name, party_id }
 */
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

/**
 * Frontend placeholder similarity (0..1)
 * Later: server-side similarity (pg_trgm / levenshtein) and return:
 * { party, guests, confidence, matchedGuest }
 */
function similarityScore(input, candidate) {
  const clean = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim();

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

  // prefix bias helps partial typing
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
  // match = { party, guests, matchedGuest, confidence }

  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // Arrow-after-text overlay (clickable + mobile-safe)
  const mirrorRef = useRef(null);
  const arrowBtnRef = useRef(null);

  const showArrow = query.trim().length > 0;

  // Compute position for arrow after centered text, with controllable spacing.
  // This version is stable because it "rides" in a centered overlay.
  const ARROW_GAP_PX = 18;

  useEffect(() => {
    if (!mirrorRef.current || !arrowBtnRef.current) return;

    const textWidth = mirrorRef.current.offsetWidth;

    // Move arrow to the end of centered text + gap
    arrowBtnRef.current.style.transform = showArrow
      ? `translateX(${textWidth / 2 + ARROW_GAP_PX}px)`
      : "translateX(0)";
  }, [query, showArrow]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Later: replace with server action returning best party match
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

    // Default: select everyone in party (common RSVP flow)
    setSelectedIds(new Set(partyGuests.map((g) => g.id)));

    setStep("party");
  };

  const handleNotYou = () => {
    setStep("search");
    setMatch(null);
    setSelectedIds(new Set());
    // keep query so they can edit quickly:
    // setQuery("");
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

    // Later: submit selected guests RSVP via server action
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
              }}
            >
              Please enter your full name
            </p>

            <form
              onSubmit={handleSearchSubmit}
              style={{
                maxWidth: 520,
                margin: "0 auto",
                position: "relative",
              }}
            >
              {/* Hidden mirror text for measuring width */}
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
                type="text"
                name="fullName"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="name"
                className="form-control"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(84, 79, 68, 0.35)",
                  borderRadius: 0,
                  textAlign: "center",
                  padding: "14px 16px",
                  fontFamily: "var(--font-body)",
                  fontSize: 18,
                  color: "#544f44",
                  boxShadow: "none",
                }}
              />

              {/* Centered overlay that holds the arrow "inline" */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "100%",
                  pointerEvents: "none", // allow typing without weird overlay clicks
                }}
              >
                <button
                  ref={arrowBtnRef}
                  type="submit"
                  aria-label="Search"
                  style={{
                    pointerEvents: showArrow ? "auto" : "none", // button still clickable
                    background: "none",
                    border: "none",
                    fontSize: 22,
                    color: "#544f44",
                    opacity: showArrow ? 1 : 0,
                    transition: "opacity 0.25s ease, transform 0.25s ease",
                    cursor: "pointer",
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  →
                </button>
              </div>
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
              }}
            >
              Select the members of your party that will be attending
            </p>

            <div
              className="font-subheader"
              style={{
                fontSize: 14,
                letterSpacing: "0.16em",
                opacity: 0.65,
                marginBottom: 22,
              }}
            >
              {match?.party?.name}
              {match?.confidence != null ? `  ·  ${pct(match.confidence)}%` : ""}
            </div>

            <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "left" }}>
              {match?.guests?.map((g) => {
                const checked = selectedIds.has(g.id);
                return (
                  <label
                    key={g.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      padding: "10px 6px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelected(g.id)}
                      style={{
                        width: 26,
                        height: 26,
                        accentColor: "#544f44",
                        cursor: "pointer",
                        flex: "0 0 auto",
                      }}
                    />

                    <span
                      className="font-subheader"
                      style={{
                        fontSize: 22,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#544f44",
                      }}
                    >
                      {fullName(g)}
                    </span>
                  </label>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 26,
                display: "flex",
                justifyContent: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleContinue}
                disabled={selectedIds.size === 0}
                style={{
                  borderRadius: 999,
                  padding: "10px 26px",
                  backgroundColor: "#544f44",
                  borderColor: "#544f44",
                  opacity: selectedIds.size === 0 ? 0.5 : 1,
                  cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
                }}
              >
                Continue
              </button>

              <button
                type="button"
                className="btn"
                onClick={handleNotYou}
                style={{
                  borderRadius: 999,
                  padding: "10px 18px",
                  background: "transparent",
                  border: "1px solid rgba(84, 79, 68, 0.35)",
                  color: "#544f44",
                }}
              >
                Not you?
              </button>
            </div>
          </>
        )}
      </Container>
    </main>
  );
}
