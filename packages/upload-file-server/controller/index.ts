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
import { CHUNK_SIZE } from "../const";

const SAVE_PATH = path.resolve(__dirname, "../node_modules/.cache");
const CHUNK_DIR = "chunkDir";

class FileController {
  // 上传切片
  static async uploadChunk(ctx: Context) {
    const { hash, index, fileHash } = ctx.request.body;
    // @ts-ignore
    const chunkFile = ctx.request.files?.chunk.filepath;
    const chunkDir = path.resolve(SAVE_PATH, `${CHUNK_DIR}_${fileHash}`);
    // 判断目录是否存在
    await mkdir(chunkDir, { recursive: true });
    const readStream = createReadStream(chunkFile);
    const writeStream = createWriteStream(path.resolve(chunkDir, index));
    readStream.pipe(writeStream);
    ctx.body = {
      code: 0,
    };
  }
  // 合并切片
  static async mergeChunk(ctx: Context) {
    const { fileName, fileHash } = ctx.request.body;
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
        pipeline(
          createReadStream(path.resolve(chunkDir, chunkPath)),
          createWriteStream(path.resolve(SAVE_PATH, `${fileHash}${suffix}`), {
            start: i * CHUNK_SIZE,
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
      const uploadedChunks = existsSync(chunkDir)
        ? await readdir(chunkDir)
        : [];
      ctx.body = {
        code: 0,
        data: { exist: false, uploadedChunks },
      };
    }
  }
}

export default FileController;
