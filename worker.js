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

    // GET静态页面，POST才执行AI接口
    if (request.method !== "POST") {
      return env.ASSETS.fetch(request);
    }

    // 校验AI绑定是否生效
    if (!env.AI) {
      return Response.json({ error: "AI绑定未配置，请检查wrangler.toml" }, { status: 500, headers: corsHeaders });
    }

    try {
      // 解析前端对话参数
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return Response.json({ error: "请求体非标准JSON" }, { status: 400, headers: corsHeaders });
      }

      if (!Array.isArray(body.chatMessages)) {
        return Response.json({ error: "参数chatMessages对话数组缺失" }, { status: 400, headers: corsHeaders });
      }

      // 调用轻量化快速模型，降低超时概率
      const aiResult = await env.AI.run(
        "@cf/meta/llama-3-8b-instruct-fast",
        { messages: body.chatMessages, max_tokens: 500 }
      );

      return Response.json({ answer: aiResult.response }, { headers: corsHeaders });
    } catch (err) {
      console.error("AI调用异常：", err.message);
      return Response.json({ error: "服务异常：" + err.message }, { status: 500, headers: corsHeaders });
    }
  }
};