import { UPLOAD_CHUNK, MERGE_CHUNK, VERIFY_UPLOAD } from "@sivan/upload-file-server/const";
import { IUploadChunkParams, IMergeChunksParams, IVerifyUploadParams, IVerifyUploadResponse } from "@sivan/upload-file-server/types";
import axios, { type GenericAbortSignal, type AxiosProgressEvent } from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  // 这个超时时间设置的有点随意了，从 5 直接变成 60
  timeout: 60 * 1000,
});

export const uploadChunk = (
  // 这个改造不错
  params: IUploadChunkParams & { signal?: GenericAbortSignal; onUploadProgress?: (e: AxiosProgressEvent) => void },
) => {
  const { chunk, chunkName, fileHash, signal, onUploadProgress } = params;
  const formData = new FormData();
  formData.append("chunk", chunk);
  formData.append("chunkName", chunkName);
  formData.append("fileHash", fileHash);
  // return 一个闭包函数？外部再调用这个？
  return async () => await instance.post(UPLOAD_CHUNK, formData, { signal, onUploadProgress });
};

export const mergeChunks = async (params: IMergeChunksParams) => {
  const res = await instance.post(MERGE_CHUNK, params);
  return res.data;
};

export const verifyUpload = async (params: IVerifyUploadParams) => {
  const res = await instance.get<IVerifyUploadResponse>(VERIFY_UPLOAD, { params });
  return res.data.data;
};
