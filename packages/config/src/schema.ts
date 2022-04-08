import Schema, { Type, array, string, number, unknown } from "computed-types";

const MiddlewareSchema = Schema(
  {
    priority: number.integer().gt(0),
    module: string,
    function: string.optional(),
    arguments: array.optional(),
  },
  { strict: true }
);

type MiddlewareSchemaType = Type<typeof MiddlewareSchema>;
type MiddlewareDef = MiddlewareSchemaType & { name: string };

interface MiddlewareDefs {
  [index: string]: MiddlewareDef;
}

function MiddlewareDefsSchema(input: unknown): MiddlewareDefs {
  const middlewareObj = unknown.object()(input);

  const result: MiddlewareDefs = {};

  Object.entries(middlewareObj).forEach(([key, value]) => {
    const name = unknown.string()(key);
    const [err, def] = MiddlewareSchema.destruct()(value);

    if (err) {
      throw Error(`Error parsing config for middleware "${name}":\n${err}`);
    }

    result[name] = {
      name,
      ...(<MiddlewareSchemaType>def),
    };
  });

  return result;
}

const AppSchema = Schema(
  {
    port: number.integer().between(1024, 49151).optional(3000),
    middleware: MiddlewareDefsSchema,
    startupMessage: string.optional("Rack listening on port $PORT"),
  },
  { strict: true }
);

export const ConfigSchema = Schema({
  app: AppSchema,
});

export type Configuration = Type<typeof ConfigSchema>;
