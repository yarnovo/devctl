import { fs, vol, type IFs, type NestedDirectoryJSON } from 'memfs'
import { Stats } from 'fs'
import { injectable } from 'tsyringe'
import { IFileSystem } from '../interfaces/file-system.interface.js'

@injectable()
export class MemoryFileSystem implements IFileSystem {
  private fs: IFs

  constructor() {
    this.fs = fs
  }

  async readFile(
    path: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<string> {
    return this.fs.promises.readFile(path, encoding) as Promise<string>
  }

  async writeFile(
    path: string,
    data: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<void> {
    await this.fs.promises.writeFile(path, data, { encoding })
  }

  async appendFile(
    path: string,
    data: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<void> {
    await this.fs.promises.appendFile(path, data, { encoding })
  }

  async mkdir(
    path: string,
    options: { recursive?: boolean } = {}
  ): Promise<void> {
    await this.fs.promises.mkdir(path, options)
  }

  async rmdir(
    path: string,
    options: { recursive?: boolean } = {}
  ): Promise<void> {
    await this.fs.promises.rmdir(path, options)
  }

  async readdir(path: string): Promise<string[]> {
    return this.fs.promises.readdir(path) as Promise<string[]>
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.fs.promises.access(path)
      return true
    } catch {
      return false
    }
  }

  async stat(path: string): Promise<Stats> {
    return this.fs.promises.stat(path) as Promise<Stats>
  }

  async access(path: string): Promise<void> {
    await this.fs.promises.access(path)
  }

  async unlink(path: string): Promise<void> {
    await this.fs.promises.unlink(path)
  }

  async rm(
    path: string,
    options: { recursive?: boolean; force?: boolean } = {}
  ): Promise<void> {
    await this.fs.promises.rm(path, options)
  }

  // 测试辅助方法
  reset(): void {
    vol.reset()
  }

  fromJSON(json: Record<string, string>, cwd?: string): void {
    vol.fromJSON(json, cwd)
  }

  fromNestedJSON(json: NestedDirectoryJSON, cwd?: string): void {
    vol.fromNestedJSON(json, cwd)
  }
}
