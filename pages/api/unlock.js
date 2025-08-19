export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { entry } = req.body;
  console.log("Journal entry:", entry);

  const profileId = process.env.NEXTDNS_LOCKED_PROFILE_ID;
  const apiKey = process.env.NEXTDNS_API_KEY;

  // Set override to expire at local midnight (23:59)
  const expires = new Date();
  expires.setHours(23, 59, 0, 0); // 23:59 today
  const isoExpires = expires.toISOString();

  const r = await fetch(`https://api.nextdns.io/profiles/${profileId}/override`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      devices: ["all"],
      expires: isoExpires
    })
  });

  if (!r.ok) {
    console.error(await r.text());
    return res.status(500).json({ error: 'Failed to set override' });
  }

  res.status(200).json({ ok: true });
}
