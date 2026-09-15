import jwt from "jsonwebtoken";
import type { FastifyReply, FastifyRequest } from "fastify";
import { config } from "./config.js";

type AdminToken = { sub: number; email: string };

export function signToken(user: { id: number; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: "7d" });
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return reply.code(401).send({ error: "No autorizado" });
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as unknown as AdminToken;
    (req as FastifyRequest & { admin?: AdminToken }).admin = payload;
  } catch {
    return reply.code(401).send({ error: "Sesión expirada" });
  }
}
