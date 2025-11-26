import {
    TavilyResearchOptions,
    TavilyResearchFunction,
    TavilyGetResearchFunction,
    TavilyProxyOptions,
} from "./types";
import { post, get, handleRequestError, handleTimeoutError } from "./utils";
import { AxiosError, AxiosResponse } from "axios";
import { Readable } from "stream";

export function _research(
    apiKey: string,
    proxies?: TavilyProxyOptions,
    apiBaseURL?: string
): TavilyResearchFunction {
    return async function research(
        input: string,
        options: Partial<TavilyResearchOptions> = {}
    ) {
        const {
            model,
            outputSchema,
            stream,
            citationFormat,
            mcps,
            timeout,
            ...kwargs
        } = options;

        // Map MCP objects from camelCase to snake_case for API
        const mappedMcps = mcps?.map((mcp) => ({
            name: mcp.name,
            url: mcp.url,
            transport: mcp.transport,
            tools_to_include: mcp.toolsToInclude,
            headers: mcp.headers,
        }));

        if (stream) {
            try {
                const response = await post(
                    "research",
                    {
                        input: input,
                        model,
                        output_schema: outputSchema,
                        stream: stream,
                        citation_format: citationFormat,
                        mcps: mappedMcps,
                        ...kwargs,
                    },
                    apiKey,
                    proxies,
                    timeout,
                    apiBaseURL,
                    'stream'
                );

                async function* streamGenerator(): AsyncGenerator<Buffer, void, unknown> {
                    const stream = response.data as Readable;
                    try {
                        for await (const chunk of stream) {
                            if (chunk) {
                                yield chunk; 
                            }
                        }
                    } finally {
                        if (!stream.destroyed) {
                            stream.destroy();
                        }
                    }
                }

                return streamGenerator();
            } catch (err) {
                if (err instanceof AxiosError) {
                    if (err.code === "ECONNABORTED") {
                        handleTimeoutError(timeout || 0);
                    }
                    if (err.response) {
                        handleRequestError(err.response as AxiosResponse);
                    }
                }
                throw new Error(
                    `An unexpected error occurred while making the request. Error: ${err}`
                );
            }
        } else {
            try {
                const response = await post(
                    "research",
                    {
                        input,
                        model,
                        output_schema: outputSchema,
                        stream,
                        citation_format: citationFormat,
                        mcps: mappedMcps,
                        ...kwargs,
                    },
                    apiKey,
                    proxies,
                    timeout,
                    apiBaseURL
                );

                return {
                    requestId: response.data.request_id,
                    createdAt: response.data.created_at,
                    status: response.data.status,
                    input: response.data.input,
                    model: response.data.model,
                };
            } catch (err) {
                if (err instanceof AxiosError) {
                    if (err.code === "ECONNABORTED") {
                        handleTimeoutError(timeout || 0);
                    }
                    if (err.response) {
                        handleRequestError(err.response as AxiosResponse);
                    }
                }
                throw new Error(
                    `An unexpected error occurred while making the request. Error: ${err}`
                );
            }
        }
    };
}

export function _getResearch(
    apiKey: string,
    proxies?: TavilyProxyOptions,
    apiBaseURL?: string
): TavilyGetResearchFunction {
    return async function getResearch(requestId: string) {
        const requestTimeout = 60; // Default timeout for GET requests

        try {
            const response = await get(
                `research/${requestId}`,
                apiKey,
                proxies,
                requestTimeout,
                apiBaseURL
            );

            return {
                requestId: response.data.request_id,
                createdAt: response.data.created_at,
                completedAt: response.data.completed_at,
                status: response.data.status,
                content: response.data.content,
                sources: response.data.sources,
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

