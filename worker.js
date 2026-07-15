export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (request.method !== "POST") return env.ASSETS.fetch(request);
    if (!env.AI) return Response.json({ error: "AI绑定未配置" }, { status: 500, headers: corsHeaders });
    try {
      let body;
      try { body = await request.json(); } catch { return Response.json({ error: "JSON格式错误" }, { status: 400, headers: corsHeaders }); }
      if (!Array.isArray(body.chatMessages)) return Response.json({ error: "缺少chatMessages" }, { status: 400, headers: corsHeaders });
      const aiResult = await env.AI.run("@cf/meta/llama-3-8b-instruct-fast", { messages: body.chatMessages, max_tokens: 500 });
      return Response.json({ answer: aiResult.response }, { headers: corsHeaders });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
  }
};