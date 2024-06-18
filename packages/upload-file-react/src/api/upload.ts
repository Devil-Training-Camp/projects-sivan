import { UPLOAD_CHUNK, MERGE_CHUNK, VERIFY_UPLOAD } from "@sivan/upload-file-server/const";
import axios, { type GenericAbortSignal, type AxiosProgressEvent } from "axios";
import { IChunk } from "@/types";
import TaskQueue from "@/utils/concurrent";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  // 5s? 这么短？
  timeout: 5 * 1000,
});

export const uploadChunks = async (
  // 这种，很多很多个参数的函数，应该写成一个参数对象
  // 另外，一个编程的基本原则是，低耦合高内聚，参数越多，往往意味着耦合度或内聚性不够高
  fileChunkList: IChunk[],
  fileHash: string,
  signal: GenericAbortSignal,
  // 为什么这个参数名是“create”？
  createProgressHandler: (index: number) => (e: AxiosProgressEvent) => void,
  taskQueue: TaskQueue,
  finishCount: number = 0,
) => {
  for (let i = 0; i < fileChunkList.length; i++) {
    const fileChunk = fileChunkList[i];
    const formData = new FormData();
    formData.append("chunk", fileChunk.chunk);
    formData.append("chunkName", fileChunk.chunkName);
    formData.append("fileHash", fileHash);
    // createProgressHandler 设计非常不合理，你得为每个 chunk 都做这个调用
    // 逻辑上，chunk 的 progress 处理方法放在外层，你这个 uploadChunks => uploadChunk，也就是说只上传一个 chunk 的时候
    // 这里就不需要关系 createProgressHandler 调用了
    const onUploadProgress = createProgressHandler(i + finishCount);
    // 并发控制
    const task = async () => {
      await instance.post(UPLOAD_CHUNK, formData, { signal, onUploadProgress });
    };
    // 这个 taskQueue 为什么是从外部传进来？
    taskQueue.enqueue(task);
  }
};

export const mergeChunks = async (fileName: string, fileHash: string, size: number) => {
  const res = await instance.post(MERGE_CHUNK, { fileName, fileHash, size });
  return res.data;
};

export const verifyUpload = async (fileName: string, fileHash: string) => {
  const res = await instance.get<{ code: number; data: { exist: boolean; cacheChunks: string[] } }>(VERIFY_UPLOAD, {
    params: { fileName, fileHash },
  });
  return res.data.data;
};
