const promptEl = document.getElementById("prompt");
const runBtn = document.getElementById("run");
const output = document.getElementById("output");
const clearBtn = document.getElementById("clear");
const darkToggle = document.getElementById("darkToggle");
const clickSound = document.getElementById("clickSound");
const typeSound = document.getElementById("typeSound");

// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabs = document.querySelectorAll(".tab");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    tabs.forEach(t => t.classList.remove("active"));
    const target = document.getElementById(btn.dataset.tab);
    if (target) target.classList.add("active");
  });
});

// Gemini API key
const GEMINI_API_KEY = "AIzaSyCk3ljlxhDJwKh7o4vbt90jG1FOro-laJk";

// Typing animation
async function typeText(container, text) {
  container.textContent = "";
  for (let char of text) {
    container.textContent += char;
    typeSound.currentTime = 0; typeSound.play();
    await new Promise(r => setTimeout(r, 15));
  }
}

// Clean input
function cleanPrompt(text) {
  return text.trim().replace(/[^a-zA-Z0-9,.\s]/g,"").replace(/\s+/g," ");
}

// Clean output
function cleanResponse(text) {
  return text.replace(/\s+/g," ").trim();
}

// Gemini API call
async function callGemini(prompt) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_API_KEY;
  const body = {
    contents: [
      { parts: [{ text: `Create 3 recipes using ONLY these ingredients: ${prompt}.
- Number each step clearly
- Use proper measurements
- Do not add unrelated ingredients
- Output in clean recipe format` }] }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error("API Error: " + res.status);
  const data = await res.json();
  return cleanResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "No response");
}

// Run
runBtn.addEventListener("click", async () => {
  clickSound.play();
  let prompt = cleanPrompt(promptEl.value);
  if (!prompt) {
    output.textContent = "Please enter ingredients.";
    return;
  }

  output.textContent = "Thinking...";
  try {
    const reply = await callGemini(prompt);
    await typeText(output, reply);
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
});

// Clear
clearBtn.addEventListener("click", () => {
  clickSound.play();
  promptEl.value = "";
  output.textContent = "";
});

// Dark Mode
darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
});
