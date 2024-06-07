import type Router from "koa-router";
import { UPLOAD_CHUNK, MERGE_CHUNK, VERIFY_UPLOAD } from "../const";
import FileController from "../controller";

const routes = (router: Router) => {
  // 设置前缀
  router.prefix("/api/v1");
  // 上传切片
  router.post(UPLOAD_CHUNK, FileController.uploadChunk);
  // 合并切片
  router.post(MERGE_CHUNK, FileController.mergeChunk);
  // 验证上传
  router.get(VERIFY_UPLOAD, FileController.verifyUpload);
};

export default routes;
