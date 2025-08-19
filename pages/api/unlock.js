// pages/api/unlock.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      console.log("Wrong method:", req.method);
      return res.status(405).end();
    }

    const { entry } = req.body || {};
    console.log("Journal entry received:", entry);

    const profileId = process.env.NEXTDNS_LOCKED_PROFILE_ID;
    const apiKey = process.env.NEXTDNS_API_KEY;

    console.log("Profile ID:", profileId);
    console.log("API Key set?", apiKey ? "YES" : "NO");

    if (!profileId || !apiKey) {
      console.log("Missing env vars!");
      return res.status(500).json({ error: "Missing environment variables" });
    }

    // Set override until 23:59 today
    const expires = new Date();
    expires.setHours(23, 59, 0, 0);
    const isoExpires = expires.toISOString();

    console.log("Override expires at:", isoExpires);

    const response = await fetch(`https://api.nextdns.io/profiles/${profileId}/override`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ devices: ["all"], expires: isoExpires })
    });

    const text = await response.text();
    console.log("NextDNS response text:", text);

    if (!response.ok) {
      console.log("Override API failed");
      return res.status(500).json({ error: "Override API failed", details: text });
    }

    console.log("Override set successfully!");
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Server caught error:", err);
    return res.status(500).json({ error: "Server exception", details: err.message });
  }
}
