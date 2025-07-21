import { promises as fs, Stats } from 'fs'
import { injectable } from 'tsyringe'
import { IFileSystem } from '../interfaces/file-system.interface.js'

@injectable()
export class RealFileSystem implements IFileSystem {
  async readFile(
    path: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<string> {
    return fs.readFile(path, encoding)
  }

  async writeFile(
    path: string,
    data: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<void> {
    await fs.writeFile(path, data, encoding)
  }

  async appendFile(
    path: string,
    data: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<void> {
    await fs.appendFile(path, data, encoding)
  }

  async mkdir(
    path: string,
    options: { recursive?: boolean } = {}
  ): Promise<void> {
    await fs.mkdir(path, options)
  }

  async rmdir(
    path: string,
    options: { recursive?: boolean } = {}
  ): Promise<void> {
    await fs.rmdir(path, options)
  }

  async readdir(path: string): Promise<string[]> {
    return fs.readdir(path)
  }

  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path)
      return true
    } catch {
      return false
    }
  }

  async stat(path: string): Promise<Stats> {
    return fs.stat(path)
  }

  async access(path: string): Promise<void> {
    await fs.access(path)
  }

  async unlink(path: string): Promise<void> {
    await fs.unlink(path)
  }

  async rm(
    path: string,
    options: { recursive?: boolean; force?: boolean } = {}
  ): Promise<void> {
    await fs.rm(path, options)
  }
}
