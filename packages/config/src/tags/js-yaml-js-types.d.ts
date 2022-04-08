declare module "js-yaml-js-types" {
  import { Type } from "koa";

  // function is explicitly omitted here as Typescript REALLY does not want to
  // allow it, and it is dangerous anyway.
  export let regexp: Type;
  export let undefined: Type;
}
