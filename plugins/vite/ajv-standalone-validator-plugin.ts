/*
 * SPDX-FileCopyrightText: 2026 morvorus
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readFile } from "node:fs/promises";
import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";
import type { Plugin } from "vite";

const PUBLIC_ID = "virtual:custom-daily-run-validator";
const RESOLVED_ID = `\0${PUBLIC_ID}`;

/** Compile the custom daily-run schema at build time so production does not require `unsafe-eval`. */
export function ajvStandaloneValidator(): Plugin {
  return {
    name: "ajv-standalone-validator",
    resolveId(id) {
      return id === PUBLIC_ID ? RESOLVED_ID : undefined;
    },
    async load(id) {
      if (id !== RESOLVED_ID) {
        return;
      }

      const schemaUrl = new URL("../../src/data/daily-seed/schema.json", import.meta.url);
      const schema = JSON.parse(await readFile(schemaUrl, "utf8"));
      const ajv = new Ajv({ allErrors: true, code: { esm: true, source: true } });
      return standaloneCode(ajv, ajv.compile(schema));
    },
  };
}
