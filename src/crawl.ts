import {
  TavilyCrawlOptions,
  TavilyCrawlFunction,
  TavilyProxyOptions,
} from "./types";
import { post, handleRequestError } from "./utils";
import { AxiosError, AxiosResponse } from "axios";

export function _crawl(
  apiKey: string,
  proxies?: TavilyProxyOptions
): TavilyCrawlFunction {
  return async function crawl(
    url: string,
    options: Partial<TavilyCrawlOptions> = {}
  ) {
    const defaultOptions: TavilyCrawlOptions = {
      url: url,
      maxDepth: 1,
      maxBreadth: 20,
      limit: 50,
      includeImages: false,
      extractDepth: "basic",
      selectPaths: null,
      selectDomains: null,
      allowExternal: false,
      categories: null,
      query: null,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      const response = await post(
        "crawl",
        {
          url: mergedOptions.url,
          max_depth: mergedOptions.maxDepth,
          max_breadth: mergedOptions.maxBreadth,
          limit: mergedOptions.limit,
          include_images: mergedOptions.includeImages,
          extract_depth: mergedOptions.extractDepth,
          select_paths: mergedOptions.selectPaths,
          select_domains: mergedOptions.selectDomains,
          allow_external: mergedOptions.allowExternal,
          categories: mergedOptions.categories,
          query: mergedOptions.query,
        },
        apiKey,
        proxies,
        options?.timeout ? Math.min(options.timeout, 120) : 60 // Max 120s, default to 60
      );

      return {
        responseTime: response.data.response_time,
        baseUrl: response.data.base_url,
        results: response.data.results.map((item: any) => {
          return {
            url: item.url,
            rawContent: item.raw_content,
            images: item.images,
          };
        }),
      };
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        handleRequestError(err.response as AxiosResponse);
      } else {
        throw new Error(
          `An unexpected error occurred while making the request. Error: ${err}`
        );
      }
    }
  };
}
