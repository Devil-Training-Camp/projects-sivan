import axios from "axios";
import { UPLOAD_CHUNK, MERGE_CHUNK } from "@sivan/upload-file-server/const";

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
    .map((formData) => instance.post(UPLOAD_CHUNK, formData));
  await Promise.all(requestList);
};

export const mergeChunks = async (fileHash: string) => {
  return instance.post(MERGE_CHUNK, { fileHash });
};
