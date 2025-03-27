import { TavilyClientOptions, TavilyClient, TavilyProxyOptions } from "./types";
import { _search, _searchQNA, _searchContext } from "./search";
import { _extract } from "./extract";

export function tavily(options?: TavilyClientOptions): TavilyClient {
  const apiKey = options?.apiKey || process.env.TAVILY_API_KEY;
  const proxies = (() => {
    const http = options?.proxies?.http || process.env.TAVILY_HTTP_PROXY;
    const https = options?.proxies?.https || process.env.TAVILY_HTTPS_PROXY;

    const result = {} as TavilyProxyOptions;

    if (http) result.http = http;
    if (https) result.https = https;

    return Object.keys(result).length > 0 ? result : undefined;
  })();

  if (!apiKey) {
    throw new Error("No API key provided");
  }

  return {
    search: _search(apiKey, proxies),
    extract: _extract(apiKey, proxies),
    searchQNA: _searchQNA(apiKey, proxies),
    searchContext: _searchContext(apiKey, proxies),
  };
}
