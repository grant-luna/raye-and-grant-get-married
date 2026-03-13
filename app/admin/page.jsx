"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import {
  getPartiesWithGuests,
  createParty,
  updateParty,
  deleteParty,
  createGuest,
  updateGuest,
  deleteGuest,
  importGuestsFromCsv,
} from "../server-actions/adminActions";

function fullName(g) {
  return `${g.first_name || ""} ${g.last_name || ""}`.trim();
}

/**
 * Robust-ish CSV parser (handles quoted commas + newlines).
 * Returns: { headers: string[], rows: object[] }
 */
function parseCsvToObjects(csvText) {
  const text = String(csvText || "");
  if (!text.trim()) return { headers: [], rows: [] };

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (c === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && next === "\n") i++;
      row.push(field);
      field = "";

      if (row.some((v) => String(v || "").trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    field += c;
  }

  row.push(field);
  if (row.some((v) => String(v || "").trim() !== "")) rows.push(row);

  if (rows.length === 0) return { headers: [], rows: [] };

  const rawHeaders = rows[0].map((h) => String(h || "").trim());
  const headers = rawHeaders.map((h, idx) => (h ? h : `Column ${idx + 1}`));

  const body = rows.slice(1);
  const objects = body.map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = r[idx] ?? "";
    });
    return obj;
  });

  return { headers, rows: objects };
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

  // Guest create per party
  const [newGuestByParty, setNewGuestByParty] = useState({});

  // Guest edit
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editingGuest, setEditingGuest] = useState({
    first_name: "",
    last_name: "",
    dietary_restrictions: "",
    rsvp_status: "",
    party_id: "",
  });

  // CSV import state
  const [csvName, setCsvName] = useState("");
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState("");
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  const [csvMapping, setCsvMapping] = useState({
    first_name: "",
    last_name: "",
    party_name: "",
    rsvp_status: "",
    dietary_restrictions: "",
  });

  const [defaultPartyName, setDefaultPartyName] = useState("Imported Guests");

  // NEW: search / filter state
  const [guestSearch, setGuestSearch] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("");
  const [filterDietary, setFilterDietary] = useState("");
  const [filterPartyId, setFilterPartyId] = useState("");

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

  // NEW: flattened guests for search/filter UI
  const allGuests = useMemo(() => {
    return (parties || []).flatMap((party) =>
      (party.guests || []).map((guest) => ({
        ...guest,
        party_name: party.name || "",
      }))
    );
  }, [parties]);

  const filteredGuests = useMemo(() => {
    const q = guestSearch.trim().toLowerCase();

    return allGuests.filter((g) => {
      const guestName = fullName(g).toLowerCase();
      const partyName = String(g.party_name || "").toLowerCase();
      const diet = String(g.dietary_restrictions || "").trim();
      const rsvp = String(g.rsvp_status || "").toLowerCase();

      const matchesSearch =
        !q ||
        guestName.includes(q) ||
        partyName.includes(q);

      const matchesRsvp =
        !filterRsvp || rsvp === filterRsvp;

      const matchesDietary =
        !filterDietary ||
        (filterDietary === "has_dietary" && !!diet) ||
        (filterDietary === "no_dietary" && !diet);

      const matchesParty =
        !filterPartyId || String(g.party_id) === String(filterPartyId);

      return matchesSearch && matchesRsvp && matchesDietary && matchesParty;
    });
  }, [allGuests, guestSearch, filterRsvp, filterDietary, filterPartyId]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthed(true);
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

    if (!first) return;

    await createGuest({
      admin_password: adminPassword,
      party_id: partyId,
      first_name: first,
      last_name: last || null,
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
      dietary_restrictions: editingGuest.dietary_restrictions.trim() || null,
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
  // CSV Import handlers
  // -----------------------
  const onCsvPicked = async (file) => {
    setCsvError("");
    setCsvResult(null);

    if (!file) {
      setCsvName("");
      setCsvHeaders([]);
      setCsvRows([]);
      setCsvMapping({
        first_name: "",
        last_name: "",
        party_name: "",
        rsvp_status: "",
        dietary_restrictions: "",
      });
      return;
    }

    if (!String(file.name || "").toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload a .csv file.");
      return;
    }

    setCsvName(file.name);

    try {
      const text = await file.text();
      const parsed = parseCsvToObjects(text);

      if (!parsed.headers.length) {
        setCsvError("We couldn’t read headers from that CSV.");
        setCsvHeaders([]);
        setCsvRows([]);
        return;
      }

      setCsvHeaders(parsed.headers);
      setCsvRows(parsed.rows);

      const lower = parsed.headers.map((h) => h.toLowerCase().trim());
      const pick = (candidates) => {
        const idx = lower.findIndex((h) => candidates.includes(h));
        return idx >= 0 ? parsed.headers[idx] : "";
      };

      setCsvMapping((prev) => ({
        ...prev,
        first_name: pick(["first_name", "first name", "firstname", "givenname", "given name"]),
        last_name: pick(["last_name", "last name", "lastname", "surname", "familyname", "family name"]),
        party_name: pick(["party", "party_name", "party name", "group", "group_name", "group name", "household", "household_name", "household name"]),
        rsvp_status: pick(["rsvp", "rsvp_status", "rsvp status", "status", "attending"]),
        dietary_restrictions: pick(["diet", "dietary", "dietary_restrictions", "dietary restrictions", "restrictions", "notes"]),
      }));
    } catch (err) {
      setCsvError("Something went wrong reading that file.");
      setCsvHeaders([]);
      setCsvRows([]);
    }
  };

  const canImport =
    csvRows.length > 0 &&
    csvMapping.first_name &&
    csvMapping.last_name &&
    !csvImporting;

  const runCsvImport = async () => {
    setCsvError("");
    setCsvResult(null);

    if (!csvMapping.first_name || !csvMapping.last_name) {
      setCsvError("Please map First Name and Last Name.");
      return;
    }

    if (!csvRows.length) {
      setCsvError("No rows found to import.");
      return;
    }

    if (csvRows.length > 5000) {
      setCsvError(
        "This file has more than 5,000 rows. Please split it into smaller files before importing."
      );
      return;
    }

    setCsvImporting(true);
    try {
      const res = await importGuestsFromCsv({
        admin_password: adminPassword,
        rows: csvRows,
        mapping: {
          first_name: csvMapping.first_name,
          last_name: csvMapping.last_name,
          party_name: csvMapping.party_name || "",
          rsvp_status: csvMapping.rsvp_status || "",
          dietary_restrictions: csvMapping.dietary_restrictions || "",
        },
        defaultPartyName: defaultPartyName || "Imported Guests",
      });

      if (!res?.ok) {
        setCsvError(res?.error || "Import failed.");
        return;
      }

      setCsvResult(res);
      await refresh();
    } catch (err) {
      setCsvError("Import failed. Please try again.");
    } finally {
      setCsvImporting(false);
    }
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
    opacity: csvImporting ? 0.7 : 1,
  });

  const labelStyle = {
    margin: "0 0 8px",
    fontSize: 12,
    letterSpacing: "0.18em",
    opacity: 0.75,
    textTransform: "uppercase",
  };

  if (!authed) {
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

        {/* NEW: Guest Search / Filter */}
        <section
          style={{
            maxWidth: 820,
            margin: "0 auto 34px",
            padding: "18px 16px",
            borderTop: `1px solid ${thinRule}`,
            borderBottom: `1px solid ${thinRule}`,
          }}
        >
          <p
            className="font-subheader"
            style={{ margin: "0 0 14px", fontSize: 12, letterSpacing: "0.18em", opacity: 0.8 }}
          >
            Search & Filter Guests
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <p className="font-subheader" style={labelStyle}>Search Name / Party</p>
              <input
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                placeholder="Search guest or party..."
                style={{ ...fieldStyle, maxWidth: "100%" }}
              />
            </div>

            <div>
              <p className="font-subheader" style={labelStyle}>RSVP Status</p>
              <select
                value={filterRsvp}
                onChange={(e) => setFilterRsvp(e.target.value)}
                style={{ ...fieldStyle, maxWidth: "100%" }}
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <p className="font-subheader" style={labelStyle}>Dietary Restrictions</p>
              <select
                value={filterDietary}
                onChange={(e) => setFilterDietary(e.target.value)}
                style={{ ...fieldStyle, maxWidth: "100%" }}
              >
                <option value="">All</option>
                <option value="has_dietary">Has dietary restrictions</option>
                <option value="no_dietary">No dietary restrictions</option>
              </select>
            </div>

            <div>
              <p className="font-subheader" style={labelStyle}>Party</p>
              <select
                value={filterPartyId}
                onChange={(e) => setFilterPartyId(e.target.value)}
                style={{ ...fieldStyle, maxWidth: "100%" }}
              >
                <option value="">All parties</option>
                {partyOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              style={btnStyle(false)}
              onClick={() => {
                setGuestSearch("");
                setFilterRsvp("");
                setFilterDietary("");
                setFilterPartyId("");
              }}
            >
              Clear Filters
            </button>

            <div
              className="font-subheader"
              style={{ fontSize: 11, letterSpacing: "0.16em", opacity: 0.6, textTransform: "uppercase" }}
            >
              Showing {filteredGuests.length} of {allGuests.length} guests
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            {filteredGuests.length === 0 ? (
              <div
                className="font-subheader"
                style={{ fontSize: 12, letterSpacing: "0.16em", opacity: 0.45 }}
              >
                No guests match your filters.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredGuests.slice(0, 100).map((g) => (
                  <div
                    key={`search-${g.id}`}
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
                          lineHeight: 1.8,
                        }}
                      >
                        Party: {g.party_name || "—"} · RSVP: {g.rsvp_status || "—"}
                        {g.dietary_restrictions ? ` · Diet: ${g.dietary_restrictions}` : ""}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button type="button" style={btnStyle(false)} onClick={() => startEditGuest(g)}>
                        Edit
                      </button>
                      <button type="button" style={btnStyle(false)} onClick={() => onDeleteGuest(g.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {filteredGuests.length > 100 && (
                  <div
                    className="font-subheader"
                    style={{ fontSize: 11, letterSpacing: "0.16em", opacity: 0.45, textTransform: "uppercase" }}
                  >
                    Showing first 100 matches
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* CSV Import */}
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
            Import Guests (CSV)
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => onCsvPicked(e.target.files?.[0])}
              style={{
                ...fieldStyle,
                maxWidth: 520,
                borderRadius: 14,
                padding: "10px 12px",
              }}
            />

            <button
              type="button"
              style={btnStyle(false)}
              onClick={() => {
                setCsvName("");
                setCsvHeaders([]);
                setCsvRows([]);
                setCsvError("");
                setCsvResult(null);
                setCsvMapping({
                  first_name: "",
                  last_name: "",
                  party_name: "",
                  rsvp_status: "",
                  dietary_restrictions: "",
                });
              }}
            >
              Clear
            </button>
          </div>

          {csvName && (
            <div className="font-subheader" style={{ marginTop: 12, fontSize: 11, letterSpacing: "0.16em", opacity: 0.55, textTransform: "uppercase" }}>
              File: {csvName} · Rows: {csvRows.length}
            </div>
          )}

          {csvHeaders.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                  alignItems: "end",
                }}
              >
                <div>
                  <p className="font-subheader" style={labelStyle}>First Name (required)</p>
                  <select
                    value={csvMapping.first_name}
                    onChange={(e) => setCsvMapping((p) => ({ ...p, first_name: e.target.value }))}
                    style={{ ...fieldStyle, maxWidth: "100%" }}
                  >
                    <option value="">Select column…</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="font-subheader" style={labelStyle}>Last Name (required)</p>
                  <select
                    value={csvMapping.last_name}
                    onChange={(e) => setCsvMapping((p) => ({ ...p, last_name: e.target.value }))}
                    style={{ ...fieldStyle, maxWidth: "100%" }}
                  >
                    <option value="">Select column…</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="font-subheader" style={labelStyle}>Party Name (optional)</p>
                  <select
                    value={csvMapping.party_name}
                    onChange={(e) => setCsvMapping((p) => ({ ...p, party_name: e.target.value }))}
                    style={{ ...fieldStyle, maxWidth: "100%" }}
                  >
                    <option value="">(none)</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="font-subheader" style={labelStyle}>RSVP Status (optional)</p>
                  <select
                    value={csvMapping.rsvp_status}
                    onChange={(e) => setCsvMapping((p) => ({ ...p, rsvp_status: e.target.value }))}
                    style={{ ...fieldStyle, maxWidth: "100%" }}
                  >
                    <option value="">(none)</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="font-subheader" style={labelStyle}>Dietary Restrictions (optional)</p>
                  <select
                    value={csvMapping.dietary_restrictions}
                    onChange={(e) => setCsvMapping((p) => ({ ...p, dietary_restrictions: e.target.value }))}
                    style={{ ...fieldStyle, maxWidth: "100%" }}
                  >
                    <option value="">(none)</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="font-subheader" style={labelStyle}>Default Party Name</p>
                  <input
                    value={defaultPartyName}
                    onChange={(e) => setDefaultPartyName(e.target.value)}
                    placeholder="Imported Guests"
                    style={{ ...fieldStyle, maxWidth: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <p className="font-subheader" style={{ ...labelStyle, marginBottom: 10 }}>
                  Preview (first 3 rows)
                </p>

                <div
                  style={{
                    border: `1px solid ${thinRule}`,
                    borderRadius: 14,
                    padding: 12,
                    overflowX: "auto",
                    background: "rgba(255,255,255,0.35)",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                    <thead>
                      <tr>
                        {["First", "Last", "Party", "RSVP", "Dietary"].map((h) => (
                          <th
                            key={h}
                            className="font-subheader"
                            style={{
                              textAlign: "left",
                              fontSize: 11,
                              letterSpacing: "0.16em",
                              textTransform: "uppercase",
                              opacity: 0.7,
                              padding: "8px 10px",
                              borderBottom: `1px solid ${thinRule}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(0, 3).map((r, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: "8px 10px", borderBottom: `1px solid rgba(84,79,68,0.12)` }}>
                            {String(r[csvMapping.first_name] || "")}
                          </td>
                          <td style={{ padding: "8px 10px", borderBottom: `1px solid rgba(84,79,68,0.12)` }}>
                            {String(r[csvMapping.last_name] || "")}
                          </td>
                          <td style={{ padding: "8px 10px", borderBottom: `1px solid rgba(84,79,68,0.12)` }}>
                            {csvMapping.party_name
                              ? String(r[csvMapping.party_name] || defaultPartyName || "")
                              : (defaultPartyName || "")}
                          </td>
                          <td style={{ padding: "8px 10px", borderBottom: `1px solid rgba(84,79,68,0.12)` }}>
                            {csvMapping.rsvp_status ? String(r[csvMapping.rsvp_status] || "") : "—"}
                          </td>
                          <td style={{ padding: "8px 10px", borderBottom: `1px solid rgba(84,79,68,0.12)` }}>
                            {csvMapping.dietary_restrictions ? String(r[csvMapping.dietary_restrictions] || "") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button type="button" style={btnStyle(true)} disabled={!canImport} onClick={runCsvImport}>
                    {csvImporting ? "Importing…" : "Import Guests"}
                  </button>

                  <div className="font-subheader" style={{ fontSize: 11, letterSpacing: "0.16em", opacity: 0.6, textTransform: "uppercase" }}>
                    First + Last name are required. Parties will be created automatically.
                  </div>
                </div>

                {csvError && (
                  <p className="font-subheader" style={{ marginTop: 12, fontSize: 12, letterSpacing: "0.16em", opacity: 0.75, textTransform: "uppercase", lineHeight: 1.8 }}>
                    {csvError}
                  </p>
                )}

                {csvResult?.ok && (
                  <p className="font-subheader" style={{ marginTop: 12, fontSize: 12, letterSpacing: "0.16em", opacity: 0.75, textTransform: "uppercase", lineHeight: 1.8 }}>
                    Imported {csvResult.inserted} guests · Skipped {csvResult.skipped} · Created {csvResult.partiesCreated} parties
                  </p>
                )}
              </div>
            </div>
          )}

          {csvHeaders.length === 0 && csvError && (
            <p className="font-subheader" style={{ marginTop: 12, fontSize: 12, letterSpacing: "0.16em", opacity: 0.75, textTransform: "uppercase", lineHeight: 1.8 }}>
              {csvError}
            </p>
          )}
        </section>

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