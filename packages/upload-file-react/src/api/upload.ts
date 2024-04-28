import axios, { type GenericAbortSignal } from "axios";
import {
  UPLOAD_CHUNK,
  MERGE_CHUNK,
  VERIFY_UPLOAD,
} from "@sivan/upload-file-server/const";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 5 * 1000,
});

export const uploadChunks = async (
  fileChunkList: {
    chunk: Blob;
    hash: string;
    index: string;
    fileHash: string;
  }[],
  signal: GenericAbortSignal,
) => {
  const requestList = fileChunkList
    .map((item) => {
      const formData = new FormData();
      formData.append("chunk", item.chunk);
      formData.append("hash", item.hash);
      formData.append("index", item.index);
      formData.append("fileHash", item.fileHash);
      return formData;
    })
    .map((formData) => instance.post(UPLOAD_CHUNK, formData, { signal }));
  await Promise.all(requestList);
};

export const mergeChunks = async (fileName: string, fileHash: string) => {
  const res = await instance.post(MERGE_CHUNK, { fileName, fileHash });
  return res.data;
};

export const verifyUpload = async (fileName: string, fileHash: string) => {
  const res = await instance.get(VERIFY_UPLOAD, {
    params: { fileName, fileHash },
  });
  return res.data.data;
};
