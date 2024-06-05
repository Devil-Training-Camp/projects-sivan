import SparkMD5 from "spark-md5";
import { FilePiece } from "@/types";

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
    // 通知hash计算进度
    self.postMessage({
      progress: Number((((i + 1) / fileChunkList.length) * 100).toFixed(2)),
    });
  }
  self.postMessage({
    hash: spark.end(), // 生成hash
    progress: 100,
  });
  self.close();
};
