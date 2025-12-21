const nodeResolve = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');

module.exports = {
  input: 'dist/main.js',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
    sourcemap: false
  },
  plugins: [
    nodeResolve(),
    terser()
  ]
};