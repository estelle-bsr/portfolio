module.exports = async (req, res) => {
  try {
    // 1. Vérification de la méthode
    if (req.method !== 'POST') {
      return res.status(200).json({ reply: "🚨 Erreur : Méthode non autorisée. (Attendait POST)" });
    }

    // 2. Récupération sécurisée du message
    let userMessage = "Message vide";
    if (req.body && req.body.message) {
      userMessage = req.body.message;
    } else if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        userMessage = parsed.message || userMessage;
      } catch(e) {}
    }

    // 3. Vérification de la clé API
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey || apiKey.trim() === '') {
      return res.status(200).json({ reply: "🚨 Erreur Vercel : La variable GEMINI_API_KEY est introuvable ou vide." });
    }

    // 4. Préparation du message pour Google
    const systemPrompt = `Tu es l'assistant virtuel d'Estelle Boisserie, étudiante ingénieure en cybersécurité. Réponds de façon concise et professionnelle.`;
    const finalMessage = `[INSTRUCTIONS : ${systemPrompt}]\n\n[QUESTION] : ${userMessage}`;

    // 5. Appel à l'API Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: finalMessage }]
        }]
      })
    });

    const data = await response.json();

    // 6. Si Google rejette la demande (Clé invalide, mauvaise syntaxe...)
    if (!response.ok) {
      return res.status(200).json({ reply: `🚨 Refus de Google : ${JSON.stringify(data)}` });
    }

    // 7. Si Google répond correctement
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const botReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: botReply });
    } else {
      return res.status(200).json({ reply: `🚨 Réponse illisible de Google : ${JSON.stringify(data)}` });
    }

  } catch (error) {
    // 8. Si le code JavaScript plante de notre côté
    return res.status(200).json({ reply: `🚨 CRASH SERVEUR INTERNE : ${error.message} \nStack: ${error.stack}` });
  }
};
