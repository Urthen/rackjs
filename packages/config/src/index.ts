import yaml, { Type, Schema } from "js-yaml";
import fs from "fs";
import path from "path";
import { ConfigSchema, Configuration } from "./schema";
import tags from "./tags";
export { Configuration } from "./schema";

const CONFPATH = "config";

export class ConfigLoader {
  configPath: string = "";
  private yamlSchema: Schema = yaml.DEFAULT_SCHEMA;
  config?: Configuration;
  private rawConfig: any;
  tags: Type[] = [];

  addTagType(tagDef: Type | Type[]) {
    this.yamlSchema = this.yamlSchema.extend(tagDef);
  }

  addDefaultTagTypes() {
    this.addTagType(tags);
  }

  load({ configPath }: { configPath: string }): Configuration {
    this.configPath = configPath;
    this.rawConfig = this.tryLoadFile("default.yaml");
    this.config = ConfigSchema(this.rawConfig);
    return this.config;
  }
  getConfig(): Configuration {
    if (!this.config) throw Error("Must load config before getting it");
    return this.config;
  }

  get<T>(path: string, defaultValue?: T) {
    if (!this.config) throw Error("Must load config before getting it");
  }

  dumpConfig(): string {
    if (!this.config) throw Error("Must load config before dumping it");

    // Dumping it back as Yaml is the best way to pretty print but also
    // identify reversible Yaml tags (such as js/regexp, etc).
    return yaml.dump(this.rawConfig, {
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
