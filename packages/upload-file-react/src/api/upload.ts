import { UPLOAD_CHUNK, MERGE_CHUNK, VERIFY_UPLOAD } from "@sivan/upload-file-server/const";
import type { VerifyUploadParams } from "@sivan/upload-file-server/types";
import axios, { type GenericAbortSignal, type AxiosProgressEvent } from "axios";
import { IChunk } from "@/types";
import TaskQueue from "@/utils/concurrent";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 5 * 1000,
});

export const uploadChunks = async (
  fileChunkList: IChunk[],
  fileHash: string,
  signal: GenericAbortSignal,
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
    const onUploadProgress = createProgressHandler(i + finishCount);
    // 并发控制
    const task = async () => {
      await instance.post(UPLOAD_CHUNK, formData, { signal, onUploadProgress });
    };
    taskQueue.enqueue(task);
  }
};

export const mergeChunks = async (fileName: string, fileHash: string, size: number) => {
  const res = await instance.post(MERGE_CHUNK, { fileName, fileHash, size });
  return res.data;
};

export const verifyUpload = async (params: VerifyUploadParams) => {
  const res = await instance.get<{ code: number; data: { exist: boolean; cacheChunks: string[] } }>(VERIFY_UPLOAD, { params });
  return res.data.data;
};
