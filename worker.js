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

    // GET请求返回前端页面，仅POST走AI接口
    if (request.method !== "POST") {
      return env.ASSETS.fetch(request);
    }

    // 检测AI绑定是否生效
    if (!env.AI) {
      return Response.json({ error: "AI绑定未配置，请检查wrangler.toml" }, { status: 500, headers: corsHeaders });
    }

    try {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return Response.json({ error: "请求JSON格式错误" }, { status: 400, headers: corsHeaders });
      }

      if (!Array.isArray(body.chatMessages)) {
        return Response.json({ error: "缺少chatMessages对话数组" }, { status: 400, headers: corsHeaders });
      }

      // 内置调用模型，无外网中转
      const aiResult = await env.AI.run(
        "@cf/meta/llama-3-8b-instruct-fast",
        { messages: body.chatMessages, max_tokens: 500 }
      );

      return Response.json({ answer: aiResult.response }, { headers: corsHeaders });
    } catch (err) {
      console.error("AI异常：", err);
      return Response.json({ error: "服务异常：" + err.message }, { status: 500, headers: corsHeaders });
    }
  }
};