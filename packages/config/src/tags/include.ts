import { Type } from "js-yaml";
import { accessSync, constants } from "fs";
import path from "path";
import ConfigLoader from "..";

function resolveInclude(data: any): boolean {
  if (data === null) return false;
  if (data.length === 0) return false;

  const fullFile = path.join(ConfigLoader.configPath, data);

  // will throw an error if file is not readable
  accessSync(fullFile, constants.R_OK);

  return true;
}

function constructInclude(data: any): any {
  return ConfigLoader.tryLoadFile(data);
}

export default new Type("tag:yaml.org,2002:rack/include", {
  kind: "scalar",
  resolve: resolveInclude,
  construct: constructInclude,
  // rack/include can and should not be reversed
});
