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

    const {
      maxDepth,
      maxBreadth,
      limit,
      extractDepth,
      selectPaths,
      selectDomains,
      excludePaths,
      excludeDomains,
      allowExternal,
      includeImages,
      categories,
      instructions,
      ...kwargs
    } = options;
    
    try {
      const response = await post(
        "crawl",
        {
          url: url,
          max_depth: maxDepth,
          max_breadth: maxBreadth,
          limit: limit,
          extract_depth: extractDepth,
          select_paths: selectPaths,
          select_domains: selectDomains,
          exclude_paths: excludePaths,
          exclude_domains: excludeDomains,
          allow_external: allowExternal,
          include_images: includeImages,
          categories: categories,
          instructions: instructions,
          ...kwargs
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
