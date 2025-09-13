// 格式化日期
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const copy: any = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as any)[key]);
    });
    return copy;
  }
  return obj;
};

// 生成随机字符串
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 树形数据工具函数
export const treeUtils = {
  // 扁平化树形数据
  flatten: <T extends { children?: T[] }>(tree: T[]): T[] => {
    const result: T[] = [];
    const traverse = (nodes: T[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(tree);
    return result;
  },

  // 根据 ID 查找节点
  findById: <T extends { id: string; children?: T[] }>(tree: T[], id: string): T | null => {
    for (const node of tree) {
      if (node.id === id) return node;
      if (node.children) {
        const found = treeUtils.findById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  },

  // 获取所有父节点
  getParents: <T extends { id: string; parentId?: string; children?: T[] }>(
    tree: T[], 
    targetId: string
  ): T[] => {
    const result: T[] = [];
    const flat = treeUtils.flatten(tree);
    let current = flat.find(item => item.id === targetId);
    
    while (current && current.parentId) {
      const parent = flat.find(item => item.id === current!.parentId);
      if (parent) {
        result.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return result;
  },

  // 过滤树形数据
  filter: <T extends { children?: T[] }>(
    tree: T[], 
    predicate: (node: T) => boolean
  ): T[] => {
    const result: T[] = [];
    
    tree.forEach(node => {
      if (predicate(node)) {
        result.push({
          ...node,
          children: node.children ? treeUtils.filter(node.children, predicate) : undefined
        });
      } else if (node.children) {
        const filteredChildren = treeUtils.filter(node.children, predicate);
        if (filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren
          });
        }
      }
    });
    
    return result;
  }
};

// 表单验证工具
export const validators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return '此字段为必填项';
    }
    return null;
  },

  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : '请输入有效的邮箱地址';
  },

  phone: (value: string) => {
    if (!value) return null;
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(value) ? null : '请输入有效的手机号码';
  },

  minLength: (min: number) => (value: string) => {
    if (!value) return null;
    return value.length >= min ? null : `最少需要${min}个字符`;
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return null;
    return value.length <= max ? null : `最多允许${max}个字符`;
  },

  number: (value: string) => {
    if (!value) return null;
    return /^\d+$/.test(value) ? null : '请输入有效的数字';
  },

  decimal: (value: string) => {
    if (!value) return null;
    return /^\d+(\.\d+)?$/.test(value) ? null : '请输入有效的小数';
  }
};

// 本地存储工具
export const storage = {
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  get: <T = any>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue ?? null;
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};