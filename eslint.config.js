import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier/recommended'

export default [
  // 忽略文件配置
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.vscode/**',
      '**/.idea/**',
      '**/generated/**',
      '**/auto-imports.d.ts',
      '**/components.d.ts',
    ],
  },

  // JavaScript 推荐规则
  js.configs.recommended,

  // TypeScript 推荐规则
  ...tseslint.configs.recommended,

  // Vue 推荐规则
  ...pluginVue.configs['flat/recommended'],

  // 自定义规则配置
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // 浏览器全局变量
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        // Node.js 全局变量
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        // TypeScript 全局变量
        NodeJS: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // TypeScript 规则
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any（生产环境建议 'warn'）
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^error$', // 忽略 error 变量
          caughtErrorsIgnorePattern: '^_|^error$', // 忽略 catch 中的 error
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off', // 允许非空断言
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
          'ts-check': false,
          minimumDescriptionLength: 3,
        },
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'always',
          allowObjectTypes: 'always', // 允许空对象类型
        },
      ],

      // Vue 规则
      'vue/multi-word-component-names': 'off', // 允许单词组件名
      'vue/require-default-prop': 'off',
      'vue/no-v-html': 'warn',
      'vue/no-required-prop-with-default': 'off', // 允许必需 prop 有默认值
      'vue/no-use-v-if-with-v-for': 'off', // 允许 v-if 和 v-for 同时使用
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
      'vue/max-attributes-per-line': [
        'warn',
        {
          singleline: 3,
          multiline: 1,
        },
      ],

      // 通用规则
      'no-console': 'off', // 允许 console（生产环境建议 'warn'）
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // 使用 TS 规则
      'no-undef': 'off', // TypeScript 已经处理
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Vue 文件的 TypeScript 解析器配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },

  // Prettier 配置（必须放在最后）
  prettier,

  // Prettier 规则覆盖
  {
    rules: {
      'prettier/prettier': [
        'warn', // 改为 warn，避免格式化问题阻止开发
        {
          singleQuote: true,
          semi: false,
          trailingComma: 'all',
          printWidth: 80,
          tabWidth: 2,
          endOfLine: 'lf',
        },
      ],
    },
  },
]
