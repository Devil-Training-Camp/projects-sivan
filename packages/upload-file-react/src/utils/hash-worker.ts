import SparkMD5 from "spark-md5";
import { FilePiece } from "./file";

self.onmessage = (e) => {
  const { fileChunkList } = e.data as { fileChunkList: FilePiece[] };
};
