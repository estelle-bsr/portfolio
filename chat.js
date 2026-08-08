module.exports = async function handler(req, res) {
  try {
    const userMessage = req.body.message || "Message vide";
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    // 1. Test si la clé est bien lue
    if (!apiKey) {
      return res.status(200).json({ reply: "🚨 ERREUR DEBUG : Vercel ne trouve pas la clé API." });
    }

    const systemPrompt = `Tu es l'assistant virtuel d'Estelle. Réponds de façon concise.`;
    const finalMessage = `[Consignes: ${systemPrompt}]\n\nQuestion: ${userMessage}`;

    // 2. Appel à Google
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: finalMessage }] }]
      })
    });

    const data = await response.json();

    // 3. SI GOOGLE REFUSE : On affiche son message exact dans le chat !
    if (!response.ok) {
      return res.status(200).json({ 
        reply: `🚨 REFUS DE GOOGLE : ${JSON.stringify(data)}` 
      });
    }

    // 4. Si tout va bien
    if (data.candidates && data.candidates.length > 0) {
      const botReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: botReply });
    } else {
      return res.status(200).json({ reply: "🚨 ERREUR DEBUG : Google a répondu mais la réponse est vide." });
    }

  } catch (error) {
    // 5. S'il y a un crash du code serveur
    return res.status(200).json({ reply: `🚨 CRASH SERVEUR : ${error.message}` });
  }
};
