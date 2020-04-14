
module.exports = {
    mode:"production", 
    watch: false,
    entry: {
      webgl: './example/WebGL/Example.js',
      mlwebgl:'./example/mlWebGL/Example.js'
    },
    
    output: {
      path: __dirname + '/example/build',
      filename: '[name]-bundle.js'
    },
  
  }