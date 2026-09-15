import { config } from "../config.js";
import { LocalStorage } from "./local.js";

/**
 * Contrato de almacenamiento de archivos.
 * Las URLs guardadas en BD son relativas (/uploads/...) para drivers locales,
 * o absolutas (https://cdn...) para drivers externos (S3, Cloudinary, R2).
 * Para migrar: implementar este contrato y seleccionarlo con STORAGE_DRIVER.
 */
export interface StorageDriver {
  save(input: { buffer: Buffer; fileName: string; mimeType: string }): Promise<{ key: string; url: string }>;
  remove(key: string): Promise<void>;
}

function createStorage(): StorageDriver {
  switch (config.storageDriver) {
    case "local":
      return new LocalStorage(config.uploadDir);
    default:
      throw new Error(`STORAGE_DRIVER no soportado: ${config.storageDriver}`);
  }
}

export const storage = createStorage();
