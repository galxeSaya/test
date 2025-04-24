module.exports = {
  extends: ['react-app'],
  plugins: ['react'],
  rules: {
    // 添加自定义规则
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
  },
  settings: {
    react: {
      version: 'detect', // 自动检测安装的 React 版本
    },
  },
};
