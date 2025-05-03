import CRDs from "@/crds";
import type { APIRoute } from "astro";
import crdToJSONSchema from "@/lib/crd-to-json-schema";

export const GET: APIRoute = async ({ params }) => {
  const { group, version, kind } = params;

  if (!group || !version || !kind) {
    return new Response("Missing parameters", { status: 400 });
  }

  try {
    const crd = CRDs.get(group)?.get(version)?.get(kind);
    if (!crd) {
      return new Response("CRD not found", { status: 404 });
    }

    const jsonSchema = crdToJSONSchema(crd, version);
    return new Response(JSON.stringify(jsonSchema), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response("Schema not found", { status: 404 });
  }
};

export function getStaticPaths() {
  const paths = [];
  for (const [group, versions] of CRDs) {
    for (const [version, kinds] of versions) {
      for (const kind of kinds.keys()) {
        paths.push({
          params: { group, version, kind },
        });
      }
    }
  }
  return paths;
}
