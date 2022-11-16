const catURLBase = "https://cataas.com/cat/says/";
const msg = "Welcome to my github profile!\nRefresh the page to see a new cat!";
const catURL = catURLBase + encodeURIComponent(msg);

export default {
  async fetch(request: Request): Promise<Response> {
    // local dev noise
    if (request.url.endsWith("favicon.ico")) {
      return new Response(null, { status: 404 });
    }

    const catResp = await fetch(catURL);
    const newResp = new Response(catResp.body, catResp);

    // don't cache
    newResp.headers.set("Cache-Control", "no-cache");

    return newResp;
  },
};
