import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { encodingForModel, TiktokenModel } from "js-tiktoken";
import { TavilyProxyOptions } from "./types";
import { HttpsProxyAgent } from "https-proxy-agent";

const BASE_URL = "https://api.tavily.com";
const DEFAULT_MODEL_ENCODING = "gpt-3.5-turbo";
export const DEFAULT_MAX_TOKENS = 4000;
export const DEFAULT_CHUNKS_PER_SOURCE = 3;

type TavilyErrorData = {
  detail: { error: string };
};

export async function post(
  endpoint: string,
  body: any,
  apiKey: string,
  proxies?: TavilyProxyOptions,
  timeout: number = 60
): Promise<AxiosResponse> {
  const url = `${BASE_URL}/${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const timeoutInMillis = timeout * 1000;

  const config: AxiosRequestConfig = { headers, timeout: timeoutInMillis };
  if (proxies) {
    if (proxies.http) {
      config.httpAgent = new HttpsProxyAgent(proxies.http);
    }
    if (proxies.https) {
      config.httpsAgent = new HttpsProxyAgent(proxies.https);
    }
  }
  return axios.post(url, body, config);
}

function getTotalTokensFromString(
  str: string,
  encodingName: TiktokenModel = DEFAULT_MODEL_ENCODING
) {
  const encoding = encodingForModel(encodingName);
  return encoding.encode(str).length;
}

export function getMaxTokensFromList(
  data: Array<any>,
  maxTokens: number = DEFAULT_MAX_TOKENS
): string {
  var result = [];
  let currentTokens = 0;
  for (let item of data) {
    let itemString = JSON.stringify(item);
    let newTotalTokens = currentTokens + getTotalTokensFromString(itemString);
    if (newTotalTokens > maxTokens) {
      break;
    }
    result.push(item);
    currentTokens = newTotalTokens;
  }
  return JSON.stringify(result);
}

export function handleRequestError(res: AxiosResponse): never {
  const status = res.status;
  const message = (res.data as TavilyErrorData)?.detail?.error;

  if (!message) {
    throw new Error(`${status} Error: ${JSON.stringify(res.data)}`);
  }

  throw new Error(`${(res.data as TavilyErrorData)?.detail?.error}`);
}
