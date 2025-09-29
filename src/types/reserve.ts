/**
 * 储备融资状态常量
 */
export const ReserveStatus = {
  /** 待放款 */
  WAITING_FOR_LOAN: 0,
  /** 已放款 */
  LOANED: 1,
  /** 已取消 */
  CANCELLED: 2
} as const;

export type ReserveStatus = typeof ReserveStatus[keyof typeof ReserveStatus];

/**
 * 储备融资状态显示文本映射
 */
export const ReserveStatusText: Record<ReserveStatus, string> = {
  [ReserveStatus.WAITING_FOR_LOAN]: '待放款',
  [ReserveStatus.LOANED]: '已放款',
  [ReserveStatus.CANCELLED]: '已取消'
};

/**
 * 储备融资状态标签颜色映射
 */
export const ReserveStatusColor: Record<ReserveStatus, string> = {
  [ReserveStatus.WAITING_FOR_LOAN]: 'orange',
  [ReserveStatus.LOANED]: 'green',
  [ReserveStatus.CANCELLED]: 'red'
};