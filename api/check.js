export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { drugA, drugB } = req.body;
  if (!drugA || !drugB) return res.status(400).json({ error: 'drugA and drugB required' });

  try {
    const prompt = `You are a medical expert in Indian traditional (Siddha, Ayurveda) and modern allopathic medicine.
Check drug interaction between "${drugA.brand}" (${drugA.generic}) and "${drugB.brand}" (${drugB.generic}).
Reply ONLY in this exact pipe-separated format (no extra text, no markdown):
SEVERITY|English effect one sentence|Tamil effect one sentence|Recommendation one sentence
Severity must be exactly: SAFE, MILD, MODERATE, SEVERE, or DANGEROUS`;

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.2 },
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return res.status(500).json({ error: 'No response from Gemini' });

    const parts = text.split('|');
    if (parts.length >= 3) {
      return res.status(200).json({
        sev: parts[0].trim().toUpperCase(),
        en: parts[1].trim(),
        ta: parts[2].trim(),
        rec: (parts[3] || 'Consult your doctor').trim(),
      });
    }

    return res.status(200).json({ sev: 'MILD', en: text, ta: text, rec: 'Consult your doctor' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
