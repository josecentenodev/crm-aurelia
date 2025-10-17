import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { FieldType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

