/* Play11 Chatbot JS (frontend-only) */
const Play11Chatbot = (() => {
  const PRESET_ANSWERS = {
    "what sizes do you offer": "Play11 jerseys are available from XS to XXL.",
    "do you support custom jerseys": "Yes, Play11 supports custom names and numbers.",
    "is this an official play11 store": "Yes, this is the official Play11 brand website."
  };

  const API_KEY = window.PLAY11_API_KEY || "";
  const API_URL = window.PLAY11_API_URL || "https://api.openai.com/v1/chat/completions";
  const API_MODEL = window.PLAY11_AI_MODEL || "gpt-4o-mini";

  const normalize = (text) =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

  const matchPreset = (text) => {
    const cleaned = normalize(text);
    const exact = PRESET_ANSWERS[cleaned];
    if (exact) return exact;

    if (cleaned.includes("sizes")) return PRESET_ANSWERS["what sizes do you offer"];
    if (cleaned.includes("custom") || cleaned.includes("name") || cleaned.includes("number")) {
      return PRESET_ANSWERS["do you support custom jerseys"];
    }
    if (cleaned.includes("official")) return PRESET_ANSWERS["is this an official play11 store"];

    return "Thanks for reaching out! Ask about sizes, customization, or store info.";
  };

  const createBubble = (text, type = "bot") => {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${type}`.trim();
    bubble.textContent = text;
    return bubble;
  };

  const createTypingBubble = () => {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble typing";
    bubble.textContent = "Play11 AI is typing...";
    return bubble;
  };

  const sendToApi = async (message) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages: [
          {
            role: "system",
            content: "You are the Play11 brand assistant. Be concise, helpful, and premium."
          },
          { role: "user", content: message }
        ],
        temperature: 0.4
      })
    });

    if (!response.ok) {
      return matchPreset(message);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || matchPreset(message);
  };

  const init = () => {
    const chatbot = document.querySelector(".chatbot");
    if (!chatbot) return;

    const toggle = chatbot.querySelector(".chatbot-toggle");
    const closeBtn = chatbot.querySelector(".chatbot-close");
    const form = chatbot.querySelector(".chatbot-form");
    const input = chatbot.querySelector("#chatbot-input");
    const messages = chatbot.querySelector("#chatbot-messages");
    const quickButtons = chatbot.querySelectorAll("[data-question]");

    const openChat = () => {
      chatbot.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      if (input) input.focus();
    };

    const closeChat = () => {
      chatbot.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (chatbot.classList.contains("open")) {
          closeChat();
          return;
        }
        openChat();
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", closeChat);

    const handleSend = async (question) => {
      if (!messages) return;
      const message = question.trim();
      if (!message) return;

      messages.appendChild(createBubble(message, "user"));
      const typing = createTypingBubble();
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;

      let reply = "";
      if (!API_KEY) {
        reply = matchPreset(message);
      } else {
        try {
          reply = await sendToApi(message);
        } catch (error) {
          reply = matchPreset(message);
        }
      }

      typing.remove();
      messages.appendChild(createBubble(reply, "bot"));
      messages.scrollTop = messages.scrollHeight;
    };

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!input) return;
        const value = input.value;
        input.value = "";
        handleSend(value);
      });
    }

    quickButtons.forEach((button) => {
      button.addEventListener("click", () => handleSend(button.dataset.question || ""));
    });

    if (messages && messages.children.length === 0) {
      messages.appendChild(createBubble("Hi! Ask me about sizes, customization, or the Play11 brand."));
    }
  };

  return { init };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", Play11Chatbot.init);
} else {
  Play11Chatbot.init();
}
