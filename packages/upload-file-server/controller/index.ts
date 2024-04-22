import fs, { createReadStream, createWriteStream } from "fs";
import { mkdir, readdir } from "fs/promises";
import path from "path";
import { type Context } from "koa";
import { pipeline } from "stream/promises";

const SAVE_PATH = path.resolve(__dirname, "../node_modules/.cache/temp");
const CHUNK_SIZE = 5 * 1024 * 1024;

class FileController {
  // 上传切片
  static async uploadChunk(ctx: Context) {
    const { hash } = ctx.request.body;
    // @ts-ignore
    const chunkFile = ctx.request.files?.chunk.filepath;
    const readStream = fs.createReadStream(chunkFile);
    // 判断文件夹是否存在,没有就创建
    // fs模块和fs/promise模块有啥区别?
    await mkdir(SAVE_PATH, { recursive: true });
    const writeStream = fs.createWriteStream(`${SAVE_PATH}/${hash}`);
    readStream.pipe(writeStream);
    ctx.body = {
      code: 0,
    };
  }
  // 合并切片
  static async mergeChunk(ctx: Context) {
    // 判断目录是否存在
    const chunkFiles = await readdir(SAVE_PATH);
    // 切片排序，防止错乱
    chunkFiles.sort((a, b) => Number(a) - Number(b));
    // 并发写入
    await Promise.all(
      chunkFiles.map((item, i) => {
        return pipeline(
          createReadStream(`${SAVE_PATH}/${item}`),
          createWriteStream(`${SAVE_PATH}/combind`, {
            start: i * CHUNK_SIZE,
          }),
        );
      }),
    );
    ctx.body = {
      code: 0,
    };
  }
}

export default FileController;
