import {
  TavilyMapOptions,
  TavilyMapFunction,
  TavilyProxyOptions,
} from "./types";
import { post, handleRequestError, handleTimeoutError } from "./utils";
import { AxiosError, AxiosResponse } from "axios";

export function _map(
  apiKey: string,
  proxies?: TavilyProxyOptions
): TavilyMapFunction {
  return async function map(
    url: string,
    options: Partial<TavilyMapOptions> = {}
  ) {
    const {
      maxDepth,
      maxBreadth,
      limit,
      selectPaths,
      selectDomains,
      excludePaths,
      excludeDomains,
      allowExternal,
      categories,
      instructions,
      ...kwargs
    } = options;

    const timeout = options?.timeout ? Math.min(options.timeout, 120) : 60; // Max 120s, default to 60

    try {
      const response = await post(
        "map",
        {
          url: url,
          max_depth: maxDepth,
          max_breadth: maxBreadth,
          limit: limit,
          select_paths: selectPaths,
          select_domains: selectDomains,
          exclude_paths: excludePaths,
          exclude_domains: excludeDomains,
          allow_external: allowExternal,
          categories: categories,
          instructions: instructions,
          ...kwargs,
        },
        apiKey,
        proxies,
        timeout
      );

      return {
        responseTime: response.data.response_time,
        baseUrl: response.data.base_url,
        results: response.data.results,
      };
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === "ECONNABORTED") {
          handleTimeoutError(timeout);
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
