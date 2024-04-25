import { mkdir, readdir, createReadStream, createWriteStream } from "fs-extra";
import path from "path";
import { type Context } from "koa";
import { pipeline } from "stream/promises";
import { CHUNK_SIZE } from "../const";

const SAVE_PATH = path.resolve(__dirname, "../node_modules/.cache");

class FileController {
  // 上传切片
  static async uploadChunk(ctx: Context) {
    const { hash, fileName, index } = ctx.request.body;
    // @ts-ignore
    const chunkFile = ctx.request.files?.chunk.filepath;
    const fileDir = path.resolve(SAVE_PATH, fileName.split(".")[0]);
    // 判断要写入文件的目录是否存在
    await mkdir(fileDir, { recursive: true });
    const readStream = createReadStream(chunkFile);
    const writeStream = createWriteStream(path.resolve(fileDir, index));
    readStream.pipe(writeStream);
    ctx.body = {
      code: 0,
    };
  }
  // 合并切片
  static async mergeChunk(ctx: Context) {
    const { fileName } = ctx.request.body;
    const fileDir = path.resolve(SAVE_PATH, fileName.split(".")[0]);
    // TODO 判断目录是否存在
    // 遍历目录
    const chunkFiles = await readdir(fileDir);
    // 切片排序，直接读取目录获取的顺序可能错乱
    chunkFiles.sort((a, b) => Number(a) - Number(b));
    // 并发写入
    await Promise.all(
      chunkFiles.map((chunkPath, i) =>
        pipeline(
          createReadStream(path.resolve(fileDir, chunkPath)),
          createWriteStream(path.resolve(fileDir, "combind"), {
            start: i * CHUNK_SIZE,
          }),
        ),
      ),
    );
    ctx.body = {
      code: 0,
    };
  }
}

export default FileController;
