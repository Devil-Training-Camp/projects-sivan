import fs from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { type Context } from "koa";

class FileController {
  // 查找切片
  static async findSplice(ctx: Context) {
    ctx.status = 200;
    ctx.body = {
      a: "你好aa",
    };
  }

  static async uploadChunk(ctx: Context) {
    const { hash } = ctx.request.body;
    // @ts-ignore
    const chunkFile = ctx.request.files?.chunk.filepath;
    const readStream = fs.createReadStream(chunkFile);
    const savePath = path.resolve(__dirname, "../node_modules/.cache");
    // 判断文件夹是否存在,没有就创建
    // fs模块和fs/promise模块有啥区别?
    await mkdir(savePath, { recursive: true });
    const writeStream = fs.createWriteStream(`${savePath}/${hash}`);
    readStream.pipe(writeStream);
    ctx.body = {
      code: 0,
      data: "你好",
    };
  }
}

export default FileController;
