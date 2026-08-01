import type {
  ConvertResourceInput,
  CreateResourceInput,
  PatchResourceInput,
} from "@my-learning/contracts";
import type { FastifyReply } from "fastify";

type ResourceService = {
  preview(
    id: string,
    input: Pick<ConvertResourceInput, "targetCategory" | "targetFormat">,
  ): Promise<unknown>;
  convert(id: string, input: ConvertResourceInput): Promise<unknown>;
  create(trailId: string, input: CreateResourceInput): Promise<unknown>;
  get(id: string): Promise<unknown>;
  update(id: string, input: PatchResourceInput): Promise<unknown>;
  updateStatus(id: string, status: ResourceStatus): Promise<unknown>;
  reorder(trailId: string, resourceIds: string[]): Promise<unknown>;
  remove(id: string): Promise<void>;
};

type ResourceStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export function createResourceController(service: ResourceService) {
  return {
    preview: ({
      params,
      body,
    }: {
      params: { resourceId: string };
      body: Pick<ConvertResourceInput, "targetCategory" | "targetFormat">;
    }) => service.preview(params.resourceId, body),
    convert: ({
      params,
      body,
    }: {
      params: { resourceId: string };
      body: ConvertResourceInput;
    }) => service.convert(params.resourceId, body),
    async create(
      {
        params,
        body,
      }: { params: { trailId: string }; body: CreateResourceInput },
      reply: FastifyReply,
    ) {
      return reply.code(201).send(await service.create(params.trailId, body));
    },
    get: ({ params }: { params: { resourceId: string } }) =>
      service.get(params.resourceId),
    update: ({
      params,
      body,
    }: {
      params: { resourceId: string };
      body: PatchResourceInput;
    }) => service.update(params.resourceId, body),
    updateStatus: ({
      params,
      body,
    }: {
      params: { resourceId: string };
      body: { status: ResourceStatus };
    }) => service.updateStatus(params.resourceId, body.status),
    reorder: ({
      params,
      body,
    }: {
      params: { trailId: string };
      body: { resourceIds: string[] };
    }) => service.reorder(params.trailId, body.resourceIds),
    async remove(
      { params }: { params: { resourceId: string } },
      reply: FastifyReply,
    ) {
      await service.remove(params.resourceId);
      return reply.code(204).send();
    },
  };
}
