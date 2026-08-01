import type { Prisma } from "@my-learning/database";
import type { FastifyError, FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { AppError } from "../shared/errors/app-error.js";

type ValidationIssue = {
  instancePath?: string;
  message?: string;
};

type ValidationError = FastifyError & {
  validation?: ValidationIssue[];
  validationContext?: "body" | "params" | "querystring" | "headers";
};

function isPrismaKnownError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    /^P\d{4}$/.test(error.code)
  );
}

function fieldErrors(
  validation: ValidationIssue[],
): Record<string, string[]> | undefined {
  const errors = validation.reduce<Record<string, string[]>>(
    (result, issue) => {
      const field =
        issue.instancePath?.replace(/^\//, "").replaceAll("/", ".") || "form";
      const message = issue.message ?? "Valor inválido.";
      result[field] ??= [];
      result[field].push(message);
      return result;
    },
    {},
  );

  return Object.keys(errors).length > 0 ? errors : undefined;
}

export const errorHandlerPlugin = fp((app: FastifyInstance) => {
  app.setErrorHandler((error: ValidationError, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.options.statusCode).send({
        error: {
          code: error.options.code,
          message: error.options.message,
          ...(error.options.fieldErrors
            ? { fieldErrors: error.options.fieldErrors }
            : {}),
        },
      });
    }

    if (error.validation) {
      const statusCode = error.validationContext === "body" ? 422 : 400;
      const errors = fieldErrors(error.validation);
      return reply.status(statusCode).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Os dados informados são inválidos.",
          ...(errors ? { fieldErrors: errors } : {}),
        },
      });
    }

    if (error.code === "FST_ERR_CTP_INVALID_JSON_BODY") {
      return reply.status(400).send({
        error: {
          code: "INVALID_JSON",
          message: "O JSON informado é inválido.",
        },
      });
    }

    if (isPrismaKnownError(error)) {
      const statusCode =
        error.code === "P2002" ? 409 : error.code === "P2025" ? 404 : 500;
      const message =
        statusCode === 409
          ? "Já existe um registro com estes dados."
          : statusCode === 404
            ? "O registro solicitado não foi encontrado."
            : "Ocorreu um erro inesperado.";
      return reply.status(statusCode).send({
        error: { code: error.code, message },
      });
    }

    return reply.status(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocorreu um erro inesperado.",
      },
    });
  });
});
