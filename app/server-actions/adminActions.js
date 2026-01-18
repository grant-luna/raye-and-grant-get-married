"use server";

import { neon } from "@neondatabase/serverless";

function sqlClient() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");
  return neon(process.env.DATABASE_URL);
}

function confirmsAdmin(admin_password) {
  const expected = process.env.ADMIN_PASSWORD || "";
  return (
    typeof admin_password === "string" &&
    admin_password.length > 0 &&
    expected.length > 0 &&
    admin_password === expected
  );
}

// ✅ parties + guests in one call
export async function getPartiesWithGuests(admin_password) {
  if (!confirmsAdmin(admin_password)) return { ok: false, parties: [] };

  const sql = sqlClient();

  const parties = await sql`
    SELECT id, name
    FROM parties
    ORDER BY name ASC
  `;

  const guests = await sql`
    SELECT id, first_name, last_name, rsvp_status, dietary_restrictions, party_id
    FROM guests
    ORDER BY last_name ASC, first_name ASC
  `;

  const partyMap = new Map();
  for (const p of parties) {
    partyMap.set(p.id, { ...p, guests: [] });
  }

  // guests with null party_id will be ignored here (by design)
  for (const g of guests) {
    if (g.party_id && partyMap.has(g.party_id)) {
      partyMap.get(g.party_id).guests.push(g);
    }
  }

  return { ok: true, parties: Array.from(partyMap.values()) };
}

export async function createParty({ admin_password, name }) {
  if (!confirmsAdmin(admin_password)) return { ok: false };

  const cleanName = String(name || "").trim();
  if (!cleanName) return { ok: false, error: "Party name is required." };

  const sql = sqlClient();
  const rows = await sql`
    INSERT INTO parties (name)
    VALUES (${cleanName})
    RETURNING id, name
  `;
  return { ok: true, party: rows?.[0] || null };
}

export async function updateParty({ admin_password, party_id, name }) {
  if (!confirmsAdmin(admin_password)) return { ok: false };

  const cleanName = String(name || "").trim();
  if (!party_id) return { ok: false, error: "party_id required" };
  if (!cleanName) return { ok: false, error: "Party name is required." };

  const sql = sqlClient();
  const rows = await sql`
    UPDATE parties
    SET name = ${cleanName}
    WHERE id = ${party_id}
    RETURNING id, name
  `;

  return { ok: true, party: rows?.[0] || null };
}

// ⚠️ simple behavior: delete all guests in the party, then delete party
export async function deleteParty({ admin_password, party_id }) {
  if (!confirmsAdmin(admin_password)) return { ok: false };
  if (!party_id) return { ok: false, error: "party_id required" };

  const sql = sqlClient();

  await sql`
    DELETE FROM guests
    WHERE party_id = ${party_id}
  `;

  await sql`
    DELETE FROM parties
    WHERE id = ${party_id}
  `;

  return { ok: true };
}

export async function createGuest({
  admin_password,
  party_id,
  first_name,
  last_name,
  dietary_restrictions = null,
  rsvp_status = null, // "yes" | "no" | null
}) {
  if (!confirmsAdmin(admin_password)) return { ok: false };

  const fn = String(first_name || "").trim();
  const ln = String(last_name || "").trim();
  const dr =
    dietary_restrictions == null ? null : String(dietary_restrictions).trim();
  const rs = rsvp_status == null ? null : String(rsvp_status).trim();

  if (!party_id) return { ok: false, error: "party_id required" };
  if (!fn || !ln) return { ok: false, error: "First + last name required." };
  if (rs && rs !== "yes" && rs !== "no")
    return { ok: false, error: "rsvp_status must be yes/no/null" };

  const sql = sqlClient();
  const rows = await sql`
    INSERT INTO guests (first_name, last_name, party_id, dietary_restrictions, rsvp_status)
    VALUES (${fn}, ${ln}, ${party_id}, ${dr}, ${rs})
    RETURNING id, first_name, last_name, party_id, dietary_restrictions, rsvp_status
  `;

  return { ok: true, guest: rows?.[0] || null };
}

export async function updateGuest({
  admin_password,
  guest_id,
  first_name,
  last_name,
  party_id, // allow move
  dietary_restrictions = null,
  rsvp_status = null,
}) {
  if (!confirmsAdmin(admin_password)) return { ok: false };

  if (!guest_id) return { ok: false, error: "guest_id required" };

  const fn = String(first_name || "").trim();
  const ln = String(last_name || "").trim();
  const dr =
    dietary_restrictions == null ? null : String(dietary_restrictions).trim();
  const rs = rsvp_status == null ? null : String(rsvp_status).trim();

  if (!fn || !ln) return { ok: false, error: "First + last name required." };
  if (rs && rs !== "yes" && rs !== "no")
    return { ok: false, error: "rsvp_status must be yes/no/null" };

  const sql = sqlClient();

  const rows = await sql`
    UPDATE guests
    SET
      first_name = ${fn},
      last_name = ${ln},
      party_id = ${party_id ?? null},
      dietary_restrictions = ${dr},
      rsvp_status = ${rs}
    WHERE id = ${guest_id}
    RETURNING id, first_name, last_name, party_id, dietary_restrictions, rsvp_status
  `;

  return { ok: true, guest: rows?.[0] || null };
}

export async function deleteGuest({ admin_password, guest_id }) {
  if (!confirmsAdmin(admin_password)) return { ok: false };
  if (!guest_id) return { ok: false, error: "guest_id required" };

  const sql = sqlClient();

  await sql`
    DELETE FROM guests
    WHERE id = ${guest_id}
  `;

  return { ok: true };
}
