import { FilePiece } from "@/types";
import Worker from "./hash-worker.ts?worker";

export const calculateHash = ({
  chunks,
  updateHashProgress,
}: {
  chunks: FilePiece[];
  updateHashProgress: (progress: number) => void;
}): Promise<string> => {
  return new Promise((resolve) => {
    const worker = new Worker();
    worker.postMessage({ fileChunkList: chunks });
    worker.onmessage = (e) => {
      const { hash, progress } = e.data;
      updateHashProgress(progress);
      if (hash) {
        resolve(hash);
      }
    };
  });
};
