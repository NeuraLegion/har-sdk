import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import autoExternal from 'rollup-plugin-auto-external';
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import { join } from 'path';

const cwd = process.cwd();
const packagePath = join(cwd, 'package.json');
const pkg = require(packagePath);

export default {
  input: 'src/index.ts',
  output: [
    { format: 'es', file: pkg.module },
    { format: 'umd', file: pkg.main, name: pkg.name }
  ],
  plugins: [
    json(),
    resolve({ preferBuiltins: false }),
    commonjs({ include: /node_modules/ }),
    typescript({
      clean: true,
      tsconfig: 'tsconfig.build.json'
    }),
    autoExternal({ packagePath }),
    terser({
      ecma: 2020,
      mangle: { toplevel: true },
      compress: {
        module: true,
        toplevel: true,
        unsafe_arrows: true,
        drop_console: true,
        drop_debugger: true
      },
      output: { quote_style: 1 }
    }),
    ...(process.env.ANALYZE !== '1' ? [visualizer()] : [])
  ]
};
