export interface IUploadChunkParams {
  chunk: Blob;
  chunkName: string;
  fileHash: string;
}

export interface IMergeChunksParams {
  fileName: string;
  fileHash: string;
  size: number;
}

export interface IVerifyUploadParams {
  fileName: string;
  fileHash: string;
}

export interface IVerifyUploadResponse {
  code: number;
  data: {
    exist: boolean;
    cacheChunks: string[];
  };
}
