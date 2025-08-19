export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { entry } = req.body;
  console.log("Journal entry:", entry);

  const profileId = process.env.NEXTDNS_OPEN_PROFILE_ID; // Keep your env name
  const apiKey = process.env.NEXTDNS_API_KEY;

  try {
    const r = await fetch(`https://api.nextdns.io/profiles/${profileId}/activate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (!r.ok) {
      const text = await r.text();
      console.log("NextDNS response:", text);
      return res.status(500).json({ error: 'Failed to switch profile', details: text });
    }

    console.log("Successfully activated profile!");
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: 'Server exception', details: err.message });
  }
}
