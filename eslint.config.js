// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

const style = stylistic.configs.customize({
  flat        : true,
  indent      : 4,
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
        'require-yield'                                    : [1],
        '@typescript-eslint/consistent-type-imports'       : [2],
        '@typescript-eslint/no-unnecessary-type-parameters': [0],
        '@typescript-eslint/consistent-type-exports'       : [2],
        '@typescript-eslint/no-import-type-side-effects'   : [2],
        '@typescript-eslint/no-non-null-assertion'         : [1],
        '@typescript-eslint/restrict-template-expressions' : [2, {
          allowBoolean: true,
          allowNullish: true,
          allowNumber : true,
        }],
        '@typescript-eslint/no-unused-vars': [2, {caughtErrorsIgnorePattern: '^_'}],

        // temp
        '@typescript-eslint/no-unused-expressions'    : [0],
        '@typescript-eslint/no-unsafe-enum-comparison': [0],
        '@typescript-eslint/only-throw-error'         : [0],
      },
    },
    {
      ...style,
      rules: {
        ...style.rules,
        '@stylistic/key-spacing': ['error', {
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
        '@typescript-eslint/no-unused-vars'     : [2, {
          args                          : 'all',
          argsIgnorePattern             : '^_',
          caughtErrors                  : 'all',
          caughtErrorsIgnorePattern     : '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern             : '^_',
          ignoreRestSiblings            : true,
        }],
      },
    },
    {
      files: ['test/**/*'],
      rules: {
        '@typescript-eslint/no-unsafe-call'         : [0],
        '@typescript-eslint/no-unsafe-member-access': [0],
      },
    },
  ),
];

export default config;
