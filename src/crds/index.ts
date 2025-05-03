import { V1CustomResourceDefinition } from "@kubernetes/client-node";
import * as fs from "node:fs";
import * as path from "node:path";
import { Document, parseAllDocuments } from "yaml";

type Group = string;
type Version = string;
type Kind = string;

const dir = path.join(process.cwd(), "src", "crds");

const withExtensions = (exts: string[]) => (name: string) =>
  exts.includes(path.extname(name));
const toPath = (fileName: string) => path.join(dir, fileName);
const toContent = (fileName: string) => fs.readFileSync(fileName, "utf8");
const fromYaml = (fileContent: string) => parseAllDocuments(fileContent);
const withKey = (key: string) => (doc: Document) => doc.has(key);
const withKind = (kind: string) => (doc: Document) => doc.get("kind") === kind;
const toJSON = <T>(doc: Document) => doc.toJSON() as T;

let seenCRDs = new Set();

const CRDs = fs.readdirSync(dir, { recursive: true })
  .map((fileName) => fileName.toString())
  .filter(withExtensions([".yaml", ".yml"]))
  .map(toPath)
  .map(toContent)
  .flatMap(fromYaml)
  .filter(withKey("kind"))
  .filter(withKind("CustomResourceDefinition"))
  .map(toJSON<V1CustomResourceDefinition>)
  .reduce(
    (acc, crd) => {
      const groups = acc.has(crd.spec.group)
        ? acc.get(crd.spec.group)!
        : acc.set(
          crd.spec.group,
          new Map<Version, Map<Kind, V1CustomResourceDefinition>>(),
        ).get(crd.spec.group)!;

      crd.spec.versions.forEach((version) => {
        const versions = groups.has(version.name)
          ? groups.get(version.name)!
          : groups.set(
            version.name,
            new Map<Kind, V1CustomResourceDefinition>(),
          ).get(version.name)!;

        if (
          seenCRDs.has(
            `${crd.spec.group}/${version.name}/${crd.spec.names.kind}`,
          )
        ) {
          console.warn(
            `Duplicate CRD found: ${crd.spec.group}/${version.name}/${crd.spec.names.kind}`,
          );
          return;
        }
        versions.set(crd.spec.names.kind, crd);
      });

      return acc;
    },
    new Map<Group, Map<Version, Map<Kind, V1CustomResourceDefinition>>>(),
  );

export default CRDs;
