import { existsSync, createReadStream, createWriteStream } from "fs";
import { mkdir, writeFile, readdir, rm } from "fs/promises";
import { type Context } from "koa";
import path from "path";
import { pipeline } from "stream/promises";
import { getFilePath, getChunkPath } from "../utils";

class FileController {
  // 上传切片
  static async uploadChunk(ctx: Context) {
    const { chunkName, fileHash } = ctx.request.body;
    // @ts-ignore
    const chunkFile = ctx.request.files?.chunk?.filepath;
    // TODO 这里需要对参数进行检查，防止为 undefined 导致报错
    const chunkPath = getChunkPath(fileHash);
    // 目录如果不存在先创建目录
    await mkdir(chunkPath, { recursive: true });
    await writeFile(path.resolve(chunkPath, chunkName), chunkFile);
    ctx.body = {
      code: 0,
    };
  }
  // 合并切片
  static async mergeChunk(ctx: Context) {
    const { fileName, fileHash, size } = ctx.request.body;
    // TODO 这里需要对参数进行检查，防止为 undefined 导致报错
    const chunkPath = getChunkPath(fileHash);
    // 判断目录是否存在
    if (existsSync(chunkPath)) {
      const filePath = getFilePath(fileName, fileHash);
      // 遍历目录
      const chunkFiles = await readdir(chunkPath);
      // 切片排序，直接读取目录获取的顺序可能错乱
      chunkFiles.sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
      // 并发写入
      await Promise.all(
        chunkFiles.map((chunkName, i) =>
          pipeline(
            createReadStream(path.resolve(chunkPath, chunkName)),
            createWriteStream(filePath, {
              start: i * size,
            }),
          ),
        ),
      );
      // 递归删除切片和目录，目录不存在则忽略
      await rm(chunkPath, { recursive: true, force: true });
      ctx.body = {
        code: 0,
        data: {
          msg: "切片合并成功",
        },
      };
    } else {
      ctx.body = {
        code: 500,
        data: {
          msg: "切片目录不存在",
        },
      };
    }
  }
  // 验证上传
  static async verifyUpload(ctx: Context) {
    const { fileName, fileHash } = ctx.request.query as { fileName: string; fileHash: string };
    // TODO 这里需要对参数进行检查，防止为 undefined 导致报错
    const filePath = getFilePath(fileName, fileHash);
    // 判断文件是否存在
    if (existsSync(filePath)) {
      ctx.body = {
        code: 0,
        data: { exist: true },
      };
    } else {
      const chunkPath = getChunkPath(fileHash);
      // 获取已上传切片
      const cacheChunks = existsSync(chunkPath) ? await readdir(chunkPath) : [];
      ctx.body = {
        code: 0,
        data: { exist: false, cacheChunks },
      };
    }
  }
}

export default FileController;
