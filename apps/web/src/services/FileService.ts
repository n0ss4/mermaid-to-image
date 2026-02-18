import type { IFileService } from "./interfaces";

export class FileService implements IFileService {
  async readFile(file: File): Promise<string> {
    return file.text();
  }
}
