判断字段是否有值

// 方法1：通过 id 判断

```javascript
const hasValue = item.id !== null;
```

// 方法2：通过值字段判断

```javascript
const hasValue = item.valueStr !== null
    || item.valueNum !== null
    || item.valueDate !== null
    || item.valueDt !== null
    || item.valueBool !== null;
```

响应数据示例

```json
{
    "success": true,
    "data": [
        {
        "id": 1001,                        // 有值（已保存）
        "loanId": 100,
        "defId": 10,
        "fieldKey": "contract_no",
        "fieldLabel": "合同编号",
        "dataType": "STRING",
        "isRequired": true,
        "isVisible": true,
        "dictCode": null,
        "fieldProductFamily": "ALL",
        "fieldProductType": "ALL",
        "valueStr": "HT-2025-001",
        "valueNum": null,
        "valueDate": null,
        "valueDt": null,
        "valueBool": null
        },
        {
        "id": null,                         // 无值（新增的定义）
        "loanId": 100,
        "defId": 15,
        "fieldKey": "new_field",
        "fieldLabel": "新增字段",
        "dataType": "STRING",
        "isRequired": false,
        "isVisible": true,
        "dictCode": null,
        "fieldProductFamily": "ALL",
        "fieldProductType": "ALL",
        "valueStr": null,
        "valueNum": null,
        "valueDate": null,
        "valueDt": null,
        "valueBool": null
        }
    ]
}
```