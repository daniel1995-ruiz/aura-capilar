import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { StorageDriver } from "./index.js";

export class LocalStorage implements StorageDriver {
  constructor(private root: string, private publicPrefix = "/uploads") {}

  async save({ buffer, fileName }: { buffer: Buffer; fileName: string }) {
    const now = new Date();
    const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    const ext = path.extname(fileName).toLowerCase().replace(/[^.a-z0-9]/g, "");
    const key = `${dir}/${randomUUID()}${ext}`;
    await mkdir(path.join(this.root, dir), { recursive: true });
    await writeFile(path.join(this.root, key), buffer);
    return { key, url: `${this.publicPrefix}/${key}` };
  }

  async remove(key: string) {
    const target = path.resolve(this.root, key);
    if (!target.startsWith(this.root)) return;
    await unlink(target).catch(() => undefined);
  }
}
