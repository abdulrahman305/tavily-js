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
      maxDepth: 2,
      maxBreadth: 20,
      limit: 100,
      includeImages: false,
      extractDepth: "basic",
      selectPaths: [],
      selectDomains: [],
      allowExternal: false,
      categories: [],
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
        },
        apiKey,
        proxies,
        options?.timeout ? Math.min(options.timeout, 120) : 60 // Max 120s, default to 60
      );

      return {
        success: response.data.success,
        ...(response.data.error ? { error: response.data.error } : {}),
        metadata: {
          pagesCrawled: response.data.metadata.pages_crawled,
          maxDepthReached: response.data.metadata.max_depth_reached,
          successfulUrls: response.data.metadata.successful_urls,
          totalCredits: response.data.metadata.total_credits,
          crawlOutcome: response.data.metadata.crawl_outcome,
        },
        config: {
          baseUrl: response.data.config.url,
          maxDepth: response.data.config.max_depth,
          maxBreadth: response.data.config.max_breadth,
          limit: response.data.config.limit,
          includeImages: response.data.config.include_images,
          selectPaths: response.data.config.select_paths,
          selectDomains: response.data.config.select_domains,
          allowExternal: response.data.config.allow_external,
          categories: response.data.config.categories,
        },
        data: response.data.data.map((item: any) => {
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