const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules[1].oneOf.forEach((rule) => {
        if (rule.test && rule.test.toString().includes('css')) {
          rule.use.forEach((use) => {
            if (use.loader && use.loader.includes('/css-loader/')) {
              use.options.modules = { mode: 'local' };
            }
          });
        }
      });
      return webpackConfig;
    },
  },
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
};