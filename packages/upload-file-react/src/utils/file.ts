import { CHUNK_SIZE } from "@/const";

export interface FilePiece {
  chunk: Blob;
  size: number;
}

export const splitFile = (file: File, chunkSize = CHUNK_SIZE) => {
  const fileChunkList: FilePiece[] = [];
  let cur = 0;
  while (cur < file.size) {
    const piece = file.slice(cur, cur + chunkSize);
    fileChunkList.push({ chunk: piece, size: piece.size });
    cur += chunkSize;
  }
  return fileChunkList;
};
