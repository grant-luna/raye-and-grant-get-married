"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

function fullName(g) {
  return `${g.first_name || ""} ${g.last_name || ""}`.trim();
}

function similarityScore(input, candidate) {
  const clean = (s) =>
    String(s || "")
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

  const prefixLen = Math.min(A.length, B.length);
  let prefixMatch = 0;
  for (let i = 0; i < prefixLen; i++) {
    if (A[i] === B[i]) prefixMatch++;
    else break;
  }
  const prefixScore = prefixMatch / Math.max(A.length, B.length);

  return Math.min(1, tokenScore * 0.7 + prefixScore * 0.3);
}

export async function findPartyMatchByName(input) {
  const q = String(input || "").trim();
  if (!q) return null;

  // For weddings this is usually small enough. If you had 50k guests,
  // we'd do token filtering in SQL first.
  const guests = await sql`
    SELECT id, first_name, last_name, party_id, rsvp_status, dietary_restrictions
    FROM guests
  `;

  let best = null;
  for (const g of guests) {
    const score = similarityScore(q, fullName(g));
    if (!best || score > best.score) best = { guest: g, score };
  }

  if (!best) return null;

  // If guest has no party_id, treat them as a “solo party”
  const partyId = best.guest.party_id;

  let party = null;
  let partyGuests = [best.guest];

  if (partyId) {
    const parties = await sql`
      SELECT id, name
      FROM parties
      WHERE id = ${partyId}
      LIMIT 1
    `;
    party = parties?.[0] || { id: partyId, name: "Your Party" };

    partyGuests = await sql`
      SELECT id, first_name, last_name, party_id, rsvp_status, dietary_restrictions
      FROM guests
      WHERE party_id = ${partyId}
      ORDER BY last_name ASC, first_name ASC
    `;
  } else {
    party = { id: null, name: "Your Party" };
  }

  return {
    party,
    guests: partyGuests,
    matchedGuest: best.guest,
    confidence: best.score,
  };
}

export async function submitPartyRSVP({ partyId, guestIdsInParty, selectedIds }) {
  const idsInParty = Array.isArray(guestIdsInParty) ? guestIdsInParty : [];
  const selected = Array.isArray(selectedIds) ? selectedIds : [];

  if (!idsInParty.length) return { ok: false };

  // If none selected: everyone in party => "no"
  if (selected.length === 0) {
    await sql`
      UPDATE guests
      SET rsvp_status = 'no'
      WHERE id = ANY(${idsInParty}::uuid[])
    `;
    return { ok: true, attending: 0, declined: idsInParty.length };
  }

  // Some selected:
  // selected => "yes"
  await sql`
    UPDATE guests
    SET rsvp_status = 'yes'
    WHERE id = ANY(${selected}::uuid[])
  `;

  // unselected => "no"
  const selectedSet = new Set(selected);
  const unselected = idsInParty.filter((id) => !selectedSet.has(id));

  if (unselected.length) {
    await sql`
      UPDATE guests
      SET rsvp_status = 'no'
      WHERE id = ANY(${unselected}::uuid[])
    `;
  }

  return { ok: true, attending: selected.length, declined: unselected.length };
}