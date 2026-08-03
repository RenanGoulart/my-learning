import cors from "@fastify/cors";
import fp from "fastify-plugin";

export const corsPlugin = fp(async (app) => {
  await app.register(cors, {
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    origin: true,
  });
});
