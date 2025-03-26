import { TavilyClientOptions, TavilyClient, TavilyProxyOptions } from "./types";
import { _search, _searchQNA, _searchContext } from "./search";
import { _extract } from "./extract";

export function tavily(options?: TavilyClientOptions): TavilyClient {
  const apiKey = options?.apiKey || process.env.TAVILY_API_KEY;
  const proxies: TavilyProxyOptions = {
    http: options?.proxies?.http || process.env.TAVILY_HTTP_PROXY,
    https: options?.proxies?.https || process.env.TAVILY_HTTPS_PROXY,
  };

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
