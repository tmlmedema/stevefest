import next from "@next/eslint-plugin-next";
import babelParser from "@babel/eslint-parser";

/*
 * The usual `eslint-config-next` can't be used here: it pulls in
 * typescript-eslint, which declares `typescript: ">=4.8.4 <6.1.0"` and throws
 * outright on this project's TypeScript 7. Babel parses the TSX instead —
 * it reads types as syntax and ignores them, so the Next rules below work
 * while type-aware rules stay off the table until typescript-eslint ships
 * TS 7 support. Type errors are `tsc --noEmit`'s job anyway (npm run typecheck).
 */
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "legacy/**",
      "app/_archived/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{js,mjs,jsx,ts,tsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: [
            ["@babel/preset-react", { runtime: "automatic" }],
            ["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
          ],
        },
      },
    },
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
];
