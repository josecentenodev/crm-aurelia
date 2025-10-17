import type { AdminOpenAI } from "@/services/openai-api-types";
import type { PrismaClient, Prisma, DefaultArgs } from "@prisma/client";

import { TRPCError } from "@trpc/server";

import { Encryptor } from "@/lib/encryptor/functions"
import { OpenAIAdminApiService } from "@/services/openai-api-services";
import { db } from "@/server/db";
import { Logger } from "@/server/utils/logger"

export const AiInfo = {
  async create(clientId: string, name: string) {
    try {
      const projectData = await OpenAIAdminApiService.createProject(name);
      const serviceSource = (
        await OpenAIAdminApiService.createProjectServiceAccount(
          projectData.id,
          `service_${encodeURI(name)}_${Date.now()}`
        )
      );
      console.info({projectData, serviceSource});
      const apiKey = serviceSource.api_key;
      return await db.clientAiInfo.create({
        data: {
          projectId: projectData.id,
          projectName: projectData.name,
          projectCreateAt: new Date(projectData.created_at * 1000),
          serviceAccountId: serviceSource.id,
          serviceAccountName: serviceSource.name,
          serviceAccountCreateAt: new Date(serviceSource.created_at * 1000),
          apiKeyId: apiKey.id,
          apiKeyValue: Encryptor.encrypt(apiKey.value),
          client: {
            connect: {id: clientId}
          }
        }
      });
    } catch (error: unknown) {
      throw error;
    }
  },

  async get(
    clientId: string,
    select?: Record<string, boolean>,
    tx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
  ) {
    let d: any;
    if (tx !== undefined) {
      d = tx;
    } else {
      d = db;
    }
    if (select !== undefined) {
      return await d.clientAiInfo.findUnique({
        where: {clientId},
        select
      });
    } else {
      return await d.clientAiInfo.findUnique({where: {clientId}});
    }
  },

  async update(clientId: string) {
    const data = await db.clientAiInfo.findUnique({where: {clientId}});
    if (data === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cliente no encontrado"
      });
    }
    const projectId = Encryptor.decrypt(data.projectId);
    const oldServiceAccountId = Encryptor.decrypt(data.serviceAccountId);
    const newServiceName = `service_${encodeURI(data.projectName)}_${Date.now()}`;
    const [deleteService, newService] = await Promise.allSettled([
      OpenAIAdminApiService.deleteProjectServiceAccount(
        projectId,
        oldServiceAccountId
      ),
      OpenAIAdminApiService.createProjectServiceAccount(
        projectId,
        newServiceName
      )
    ]);


    //You can not remove a ServiceAccount
    const errorMessage = `OpenAI | Can not delete Project Service Account ${data.serviceAccountName}`;
    if (deleteService.status === "rejected") {
      Logger.error(errorMessage, deleteService.reason);
    } else if (!deleteService.value.deleted) {
      Logger.error(errorMessage);
    }

    if (newService.status === "rejected") {
      throw new Error(newService.reason);
    }

    const serviceSource = newService.value as AdminOpenAI.Project.CreatedServiceAccount;
    const apiKey = serviceSource.api_key;
    return await db.clientAiInfo.update({
      where: {clientId},
      data: {
        serviceAccountId: serviceSource.id,
        serviceAccountName: serviceSource.name,
        serviceAccountCreateAt: new Date(serviceSource.created_at),
        apiKeyId: apiKey.id,
        apiKeyValue: Encryptor.encrypt(apiKey.value),
      }
    });
  },
  async delete(clientId: string, aiInfoId: string) {
    const data = await db.clientAiInfo.findUnique({where: {clientId}});
    if (data === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cliente no encontrado"
      });
    }
    const projectId = Encryptor.decrypt(data.projectId);

    try {
      const archiveProject = await OpenAIAdminApiService.archiveProject(projectId);
      if (archiveProject.status !== "archived") {
        Logger.error(`OpenAI | Can not archive project ${data.projectName}`)
      }
    } catch (error) {
      Logger.error(`OpenAI | Can not archive project ${data.projectName}`, error)
    }

    return await db.clientAiInfo.delete({ where: {id: aiInfoId} });
  }
};
