import {
  mkdir,
  readdir,
  createReadStream,
  createWriteStream,
  rm,
  existsSync,
} from "fs-extra";
import path from "path";
import { type Context } from "koa";
import { pipeline } from "stream/promises";

const SAVE_PATH = path.resolve(__dirname, "../node_modules/.cache");
const CHUNK_DIR = "chunkDir";

class FileController {
  // 上传切片
  static async uploadChunk(ctx: Context) {
    const { hash, fileHash } = ctx.request.body;
    // @ts-ignore
    const chunkFile = ctx.request.files?.chunk.filepath;
    const chunkDir = path.resolve(SAVE_PATH, `${CHUNK_DIR}_${fileHash}`);
    // 判断目录是否存在
    await mkdir(chunkDir, { recursive: true });
    const readStream = createReadStream(chunkFile);
    const writeStream = createWriteStream(path.resolve(chunkDir, hash));
    // 这里有一个风险，stream 写出的过程是异步的，但你下面直接返回了 ctx.body
    // 这会导致返回的时候文件还没有写完，可能会出错而接口没有正确返回错误信息，前端无感知
    readStream.pipe(writeStream);
    ctx.body = {
      code: 0,
    };
  }
  // 合并切片
  static async mergeChunk(ctx: Context) {
    const { fileName, fileHash, size } = ctx.request.body;
    const chunkDir = path.resolve(SAVE_PATH, `${CHUNK_DIR}_${fileHash}`);
    const suffix = path.extname(fileName);
    // TODO 判断目录是否存在
    // 遍历目录
    const chunkFiles = await readdir(chunkDir);
    // 切片排序，直接读取目录获取的顺序可能错乱
    chunkFiles.sort((a, b) => Number(a) - Number(b));
    // 并发写入
    await Promise.all(
      chunkFiles.map((chunkPath, i) =>
        // good job
        pipeline(
          createReadStream(path.resolve(chunkDir, chunkPath)),
          createWriteStream(path.resolve(SAVE_PATH, `${fileHash}${suffix}`), {
            start: i * size,
          }),
        ),
      ),
    );
    // 删除切片目录
    rm(chunkDir, { recursive: true });
    ctx.body = {
      code: 0,
    };
  }
  // 验证上传
  static async verifyUpload(ctx: Context) {
    const { fileName, fileHash } = ctx.request.query;
    // @ts-ignore
    const suffix = path.extname(fileName);
    const filePath = path.resolve(SAVE_PATH, `${fileHash}${suffix}`);
    if (existsSync(filePath)) {
      ctx.body = {
        code: 0,
        data: { exist: true },
      };
    } else {
      const chunkDir = path.resolve(SAVE_PATH, `${CHUNK_DIR}_${fileHash}`);
      const serverChunks = existsSync(chunkDir) ? await readdir(chunkDir) : [];
      ctx.body = {
        code: 0,
        data: { exist: false, serverChunks },
      };
    }
  }
}

export default FileController;
