import type Router from "koa-router";
import FileController from "../controller";
import { UPLOAD_CHUNK, MERGE_CHUNK } from "../const";

const routes = (router: Router) => {
  // 设置前缀
  router.prefix("/api/v1");
  // 上传切片
  router.post(UPLOAD_CHUNK, FileController.uploadChunk);
  // 合并切片
  router.post(MERGE_CHUNK, FileController.mergeChunk);
};

export default routes;
