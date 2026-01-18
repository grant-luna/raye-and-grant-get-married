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

function formatNameList(names) {
  const list = (names || []).filter(Boolean);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}

export default function RSVPPage() {
  // ✅ added "thanks" step
  const [step, setStep] = useState("search"); // "search" | "party" | "confirm" | "thanks"
  const [query, setQuery] = useState("");
  const [match, setMatch] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // ✅ decline confirmation prompt
  const [showDeclinePrompt, setShowDeclinePrompt] = useState(false);

  // refs for arrow positioning
  const mirrorRef = useRef(null);
  const arrowBtnRef = useRef(null);
  const inputRef = useRef(null);

  const showArrow = query.trim().length > 0;
  const ARROW_GAP_PX = 18;

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

    setSelectedIds(new Set());
    setShowDeclinePrompt(false);
    setStep("party");
  };

  const handleNotYou = () => {
    setStep("search");
    setMatch(null);
    setSelectedIds(new Set());
    setShowDeclinePrompt(false);
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confidenceText = useMemo(() => {
    if (!match) return "";
    const c = match.confidence;
    if (c >= 0.9) return "We found your party";
    if (c >= 0.75) return "We think we found your party";
    return "We found a possible match";
  }, [match]);

  const selectedGuests = useMemo(() => {
    if (!match) return [];
    return match.guests.filter((g) => selectedIds.has(g.id));
  }, [match, selectedIds]);

  const selectedNames = useMemo(
    () => selectedGuests.map(fullName),
    [selectedGuests]
  );

  const partyNames = useMemo(() => {
    if (!match) return [];
    return match.guests.map(fullName);
  }, [match]);

  const confirmCopy = useMemo(() => {
    const count = selectedNames.length;

    if (count === 0) {
      return {
        line1: formatNameList(partyNames).toUpperCase(),
        line2: "REGRETFULLY DECLINE",
        isAttending: false,
      };
    }

    return {
      line1: `${formatNameList(selectedNames).toUpperCase()} WILL BE`,
      line2: "CELEBRATING WITH US!",
      isAttending: true,
    };
  }, [selectedNames, partyNames]);

  // ✅ thank-you page copy logic (matches screenshot)
  const thanksCopy = useMemo(() => {
    const isAttending = selectedIds.size > 0;
    return {
      line1: "THANK YOU FOR RSVPING!",
      line2: isAttending ? "WE CAN’T WAIT TO CELEBRATE WITH YOU!" : "WE WILL MISS YOU",
    };
  }, [selectedIds]);

  // Wedding typography
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

  const handleContinueFromParty = () => {
    if (selectedIds.size === 0) {
      setShowDeclinePrompt(true);
      return;
    }
    setShowDeclinePrompt(false);
    setStep("confirm");
  };

  const confirmDecline = () => {
    setShowDeclinePrompt(false);
    setStep("confirm");
  };

  // ✅ now "Continue" from confirm navigates to thanks page
  const handleContinueFromConfirm = () => {
    setStep("thanks");
  };

  // ✅ (optional) you can call your submit here; for now we just log once on thanks entry
  useEffect(() => {
    if (step !== "thanks" || !match) return;
    const selected = match.guests.filter((g) => selectedIds.has(g.id));
    console.log("RSVP Submitted:", {
      party: match.party,
      attending: selected.map(fullName),
      declined: selected.length === 0,
    });
  }, [step, match, selectedIds]);

  const bottomNav = (
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
        onClick={() => {
          setShowDeclinePrompt(false);

          if (step === "confirm") setStep("party");
          else if (step === "thanks") setStep("confirm");
          else handleNotYou();
        }}
        style={navBtnBase}
      >
        <ArrowLine side="left" />
        <span>
          {step === "confirm"
            ? "Not right? go back"
            : step === "thanks"
            ? "Go back"
            : "Not you? go back"}
        </span>
      </button>

      <button
        type="button"
        onClick={
          step === "confirm"
            ? handleContinueFromConfirm
            : step === "party"
            ? handleContinueFromParty
            : () => {}
        }
        style={{
          ...navBtnBase,
          visibility: step === "thanks" ? "hidden" : "visible",
          pointerEvents: step === "thanks" ? "none" : "auto",
        }}
      >
        <span>Continue</span>
        <ArrowLine side="right" />
      </button>
    </div>
  );

  const centerCopyStyle = {
    fontSize: 15,
    letterSpacing: "0.20em",
    opacity: 0.75,
    textTransform: "uppercase",
    lineHeight: 1.9,
    paddingInline: 10,
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
        ) : step === "party" ? (
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

            {showDeclinePrompt && (
              <div
                style={{
                  maxWidth: 560,
                  margin: "26px auto 0",
                  padding: "18px 16px",
                  borderTop: `1px solid ${thinRule}`,
                  borderBottom: `1px solid ${thinRule}`,
                }}
              >
                <p
                  className="font-subheader"
                  style={{
                    margin: 0,
                    fontSize: 13,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                    lineHeight: 1.8,
                  }}
                >
                  It looks like no one is selected.
                  <br />
                  Would you like to politely decline the invitation?
                </p>

                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowDeclinePrompt(false)}
                    style={{
                      background: "transparent",
                      border: `1px solid ${thinRule}`,
                      color: ink,
                      borderRadius: 999,
                      padding: "10px 18px",
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    }}
                  >
                    No, go back
                  </button>

                  <button
                    type="button"
                    onClick={confirmDecline}
                    style={{
                      background: ink,
                      border: `1px solid ${ink}`,
                      color: "#fbfaf7",
                      borderRadius: 999,
                      padding: "10px 18px",
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    }}
                  >
                    Yes, decline
                  </button>
                </div>
              </div>
            )}

            {bottomNav}
          </>
        ) : step === "confirm" ? (
          <>
            <div style={{ marginTop: 10, maxWidth: 720, marginInline: "auto" }}>
              <p className="font-subheader" style={{ ...centerCopyStyle, marginBottom: 28 }}>
                {confirmCopy.line1}
              </p>

              <p className="font-subheader" style={{ ...centerCopyStyle, marginBottom: 10 }}>
                {confirmCopy.line2}
              </p>
            </div>

            {bottomNav}
          </>
        ) : (
          // ✅ THANK YOU PAGE (matches screenshot + logic)
          <>
            <div style={{ marginTop: 10, maxWidth: 720, marginInline: "auto" }}>
              <p
                className="font-subheader"
                style={{
                  ...centerCopyStyle,
                  marginBottom: 18,
                }}
              >
                {thanksCopy.line1}
              </p>

              <p
                className="font-subheader"
                style={{
                  ...centerCopyStyle,
                  marginBottom: 18,
                }}
              >
                {thanksCopy.line2}
              </p>
            </div>

            {/* no nav on thank-you page (like screenshot) */}
          </>
        )}
      </Container>
    </main>
  );
}
