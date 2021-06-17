import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import analyze from 'rollup-plugin-analyzer'

const pkg = require(`${process.cwd()}/package.json`);

export default {
  input: 'src/index.ts',
  external: [],
  watch: {
    include: 'src/**'
  },
  output: [
    { format: 'umd', file: pkg.main, name: pkg.name },
    { format: 'es', file: pkg.module }
  ],
  plugins: [
    json(),
    resolve(),
    commonjs({ include: 'node_modules/**' }),
    typescript({
      tsconfig: 'tsconfig.build.json',
      useTsconfigDeclarationDir: true
    }),
    ...(process.env.ANALYZE === 'true' ? [analyze()] : []),
  ],
};
