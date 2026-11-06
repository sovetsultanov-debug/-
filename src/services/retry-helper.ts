/**
 * Rate-limit and retry helper following AI Studio Science skill guidelines.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
  baseDelayMs = 500
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      if (
        (response.status === 429 || response.status >= 500) &&
        attempt < maxRetries
      ) {
        const retryAfter = Number(response.headers.get('Retry-After'));
        const delay =
          !Number.isNaN(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `HTTP ${response.status} (${response.statusText}) from ${url}: ${errorBody.slice(0, 200)}`
      );
    } catch (err: any) {
      if (attempt >= maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)));
    }
  }
  throw new Error(`Exhausted retries for ${url}`);
}
