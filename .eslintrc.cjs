module.exports = {
  extends: ['react-app'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn'
  },
  ignorePatterns: ['android/**', 'build/**', 'node_modules/**', 'public/**', 'electron/**']
};