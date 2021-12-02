/*
	Nous sommes encore débutants sur Svelte (le plus expérimenté d'entre nous
	connait Svelte depuis une semaine). Nous avons donc utilisé la configuration
	de cette template sur github: https://github.com/EmilTholin/svelte-routing

	Une partie du fichier app.js en est aussi inspirée

 */

import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import css from 'rollup-plugin-css-only';
const isDev = Boolean(process.env.ROLLUP_WATCH);

export default [
  {
    input: "src/main.js",
    output: {
      sourcemap: true,
      format: "iife",
      name: "app",
      file: "public/bundle.js"
    },
    plugins: [
      svelte({
        compilerOptions: {
          hydratable: true,
        }
      }),
      css({ output: 'bundle.css' }),

      resolve(),
      commonjs(),
      isDev &&
        livereload({
          watch: "public/App.js",
          delay: 200
        }),
      !isDev && terser()
    ]
  },
  {
    input: "src/App.svelte",
    output: {
      exports: "default",
      sourcemap: false,
      format: "cjs",
      name: "app",
      file: "public/App.js"
    },
    plugins: [
      svelte({
        compilerOptions: {
          generate: "ssr"
        }
      }),
      css({ output: 'bundle.css' }),
      resolve(),
      commonjs(),
      !isDev && terser()
    ]
  }
];
