const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  // Prisma's native engine binary (.node file) can't be bundled by webpack.
  // Marking @prisma/client as external makes the bundle require() it at runtime
  // from node_modules, where the binary already lives after `prisma generate`.
  externals: [
    { '@prisma/client': 'commonjs @prisma/client' },
    (ctx, callback) => {
      if (/\.prisma\/client/.test(ctx.request ?? '')) {
        return callback(null, 'commonjs ' + ctx.request);
      }
      callback();
    },
  ],
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],
};
