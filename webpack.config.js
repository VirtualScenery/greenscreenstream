const path = require('path');

module.exports = {
    mode:"production", 
    watch: false,
    entry: {
      webgl: './dist/example/WebGL/Example.js',
      mlwebgl:'./dist/example/mlWebGL/Example.js',
      hologram: './dist/example/hologram/Hologram.js', 
      procedual: './dist/example/procedual/Procedual.js'
    },    
    output: {
      path: __dirname + '/example/build',
      filename: '[name]-bundle.js'
    },
    resolve: {
      modules: [path.resolve(__dirname, './'), 'node_modules']
    },
    module: {
      rules: [
        {
          test: /\.glsl$/i,
          use: 'raw-loader',
        },
      ],
    }
  }