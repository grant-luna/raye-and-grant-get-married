"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

function confirmsAdmin(password) {
  return password === process.env.ADMIN_PASSWORD;
}

export async function getParties(admin_password) {
  if (!confirmsAdmin(String(admin_password || ""))) return [];

  const rows = await sql`
    SELECT id, name
    FROM parties
    ORDER BY name ASC
  `;

  return rows;
}

export async function createParty(formData) {
  const password = String(formData.get("admin_password") || "");
  const name = String(formData.get("party_name") || "").trim();

  if (!confirmsAdmin(password)) return;
  if (!name) return;

  await sql`
    INSERT INTO parties (name)
    VALUES (${name})
  `;
}

export async function createGuest(formData) {
  const password = String(formData.get("admin_password") || "");
  const first = String(formData.get("first_name") || "").trim();
  const last = String(formData.get("last_name") || "").trim();
  const partyIdRaw = String(formData.get("party_id") || "").trim();

  if (!confirmsAdmin(password)) return;
  if (!first || !last) return;

  const partyId = partyIdRaw.length ? partyIdRaw : null;

  await sql`
    INSERT INTO guests (first_name, last_name, party_id)
    VALUES (${first}, ${last}, ${partyId})
  `;
}
