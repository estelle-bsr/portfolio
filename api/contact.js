/**
 * Handles the contact form submission.
 * Verifies the hCaptcha token and dispatches an email using the Brevo API.
 * 
 * @param {Object} req - The HTTP request object containing the form payload.
 * @param {Object} res - The HTTP response object used to return the status.
 * @returns {Promise<void>} A JSON response indicating the success or failure of the operation.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { nom: name, email, message, captchaToken } = req.body;

  const hcaptchaSecretKey = process.env.HCAPTCHA_SECRET_KEY; 
  
  const hcaptchaBody = new URLSearchParams({
    secret: hcaptchaSecretKey,
    response: captchaToken
  });

  const captchaVerification = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    body: hcaptchaBody,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  const captchaResult = await captchaVerification.json();

  if (!captchaResult.success) {
    return res.status(400).json({ message: 'Captcha invalide.' });
  }

  const brevoApiKey = process.env.BREVO_API_KEY; 

  const brevoPayload = {
    sender: { name: name, email: "estelleboisserie@orange.fr" },
    to: [{ email: "estelleboisserie@orange.fr", name: "Moi-même" }],
    subject: `Nouveau message de ${name} depuis le portfolio`,
    htmlContent: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; padding: 40px 20px; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          
          <div style="background-color: #d1345b; color: #ffffff; padding: 25px 30px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Nouveau Message</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Depuis le portfolio d'Estelle</p>
          </div>

          <div style="padding: 30px;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              <strong>Nom :</strong> ${name}
            </p>
            <p style="margin: 0 0 25px 0; font-size: 16px;">
              <strong>Email :</strong> <a href="mailto:${email}" style="color: #d1345b; text-decoration: none;">${email}</a>
            </p>
            
            <p style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #888888; font-weight: bold; letter-spacing: 1px;">Message :</p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #d1345b; padding: 20px; border-radius: 0 4px 4px 0; white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #444444;">${message}</div>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="margin: 0; font-size: 12px; color: #999999;">
              Vérifié par hCaptcha &bull; Propulsé par Vercel
            </p>
          </div>

        </div>
      </div>
    `
  };

  const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': brevoApiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(brevoPayload)
  });

  if (emailResponse.ok) {
    return res.status(200).json({ message: 'Email envoyé avec succès' });
  } else {
    return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
  }
}
