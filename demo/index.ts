import boot from "@rackjs/boot";
// const app = boot.up();

import Koa from "koa";
import ConfigLoader from "@rackjs/config";
const app = new Koa();

ConfigLoader.addDefaultTagTypes();

boot.app = app;
boot.loadConfig();
boot.dumpConfig();
boot.up();
