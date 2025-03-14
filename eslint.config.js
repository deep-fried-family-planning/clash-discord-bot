// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

const style = stylistic.configs.customize({
  indent      : 2,
  semi        : true,
  commaDangle : 'always-multiline',
  quotes      : 'single',
  jsx         : false,
  arrowParens : true,
  quoteProps  : 'as-needed',
  blockSpacing: false,
  braceStyle  : 'stroustrup',
});

const config = [
  {
    ignores: ['terraform', 'dist', 'coverage', 'node_modules', '.husky'],
  },
  ...tseslint.config(
    {
      files: [
        '**/*.ts',
        '**/*.d.ts',
        '**/*.mjs',
        '**/*.js',
        '**/*.ts',
        '**/*.mjs',
        '**/*.js',
        '**/*.tsx',
      ],
      extends: [
        eslint.configs.recommended,
        tseslint.configs.eslintRecommended,
        ...tseslint.configs.strictTypeChecked,
      ],
      languageOptions: {
        parser       : tseslint.parser,
        sourceType   : 'module',
        ecmaVersion  : 'latest',
        parserOptions: {
          project                                    : './tsconfig.eslint.json',
          lib                                        : ['esnext'],
          range                                      : true,
          jsDocParsingMode                           : 'all',
          tokens                                     : true,
          debugLevel                                 : false,
          warnOnUnsupportedTypeScriptVersion         : true,
          errorOnUnknownASTType                      : true,
          errorOnTypeScriptSyntacticAndSemanticIssues: true,
        },
        globals: {
          it      : 'readonly',
          describe: 'readonly',
        },
      },
      plugins: {
        '@stylistic': stylistic,
      },
      linterOptions: {
        reportUnusedDisableDirectives: true,
      },
      rules: {
        'no-fallthrough'                                   : [0],
        'require-yield'                                    : [1],
        '@typescript-eslint/consistent-type-imports'       : [2],
        '@typescript-eslint/no-unnecessary-type-parameters': [0],
        '@typescript-eslint/no-unnecessary-type-assertion' : [0],
        '@typescript-eslint/consistent-type-exports'       : [2],
        '@typescript-eslint/no-confusing-void-expression'  : [0],
        '@typescript-eslint/no-base-to-string'             : [0],
        '@typescript-eslint/restrict-template-expressions' : [0],
        '@typescript-eslint/no-import-type-side-effects'   : [2],
        '@typescript-eslint/no-non-null-assertion'         : [1],
        '@typescript-eslint/no-redundant-type-constituents': [0],
        '@typescript-eslint/no-namespace'                  : [0],
        '@typescript-eslint/no-dynamic-delete'             : [0],
        // '@typescript-eslint/restrict-template-expressions' : [2, {
        //   allowBoolean: true,
        //   allowNullish: true,
        //   allowNumber : true,
        // }],
        // '@typescript-eslint/no-unused-vars': [2, {caughtErrorsIgnorePattern: '^_'}],

        // temp
        '@typescript-eslint/no-unused-expressions'    : [0],
        '@typescript-eslint/no-unsafe-enum-comparison': [0],
        '@typescript-eslint/only-throw-error'         : [0],
        '@typescript-eslint/no-unused-vars'           : [0],
        '@typescript-eslint/prefer-namespace-keyword' : [0],


        '@typescript-eslint/no-explicit-any'        : [0],
        '@typescript-eslint/no-unsafe-call'         : [0],
        '@typescript-eslint/no-unsafe-member-access': [0],
        '@typescript-eslint/no-unsafe-assignment'   : [0],
        '@typescript-eslint/no-unsafe-return'       : [0],
        '@typescript-eslint/no-unsafe-argument'     : [0],
        '@typescript-eslint/no-empty-object-type'   : [0],
      },
    },
    {
      ...style,
      files: ['**/*.ts', '**/*.d.ts', '**/*.mjs', '**/*.js', '**/*.ts', '**/*.mjs', '**/*.js', '**/*.tsx'],
      rules: {
        ...style.rules,
        '@stylistic/yield-star-spacing': [0],
        '@stylistic/operator-linebreak': [0],
        '@stylistic/key-spacing'       : ['error', {
          singleLine: {beforeColon: false, afterColon: true},
          multiLine : {beforeColon: false, afterColon: true, align: 'colon', mode: 'strict'},
        }],
        // '@stylistic/object-curly-spacing'   : [2, 'never'],
        '@stylistic/type-annotation-spacing'    : [0],
        '@stylistic/max-statements-per-line'    : [2, {max: 2}],
        '@stylistic/semi'                       : [2, 'always', {omitLastInOneLineBlock: true}],
        '@stylistic/no-multi-spaces'            : [0, {exceptions: {TSPropertySignature: true}}],
        '@stylistic/multiline-ternary'          : [0],
        '@stylistic/indent-binary-ops'          : [0],
        '@stylistic/object-curly-spacing'       : [0],
        '@stylistic/indent'                     : [0, 4, {flatTernaryExpressions: true}],
        '@stylistic/no-multiple-empty-lines'    : [2, {max: 3}],
        '@stylistic/lines-between-class-members': [0],
        // '@typescript-eslint/no-unused-vars'     : [2, {
        //   args                          : 'all',
        //   argsIgnorePattern             : '^_',
        //   caughtErrors                  : 'all',
        //   caughtErrorsIgnorePattern     : '^_',
        //   destructuredArrayIgnorePattern: '^_',
        //   varsIgnorePattern             : '^_',
        //   ignoreRestSiblings            : true,
        // }],
        '@typescript-eslint/no-unused-vars'     : [0],
      },
    },
    {
      files: ['test/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any'          : [0],
        '@typescript-eslint/no-unsafe-call'           : [0],
        '@typescript-eslint/no-unsafe-member-access'  : [0],
        '@typescript-eslint/no-unsafe-assignment'     : [0],
        '@typescript-eslint/no-unsafe-return'         : [0],
        '@typescript-eslint/no-unsafe-argument'       : [0],
        '@typescript-eslint/no-unsafe-enum-comparison': [0],
        '@typescript-eslint/only-throw-error'         : [0],
        '@typescript-eslint/no-unused-expressions'    : [0],
        '@typescript-eslint/no-unused-vars'           : [0],
        '@typescript-eslint/no-empty-object-type'     : [0],
      },
    },
    {
      files: ['src/disreact/**/*', 'dev/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any'          : [0],
        '@typescript-eslint/no-unsafe-call'           : [0],
        '@typescript-eslint/no-unsafe-member-access'  : [0],
        '@typescript-eslint/no-unsafe-assignment'     : [0],
        '@typescript-eslint/no-unsafe-return'         : [0],
        '@typescript-eslint/no-unsafe-argument'       : [0],
        '@typescript-eslint/no-unsafe-enum-comparison': [0],
        '@typescript-eslint/only-throw-error'         : [0],
        '@typescript-eslint/no-unused-expressions'    : [0],
        '@typescript-eslint/no-unused-vars'           : [0],
        '@typescript-eslint/no-empty-object-type'     : [0],
      },
    },
  ),
];

export default config;
