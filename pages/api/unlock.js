export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { entry } = req.body;
  console.log("Journal entry:", entry);

  const profileId = process.env.NEXTDNS_LOCKED_PROFILE_ID;
  const apiKey = process.env.NEXTDNS_API_KEY;
  console.log("Using Profile ID:", profileId);
  console.log("Using API Key:", apiKey ? "SET" : "MISSING");

  const expires = new Date();
  expires.setHours(23, 59, 0, 0);
  const isoExpires = expires.toISOString();

  try {
    const r = await fetch(`https://api.nextdns.io/profiles/${profileId}/override`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ devices: ["all"], expires: isoExpires })
    });

    const text = await r.text();
    console.log("NextDNS response:", text);

    if (!r.ok) return res.status(500).json({ error: 'Failed to set override', details: text });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
