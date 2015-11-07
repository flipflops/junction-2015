import { join } from 'path';
import { NoErrorsPlugin } from 'webpack';

export const config = {
    output: {
        path: join(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [
          { test: /\.jsx$/, loaders: [ 'react-hot', 'babel' ], exclude: [ /node_modules/ ] },
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
          { test: /\.jpe?g|\.gif|\.png|\.svg|\.woff|\.woff2|\.ttf|\.eot/, loader: 'file' },
          { test: /\.json$/, loader: 'json' },
        ],
    },
    plugins: [
      new NoErrorsPlugin(),
    ],
};
