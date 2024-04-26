import SparkMD5 from "spark-md5";
import { type FilePiece } from "./file";

const readChunk = (file: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      if (e.target) {
        resolve(e.target.result as ArrayBuffer);
      }
    };
  });
};

self.onmessage = async (e) => {
  const { fileChunkList } = e.data as { fileChunkList: FilePiece[] };
  const spark = new SparkMD5.ArrayBuffer();
  for (let i = 0; i < fileChunkList.length; i++) {
    const chunk = fileChunkList[i].chunk;
    const res = await readChunk(chunk);
    spark.append(res);
  }
  self.postMessage({
    hash: spark.end(), // 生成hash
  });
  self.close();
};
