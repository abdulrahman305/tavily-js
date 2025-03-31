import { AxiosError, AxiosResponse } from "axios";
import {
  TavilyExtractOptions,
  TavilyExtractFunction,
  TavilyProxyOptions,
} from "./types";
import { handleRequestError, post } from "./utils";

export function _extract(
  apiKey: string,
  proxies?: TavilyProxyOptions
): TavilyExtractFunction {
  return async function extract(
    urls: Array<string>,
    options: TavilyExtractOptions = {
      includeImages: false,
      extractDepth: "basic",
      timeout: 60,
    }
  ) {
    const { includeImages, extractDepth, timeout, ...kwargs } = options;

    try {
      const response = await post(
        "extract",
        {
          urls,
          include_images: includeImages,
          extract_depth: extractDepth,
          ...kwargs,
        },
        apiKey,
        proxies,
        timeout ? Math.min(timeout, 120) : 60 // Max 120s, default to 60
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
