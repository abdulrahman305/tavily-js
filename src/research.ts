import {
    TavilyResearchOptions,
    TavilyResearchFunction,
    TavilyGetResearchFunction,
    TavilyProxyOptions,
} from "./types";
import { post, get, handleRequestError, handleTimeoutError } from "./utils";
import { AxiosError, AxiosResponse } from "axios";

export function _research(
    apiKey: string,
    proxies?: TavilyProxyOptions,
    apiBaseURL?: string
): TavilyResearchFunction {
    return async function research(
        taskDescription: string,
        options: Partial<TavilyResearchOptions> = {}
    ) {
        const {
            researchDepth,
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

        try {
            const response = await post(
                "research",
                {
                    task_description: taskDescription,
                    research_depth: researchDepth,
                    output_schema: outputSchema,
                    stream: stream,
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
                taskDescription: response.data.task_description,
                researchDepth: response.data.research_depth,
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

