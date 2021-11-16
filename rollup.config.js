import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { join } from 'path';

const cwd = process.cwd();
const packagePath = join(cwd, 'package.json');
const pkg = require(packagePath);

export default async () => ({
  input: 'src/index.ts',
  output: [
    { format: 'es', file: pkg.module, sourcemap: true },
    {
      format: 'umd',
      file: pkg.main,
      name: pkg.name,
      sourcemap: true,
      esModule: false
    }
  ],
  external: [
    /node_modules/
  ],
  plugins: [
    json({ compact: true }),
    typescript({
      tsconfig: 'tsconfig.build.json'
    }),
    terser({
      ecma: 2020,
      module: true,
      warnings: true
    }),
    ...(process.env.ANALYZE === '1'
      ? [(await import('rollup-plugin-visualizer')).visualizer()]
      : [])
  ]
});
