import type { CreateTrailInput, PatchTrailInput } from "@my-learning/contracts";
import type { FastifyReply } from "fastify";

type TrailService = {
  list(): Promise<unknown>;
  get(id: string): Promise<unknown>;
  create(input: CreateTrailInput): Promise<unknown>;
  update(id: string, input: PatchTrailInput): Promise<unknown>;
  remove(id: string): Promise<void>;
};

export function createTrailController(service: TrailService) {
  return {
    list: () => service.list(),
    get: ({ params }: { params: { trailId: string } }) =>
      service.get(params.trailId),
    async create({ body }: { body: CreateTrailInput }, reply: FastifyReply) {
      return reply.code(201).send(await service.create(body));
    },
    update: ({
      params,
      body,
    }: {
      params: { trailId: string };
      body: PatchTrailInput;
    }) => service.update(params.trailId, body),
    async remove(
      { params }: { params: { trailId: string } },
      reply: FastifyReply,
    ) {
      await service.remove(params.trailId);
      return reply.code(204).send();
    },
  };
}
