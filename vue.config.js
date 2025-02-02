module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
      config.optimization.minimize = false
    }
  },

  devServer: {
    env: {
      BASE_URL: '/'
    }
  },

  transpileDependencies: [
    'vuetify'
  ]
}
