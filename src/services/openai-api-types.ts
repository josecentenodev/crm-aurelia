export declare namespace AdminOpenAI {
    //https://platform.openai.com/docs/api-reference/projects/object
    export interface Project {
        archived_at: number | null,
        created_at: number,
        id: string,
        name: string,
        object: string, //organization.project
        status: string  //active or archive
    }
    export namespace Project {

        //https://platform.openai.com/docs/api-reference/project-service-accounts/object
        export interface ServiceAccount {
            created_at: number,
            id: string,
            name: string,
            object: string, //organization.project.service_account
            role: string   //owner or member
        }

        //https://platform.openai.com/docs/api-reference/project-service-accounts/create
        export interface CreatedServiceAccount {
            object: string,
            id: string,
            name: string,
            role: string,
            created_at: number,
            api_key: {
                object: string,
                value: string,
                name: string,
                created_at: number,
                id: string
            }
        }

        //https://platform.openai.com/docs/api-reference/project-service-accounts/delete
        export interface DeletedServiceAccount {
            object: string,
            id: string,
            deleted: boolean
        }
    }

}
