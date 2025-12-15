import dayjs from 'dayjs';
import type {
  FinLoanExtFieldDefDto,
  FinLoanExtFieldValDto,
  CreateFinLoanExtFieldValDto,
} from '@/types/swagger-api';

/**
 * 根据字段值对象，获取用于表单显示的值
 * 由于 FinLoanExtFieldValDto 现在包含了 dataType 和 dictCode 信息，
 * 可以直接从 fieldVal 中获取，不再强依赖 field 参数
 */
export function getFormValueFromExtFieldVal(
  fieldVal: FinLoanExtFieldValDto,
  field?: FinLoanExtFieldDefDto
): any {
  const dataType = field?.dataType || fieldVal.dataType;
  const dictCode = field?.dictCode || fieldVal.dictCode;

  // 如果有 dictCode，值存储在 valueStr
  if (dictCode) {
    return fieldVal.valueStr;
  }

  switch (dataType) {
    case 'string':
      return fieldVal.valueStr;
    case 'number':
    case 'decimal':
      return fieldVal.valueNum;
    case 'date':
      return fieldVal.valueDate ? dayjs(fieldVal.valueDate) : undefined;
    case 'datetime':
      return fieldVal.valueDt ? dayjs(fieldVal.valueDt) : undefined;
    case 'boolean':
      return fieldVal.valueBool;
    default:
      return fieldVal.valueStr;
  }
}

/**
 * 根据字段定义和表单值，构建 API 提交的值对象
 */
export function buildExtFieldVal(
  fieldKey: string,
  value: any,
  field: FinLoanExtFieldDefDto
): CreateFinLoanExtFieldValDto {
  const { dataType } = field;
  const result: CreateFinLoanExtFieldValDto = {
    fieldKey,
    dataType,
  };

  // 如果有 dictCode，值存储在 valueStr
  if (field.dictCode) {
    result.valueStr = value;
    return result;
  }

  switch (dataType) {
    case 'string':
      result.valueStr = value;
      break;
    case 'number':
    case 'decimal':
      result.valueNum = value;
      break;
    case 'date':
      result.valueDate = value ? dayjs(value).format('YYYY-MM-DD') : undefined;
      break;
    case 'datetime':
      result.valueDt = value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : undefined;
      break;
    case 'boolean':
      result.valueBool = value;
      break;
    default:
      result.valueStr = value;
  }

  return result;
}

/**
 * 表单值对象 -> API 提交数组
 * @param values 表单值对象 { fieldKey1: value1, fieldKey2: value2 }
 * @param fields 字段定义列表
 * @returns CreateFinLoanExtFieldValDto[]
 */
export function formValuesToExtFieldValList(
  values: Record<string, any>,
  fields: FinLoanExtFieldDefDto[]
): CreateFinLoanExtFieldValDto[] {
  const result: CreateFinLoanExtFieldValDto[] = [];

  for (const field of fields) {
    const { fieldKey } = field;
    const value = values[fieldKey];

    // 跳过空值
    if (value === undefined || value === null || value === '') {
      continue;
    }

    result.push(buildExtFieldVal(fieldKey, value, field));
  }

  return result;
}

/**
 * API 返回数组 -> 表单值对象
 * @param valList 扩展字段值列表
 * @param fields 字段定义列表（可选，FinLoanExtFieldValDto 已包含必要信息）
 * @returns 表单值对象 { fieldKey1: value1, fieldKey2: value2 }
 */
export function extFieldValListToFormValues(
  valList: FinLoanExtFieldValDto[],
  fields?: FinLoanExtFieldDefDto[]
): Record<string, any> {
  const result: Record<string, any> = {};

  // 构建 fieldKey -> field 映射（如果提供了 fields）
  const fieldMap = new Map<string, FinLoanExtFieldDefDto>();
  if (fields) {
    for (const field of fields) {
      fieldMap.set(field.fieldKey, field);
    }
  }

  for (const fieldVal of valList) {
    const field = fieldMap.get(fieldVal.fieldKey);
    result[fieldVal.fieldKey] = getFormValueFromExtFieldVal(fieldVal, field);
  }

  return result;
}
