# RaxUpload 文件上传组件

## 概述

RaxUpload 是一个基于 Ant Design Upload 组件封装的全局统一文件上传组件，支持预签名 OSS 上传流程。

## 特性

- ✅ 单文件上传（不支持拖拽）
- ✅ 可配置文件类型和大小限制
- ✅ 预签名 OSS 上传流程
- ✅ 实时上传进度显示
- ✅ 已上传文件列表管理
- ✅ 文件删除功能
- ✅ 完整的错误处理

## 使用示例

```tsx
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';

const MyComponent = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  return (
    <RaxUpload
      bizModule="ReserveReport"
      value={files}
      onChange={setFiles}
      maxSize={10 * 1024 * 1024} // 10MB
      maxCount={5}
    />
  );
};
```

## API

### RaxUploadProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| bizModule | `'ReserveReport' \| 'FinExisting'` | - | 业务模块，必填 |
| value | `UploadedFile[]` | `[]` | 受控模式的文件列表 |
| onChange | `(files: UploadedFile[]) => void` | - | 文件列表变化回调 |
| maxSize | `number` | `50MB` | 最大文件大小（字节） |
| acceptedTypes | `string[]` | 常见文档和图片格式 | 允许的文件类型 |
| disabled | `boolean` | `false` | 是否禁用 |
| maxCount | `number` | - | 最大文件数量 |
| className | `string` | - | 自定义样式类名 |

### UploadedFile

```typescript
interface UploadedFile {
  attachmentId: number;  // 附件ID
  filename: string;      // 源文件名
  fileSize: number;      // 文件大小（字节）
}
```

## 默认支持的文件类型

- **图片**: JPEG, PNG, GIF, BMP, WebP
- **文档**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), CSV

## 上传流程

1. 用户选择文件
2. 前端验证文件类型和大小
3. 调用 `attachmentApi.getPresignedUrl` 获取预签名链接
4. 使用预签名链接直接上传到 OSS
5. 更新本地文件列表状态