import progress from 'rollup-plugin-progress';
import babel from 'rollup-plugin-babel';
import {plugin as analyze} from 'rollup-plugin-analyzer';
import pkg from './package.json';

const makeExternalPredicate = () => {
  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];
  if (externals.length === 0) {
    return () => false;
  }
  const externalPattern = new RegExp(`^(${externals.join('|')})($|/)`);
  return id => externalPattern.test(id);
};

const createConfig = ({input = 'src/index.js', output} = {}) => ({
  input,
  output,
  external: makeExternalPredicate(),
  plugins: [
    progress(),
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers']
    }),
    analyze(),
  ].filter(Boolean)
});

export default [
  createConfig({
    output: [
      {file: pkg.main, format: 'cjs', interop: false},
      {file: pkg.module, format: 'es', interop: false},
    ],
  }),
  createConfig({
    input: './test/index.test.js',
    output: [
      {file: './lib/test/index.test.js', format: 'cjs', interop: false},
    ],
  }),
];
