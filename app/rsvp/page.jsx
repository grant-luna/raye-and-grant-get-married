"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "react-bootstrap/Container";
import {
  findPartyMatchByName,
  submitPartyRSVP,
} from "../server-actions/rsvpActions";
import Link from "next/link";

function fullName(g) {
  return `${g.first_name} ${g.last_name}`.trim();
}

function formatNameList(names) {
  const list = (names || []).filter(Boolean);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}

export default function RSVPPage() {
  const [step, setStep] = useState("search"); // "search" | "party" | "dietary" | "confirm" | "thanks"
  const [query, setQuery] = useState("");
  const [match, setMatch] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [showDeclinePrompt, setShowDeclinePrompt] = useState(false);

  // ✅ NEW: show "couldn't find your party" prompt
  const [showNoMatchPrompt, setShowNoMatchPrompt] = useState(false);

  // Dietary restrictions per guest id
  const [dietaryByGuestId, setDietaryByGuestId] = useState({});

  // autosave-on-confirm helpers
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const lastSavedSignatureRef = useRef("");

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

  // DB SEARCH
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setSaveError("");

    const res = await findPartyMatchByName(q);

    // ✅ NEW: show friendly prompt instead of failing silently
    if (!res) {
      setShowNoMatchPrompt(true);
      return;
    }

    setShowNoMatchPrompt(false);
    setMatch(res);

    // pre-check based on existing rsvp_status
    const prechecked = new Set(
      (res.guests || [])
        .filter((g) => g.rsvp_status === "yes")
        .map((g) => g.id)
    );

    setSelectedIds(prechecked);

    // preload dietary restrictions from DB
    const nextDietary = {};
    (res.guests || []).forEach((g) => {
      nextDietary[g.id] = g.dietary_restrictions || "";
    });
    setDietaryByGuestId(nextDietary);

    setShowDeclinePrompt(false);
    setIsSaving(false);
    lastSavedSignatureRef.current = "";
    setStep("party");
  };

  const handleNotYou = () => {
    setStep("search");
    setMatch(null);
    setSelectedIds(new Set());
    setDietaryByGuestId({});
    setShowDeclinePrompt(false);
    setShowNoMatchPrompt(false);
    setSaveError("");
    setIsSaving(false);
    lastSavedSignatureRef.current = "";
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
    return "We think we found your party";
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
    const selectedCount = selectedNames.length;
    const partyCount = partyNames.length;

    // Decline
    if (selectedCount === 0) {
      return {
        line1: `${formatNameList(partyNames).toUpperCase()} REGRETFULLY DECLINE${
          partyCount === 1 ? "S" : ""
        }`,
        isAttending: false,
      };
    }

    // Attending
    return {
      line1: `${formatNameList(selectedNames).toUpperCase()} WILL BE JOINING US`,
      isAttending: true,
    };
  }, [selectedNames, partyNames]);

  const thanksCopy = useMemo(() => {
    const isAttending = selectedIds.size > 0;
    return {
      line1: "THANK YOU FOR RSVPING!",
      line2: isAttending
        ? "WE CAN’T WAIT TO CELEBRATE WITH YOU!"
        : "WE WILL MISS YOU",
    };
  }, [selectedIds]);

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
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      {side === "left" ? (
        <>
          <span style={{ fontSize: 22, color: ink, lineHeight: 1 }}>←</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 22, color: ink, lineHeight: 1 }}>→</span>
        </>
      )}
    </span>
  );

  const handleContinueFromParty = () => {
    // decline flow from 0 selected
    if (selectedIds.size === 0) {
      setShowDeclinePrompt(true);
      return;
    }
    setShowDeclinePrompt(false);
    setSaveError("");
    setStep("dietary");
  };

  const confirmDecline = () => {
    setShowDeclinePrompt(false);
    setSaveError("");
    setStep("confirm"); // entering confirm triggers autosave
  };

  const handleContinueFromDietary = () => {
    setSaveError("");
    setStep("confirm"); // entering confirm triggers autosave
  };

  // AUTOSAVE: as soon as we ENTER the confirm page
  useEffect(() => {
    const run = async () => {
      if (step !== "confirm") return;
      if (!match) return;

      const partyId = match.party?.id ?? "";
      const selected = Array.from(selectedIds).sort();

      // include dietary in signature so changes re-save
      const dietarySignature = selected
        .map((id) => `${id}:${(dietaryByGuestId[id] || "").trim()}`)
        .join("|");

      const signature = `${partyId}::${selected.join(",")}::${dietarySignature}`;

      if (signature && signature === lastSavedSignatureRef.current) return;

      try {
        setIsSaving(true);
        setSaveError("");

        const guestIdsInParty = (match.guests || []).map((g) => g.id);

        // only send dietary for selected guests
        const dietarySelected = {};
        selected.forEach((id) => {
          dietarySelected[id] = dietaryByGuestId[id] || "";
        });

        await submitPartyRSVP({
          partyId: match.party?.id ?? null,
          guestIdsInParty,
          selectedIds: selected, // may be empty => decline
          dietaryByGuestId: dietarySelected,
        });

        lastSavedSignatureRef.current = signature;
      } catch (err) {
        setSaveError("Something went wrong saving your RSVP. Please try again.");
      } finally {
        setIsSaving(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, match, selectedIds, dietaryByGuestId]);

  const handleContinueFromConfirm = () => {
    setStep("thanks");
  };

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

          if (step === "confirm")
            setStep(selectedIds.size > 0 ? "dietary" : "party");
          else if (step === "dietary") setStep("party");
          else if (step === "thanks") setStep("confirm");
          else handleNotYou();
        }}
        style={navBtnBase}
      >
        <ArrowLine side="left" />
        <span>
          {step === "confirm"
            ? "Not right? go back"
            : step === "dietary"
            ? "Go back"
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
            : step === "dietary"
            ? handleContinueFromDietary
            : step === "party"
            ? handleContinueFromParty
            : () => {}
        }
        style={{
          ...navBtnBase,
          visibility: step === "thanks" ? "hidden" : "visible",
          pointerEvents: step === "thanks" ? "none" : "auto",
          opacity: step === "confirm" && isSaving ? 0.45 : 0.9,
        }}
      >
        <span>{step === "confirm" && isSaving ? "Saving…" : "Continue"}</span>
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
            fontSize: "clamp(62px, 10vw, 96px)",
            marginBottom: 18,
            letterSpacing: ".3em",
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
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (showNoMatchPrompt) setShowNoMatchPrompt(false);
                }}
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
                  opacity: query.trim().length > 0 ? 1 : 0,
                  pointerEvents: query.trim().length > 0 ? "auto" : "none",
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

            {/* ✅ NEW: no-match prompt */}
            {showNoMatchPrompt && (
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
                  We&apos;re sorry, we couldn&apos;t find your party!
                  <br />
                  Please try again and make sure you enter your full name.
                  If you still can&apos;t find your party, please reach out to us.
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
                    onClick={() => setShowNoMatchPrompt(false)}
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
                    Okay
                  </button>
                </div>
              </div>
            )}
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
        ) : step === "dietary" ? (
          <>
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
              Please let us know about any
              <br />
              dietary restrictions or accommodations
            </p>

            <div style={{ maxWidth: 620, margin: "0 auto" }}>
              {selectedGuests.map((g) => (
                <div
                  key={g.id}
                  style={{
                    textAlign: "left",
                    marginBottom: 18,
                    paddingBottom: 18,
                    borderBottom: `1px solid ${thinRule}`,
                  }}
                >
                  <div
                    className="font-subheader"
                    style={{
                      fontSize: 13,
                      letterSpacing: "0.16em",
                      opacity: 0.85,
                      marginBottom: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    {fullName(g)}
                  </div>

                  <textarea
                    value={dietaryByGuestId[g.id] || ""}
                    onChange={(e) =>
                      setDietaryByGuestId((prev) => ({
                        ...prev,
                        [g.id]: e.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Optional (example: vegetarian, gluten-free, allergies, mobility accommodations, etc.)"
                    className="form-control"
                    style={{
                      background: "transparent",
                      border: `1px solid ${thinRule}`,
                      borderRadius: 0,
                      fontFamily: "var(--font-body)",
                      fontSize: 16,
                      color: ink,
                      boxShadow: "none",
                      padding: "12px 14px",
                    }}
                  />
                </div>
              ))}
            </div>

            {bottomNav}
          </>
        ) : step === "confirm" ? (
          <>
            <div style={{ marginTop: 10, maxWidth: 720, marginInline: "auto" }}>
              <p
                className="font-subheader"
                style={{ ...centerCopyStyle, marginBottom: 28 }}
              >
                {confirmCopy.line1}
              </p>

              {confirmCopy.line2 ? (
                <p
                  className="font-subheader"
                  style={{ ...centerCopyStyle, marginBottom: 10 }}
                >
                  {confirmCopy.line2}
                </p>
              ) : null}

              {saveError && (
                <p
                  className="font-subheader"
                  style={{
                    marginTop: 18,
                    fontSize: 12,
                    letterSpacing: "0.16em",
                    opacity: 0.75,
                    textTransform: "uppercase",
                    lineHeight: 1.8,
                    paddingInline: 10,
                  }}
                >
                  {saveError}
                </p>
              )}
            </div>

            {bottomNav}
          </>
        ) : (
          <>
            <div style={{ marginTop: 10, maxWidth: 720, marginInline: "auto" }}>
              <p
                className="font-subheader"
                style={{ ...centerCopyStyle, marginBottom: 18 }}
              >
                {thanksCopy.line1}
              </p>

              <p
                className="font-subheader"
                style={{ ...centerCopyStyle, marginBottom: 28 }}
              >
                {thanksCopy.line2}
              </p>

              <Link href="/">
                <button
                  type="button"
                  style={{
                    background: "transparent",
                    border: `1px solid ${thinRule}`,
                    color: ink,
                    borderRadius: 999,
                    padding: "12px 22px",
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Head Back to the Homepage
                </button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </main>
  );
}