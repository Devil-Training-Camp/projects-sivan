const FileController = require("../controller/index");

module.exports = (router) => {
  // 设置前缀
  router.prefix("/api/v1");
  //
  router.get("/file/find", FileController.findSplice);
};
