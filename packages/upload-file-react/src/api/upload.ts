import { UPLOAD_CHUNK, MERGE_CHUNK, VERIFY_UPLOAD } from "@sivan/upload-file-server/const";
import axios, { type GenericAbortSignal, type AxiosProgressEvent } from "axios";
import { IChunk } from "@/types";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 60 * 1000,
});

export const uploadChunk = (
  fileChunk: IChunk,
  fileHash: string,
  signal?: GenericAbortSignal,
  onUploadProgress?: (e: AxiosProgressEvent) => void,
) => {
  const formData = new FormData();
  formData.append("chunk", fileChunk.chunk);
  formData.append("chunkName", fileChunk.chunkName);
  formData.append("fileHash", fileHash);
  return async () => await instance.post(UPLOAD_CHUNK, formData, { signal, onUploadProgress });
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
