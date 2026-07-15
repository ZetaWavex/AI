export default {
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

    // 仅 /api 作为AI接口
    if (url.pathname === "/api" && request.method === "POST") {
      if (!env.AI) {
        return Response.json({ error: "AI绑定缺失，检查wrangler.toml" }, { status: 500, headers: corsHeaders });
      }
      try {
        const body = await request.json();
        if (!Array.isArray(body.chatMessages)) {
          return Response.json({ error: "缺少chatMessages对话数组" }, { status: 400, headers: corsHeaders });
        }
        // 替换为官方存在的模型
        const aiResult = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: body.chatMessages,
          max_tokens: 200
        });
        return Response.json({ answer: aiResult.response }, { headers: corsHeaders });
      } catch (e) {
        console.error("AI内部错误：", e);
        return Response.json({ error: e.message }, { status: 500, headers: corsHeaders });
      }
    }

    // 其余路径返回静态网页
    return env.ASSETS.fetch(request);
  }
};