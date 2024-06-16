export interface FilePiece {
  chunk: Blob; // 文件切片
  size: number; // 切片大小
}

export interface IChunk {
  chunk: Blob; // 文件切片
  chunkName: string; // 切片名 由 文件hash值 + '-' + 索引 拼接
  progress: number; // 切片上传进度
  index: number; // 切片索引
}
