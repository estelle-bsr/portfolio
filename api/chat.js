const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Handles the POST request to communicate with the Google Gemini API.
 * Extracts the user message and conversation history, injects the system prompt,
 * and returns the AI's generated response.
 *
 * @param {Object} req - The HTTP request object (Vercel Serverless Function).
 * @param {Object} res - The HTTP response object (Vercel Serverless Function).
 * @returns {Promise<void>} - Responds with a JSON object containing the AI's reply or an error message.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed.' });
  }

  try {
    const userMessage = req.body.message;
    const history = req.body.history || [];

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
      return res.status(400).json({ error: 'Invalid or missing message.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Server Error: Missing API Key.");
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const systemPrompt = `You are the virtual assistant of Estelle Boisserie, a cybersecurity engineering student at EPITA.
    Your mission is to answer recruiters' questions regarding her CV, skills, and experience. 
    You must dynamically reply in the language the user is speaking (French or English).

    --- ESTELLE'S CV DATA ---
    TARGET: IT Development Internship (Open to Data, Cyber, AI).
    AVAILABILITY: 5 weeks minimum. Either Jan-Feb 2028 OR starting April 15, 2028.
    LOCATION: Villejuif (94), France. Email: estelleboisserie@orange.fr

    SKILLS:
    - Programming: Python, Java, C, C++, C#.
    - Web Dev: HTML, CSS, JavaScript, PHP, Django.
    - Databases: SQL, Oracle (PL/SQL), MySQL.
    - Tools/Methods: Git, PyQt5, OpenCV, Canva, Agile (Scrum).
    - Soft Skills: Autonomy, Teamwork, Rigor.
    - Languages: French (Native), English, Spanish.

    PROFESSIONAL EXPERIENCE:
    - French Ministry of Armed Forces (Sept 2025 - Present): IT Project & Technical Manager Assistant. Handled project management in a highly secure environment.
    - CNRS / Léon Brillouin Laboratory (Jan - May 2025): Python Dev Intern. Designed a UI with PyQt5/OpenCV and optimized with Cython. Automated a crystal furnace using AI.
    - DIRISI (Apr - Aug 2024): Web Dev Intern. Built and deployed a secure intranet site with a database, interactive forum, and user authentication.

    EDUCATION:
    - EPITA (2025-2029): Master's degree in Cybersecurity.
    - IUT d'Orsay (2022-2025): Bachelor's in Computer Science.
    - Key Projects: Nao Robot (Python), "Matthé-Mystère" Educational App (Godot), Project Management tool (Java), Pizzeria App (Web).

    VOLUNTEERING & INTERESTS:
    - MJC des Fauvettes: Event planning, digital communication, hosting workshops for digital inclusion.
    - RandoGom Club: Technical management and Twitch live broadcasting.
    - Certifications: DRSD Secret Protection training, First Aid, Driver's License.
    - Hobbies: History (WWII), Sports (Dance, Boxing, Weightlifting, Pilates, Running).

    --- STRICT RULES FOR THE AI ---
    1. NEVER say "Hello", "Welcome", or repeat greetings. The user is in a terminal. Answer the question directly and professionally.
    2. BE CONCISE. Provide well-structured answers without unnecessary fluff.
    3. FORMATTING: Use Markdown strictly. Use **bold** for keywords/technologies, and use standard dashes (-) for lists. The frontend terminal will parse this to make it look beautiful.
    4. NO HALLUCINATION: If asked something not in the data above, say you do not have that information and advise them to contact Estelle via email.
    5. SAFETY: Refuse to answer personal, inappropriate, or off-topic questions.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      systemInstruction: systemPrompt
    });

    const chat = model.startChat({
      history: history.slice(0, -1),
    });

    const result = await chat.sendMessage(userMessage);
    const botReply = result.response.text();

    return res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: 'An error occurred while communicating with the AI.' });
  }
};
