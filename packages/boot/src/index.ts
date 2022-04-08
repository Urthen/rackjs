import Koa from "koa";
import ConfigLoader, { Configuration } from "@rackjs/config";
import path from "path";
import process from "process";

export class RackBoot {
  app?: Koa;
  private appDir: string;
  private configPath: string;
  config?: Configuration;

  constructor(configPath: string = "config") {
    this.appDir = process.cwd();
    this.configPath = path.resolve(this.appDir, configPath);
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

  up() {
    if (!this.app) this.app = new Koa();

    this.config = ConfigLoader.load({ configPath: this.configPath });

    this.useMiddleware();

    const port = this.config.app.port;
    this.app.listen(port);
    console.log(
      this.config.app.startupMessage.replace("$PORT", port.toString())
    );
  }
}

export default new RackBoot();
