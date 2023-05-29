const path = require( 'path' );

module.exports = {
    devtool: "eval-source-map",
    entry: './src/main.ts',
    mode: "development",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                include: path.resolve( __dirname, 'src' ),
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve( __dirname, 'public' ),
    },
};