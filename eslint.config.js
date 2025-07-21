import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  // JavaScript 推荐配置
  js.configs.recommended,
  
  // TypeScript 配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.eslint.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        BufferEncoding: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
    },
    rules: {
      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-vars': 'off', // 使用 TypeScript 的规则替代
      'no-empty': ['error', { allowEmptyCatch: true }],
      
      // 基础规则
      'semi': ['error', 'never'],
      'quotes': ['error', 'single'],
      
      // Prettier 集成
      'prettier/prettier': ['error', {
        semi: false,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 80,
        arrowParens: 'always',
        endOfLine: 'lf',
      }],
      
      // 禁用与 Prettier 冲突的规则
      ...prettierConfig.rules,
    },
  },
  
  // 忽略文件
  {
    ignores: ['dist/', 'node_modules/', '*.config.*', 'coverage/', '**/*.min.js'],
  },
]