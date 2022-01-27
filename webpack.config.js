const path = require('path');

module.exports = {
    mode:"development", 
    watch: false,
    entry: {
      webgl: '/example/WebGL/Example.js',
      mlwebgl:'/example/mlWebGL/Example.js',
      hologram: '/example/hologram/Hologram.js', 
      procedual: '/example/procedual/Procedual.js'
    },    
    output: {
      path: __dirname + '/example/build',
      filename: '[name]-bundle.js'
    },
    // resolve: {
    //   modules: [path.resolve(__dirname, './'), 'node_modules']
    // },
    module: {
    }
  }