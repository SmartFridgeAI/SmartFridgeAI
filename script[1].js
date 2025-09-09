const promptEl = document.getElementById("prompt");
const runBtn = document.getElementById("run");
const output = document.getElementById("output");
const clearBtn = document.getElementById("clear");
const darkToggle = document.getElementById("darkToggle");
const clickSound = document.getElementById("clickSound");
const typeSound = document.getElementById("typeSound");

// Your Gemini key
const GEMINI_API_KEY = "AIzaSyCk3ljlxhDJwKh7o4vbt90jG1FOro-laJk";

// Clear placeholder on first input
promptEl.addEventListener("input", ()=>{
  if(promptEl.placeholder !== "") promptEl.placeholder = "";
});

// Clean input
function cleanPrompt(text){
  text = text.trim();
  text = text.replace(/[^a-zA-Z0-9,.\s]/g,""); // remove symbols
  text = text.replace(/\s+/g," "); // collapse spaces
  return text;
}

// Typing effect
async function typeText(container, text){
  container.textContent = "";
  for(let char of text){
    container.textContent += char;
    typeSound.currentTime = 0; typeSound.play();
    await new Promise(r=>setTimeout(r,20));
  }
}

// Gemini API call (direct client-side attempt)
async function callGemini(prompt){
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_API_KEY;
  const body = {
    contents: [
      {parts: [{text: `Make 3 clear recipes using these ingredients: ${prompt}.
- Number each step
- Include measurements
- Ignore impossible combos`}]} 
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });

  if(!res.ok) throw new Error("API error: " + res.status);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

// Run button
runBtn.addEventListener("click", async ()=>{
  clickSound.play();
  let prompt = cleanPrompt(promptEl.value);
  if(!prompt){ output.textContent = "Please enter ingredients."; return; }
  output.textContent = "Thinking...";
  try{
    const reply = await callGemini(prompt);
    const formatted = reply.replace(/\n\s*\d\./g,"\n\n$&");
    await typeText(output, formatted);
  }catch(err){ output.textContent = "Error: "+err.message; }
});

// Clear button
clearBtn.addEventListener("click", ()=>{
  clickSound.play();
  promptEl.value="";
  output.textContent="";
});

// Dark mode
darkToggle.addEventListener("change", ()=>{
  document.body.classList.toggle("dark", darkToggle.checked);
});