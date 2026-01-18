"use client";

import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { createParty, createGuest, getParties } from "../server-actions/serverActions";

export default function AdminPage() {
  const ink = "#544f44";
  const thinRule = "rgba(84, 79, 68, 0.35)";

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [parties, setParties] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");

  const inputStyle = {
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${thinRule}`,
    borderRadius: 0,
    textAlign: "center",
    padding: "14px 16px",
    fontFamily: "var(--font-body)",
    fontSize: 18,
    color: ink,
    width: "100%",
    maxWidth: 520,
    margin: "0 auto",
    boxShadow: "none",
  };

  const btnStyle = {
    background: ink,
    border: `1px solid ${ink}`,
    color: "#fbfaf7",
    borderRadius: 999,
    padding: "10px 18px",
    fontSize: 12,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontFamily: "var(--font-body)",
    minWidth: 200,
    justifySelf: "center",
  };

  function handleAuth(e) {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password.");
    }
  }

  // ✅ Fetch parties once authenticated
  useEffect(() => {
    if (!authed) return;

    (async () => {
      const rows = await getParties(password);
      setParties(Array.isArray(rows) ? rows : []);
      // default to first party
      if (rows?.length) setSelectedPartyId(rows[0].id);
    })();
  }, [authed, password]);

  return (
    <main
      style={{
        minHeight: "100svh",
        backgroundColor: "#fbfaf7",
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <Container style={{ paddingTop: 110, paddingBottom: 90, textAlign: "center", maxWidth: 760 }}>
        <h1
          className="font-header"
          style={{
            marginBottom: 42,
            color: ink,
            fontSize: "clamp(72px, 10vw, 120px)",
            lineHeight: 1.02,
          }}
        >
          Admin
        </h1>

        {!authed ? (
          <form onSubmit={handleAuth} style={{ display: "grid", gap: 22 }}>
            <div className="font-subheader">Enter admin password</div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
            />

            <button type="submit" style={btnStyle}>
              Continue
            </button>

            {error && <div style={{ fontStyle: "italic", opacity: 0.7 }}>{error}</div>}
          </form>
        ) : (
          <div style={{ display: "grid", gap: 64, maxWidth: 640, margin: "0 auto" }}>
            {/* Create Party */}
            <form
              action={async (formData) => {
                await createParty(formData);
                // refresh parties after creating one
                const rows = await getParties(password);
                setParties(Array.isArray(rows) ? rows : []);
                if (rows?.length) setSelectedPartyId(rows[0].id);
              }}
              style={{ display: "grid", gap: 18 }}
            >
              <div className="font-subheader">Create Party</div>

              <input name="party_name" placeholder="Party name" style={inputStyle} />
              <input type="hidden" name="admin_password" value={password} />

              <button type="submit" style={btnStyle}>
                Create Party
              </button>
            </form>

            {/* Create Guest */}
            <form action={createGuest} style={{ display: "grid", gap: 18 }}>
              <div className="font-subheader">Create Guest</div>

              <input name="first_name" placeholder="First name" style={inputStyle} />
              <input name="last_name" placeholder="Last name" style={inputStyle} />

              {/* ✅ Party dropdown */}
              <select
                name="party_id"
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                style={{
                  ...inputStyle,
                  fontSize: 16,
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                {parties.length === 0 ? (
                  <option value="">No parties yet</option>
                ) : (
                  parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>

              <input type="hidden" name="admin_password" value={password} />

              <button type="submit" style={btnStyle}>
                Create Guest
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setAuthed(false);
                setPassword("");
                setParties([]);
                setSelectedPartyId("");
              }}
              style={{
                background: "transparent",
                border: `1px solid ${thinRule}`,
                color: ink,
                borderRadius: 999,
                padding: "10px 18px",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontFamily: "var(--font-body)",
                justifySelf: "center",
                minWidth: 200,
              }}
            >
              Lock Admin
            </button>
          </div>
        )}
      </Container>
    </main>
  );
}
