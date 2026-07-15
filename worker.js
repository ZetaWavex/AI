export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (request.method !== "POST") return env.ASSETS.fetch(request);

    try {
      const body = await request.json();
      const accountId = "e9f13f7f37f0b16ea12c955a925e6b1b";
      const apiToken = "cfut_dnIELMZ8u5DtBnVcUk6v5DdnU0i9BSmeIJCe2bexcf802911";

      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct-fast`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: body.chatMessages, max_tokens: 500 })
      });
      const data = await res.json();
      return Response.json({ answer: data.result.response }, { headers: corsHeaders });
    } catch (err) {
      return Response.json({ error: "AI请求失败：" + err.message }, { status: 500, headers: corsHeaders });
    }
  }
};