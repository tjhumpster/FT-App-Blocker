export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { entry } = req.body;
  console.log("Journal entry (first 200 chars):", (entry || "").slice(0, 200));

  const apiKey = process.env.NEXTDNS_API_KEY;
  const openProfileId = process.env.NEXTDNS_OPEN_PROFILE_ID; // your unlocked profile ID

  if (!apiKey || !openProfileId) {
    return res.status(500).json({ error: "Missing NEXTDNS_API_KEY or OPEN profile ID" });
  }

  // Instead of activating, just return the ID for copy/paste
  return res.status(200).json({
    ok: true,
    profileId: openProfileId,
  });
}
