import type { AdminOpenAI } from "./openai-api-types";

import {env}  from "@/env";

import {parseError} from "./utils";

//Por seguridad habría que automatizar y que cada 30 dias se renueve la admin apikey
//y tambien el project api key
//Podriamos utilizar un cron de vercel para generar esto


const ADMIN_API_KEY = env.OPENAI_ADMIN_API_KEY;

export const OpenAIAdminApiService = {
    timeout: 30000,
    async request<T>(
        endpoint: string,
        method: string = "GET",
        headers: undefined | {},
        body: undefined | string
    ): Promise<T> {
        const url = `https://api.openai.com/v1/${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        const fetchOptions: RequestInit = {
            headers: {
                "Authorization": `Bearer ${ADMIN_API_KEY}`,
                "Content-Type": "application/json",
            },
            method,
            body: undefined,
            signal: controller.signal,
        };
        if (headers !== undefined) {
            fetchOptions.headers = {...headers, ...fetchOptions.headers};
        }
        if (body !== undefined) {
            fetchOptions.body = body;
        }
        try {
            OpenAIAdminApiService.logRequest(endpoint, method, fetchOptions);
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);

            OpenAIAdminApiService.logResponse(endpoint, method, response);

            if (!response.ok) {
                const error = await parseError(response);
                throw new Error (`${endpoint}: ${error}`);
            }
            return await response.json() as unknown as T
        } catch(error: any) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === "AbortError") {
                throw new Error(`${endpoint}: Request timeout after ${this.timeout}ms`);
            }
            throw error;
        }
    },
    logRequest(endpoint: string, method: string, init: ResponseInit) {
        console.log(
            `OpenAI.${method} ${endpoint}`,
            init
        )

    },
    logResponse(endpoint: string, method: string, response: Response): void {
        console.log(
            `OpenAI.${method} ${endpoint}`,
            {ok: response.ok, status: response.status}
        )
    },

    // Projects handlers

    /** @doc: https://platform.openai.com/docs/api-reference/projects/create */
    async createProject(name: string): Promise<AdminOpenAI.Project> {
        return this.request<AdminOpenAI.Project>(
            "organization/projects",
            "POST",
            undefined,
            `{"name":${JSON.stringify(name)}}`
        );
    },

    /**
     * We want to use this function to create a Project API KEY
     * @doc https://platform.openai.com/docs/api-reference/projects/archive
     */
    async archiveProject(id: string) {
        return this.request<AdminOpenAI.Project>(
            `organization/projects/${id}/archive`,
            "POST",
            undefined,
            undefined
        );
    },

    /** @doc: https://platform.openai.com/docs/api-reference/projects/retrieve */
    async getProject(id: string): Promise<AdminOpenAI.Project>{
        return this.request<AdminOpenAI.Project>(
            `organization/projects/${JSON.stringify(id)}`,
            "GET",
            undefined,
            undefined
        );
    },

    // Service Account / Project Api keys
    /**
     * We want to use this function to create a Project API KEY
     * @doc https://platform.openai.com/docs/api-reference/project_service_accounts/create
     */
    async createProjectServiceAccount(
        projectId: string,
        name: string
    ): Promise<AdminOpenAI.Project.CreatedServiceAccount> {
        return this.request<AdminOpenAI.Project.CreatedServiceAccount>(
            `organization/projects/${projectId}/service_accounts`,
            "POST",
            undefined,
            `{"name": ${JSON.stringify(name)}}`
        );
    },
    /** @doc https://platform.openai.com/docs/api-reference/project_service_accounts/delete */
    async deleteProjectServiceAccount(
        projectId: string,
        serviceAccountId: string
    ): Promise<AdminOpenAI.Project.DeletedServiceAccount> {
        return this.request<AdminOpenAI.Project.DeletedServiceAccount>(
            `organization/projects/${projectId}/service_accounts/${serviceAccountId}`,
            "DELETE",
            undefined,
            undefined
        );
    }
} as const;

export default OpenAIAdminApiService;
