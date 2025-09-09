const promptEl = document.getElementById("prompt");
const runBtn = document.getElementById("run");
const output = document.getElementById("output");
const clearBtn = document.getElementById("clear");
const darkToggle = document.getElementById("darkToggle");
const clickSound = document.getElementById("clickSound");
const typeSound = document.getElementById("typeSound");

// Your Gemini API key
const GEMINI_API_KEY = "AIzaSyCk3ljlxhDJwKh7o4vbt90jG1FOro-laJk";

// Clear placeholder on first input
promptEl.addEventListener("input", () => {
  if(promptEl.placeholder !== "") promptEl.placeholder = "";
});

// Clean user input
function cleanPrompt(text) {
  text = text.trim();
  text = text.replace(/[^a-zA-Z0-9,.\s]/g,""); // remove symbols
  text = text.replace(/\s+/g," "); // collapse spaces
  return text;
}

// Clean API response
function cleanResponse(text) {
  text = text.replace(/[^a-zA-Z0-9.,:!?\s-]/g,""); // remove weird symbols
  text = text.replace(/\s+/g," "); // collapse multiple spaces
  return text.trim();
}

// Typing animation
async function typeText(container, text) {
  container.textContent = "";
  for(let char of text) {
    container.textContent += char;
    typeSound.currentTime = 0; typeSound.play();
    await new Promise(r => setTimeout(r, 15));
  }
}

// Gemini API call
async function callGemini(prompt) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_API_KEY;
  const body = {
    contents: [
      {
        parts: [
          { text: `Create 3 recipes using ONLY these ingredients: ${prompt}.
- Number each step
- Include measurements
- Format clearly with proper capitalization and punctuation
- Do not add unrelated ingredients`}
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });

  if(!res.ok) throw new Error("API error: " + res.status);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  return cleanResponse(text);
}

// Run button
runBtn.addEventListener("click", async () => {
  clickSound.play();
  let prompt = cleanPrompt(promptEl.value);
  if(!prompt){
    output.textContent = "Please enter ingredients.";
    return;
  }

  output.textContent = "Thinking...";
  try {
    const reply = await callGemini(prompt);
    await typeText(output, reply);
  } catch(err) {
    output.textContent = "Error: " + err.message;
  }
});

// Clear button
clearBtn.addEventListener("click", () => {
  clickSound.play();
  promptEl.value = "";
  output.textContent = "";
});

// Dark mode toggle
darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
});
