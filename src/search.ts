import { AxiosError, AxiosResponse } from "axios";
import {
  TavilySearchOptions,
  TavilySearchFuncton,
  TavilyQNASearchFuncton,
  TavilyContextSearchFuncton,
  TavilyProxyOptions,
} from "./types";
import {
  post,
  DEFAULT_MAX_TOKENS,
  getMaxTokensFromList,
  DEFAULT_CHUNKS_PER_SOURCE,
  handleRequestError,
  handleTimeoutError,
} from "./utils";

export function _search(
  apiKey: string,
  proxies?: TavilyProxyOptions
): TavilySearchFuncton {
  return async function search(
    query: string,
    options: Partial<TavilySearchOptions> = {}
  ) {
    const {
      searchDepth,
      topic,
      days,
      maxResults,
      includeImages,
      includeImageDescriptions,
      includeAnswer,
      includeRawContent,
      includeDomains,
      excludeDomains,
      timeRange,
      chunksPerSource,
      country,
      autoParameters,
      timeout,
      ...kwargs
    } = options;

    const requestTimeout = timeout ? Math.min(timeout, 120) : 60; // Max 120s, default to 60

    try {
      const response = await post(
        "search",
        {
          query,
          search_depth: searchDepth,
          topic: topic,
          days: days,
          max_results: maxResults,
          include_images: includeImages,
          include_image_descriptions: includeImageDescriptions,
          include_answer: includeAnswer,
          include_raw_content: includeRawContent,
          include_domains: includeDomains,
          exclude_domains: excludeDomains,
          time_range: timeRange,
          chunks_per_source: chunksPerSource,
          country: country,
          auto_parameters: autoParameters,
          ...kwargs,
        },
        apiKey,
        proxies,
        requestTimeout
      );

      return {
        query,
        responseTime: response.data.response_time,
        images: response.data.images.map((image: any) => {
          return {
            url: image?.url || image,
            description: image.description,
          };
        }),
        results: response.data.results.map((result: any) => {
          return {
            title: result.title,
            url: result.url,
            content: result.content,
            rawContent: result.raw_content,
            score: result.score,
            publishedDate: result.published_date,
          };
        }),
        answer: response.data.answer,
        autoParameters: {
          includeDomains: response.data.auto_parameters.include_domains,
          excludeDomains: response.data.auto_parameters.exclude_domains,
          topic: response.data.auto_parameters.topic,
          timeRange: response.data.auto_parameters.time_range,
          searchDepth: response.data.auto_parameters.search_depth,
        },
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

export function _searchQNA(
  apiKey: string,
  proxies?: TavilyProxyOptions
): TavilyQNASearchFuncton {
  return async function searchQNA(
    query: string,
    options: TavilySearchOptions = {}
  ) {
    const requestTimeout = options?.timeout
      ? Math.min(options.timeout, 120)
      : 60; // Max 120s, default to 60

    try {
      const response = await post(
        "search",
        {
          query,
          search_depth: options.searchDepth ?? "advanced",
          topic: options.topic,
          days: options.days,
          max_results: options.maxResults,
          include_answer: true,
          include_domains: options.includeDomains,
          exclude_domains: options.excludeDomains,
          chunks_per_source: options.chunksPerSource,
        },
        apiKey,
        proxies,
        requestTimeout
      );

      const answer = response.data.answer;

      return answer;
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

export function _searchContext(
  apiKey: string,
  proxies?: TavilyProxyOptions
): TavilyContextSearchFuncton {
  return async function searchContext(
    query: string,
    options: TavilySearchOptions = {}
  ) {
    const timeout = options?.timeout ? Math.min(options.timeout, 120) : 60; // Max 120s, default to 60

    try {
      const response = await post(
        "search",
        {
          query,
          search_depth: options.searchDepth,
          topic: options.topic,
          days: options.days,
          max_results: options.maxResults,
          include_domains: options.includeDomains,
          exclude_domains: options.excludeDomains,
          chunks_per_source: options.chunksPerSource,
        },
        apiKey,
        proxies,
        timeout
      );

      const sources = response.data?.results || [];

      const context = sources.map((source: any) => {
        return {
          url: source.url,
          content: source.content,
        };
      });

      return JSON.stringify(
        getMaxTokensFromList(context, options.maxTokens ?? DEFAULT_MAX_TOKENS)
      );
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
