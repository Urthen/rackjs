import YAML from "js-yaml";
import fs from "fs";
import path from "path";
import { ConfigSchema, Configuration } from "./schema";
export { Configuration } from "./schema";

const CONFPATH = "config";
//hassss

export class ConfigLoader {
  private configPath: string = "";
  private loaded: boolean = false;
  config?: Configuration;

  load({ configPath }: { configPath: string }): Configuration {
    this.configPath = configPath;
    const defaultConfig = this.tryLoadFile("default.yaml");
    this.config = ConfigSchema(defaultConfig);

    return this.config;
  }

  tryLoadFile(filename: string): any {
    const fullFile = path.join(this.configPath, filename);
    const config = YAML.load(fs.readFileSync(fullFile, "utf8"), {
      filename: fullFile,
    });
    return config;
  }
}

export default new ConfigLoader();
