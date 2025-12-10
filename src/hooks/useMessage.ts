import { App } from 'antd';

/**
 * 使用 Ant Design 的 message API（基于 context）
 * 替代静态方法以支持动态主题
 */
export const useMessage = () => {
  const { message } = App.useApp();
  return message;
};
