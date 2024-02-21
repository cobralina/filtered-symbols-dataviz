module.exports = {
  filenameHashing: false,
  chainWebpack: (config) => {
    config.optimization.delete("splitChunks");
  },
  publicPath: process.env.NODE_ENV === "production" ? "https://dynamic.faz.net/red/2023/femizide/" : "/",
};
