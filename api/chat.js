/**
 * Initializes the AI Chatbot terminal.
 * Handles opening/closing the UI, maintaining chat history, 
 * formatting AI markdown to HTML, and communicating with the Vercel API.
 */
function initChatbot() {
  const toggleBtn = document.getElementById("chat-toggle-btn");
  const closeBtn = document.getElementById("chat-close-btn");
  const chatWindow = document.getElementById("chat-window");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  if (!toggleBtn || !chatWindow) return;

  // Stores the conversation history for the AI's memory
  let chatHistory = [];

  // Toggle UI visibility
  const toggleChat = () => {
    const isActive = chatWindow.classList.toggle("is-active");
    chatWindow.setAttribute("aria-hidden", !isActive);
    toggleBtn.setAttribute("aria-expanded", isActive);
    if (isActive) chatInput.focus();
  };

  toggleBtn.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", toggleChat);

  /**
   * Converts raw Markdown from the AI (**, -, *, \n) into styled HTML for the terminal.
   * @param {string} text - The raw text from Gemini.
   * @returns {string} - The formatted HTML string.
   */
  const formatTerminalText = (text) => {
    let formatted = text;
    // 1. Bold text (**word**) becomes yellow/bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<span class="term-highlight">$1</span>');
    // 2. Lists (- item or * item) become green arrows
    formatted = formatted.replace(/^[-*]\s+(.*)$/gm, '<div class="term-list"><span class="term-bullet">>></span> $1</div>');
    // 3. Line breaks become HTML breaks
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  };

  /**
   * Appends a message to the chat UI.
   * @param {string} text - The message content.
   * @param {boolean} isUser - True if the message is from the human.
   * @param {boolean} applyFormatting - True if the text should pass through the Markdown formatter.
   */
  const addMessage = (text, isUser = false, applyFormatting = false) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (isUser) {
      msgDiv.textContent = text;
    } else {
      const finalContent = applyFormatting ? formatTerminalText(text) : text;
      msgDiv.innerHTML = `<span class="prompt-prefix">estelle_ia@portfolio:~$</span><p>${finalContent}</p>`;
    }
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // Handle message submission
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Display user message
    addMessage(message, true, false);
    chatInput.value = "";
    
    // Add to memory
    chatHistory.push({ role: "user", parts: [{ text: message }] });

    // Display loading indicator
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot-message typing-indicator";
    typingDiv.innerHTML = `<span class="prompt-prefix">estelle_ia@portfolio:~$</span><p>Analyse des données...</p>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, history: chatHistory })
      });

      chatMessages.removeChild(typingDiv);

      if (!response.ok) throw new Error("Server Error");
      
      const data = await response.json();
      
      // Add AI response to memory
      chatHistory.push({ role: "model", parts: [{ text: data.reply }] });
      
      // Display AI response WITH Markdown formatting enabled (true)
      addMessage(data.reply, false, true);

    } catch (error) {
      if (chatMessages.contains(typingDiv)) chatMessages.removeChild(typingDiv);
      addMessage("Erreur réseau : Connexion au serveur perdue.", false, false);
    }
  });
}
