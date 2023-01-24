const catURLBase = "https://cataas.com/cat/says/";
const msg = [
  "♪♪♪ (=^•_•^=)_∫",
  "Welcome to my profile!",
  //"I've busted GitHub's cat-che,",
  //"refresh the page to see a new cat!",
].join("\n");
const catURL = catURLBase + encodeURIComponent(msg);

export default {
  async fetch(request: Request): Promise<Response> {
    console.log(catURL);
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
