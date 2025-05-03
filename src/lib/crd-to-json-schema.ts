import type { V1CustomResourceDefinition } from "@kubernetes/client-node";
import { openapiSchemaToJsonSchema } from "@openapi-contrib/openapi-schema-to-json-schema";

const crdToJSONSchema = (crd: V1CustomResourceDefinition, version: string) => {
  const openapiSchema = crd.spec.versions?.find((v) => v.name === version)
    ?.schema?.openAPIV3Schema;

  if (!openapiSchema) {
    throw new Error(`No OpenAPI schema found for version ${version}`);
  }

  return openapiSchemaToJsonSchema(openapiSchema);
};

export default crdToJSONSchema;
