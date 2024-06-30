import { UPLOAD_CHUNK, MERGE_CHUNK, VERIFY_UPLOAD } from "@sivan/upload-file-server/const";
import { IUploadChunkParams, IMergeChunksParams, IVerifyUploadParams, IVerifyUploadResponse } from "@sivan/upload-file-server/types";
import axios, { type GenericAbortSignal, type AxiosProgressEvent } from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 60 * 1000,
});

export const uploadChunk = (
  params: IUploadChunkParams & { signal?: GenericAbortSignal; onUploadProgress?: (e: AxiosProgressEvent) => void },
) => {
  const { chunk, chunkName, fileHash, signal, onUploadProgress } = params;
  const formData = new FormData();
  formData.append("chunk", chunk);
  formData.append("chunkName", chunkName);
  formData.append("fileHash", fileHash);
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
