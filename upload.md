### 全局统一的文件上传处理逻辑

基于 Ant Design Upload 组件封装全局统一的上传组件 RaxUpload，不需要支持拖拽上传，每次只允许选择一份文件上传。支持上传的文件类型需要做成配置项，默认包括 Word、Excel、CSV、PDF 和各种图片。

组件维护一个 uploadedFiles 数组用于表示上传成功且需要保存的文件数据，数据格式如下：

```json
[
  {
    "attachmentId": 0,
    "filename": "xxx.jpg",
    "fileSize": 0
  }
]
```

在文件上传成功后自动将数据插入到这个数据。其中 attachmentId 表示附件 ID，这个值在调用attachmentApi.getPresignedUrl 接口时就会返回。fileSize 表示上传文件的大小，由前端自行获取。filename 字段表示源文件名。

父组件可以获取到 uploadedFiles 数组并提交到服务端。

当用户选择文件后，调用接口attachmentApi.getPresignedUrl 接口获取阿里云 OSS 的预签名上传链接。请求参数 filename 表示源文件名，请求参数 bizModule 表示业务模块，可选值有：

1. ReserveReport：储备融资进度报告
2. FinExisting：存量融资

attachmentApi.getPresignedUrl 接口会返回固定的数据格式：

```json
{
  "attachmentId": 0,
  "uploadUrl": "",
  "objectKey": "",
  "fullUrl": ""
}
```

接着发起 HTTP 请求执行文件上传，Method 为 PUT，请求地址是 uploadUrl，请求参数为文件数据，上传过程中需要监听并展示上传进度，上传完成前禁止用户操作页面。下面是一个上传示例：

```javascript
import axios from 'axios';

async function uploadWithAxios(file, presignedUrl) {
  const config = {
    headers: {
      'Content-Type': file.type,
    },
    // 监听上传进度
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`上传进度: ${percentCompleted}%`);
    },
  };

  const response = await axios.put(presignedUrl, file, config);
  if (response.status === 200) {
    return presignedUrl.split('?')[0];
  }
}
```

如果文件上传成功，接口会返回 HTTP Status 200，但并不会返回任何 JSON 数据。此时需要向uploadedFiles 数组中插入数据。

最后，RaxUpload 还需要一个展示已上传文件的部分，列出uploadedFiles 数组中的所有数据，包括源文件名（filename）和文件大小（fileSize），并且需要一个删除按钮，用户确认删除后将对应数据从 uploadedFiles 数组中移除。

### 附件展示组件

封装 AttachmentDisplay 组件，接收参数为附件信息列表，组件内以表格形式展示每一份附件信息，对应类型为 SysAttachmentDto。表格字段包括：源文件名（originalName）、文件大小（fileSize）、创建时间（createTime）、创建人（createTime）。另外需要提供删除按钮，调用 attachmentApi.remove 接口完成附件删除。