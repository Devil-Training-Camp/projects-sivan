import { mkdir, readdir, createReadStream, createWriteStream, rm, existsSync } from "fs-extra";
import { type Context } from "koa";
import path from "path";
import { pipeline } from "stream/promises";
import { getFilePath, getChunkPath } from "../utils";

class FileController {
  // 上传切片
  static async uploadChunk(ctx: Context) {
    const { hash, fileHash } = ctx.request.body;
    // @ts-ignore
    const chunkFile = ctx.request.files?.chunk.filepath;
    const chunkPath = getChunkPath(fileHash);
    // 判断目录是否存在
    await mkdir(chunkPath, { recursive: true });
    const readStream = createReadStream(chunkFile);
    const writeStream = createWriteStream(path.resolve(chunkPath, hash));
    readStream.pipe(writeStream);
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
    if (existsSync(filePath)) {
      ctx.body = {
        code: 0,
        data: { exist: true },
      };
    } else {
      const chunkPath = getChunkPath(fileHash);
      const serverChunks = existsSync(chunkPath) ? await readdir(chunkPath) : [];
      ctx.body = {
        code: 0,
        data: { exist: false, serverChunks },
      };
    }
  }
}

export default FileController;
