"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "react-bootstrap/Container";
import {
  getPartiesWithGuests,
  createParty,
  updateParty,
  deleteParty,
  createGuest,
  updateGuest,
  deleteGuest,
} from "../server-actions/adminActions";

function fullName(g) {
  return `${g.first_name} ${g.last_name}`.trim();
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState([]);

  // Party create
  const [newPartyName, setNewPartyName] = useState("");

  // Edit party
  const [editingPartyId, setEditingPartyId] = useState(null);
  const [editingPartyName, setEditingPartyName] = useState("");

  // Guest create per party (keep it simple in one object)
  const [newGuestByParty, setNewGuestByParty] = useState({}); // { [partyId]: { first,last } }

  // Guest edit
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editingGuest, setEditingGuest] = useState({
    first_name: "",
    last_name: "",
    dietary_restrictions: "",
    rsvp_status: "",
    party_id: "",
  });

  const ink = "#544f44";
  const thinRule = "rgba(84, 79, 68, 0.35)";

  async function refresh() {
    setLoading(true);
    try {
      const res = await getPartiesWithGuests(adminPassword);
      if (!res?.ok) {
        setAuthed(false);
        setAuthError("Incorrect admin password.");
        setParties([]);
        return;
      }
      setParties(res.parties || []);
    } finally {
      setLoading(false);
    }
  }

  const partyOptions = useMemo(() => {
    return (parties || []).map((p) => ({ id: p.id, name: p.name }));
  }, [parties]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthed(true);
    // try loading; if password wrong, refresh() will kick you back
    await refresh();
  };

  useEffect(() => {
    if (!authed) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------
  // Party actions
  // -----------------------
  const onCreateParty = async (e) => {
    e.preventDefault();
    const name = newPartyName.trim();
    if (!name) return;

    await createParty({ admin_password: adminPassword, name });
    setNewPartyName("");
    await refresh();
  };

  const startEditParty = (p) => {
    setEditingPartyId(p.id);
    setEditingPartyName(p.name || "");
  };

  const saveEditParty = async () => {
    const name = editingPartyName.trim();
    if (!editingPartyId || !name) return;

    await updateParty({
      admin_password: adminPassword,
      party_id: editingPartyId,
      name,
    });

    setEditingPartyId(null);
    setEditingPartyName("");
    await refresh();
  };

  const onDeleteParty = async (partyId) => {
    const ok = window.confirm(
      "Delete this party? This will also delete all guests in it."
    );
    if (!ok) return;

    await deleteParty({ admin_password: adminPassword, party_id: partyId });
    await refresh();
  };

  // -----------------------
  // Guest actions
  // -----------------------
  const onCreateGuest = async (partyId, e) => {
    e.preventDefault();
    const draft = newGuestByParty[partyId] || {};
    const first = String(draft.first_name || "").trim();
    const last = String(draft.last_name || "").trim();
    if (!first || !last) return;

    await createGuest({
      admin_password: adminPassword,
      party_id: partyId,
      first_name: first,
      last_name: last,
      rsvp_status: null,
      dietary_restrictions: null,
    });

    setNewGuestByParty((prev) => ({
      ...prev,
      [partyId]: { first_name: "", last_name: "" },
    }));

    await refresh();
  };

  const startEditGuest = (g) => {
    setEditingGuestId(g.id);
    setEditingGuest({
      first_name: g.first_name || "",
      last_name: g.last_name || "",
      dietary_restrictions: g.dietary_restrictions || "",
      rsvp_status: g.rsvp_status || "",
      party_id: g.party_id || "",
    });
  };

  const saveEditGuest = async () => {
    if (!editingGuestId) return;

    await updateGuest({
      admin_password: adminPassword,
      guest_id: editingGuestId,
      first_name: editingGuest.first_name,
      last_name: editingGuest.last_name,
      party_id: editingGuest.party_id || null,
      dietary_restrictions:
        editingGuest.dietary_restrictions.trim() || null,
      rsvp_status: editingGuest.rsvp_status || null,
    });

    setEditingGuestId(null);
    setEditingGuest({
      first_name: "",
      last_name: "",
      dietary_restrictions: "",
      rsvp_status: "",
      party_id: "",
    });

    await refresh();
  };

  const onDeleteGuest = async (guestId) => {
    const ok = window.confirm("Delete this guest?");
    if (!ok) return;

    await deleteGuest({ admin_password: adminPassword, guest_id: guestId });
    await refresh();
  };

  // -----------------------
  // UI building blocks
  // -----------------------
  const fieldStyle = {
    background: "transparent",
    border: `1px solid ${thinRule}`,
    borderRadius: 999,
    padding: "10px 14px",
    fontFamily: "var(--font-body)",
    color: ink,
    outline: "none",
    width: "100%",
    maxWidth: 520,
  };

  const btnStyle = (filled = false) => ({
    background: filled ? ink : "transparent",
    border: `1px solid ${filled ? ink : thinRule}`,
    color: filled ? "#fbfaf7" : ink,
    borderRadius: 999,
    padding: "10px 16px",
    fontFamily: "var(--font-body)",
    fontSize: 12,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    cursor: "pointer",
  });

  if (!authed) {
    // ✅ RSVP-style password gate
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
          <h1 className="font-header" style={{ fontSize: "clamp(56px, 6vw, 72px)", marginBottom: 18 }}>
            Admin
          </h1>

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
            Please enter the admin password
          </p>

          <form onSubmit={handleAuthSubmit} style={{ maxWidth: 520, margin: "0 auto" }}>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoComplete="off"
              placeholder="Admin password"
              style={{
                ...fieldStyle,
                borderRadius: 0,
                border: "none",
                borderBottom: `1px solid ${thinRule}`,
                textAlign: "center",
                fontSize: 18,
              }}
            />

            <div style={{ marginTop: 22 }}>
              <button type="submit" style={btnStyle(true)}>
                Continue
              </button>
            </div>

            {authError && (
              <p
                className="font-subheader"
                style={{
                  marginTop: 18,
                  fontSize: 12,
                  letterSpacing: "0.16em",
                  opacity: 0.75,
                  textTransform: "uppercase",
                }}
              >
                {authError}
              </p>
            )}
          </form>
        </Container>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        backgroundColor: "#fbfaf7",
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <Container style={{ paddingTop: 70, paddingBottom: 80 }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="font-header" style={{ fontSize: "clamp(56px, 6vw, 72px)", marginBottom: 10 }}>
            Admin
          </h1>

          <p
            className="font-subheader"
            style={{
              fontSize: 12,
              letterSpacing: "0.18em",
              opacity: 0.65,
              textTransform: "uppercase",
              marginBottom: 26,
            }}
          >
            Parties & Guests
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
            <button style={btnStyle(false)} onClick={refresh} type="button">
              Refresh
            </button>

            <button
              style={btnStyle(false)}
              onClick={() => {
                setAuthed(false);
                setAdminPassword("");
                setParties([]);
              }}
              type="button"
            >
              Log out
            </button>
          </div>

          {loading && (
            <p className="font-subheader" style={{ fontSize: 12, letterSpacing: "0.16em", opacity: 0.6 }}>
              Loading…
            </p>
          )}
        </div>

        {/* Create Party */}
        <section
          style={{
            maxWidth: 820,
            margin: "0 auto 34px",
            padding: "18px 16px",
            borderTop: `1px solid ${thinRule}`,
            borderBottom: `1px solid ${thinRule}`,
          }}
        >
          <p className="font-subheader" style={{ margin: "0 0 14px", fontSize: 12, letterSpacing: "0.18em", opacity: 0.8 }}>
            Create Party
          </p>

          <form onSubmit={onCreateParty} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={newPartyName}
              onChange={(e) => setNewPartyName(e.target.value)}
              placeholder="Party name"
              style={{ ...fieldStyle, maxWidth: 420 }}
            />
            <button type="submit" style={btnStyle(true)}>
              Add Party
            </button>
          </form>
        </section>

        {/* Parties List */}
        <section style={{ maxWidth: 820, margin: "0 auto" }}>
          {(parties || []).map((p) => (
            <div
              key={p.id}
              style={{
                padding: "18px 0",
                borderBottom: `1px solid ${thinRule}`,
              }}
            >
              {/* Party header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 260 }}>
                  {editingPartyId === p.id ? (
                    <input
                      value={editingPartyName}
                      onChange={(e) => setEditingPartyName(e.target.value)}
                      style={{ ...fieldStyle, maxWidth: 520 }}
                    />
                  ) : (
                    <div
                      className="font-subheader"
                      style={{
                        fontSize: 14,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        opacity: 0.85,
                      }}
                    >
                      {p.name}
                    </div>
                  )}

                  <div
                    className="font-subheader"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      opacity: 0.45,
                      marginTop: 6,
                    }}
                  >
                    {p.guests?.length || 0} guests
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {editingPartyId === p.id ? (
                    <>
                      <button type="button" style={btnStyle(true)} onClick={saveEditParty}>
                        Save
                      </button>
                      <button
                        type="button"
                        style={btnStyle(false)}
                        onClick={() => {
                          setEditingPartyId(null);
                          setEditingPartyName("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" style={btnStyle(false)} onClick={() => startEditParty(p)}>
                        Edit
                      </button>
                      <button type="button" style={btnStyle(false)} onClick={() => onDeleteParty(p.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Add guest */}
              <div style={{ marginTop: 16 }}>
                <p className="font-subheader" style={{ margin: "0 0 10px", fontSize: 12, letterSpacing: "0.18em", opacity: 0.7 }}>
                  Add Guest
                </p>

                <form
                  onSubmit={(e) => onCreateGuest(p.id, e)}
                  style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}
                >
                  <input
                    value={(newGuestByParty[p.id]?.first_name ?? "")}
                    onChange={(e) =>
                      setNewGuestByParty((prev) => ({
                        ...prev,
                        [p.id]: { ...(prev[p.id] || {}), first_name: e.target.value },
                      }))
                    }
                    placeholder="First name"
                    style={{ ...fieldStyle, maxWidth: 220 }}
                  />
                  <input
                    value={(newGuestByParty[p.id]?.last_name ?? "")}
                    onChange={(e) =>
                      setNewGuestByParty((prev) => ({
                        ...prev,
                        [p.id]: { ...(prev[p.id] || {}), last_name: e.target.value },
                      }))
                    }
                    placeholder="Last name"
                    style={{ ...fieldStyle, maxWidth: 220 }}
                  />

                  <button type="submit" style={btnStyle(true)}>
                    Add Guest
                  </button>
                </form>
              </div>

              {/* Guests list */}
              <div style={{ marginTop: 18 }}>
                <p className="font-subheader" style={{ margin: "0 0 10px", fontSize: 12, letterSpacing: "0.18em", opacity: 0.7 }}>
                  Guests
                </p>

                {(p.guests || []).length === 0 ? (
                  <div className="font-subheader" style={{ fontSize: 12, letterSpacing: "0.16em", opacity: 0.45 }}>
                    No guests yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(p.guests || []).map((g) => {
                      const isEditing = editingGuestId === g.id;

                      return (
                        <div
                          key={g.id}
                          style={{
                            padding: "12px 12px",
                            border: `1px solid ${thinRule}`,
                            borderRadius: 14,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                          }}
                        >
                          {!isEditing ? (
                            <div style={{ minWidth: 260 }}>
                              <div
                                className="font-subheader"
                                style={{
                                  fontSize: 13,
                                  letterSpacing: "0.16em",
                                  textTransform: "uppercase",
                                  opacity: 0.85,
                                }}
                              >
                                {fullName(g)}
                              </div>

                              <div
                                className="font-subheader"
                                style={{
                                  fontSize: 11,
                                  letterSpacing: "0.16em",
                                  textTransform: "uppercase",
                                  opacity: 0.5,
                                  marginTop: 6,
                                }}
                              >
                                RSVP: {g.rsvp_status || "—"}{" "}
                                {g.dietary_restrictions ? ` · Diet: ${g.dietary_restrictions}` : ""}
                              </div>
                            </div>
                          ) : (
                            <div style={{ width: "100%", maxWidth: 680 }}>
                              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <input
                                  value={editingGuest.first_name}
                                  onChange={(e) =>
                                    setEditingGuest((prev) => ({ ...prev, first_name: e.target.value }))
                                  }
                                  style={{ ...fieldStyle, maxWidth: 180 }}
                                  placeholder="First"
                                />
                                <input
                                  value={editingGuest.last_name}
                                  onChange={(e) =>
                                    setEditingGuest((prev) => ({ ...prev, last_name: e.target.value }))
                                  }
                                  style={{ ...fieldStyle, maxWidth: 180 }}
                                  placeholder="Last"
                                />

                                <select
                                  value={editingGuest.rsvp_status}
                                  onChange={(e) =>
                                    setEditingGuest((prev) => ({ ...prev, rsvp_status: e.target.value }))
                                  }
                                  style={{ ...fieldStyle, maxWidth: 160 }}
                                >
                                  <option value="">RSVP —</option>
                                  <option value="yes">yes</option>
                                  <option value="no">no</option>
                                </select>

                                <input
                                  value={editingGuest.dietary_restrictions}
                                  onChange={(e) =>
                                    setEditingGuest((prev) => ({
                                      ...prev,
                                      dietary_restrictions: e.target.value,
                                    }))
                                  }
                                  style={{ ...fieldStyle, maxWidth: 260 }}
                                  placeholder="Dietary restrictions (optional)"
                                />

                                <select
                                  value={editingGuest.party_id}
                                  onChange={(e) =>
                                    setEditingGuest((prev) => ({ ...prev, party_id: e.target.value }))
                                  }
                                  style={{ ...fieldStyle, maxWidth: 260 }}
                                >
                                  <option value="">Move to party…</option>
                                  {partyOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {!isEditing ? (
                              <>
                                <button type="button" style={btnStyle(false)} onClick={() => startEditGuest(g)}>
                                  Edit
                                </button>
                                <button type="button" style={btnStyle(false)} onClick={() => onDeleteGuest(g.id)}>
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button type="button" style={btnStyle(true)} onClick={saveEditGuest}>
                                  Save
                                </button>
                                <button
                                  type="button"
                                  style={btnStyle(false)}
                                  onClick={() => {
                                    setEditingGuestId(null);
                                    setEditingGuest({
                                      first_name: "",
                                      last_name: "",
                                      dietary_restrictions: "",
                                      rsvp_status: "",
                                      party_id: "",
                                    });
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </Container>
    </main>
  );
}
