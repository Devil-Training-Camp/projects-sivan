import axios, { type GenericAbortSignal, type AxiosProgressEvent } from "axios";
import {
  UPLOAD_CHUNK,
  MERGE_CHUNK,
  VERIFY_UPLOAD,
} from "@sivan/upload-file-server/const";
import { type IChunk } from "../pages/UploadFile";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 5 * 1000,
});

export const uploadChunks = async (
  fileChunkList: IChunk[],
  signal: GenericAbortSignal,
  createProgressHandler: (index: number) => (e: AxiosProgressEvent) => void,
  finishCount: number = 0,
) => {
  const requestList = fileChunkList
    .map((item) => {
      const formData = new FormData();
      formData.append("chunk", item.chunk);
      formData.append("hash", item.hash);
      formData.append("fileHash", item.fileHash);
      return formData;
    })
    .map((formData, i) => {
      const onUploadProgress = createProgressHandler(i + finishCount);
      return instance.post(UPLOAD_CHUNK, formData, {
        signal,
        onUploadProgress,
      });
    });
  await Promise.all(requestList);
};

export const mergeChunks = async (
  fileName: string,
  fileHash: string,
  size: number,
) => {
  const res = await instance.post(MERGE_CHUNK, { fileName, fileHash, size });
  return res.data;
};

export const verifyUpload = async (fileName: string, fileHash: string) => {
  const res = await instance.get(VERIFY_UPLOAD, {
    params: { fileName, fileHash },
  });
  return res.data.data;
};
