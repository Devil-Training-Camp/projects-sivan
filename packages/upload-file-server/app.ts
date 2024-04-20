import Koa from "koa";
import Router from "koa-router";
import json from "koa-json";
import { koaBody } from "koa-body";
import cors from "koa2-cors";
import logger from "koa-logger";
import config from "./config";
import routes from "./routes";

const app = new Koa();
const router = new Router();

const port = process.env.PORT || config.port;

// middlewares
app
  .use(koaBody({ multipart: true }))
  .use(json())
  .use(cors())
  .use(logger())
  .use(router.routes())
  .use(router.allowedMethods());

// logger
app.use(async (ctx, next) => {
  await next();
  console.log(`${ctx.method} ${ctx.url} - $ms`);
});

routes(router);

// 监听报错
app.on("error", function (err, ctx) {
  console.log(err);
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
