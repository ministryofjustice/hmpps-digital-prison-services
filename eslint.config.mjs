import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'
import typescriptEslint from '@typescript-eslint/eslint-plugin'

const defaultConfig = hmppsConfig({
  extraIgnorePaths: ['assets/js/**/*.js'],
})
defaultConfig.push({
  rules: {
    'import/prefer-default-export': 'off',
  },
})
defaultConfig.push({
  plugins: {
    '@typescript-eslint': typescriptEslint,
  },

  rules: {
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        argsIgnorePattern: 'res|next|^err|_',
        ignoreRestSiblings: true,
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
})

export default defaultConfig
