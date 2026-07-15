export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // 跨域预检
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET 加载网页，POST才走AI逻辑
    if (request.method !== "POST") {
      return env.ASSETS.fetch(request);
    }

    // 提前判断AI绑定是否存在
    if (!env.AI) {
      return Response.json({ error: "AI绑定缺失，检查wrangler.toml" }, { status: 500, headers: corsHeaders });
    }

    try {
      let body;
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: "请求体不是合法JSON" }, { status: 400, headers: corsHeaders });
      }

      if (!Array.isArray(body.chatMessages)) {
        return Response.json({ error: "缺少chatMessages参数" }, { status: 400, headers: corsHeaders });
      }

      // 轻量快速模型，降低超时概率
      const aiResult = await env.AI.run("@cf/meta/llama-3-8b-instruct-fast", {
        messages: body.chatMessages,
        max_tokens: 300
      });

      return Response.json({ answer: aiResult.response }, { headers: corsHeaders });
    } catch (err) {
      console.error("AI报错：", err.message);
      // 所有异常强制返回JSON，绝对不会空白
      return Response.json({ error: "推理失败：" + err.message }, { status: 500, headers: corsHeaders });
    }
  }
};