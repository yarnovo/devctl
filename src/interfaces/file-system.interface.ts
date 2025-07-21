import { Stats } from 'fs'

export interface IFileSystem {
  // 文件读写操作
  readFile(path: string, encoding?: BufferEncoding): Promise<string>
  writeFile(
    path: string,
    data: string,
    encoding?: BufferEncoding
  ): Promise<void>
  appendFile(
    path: string,
    data: string,
    encoding?: BufferEncoding
  ): Promise<void>

  // 目录操作
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>
  rmdir(path: string, options?: { recursive?: boolean }): Promise<void>
  readdir(path: string): Promise<string[]>

  // 文件/目录检查
  exists(path: string): Promise<boolean>
  stat(path: string): Promise<Stats>
  access(path: string): Promise<void>

  // 文件删除
  unlink(path: string): Promise<void>
  rm(
    path: string,
    options?: { recursive?: boolean; force?: boolean }
  ): Promise<void>
}

export const FILE_SYSTEM_TOKEN = Symbol('FileSystem')
