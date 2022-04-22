import Koa from "koa";
import ConfigLoader, { Configuration } from "@rackjs/config";
import path from "path";
import process from "process";
import { strict as assert } from "assert";

export class RackBoot {
  app?: Koa;
  private appDir: string;
  private _config?: Configuration;

  constructor() {
    this.appDir = process.cwd();
  }

  get config(): Configuration {
    assert(this._config, "Configuration must be loaded before it can be used");
    return this._config as Configuration;
  }

  useMiddleware() {
    if (!this.app) throw Error("App must be set before middleware can be used");

    const middlewareOrder = Object.keys(this.config.app.middleware).sort(
      (a, b): number => {
        const mwA = this.config.app.middleware[a];
        const mwB = this.config.app.middleware[b];

        assert(mwA.priority, `Middleware ${a} requires a priority.`);
        assert(mwB.priority, `Middleware ${a} requires a priority.`);
        assert.notEqual(
          mwA.priority,
          mwB.priority,
          `Middleware ${a} and ${b} have the same priority ${mwA.priority}`
        );

        return mwA.priority - mwB.priority;
      }
    );

    console.log("Middleware Order:");
    middlewareOrder.forEach((name) => {
      console.log(`${name}: ${this.config.app.middleware[name].priority}`);
    });

    middlewareOrder.forEach((name) => {
      const middlewareDef = this.config.app.middleware[name];
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
        throw Error(`Loading middleware ${middlewareDef.name}:\n${err}`);
      }
    });
  }

  loadConfig(configPath: string = "config") {
    const fullPath = path.resolve(this.appDir, configPath);
    this._config = ConfigLoader.load({ configPath: fullPath });
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
