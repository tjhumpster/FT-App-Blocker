export default async function handler(req, res) {


const apiKey = process.env.NEXTDNS_API_KEY;
const openProfileId = process.env.NEXTDNS_OPEN_PROFILE_ID; // "open" profile you want when unlocked
const lockedProfileId = process.env.NEXTDNS_LOCKED_PROFILE_ID; // the daily "locked" profile to patch if activate isn't available


if (!apiKey || !openProfileId || !lockedProfileId) {
return res.status(500).json({ error: 'Missing NEXTDNS_API_KEY or profile IDs in environment' });
}


// 1) Try the documented-but-rare activate endpoint (some accounts/CLI expose this)
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


// 2) Fallback: patch the currently-locked profile to "disable blocking" (unlock behaviour)
// This uses the documented PATCH /profiles/:profile endpoint.
try {
const unlockBody = {
settings: {
blockPage: { enabled: false }
}
};


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
