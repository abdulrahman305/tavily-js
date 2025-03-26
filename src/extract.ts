import {
  TavilyExtractOptions,
  TavilyExtractFunction,
  TavilyProxyOptions,
} from "./types";
import { post } from "./utils";

export function _extract(
  apiKey: string,
  proxies?: TavilyProxyOptions
): TavilyExtractFunction {
  return async function extract(
    urls: Array<string>,
    options: TavilyExtractOptions = {
      includeImages: false,
      extractDepth: "basic",
    }
  ) {
    const { includeImages, extractDepth, ...kwargs } = options;

    const response = await post(
      "extract",
      {
        urls,
        include_images: includeImages,
        extract_depth: extractDepth,
        ...kwargs,
      },
      apiKey,
      proxies
    );

    return {
      responseTime: response.data.response_time,
      results: response.data.results.map((result: any) => {
        return {
          url: result.url,
          rawContent: result.raw_content,
          images: result.images,
        };
      }),
      failedResults: response.data.failed_results.map((result: any) => {
        return {
          url: result.url,
          error: result.error,
        };
      }),
    };
  };
}
