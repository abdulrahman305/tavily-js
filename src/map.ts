import {
  TavilyMapOptions,
  TavilyMapFunction,
  TavilyProxyOptions,
} from "./types";
import { post, handleRequestError } from "./utils";
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
          ...kwargs
        },
        apiKey,
        proxies,
        options.timeout ? Math.min(options.timeout, 120) : 60
      );

      return {
        responseTime: response.data.response_time,
        baseUrl: response.data.base_url,
        results: response.data.results,
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
