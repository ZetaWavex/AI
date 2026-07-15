// worker.js
var worker_default = {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return Response.json({ ok: true }, { headers: corsHeaders });
    }
    if (url.pathname === "/api" && request.method === "POST") {
      if (!env.AI) {
        return Response.json({ error: "AI\u7ED1\u5B9A\u7F3A\u5931\uFF0C\u68C0\u67E5wrangler.toml" }, { status: 500, headers: corsHeaders });
      }
      try {
        const body = await request.json();
        if (!Array.isArray(body.chatMessages)) {
          return Response.json({ error: "\u7F3A\u5C11chatMessages\u5BF9\u8BDD\u6570\u7EC4" }, { status: 400, headers: corsHeaders });
        }
        const aiResult = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: body.chatMessages,
          max_tokens: 300
        });
        return Response.json({ answer: aiResult.response }, { headers: corsHeaders });
      } catch (e) {
        console.error("AI\u5185\u90E8\u9519\u8BEF\uFF1A", e);
        return Response.json({ error: e.message }, { status: 500, headers: corsHeaders });
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
