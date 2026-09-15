import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { mkdirSync } from "node:fs";
import { Prisma } from "@prisma/client";
import { config } from "./config.js";
import { ApiError } from "./lib/http.js";
import { publicRoutes } from "./routes/public.js";
import { adminRoutes } from "./routes/admin.js";

const app = Fastify({ logger: { level: "info" } });

mkdirSync(config.uploadDir, { recursive: true });

await app.register(cors, {
  origin: config.corsOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});
await app.register(multipart, { limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 1 } });
await app.register(fastifyStatic, {
  root: config.uploadDir,
  prefix: "/uploads/",
  setHeaders: (res) => res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
});

app.setErrorHandler((error, _req, reply) => {
  if (error instanceof ApiError) return reply.code(error.statusCode).send({ error: error.message });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return reply.code(409).send({ error: "Ya existe un registro con ese identificador (slug o correo)" });
    if (error.code === "P2025") return reply.code(404).send({ error: "Registro no encontrado" });
    if (error.code === "P2003") return reply.code(400).send({ error: "Referencia inválida" });
  }
  const status = (error as { statusCode?: number }).statusCode ?? 500;
  if (status >= 500) app.log.error(error);
  return reply.code(status).send({ error: status >= 500 ? "Error interno del servidor" : (error as Error).message });
});

app.get("/health", async () => ({ ok: true }));
await app.register(publicRoutes, { prefix: "/api/public" });
await app.register(adminRoutes, { prefix: "/api/admin" });

await app.listen({ port: config.port, host: "0.0.0.0" });
