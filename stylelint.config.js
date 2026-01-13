/** @type {import('stylelint').Config} */
export default {
  extends: 'stylelint-config-recommended-vue',
  plugins: ['stylelint-no-unsupported-browser-features'],
  rules: {
    // 修复CSS兼容性问题
    'property-no-vendor-prefix': null, // 允许厂商前缀如 -webkit-line-clamp
    'value-no-vendor-prefix': null, // 允许厂商前缀值

    // 浏览器兼容性检查 - 调整为更现代的浏览器支持
    'plugin/no-unsupported-browser-features': [
      true,
      {
        browsers: [
          'last 2 versions',
          '> 1%',
          'not dead',
          'not ie <= 11',
          'not op_mini all',
          'not kaios <= 3.1', // 排除KaiOS
          'not and_uc <= 15.5', // 排除UC浏览器
          'not and_qq <= 14.9', // 排除QQ浏览器
        ],
        ignore: [
          'css-appearance',
          'css-variables', // 现代项目通常使用CSS变量
          'viewport-units', // 现代浏览器都支持
          'css-gradients',
          'border-radius',
          'css-boxshadow',
          'transforms2d',
          'css-transitions',
          'flexbox-gap',
          'word-break',
          'css-nesting', // 忽略CSS嵌套警告
          'css-backdrop-filter', // 忽略backdrop-filter警告
          'css-math-functions', // 忽略CSS数学函数警告
          'css3-cursors', // 忽略CSS3光标警告
        ],
        ignorePartialSupport: true,
        severity: 'warning', // 改为警告而不是错误
      },
    ],

    // 允许SCSS变量和函数
    'declaration-property-value-no-unknown': null, // 允许SCSS变量如 $transition-duration

    // 允许过时的关键字（某些情况下仍需要兼容性）
    'declaration-property-value-keyword-no-deprecated': [
      true,
      {
        ignoreKeywords: ['break-word'], // 允许 word-break: break-word
      },
    ],

    // 放宽选择器特异性规则（Vue组件中常见）
    'no-descending-specificity': null,

    // Vue特定规则优化
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global'],
      },
    ],

    // SCSS兼容性
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
  },

  // 覆盖配置，确保Vue文件使用正确的语法
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['*.scss', '**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
}
