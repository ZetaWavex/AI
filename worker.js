export default {
  async fetch(request, env) {
    // 跨域配置
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // 处理预检OPTIONS请求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const tasks = [];
      // 1. 老式prompt模式
      const simpleInput = {
        prompt: "Tell me a joke about Cloudflare"
      };
      const simpleRes = await env.AI.run("@cf/meta/llama-3-8b-instruct", simpleInput);
      tasks.push({ type: "simple_prompt", input: simpleInput, output: simpleRes });

      // 2. 标准对话messages模式（推荐）
      const chatInput = {
        messages: [
          { role: "system", content: "你是中文友好助手，回答简洁" },
          { role: "user", content: "2020年世界大赛冠军是谁？" }
        ]
      };
      const chatRes = await env.AI.run("@cf/meta/llama-3-8b-instruct", chatInput);
      tasks.push({ type: "chat_messages", input: chatInput, output: chatRes });

      // 如果是POST请求，读取前端传来的自定义prompt追加任务
      if (request.method === "POST") {
        const body = await request.json();
        if (body?.userPrompt) {
          const customChat = {
            messages: [
              { role: "system", content: "全程使用中文回答" },
              { role: "user", content: body.userPrompt }
            ]
          };
          const customRes = await env.AI.run("@cf/meta/llama-3-8b-instruct", customChat);
          tasks.push({ type: "user_custom", input: customChat, output: customRes });
        }
      }

      return Response.json(tasks, { headers: corsHeaders });
    } catch (err) {
      return Response.json(
        { error: err.message },
        { status: 500, headers: corsHeaders }
      );
    }
  }
};