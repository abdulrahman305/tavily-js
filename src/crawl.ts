import { TavilyCrawlOptions, TavilyCrawlFunction } from "./types";
import { post } from "./utils";

export function _crawl(apiKey: string): TavilyCrawlFunction {
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
      categories: new Set(),
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const response = await post("crawl", {
      url: mergedOptions.url,
      max_depth: mergedOptions.maxDepth,
      max_breadth: mergedOptions.maxBreadth,
      include_images: mergedOptions.includeImages,
      extract_depth: mergedOptions.extractDepth,
      select_paths: mergedOptions.selectPaths,
      select_domains: mergedOptions.selectDomains,
      allow_external: mergedOptions.allowExternal,
      categories: mergedOptions.categories ? Array.from(mergedOptions.categories) : [],
      limit: mergedOptions.limit,
    }, apiKey);

    return {
      success: response.data.success,
      ...(response.data.error ? { error: response.data.error } : {}),
      metadata: {
        pagesCrawled: response.data.metadata.pages_crawled,
        maxDepthReached: response.data.metadata.max_depth_reached,
        successfulUrls: response.data.metadata.successful_urls,
        totalCredits: response.data.metadata.total_credits,
      },
      config: {
        baseUrl: response.data.config.url,
        maxDepth: response.data.config.max_depth,
        maxBreadth: response.data.config.max_breadth,
        includeImages: response.data.config.include_images,
      },
      data: response.data.data.map((item: any) => {
        return {
          url: item.url,
          rawContent: item.raw_content,
          images: item.images,
        };
      }),
    };
  };
}
