import yaml, { Type, Schema } from "js-yaml";
import fs from "fs";
import path from "path";
import { ConfigSchema, Configuration } from "./schema";
import tags from "./tags";
export { Configuration } from "./schema";
import _get from "lodash.get";

const CONFPATH = "config";

export class ConfigLoader {
  configPath: string = "";
  private yamlSchema: Schema = yaml.DEFAULT_SCHEMA;
  private _config?: Configuration;
  private _rawConfig: any;
  tags: Type[] = [];

  addTagType(tagDef: Type | Type[]) {
    this.yamlSchema = this.yamlSchema.extend(tagDef);
  }

  addDefaultTagTypes() {
    this.addTagType(tags);
  }

  load({ configPath }: { configPath: string }): Configuration {
    this.configPath = configPath;
    this._rawConfig = this.tryLoadFile("default.yaml");
    this._config = ConfigSchema(this._rawConfig);
    return this.config;
  }

  get config(): Configuration {
    if (!this._config) throw Error("Must load config before getting it");
    return this._config;
  }

  get<T>(path: string, defaultValue?: T): T {
    if (!this._config) throw Error("Must load config before getting it");
    const result = _get(this._rawConfig, path);
    if (result === undefined) {
      throw Error(`Undefined configuration with no default value: ${path}`);
    }
    return result as T;
  }

  dumpConfig(): string {
    if (!this._config) throw Error("Must load config before dumping it");

    // Dumping it back as Yaml is the best way to pretty print but also
    // identify reversible Yaml tags (such as js/regexp, etc).
    return yaml.dump(this._rawConfig, {
      schema: this.yamlSchema,
    });
  }

  tryLoadFile(filename: string): any {
    const fullFile = path.join(this.configPath, filename);
    const config = yaml.load(fs.readFileSync(fullFile, "utf8"), {
      filename: fullFile,
      schema: this.yamlSchema,
    });
    return config;
  }
}

export default new ConfigLoader();
