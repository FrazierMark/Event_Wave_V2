const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
var webpack = require('webpack')
var path = require('path')

module.exports = {
    module: {
        babel: {
            loaderOptions: {
              ignore: ['./node_modules/mapbox-gl/dist/mapbox-gl.js'],
            },
          },
        rules: [
            {
                test: /.s?css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
            {
                test: /\bmapbox-gl-csp-worker.js\b/i,
                use: { loader: 'worker-loader' },
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
                loader: 'worker'
              },
              {
                test: /mapbox-gl.+\.js$/,
                loader: 'transform/cacheable?brfs'
              },
        ],
    },
    optimization: {
        minimizer: [
            // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
            // `...`,
            new CssMinimizerPlugin(),
        ],
    },    
    plugins: [new MiniCssExtractPlugin()],
};

