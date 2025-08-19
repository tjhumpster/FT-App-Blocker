export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { entry } = req.body;
  console.log('Journal entry (first 200 chars):', (entry || '').slice(0, 200));

  const apiKey = process.env.NEXTDNS_API_KEY;
  const openProfileId = process.env.NEXTDNS_OPEN_PROFILE_ID;
  const lockedProfileId = process.env.NEXTDNS_LOCKED_PROFILE_ID;

  if (!apiKey || !openProfileId || !lockedProfileId) {
    return res.status(500).json({ error: 'Missing NEXTDNS_API_KEY or profile IDs in environment' });
  }

  try {
    const r = await fetch(`https://api.nextdns.io/profiles/${openProfileId}/activate`, {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey }
    });

    if (r.ok) {
      console.log('Activated open profile via /activate');
      return res.status(200).json({ ok: true });
    }

    console.log('/activate returned', r.status);
  } catch (err) {
    console.log('Activate attempt failed:', err.message);
  }

  try {
    const unlockBody = { settings: { blockPage: { enabled: false } } };

    const r2 = await fetch(`https://api.nextdns.io/profiles/${lockedProfileId}`, {
      method: 'PATCH',
      headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(unlockBody)
    });

    if (!r2.ok) {
      const txt = await r2.text();
      console.error('PATCH unlock failed', r2.status, txt);
      return res.status(500).json({ error: 'Failed to unlock (PATCH failed)', status: r2.status, body: txt });
    }

    console.log('Patched profile to unlocked (blockPage disabled)');
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Unlock (PATCH) exception', err);
    return res.status(500).json({ error: 'Exception while unlocking' });
  }
}
