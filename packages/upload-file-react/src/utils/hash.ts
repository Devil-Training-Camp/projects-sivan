import { FilePiece } from "./file";
import Worker from "./hash-worker.ts?worker";

export const calHash = (chunks: FilePiece[]) => {
  return new Promise((resolve) => {
    const worker = new Worker();
    worker.postMessage({ fileChunkList: chunks });
  });
};
