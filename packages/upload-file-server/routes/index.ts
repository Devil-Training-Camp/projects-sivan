import type Router from "koa-router";
import FileController from "../controller";

const routes = (router: Router) => {
  // 设置前缀
  router.prefix("/api/v1");
  // 接收切片
  router.post("/upload/chunk", FileController.uploadChunk);
  // 合并切片
  router.post("/merge/chunk", FileController.mergeChunk);
};

export default routes;
