export interface FilePiece {
  chunk: Blob; // 文件切片
  size: number; // 切片大小
}
