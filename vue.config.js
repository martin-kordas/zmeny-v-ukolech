const path = require('path')

module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["css-loader"],
          // doplnìním neexistující cesty øešíme chybu https://github.com/webpack-contrib/css-loader/issues/295#issuecomment-231343071
          include: path.resolve(__dirname, "not_exist_path")
        }
      ]
    }
  },
  publicPath: "/servis/ukoly/zmeny_v_ukolech/dist/",
  devServer: {
    proxy: "http://localhost:80"
  }
}
