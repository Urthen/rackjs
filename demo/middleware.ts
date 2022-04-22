import { Context } from "koa";
import ConfigLoader, { Configuration } from "@rackjs/config";

export default function demoMiddleware(message: string) {
  const rex = ConfigLoader.get<RegExp>("test.regexp");
  return (ctx: Context) => {
    console.log(rex.exec(message));

    ctx.body = message;
  };
}
