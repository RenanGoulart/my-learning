import type { UpsertCheckInInput } from "@my-learning/contracts";
import type { FastifyReply } from "fastify";

type CheckInService = {
  list(): Promise<unknown>;
  current(): Promise<unknown>;
  upsert(localDate: string, input: UpsertCheckInInput): Promise<unknown>;
  remove(localDate: string): Promise<void>;
};

export function createCheckInController(service: CheckInService) {
  return {
    list: () => service.list(),
    current: () => service.current(),
    upsert: ({
      params,
      body,
    }: {
      params: { localDate: string };
      body: UpsertCheckInInput;
    }) => service.upsert(params.localDate, body),
    async remove(
      { params }: { params: { localDate: string } },
      reply: FastifyReply,
    ) {
      await service.remove(params.localDate);
      return reply.code(204).send();
    },
  };
}
