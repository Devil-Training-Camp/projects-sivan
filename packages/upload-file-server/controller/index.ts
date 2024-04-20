import { type Context } from "koa";

class FileController {
  // 查找切片
  static async findSplice(ctx: Context) {
    ctx.status = 200;
    ctx.body = {
      a: "你好aa",
    };
  }
}

export default FileController;
