import { mkdir, writeFile, readdir, createReadStream, createWriteStream, rm, existsSync } from "fs-extra";
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
    // 判断目录是否存在
    await mkdir(chunkPath, { recursive: true });
    await writeFile(path.resolve(chunkPath, chunkName), chunkFile);
    ctx.body = {
      code: 0,
    };
  }
  // 合并切片
  static async mergeChunk(ctx: Context) {
    const { fileName, fileHash, size } = ctx.request.body;
    const chunkPath = getChunkPath(fileHash);
    const filePath = getFilePath(fileName, fileHash);
    // TODO 判断目录是否存在
    // 遍历目录
    const chunkFiles = await readdir(chunkPath);
    // 切片排序，直接读取目录获取的顺序可能错乱
    chunkFiles.sort((a, b) => Number(a) - Number(b));
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
    // 删除切片目录
    rm(chunkPath, { recursive: true });
    ctx.body = {
      code: 0,
    };
  }
  // 验证上传
  static async verifyUpload(ctx: Context) {
    const { fileName, fileHash } = ctx.request.query as { fileName: string; fileHash: string };
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
