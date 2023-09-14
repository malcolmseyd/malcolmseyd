import { connect } from "cloudflare:sockets";

const catURLBase = "https://cataas.com/cat/says/";
const msg = [
  "♪♪♪ (=^•_•^=)_∫",
  "Welcome to my profile!",
  "I've busted GitHub's cat-che,",
  "refresh the page to see a new cat!",
].join("\n");
const catURL = catURLBase + encodeURIComponent(msg);

export default {
  async fetch(
    request: Request,
    env: unknown,
    context: { waitUntil: (p: Promise<unknown>) => void }
  ): Promise<Response> {
    console.log(catURL);
    // local dev noise
    if (request.url.endsWith("favicon.ico")) {
      return new Response(null, { status: 404 });
    }

    const catResp = await fetch(catURL);
    const newResp = new Response(catResp.body, catResp);

    // don't cache
    newResp.headers.set("Cache-Control", "no-cache");

    // delete self from cache
    context.waitUntil(purgeSelf());

    return newResp;
  },
};

async function purgeSelf() {
  const selfURL = await getSelfURL();

  // wait a bit so the response is probably cached
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (selfURL) {
    await tcpPurge(selfURL);
  } else {
    console.error("No self URL found in README.md");
  }
}

async function getSelfURL() {
  const resp = await fetch(
    "https://github.com/malcolmseyd/malcolmseyd/blob/main/README.md",
    { headers: { Accept: "application/json" } }
  );
  const json = await resp.json();
  const text = (json as any).payload.blob.richText as string;
  const matches = text.match(
    /<img[^>]+alt="cat"[^>]+ src="(https:\/\/camo[^"]*)"[^>]*>/
  );
  return matches?.[1];
}

async function tcpPurge(url: string) {
  const socket = connect(
    {
      hostname: "camo.githubusercontent.com",
      port: 443,
    },
    { secureTransport: "on", allowHalfOpen: false }
  );
  const writer: WritableStreamDefaultWriter = socket.writable.getWriter();
  const reader: ReadableStreamDefaultReader = socket.readable.getReader();

  console.log("Purging", url);

  await writer.write(
    new TextEncoder().encode(
      `PURGE ${url} HTTP/1.1\r\nHost: camo.githubusercontent.com\r\n\r\n`
    )
  );

  const { value } = await reader.read();
  const response = new TextDecoder().decode(value);
  console.log(response);

  socket.close();
}
