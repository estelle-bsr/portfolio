export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { nom, email, message, captchaToken } = req.body;

  const secretKeyHcaptcha = process.env.HCAPTCHA_SECRET_KEY; 
  
  const bodyHcaptcha = new URLSearchParams({
    secret: secretKeyHcaptcha,
    response: captchaToken
  });

  const verificationCaptcha = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    body: bodyHcaptcha,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  const resultatCaptcha = await verificationCaptcha.json();

  if (!resultatCaptcha.success) {
    return res.status(400).json({ message: 'Captcha invalide.' });
  }

  const cleApiBrevo = process.env.BREVO_API_KEY; 

  const payloadBrevo = {
    sender: { name: nom, email: "estelleboisserie@orange.fr" },
    to: [{ email: "estelleboisserie@orange.fr", name: "Moi-même" }],
    subject: `Nouveau message de ${nom} depuis le portfolio`,
    htmlContent: `<p><strong>Nom:</strong> ${nom}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Message:</strong><br>${message}</p>`
  };

  const envoiEmail = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': cleApiBrevo,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payloadBrevo)
  });

  if (envoiEmail.ok) {
    return res.status(200).json({ message: 'Email envoyé avec succès' });
  } else {
    return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
  }
}