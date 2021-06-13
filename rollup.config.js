import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  external: [],
  watch: {
    include: 'src/**'
  },
  output: [
    { format: 'umd', file: './dist/bundle.umd.js', name: 'validator' },
    { format: 'es', file: './dist/bundle.es.js' }
  ],
  plugins: [
    json(),
    nodeResolve(),
    commonjs({ include: 'node_modules/**'}),
    typescript({
      tsconfig: './tsconfig.build.json',
      sourceMap: false,
    }),
  ],
};
