class FileController {
  // 查找切片
  static async findSplice(ctx, next) {
    ctx.status = 200;
    ctx.body = {
      a: "你好",
    };
  }
}

module.exports = FileController;
