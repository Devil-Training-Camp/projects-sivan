import type Router from "koa-router";
import FileController from "../controller";

const routes = (router: Router) => {
  // 设置前缀
  router.prefix("/api/v1");
  //
  router.get("/file/find", FileController.findSplice);
  // 接收切片
  router.post("/upload/chunk", FileController.uploadChunk);
};

export default routes;
