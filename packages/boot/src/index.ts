import Koa from "koa";
import ConfigLoader, { Configuration } from "@rackjs/config";
import path from "path";
import process from "process";

export class RackBoot {
  app?: Koa;
  private appDir: string;
  config?: Configuration;

  constructor() {
    this.appDir = process.cwd();
  }

  useMiddleware() {
    if (!this.config)
      throw Error("Config must be loaded before middleware can be used");
    if (!this.app) throw Error("App must be set before middleware can be used");

    Object.values(this.config.app.middleware).forEach((middlewareDef) => {
      try {
        let middleware = require(path.resolve(
          this.appDir,
          middlewareDef.module
        ));

        if (middlewareDef.function) {
          middleware = middleware[middlewareDef.function];
        } else if (middleware.default) {
          middleware = middleware.default;
        }

        if (middlewareDef.arguments !== undefined) {
          middleware = middleware.apply(this, middlewareDef.arguments);
        }

        this.app?.use(middleware);
      } catch (err) {
        throw Error(`Error loading middleware ${middlewareDef.name}:\n${err}`);
      }
    });
  }

  loadConfig(configPath: string = "config") {
    const fullPath = path.resolve(this.appDir, configPath);
    this.config = ConfigLoader.load({ configPath: fullPath });
  }

  dumpConfig() {
    console.log(ConfigLoader.dumpConfig());
  }

  up() {
    if (!this.app) this.app = new Koa();
    if (!this.config) this.loadConfig();

    this.useMiddleware();

    const port = process.env.PORT || this.config?.app.port || 3000;
    this.app.listen(port);
    console.log(
      this.config?.app.startupMessage.replace("$PORT", port.toString())
    );
  }
}

export default new RackBoot();
