export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // 跨域预检
    if (request.method === "OPTIONS") {
      return new Response(JSON.stringify({ok:true}), { headers: corsHeaders });
    }

    // GET 走静态页面
    if (request.method !== "POST") {
      return env.ASSETS.fetch(request);
    }

    // 检测AI绑定
    if (!env.AI) {
      return Response.json({ error: "AI绑定未配置" }, { status: 500, headers: corsHeaders });
    }

    try {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return Response.json({ error: "请求不是合法JSON" }, { status: 400, headers: corsHeaders });
      }

      if (!body.chatMessages || !Array.isArray(body.chatMessages)) {
        return Response.json({ error: "缺少chatMessages数组" }, { status: 400, headers: corsHeaders });
      }

      const aiResult = await env.AI.run("@cf/meta/llama-3-8b-instruct-fast", {
        messages: body.chatMessages,
        max_tokens: 300
      });

      return Response.json({ answer: aiResult.response }, { headers: corsHeaders });
    } catch (err) {
      console.error("AI错误:", err);
      // 所有报错一定返回JSON，杜绝空白返回
      return Response.json({ error: "后端异常: " + err.message }, { status: 500, headers: corsHeaders });
    }
  }
};