// 替换成你自己的 Worker 地址
const WORKER_URL = "https://xxx.workers.dev";

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");

// 存储对话历史
let messagesHistory = [
  { role: "system", content: "你是中文AI助手，回答简洁易懂" }
];

// 渲染消息到页面
function addMsg(text, isUser) {
  const div = document.createElement("div");
  div.className = `msg ${isUser ? "user" : "ai"}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 请求Cloudflare Worker AI
async function fetchAI() {
  const userText = input.value.trim();
  if (!userText) return;

  // 展示用户消息
  addMsg(userText, true);
  input.value = "";

  // 推入历史
  messagesHistory.push({ role: "user", content: userText });

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ chatMessages: messagesHistory })
    });
    const data = await res.json();
    const aiText = data.answer;

    // 保存AI回复到对话历史
    messagesHistory.push({ role: "assistant", content: aiText });
    addMsg(aiText, false);
  } catch (err) {
    addMsg("AI请求失败：" + err.message, false);
  }
}

sendBtn.addEventListener("click", fetchAI);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") fetchAI();
});
