import { Context } from "koa";

export default function demoMiddleware(message: string) {
  return (ctx: Context) => {
    ctx.body = message;
  };

  //farts
}
