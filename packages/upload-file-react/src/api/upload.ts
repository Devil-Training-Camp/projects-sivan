import axios from "axios";
import { FilePiece } from "../utils/file";

const instance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 5 * 1000,
});

export const uploadChunks = async (fileChunkList: FilePiece[]) => {
  const requestList = fileChunkList.map((item, i) => {
    const formData = new FormData();
    formData.append("chunk", item.chunk);
    formData.append("hash", i + "");
    return instance.post("/upload/chunk", formData);
  });
  await Promise.all(requestList);
};

export const mergeChunks = async () => {
  return instance.post("/merge/chunk");
};
