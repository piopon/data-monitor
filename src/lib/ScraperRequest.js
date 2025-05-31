export class ScraperRequest {
  async #sendRequest(url, method, headers, body = undefined) {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      ...body && {body},
    });
    return new Response(JSON.stringify(await response.json()), {
      status: response.status,
      headers: response.headers,
    });
  }
}
