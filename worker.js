export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // OPTIONS预检固定返回JSON
    if (request.method === "OPTIONS") {
      return Response.json({ok: true}, {headers: corsHeaders});
    }

    // GET静态页面，POST才走AI接口
    if (request.method !== "POST") {
      return env.ASSETS.fetch(request);
    }

    // 检测AI绑定是否存在
    if (!env.AI) {
      return Response.json({error: "AI绑定未生效，请检查wrangler.toml配置并重新部署"}, {status:500, headers:corsHeaders});
    }

    try {
      let payload;
      try {
        payload = await request.json();
      } catch (parseErr) {
        return Response.json({error: "请求体不是合法JSON"}, {status:400, headers:corsHeaders});
      }

      if (!Array.isArray(payload.chatMessages)) {
        return Response.json({error: "缺少chatMessages对话数组参数"}, {status:400, headers:corsHeaders});
      }

      // 调用轻量模型，降低超时
      const aiResp = await env.AI.run("@cf/meta/llama-3-8b-instruct-fast", {
        messages: payload.chatMessages,
        max_tokens: 200
      });

      return Response.json({answer: aiResp.response}, {headers: corsHeaders});
    } catch (serverErr) {
      console.error("服务内部错误：", serverErr);
      return Response.json({error: "AI推理失败：" + serverErr.message}, {status:500, headers:corsHeaders});
    }
  }
};