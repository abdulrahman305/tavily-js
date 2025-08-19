import { AxiosError, AxiosResponse } from "axios";
import {
  TavilyExtractOptions,
  TavilyExtractFunction,
  TavilyProxyOptions,
} from "./types";
import { handleRequestError, handleTimeoutError, post } from "./utils";

export function _extract(
  apiKey: string,
  proxies?: TavilyProxyOptions,
  apiBaseURL?: string
): TavilyExtractFunction {
  return async function extract(
    urls: Array<string>,
    options: Partial<TavilyExtractOptions> = {}
  ) {
    const { includeImages, extractDepth, format, timeout, includeFavicon, ...kwargs } = options;

    const requestTimeout = timeout ? Math.min(timeout, 120) : 30; // Max 120s, default to 30

    try {
      const response = await post(
        "extract",
        {
          urls,
          include_images: includeImages,
          extract_depth: extractDepth,
          format,
          include_favicon: includeFavicon,
          timeout, // Add timeout to the payload
          ...kwargs,
        },
        apiKey,
        proxies,
        requestTimeout,
        apiBaseURL
      );

      return {
        responseTime: response.data.response_time,
        results: response.data.results.map((result: any) => {
          return {
            url: result.url,
            rawContent: result.raw_content,
            images: result.images,
            favicon: result.favicon,
          };
        }),
        failedResults: response.data.failed_results.map((result: any) => {
          return {
            url: result.url,
            error: result.error,
          };
        }),
        requestId: response.data.request_id,
      };
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === "ECONNABORTED") {
          handleTimeoutError(requestTimeout);
        }
        if (err.response) {
          handleRequestError(err.response as AxiosResponse);
        }
      }
      throw new Error(
        `An unexpected error occurred while making the request. Error: ${err}`
      );
    }
  };
}
