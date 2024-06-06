import path from "path";
import { CHUNK_DIR_PREFIX } from "../const";

/**
 * 文件保存路径
 */
export const FILE_SAVE_PATH = path.resolve(__dirname, "../node_modules/.cache");

/**
 * 获取文件后缀：.zip
 * @param fileName 文件名 xxx.zip
 * @returns
 */
export const getSuffix = (fileName: string) => path.extname(fileName);

/**
 * 拼接文件名
 * @param fileHash 文件hash值
 * @param suffix 文件后缀
 * @returns
 */
export const getFileName = (fileHash: string, suffix: string) => {
  path.resolve(__dirname, `${fileHash}${suffix}`);
  return `${fileHash}${suffix}`;
};

/**
 * 获取文件路径
 * @param fileName 文件名
 * @param fileHash 文件hash值
 */
export const getFilePath = (fileName: string, fileHash: string) => {
  const suffix = getSuffix(fileName);
  return path.resolve(FILE_SAVE_PATH, getFileName(fileHash, suffix));
};

/**
 * 获取chunk路径
 * @param fileHash 文件hash值
 * @returns
 */
export const getChunkPath = (fileHash: string) => {
  return path.resolve(FILE_SAVE_PATH, `${CHUNK_DIR_PREFIX}${fileHash}`);
};
