import { type FilePiece } from "./file";
import Worker from "./hash-worker.ts?worker";

export const calculateHash = (chunks: FilePiece[]): Promise<string> => {
  return new Promise((resolve) => {
    const worker = new Worker();
    worker.postMessage({ fileChunkList: chunks });
    worker.onmessage = (e) => {
      const { hash } = e.data;
      if (hash) {
        resolve(hash);
      }
    };
  });
};
