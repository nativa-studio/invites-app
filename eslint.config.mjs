import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The design handoff package. Its reference HTML, its prototype support script and the
    // fidelity suite are Marcia's approval as delivered, and ACCEPTANCE.md forbids editing them,
    // so they are not ours to lint. Nothing in here is shipped: the suite is run by hand and the
    // rest is read, not imported.
    "design_handoff_monster_layouts/**",
  ]),
]);

export default eslintConfig;
