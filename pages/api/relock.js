export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.NEXTDNS_API_KEY;
  const lockedProfileId = process.env.NEXTDNS_LOCKED_PROFILE_ID;

  if (!apiKey || !lockedProfileId) return res.status(500).json({ error: 'Missing env vars' });

  try {
    const r = await fetch(`https://api.nextdns.io/profiles/${lockedProfileId}/activate`, {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey }
    });

    if (r.ok) {
      console.log('Activated locked profile via /activate');
      return res.status(200).json({ ok: true });
    }
    console.log('/activate (relock) returned', r.status);
  } catch (err) {
    console.log('Re-activate attempt failed:', err.message);
  }

  try {
    const lockBody = { settings: { blockPage: { enabled: true } } };

    const r2 = await fetch(`https://api.nextdns.io/profiles/${lockedProfileId}`, {
      method: 'PATCH',
      headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(lockBody)
    });

    if (!r2.ok) {
      const txt = await r2.text();
      console.error('PATCH relock failed', r2.status, txt);
      return res.status(500).json({ error: 'Failed to relock (PATCH failed)', status: r2.status, body: txt });
    }

    console.log('Patched profile to locked (blockPage enabled)');
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Relock (PATCH) exception', err);
    return res.status(500).json({ error: 'Exception while relocking' });
  }
}
