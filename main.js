const WORKER_URL = "";
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");

let messagesHistory = [
  { role: "system", content: "你是中文AI助手，回答简洁易懂" }
];

function addMsg(text, isUser) {
  const div = document.createElement("div");
  div.className = `msg ${isUser ? "user" : "ai"}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchAI() {
  const userText = input.value.trim();
  if (!userText) return;

  addMsg(userText, true);
  input.value = "";
  messagesHistory.push({ role: "user", content: userText });

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ chatMessages: messagesHistory })
    });

    // 读取原始返回文本
    const rawContent = await res.text();
    console.log("后端完整返回内容：", rawContent);

    if (!rawContent.trim()) {
      throw new Error("后端无返回数据");
    }

    const data = JSON.parse(rawContent);
    if (data.error) throw new Error(data.error);

    messagesHistory.push({ role: "assistant", content: data.answer });
    addMsg(data.answer, false);
  } catch (err) {
    addMsg("AI请求失败：" + err.message, false);
  }
}

sendBtn.addEventListener("click", fetchAI);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") fetchAI();
});