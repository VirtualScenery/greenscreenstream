
module.exports = {
    mode:"production", 
    watch: false,
    entry: {
      webgl: './example/WebGL/Example.js',
      mlwebgl:'./example/mlWebGL/Example.js',
      hologram: './example/hologram/Hologram.js', 
      procedual: './example/procedual/Procedual.js'
    },    
    output: {
      path: __dirname + '/example/build',
      filename: '[name]-bundle.js'
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