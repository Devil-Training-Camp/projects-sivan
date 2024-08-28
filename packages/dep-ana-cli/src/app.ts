import Koa, { type Context, Next } from "koa";
import cors from "koa2-cors";
import { koaBody } from "koa-body";
import json from "koa-json";
import logger from "koa-logger";
import Router from "koa-router";
import open from "open";
import { serverPort } from "./const";
import { IDepGraph } from "./types";

export const startServer = (deps: IDepGraph[]) => {
  const app = new Koa();
  const router = new Router();
  // 设置前缀
  router.prefix("/api/v1");

  const port = process.env.PORT || serverPort;

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

  router.get("/deps", async (ctx: Context, next: Next) => {
    ctx.body = {
      code: 0,
      data: {
        deps,
      },
    };
  });

  // 监听报错
  app.on("error", function (err, ctx) {
    console.log(err);
  });

  app.listen(port, () => {
    // open(`http://localhost:${port}`);
    console.log(`Listening on http://localhost:${port}`);
  });
};
