import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';

export default [
  {
    ignores: ['dist/**/*']
  },
  ...tseslint.config(
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        tseslint.configs.recommended,
      ],
      plugins: {
        react: reactPlugin,
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    }
  ),
];
