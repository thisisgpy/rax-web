import React, { useState } from 'react';
import { Layout, Dropdown, Button, Switch, Space, Badge, Popover } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, SunOutlined, MoonOutlined, BellOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { User } from '@/types';
import { GlobalPrecisionControl } from '@/components/GlobalPrecision';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  user?: User | null;
  darkMode: boolean;
  onToggleDarkMode: (checked: boolean) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  darkMode,
  onToggleDarkMode,
  onLogout
}) => {
  // 模拟待办消息数量
  const [messageCount, setMessageCount] = useState(3);

  // 待办消息列表
  const todoMessages = [
    { id: 1, title: '审批申请', content: '有2个储备融资申请等待您审批', time: '10分钟前' },
    { id: 2, title: '系统通知', content: '系统将于今晚23:00进行维护', time: '1小时前' },
    { id: 3, title: '任务提醒', content: '月度报告截止日期为明天', time: '2小时前' },
  ];

  // 处理消息点击
  const handleMessageClick = (messageId: number) => {
    // 这里可以添加具体的消息处理逻辑
  };

  // 清除所有消息
  const handleClearAll = () => {
    setMessageCount(0);
  };

  // 消息弹窗内容
  const messageContent = (
    <div style={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`
      }}>
        <span style={{ fontWeight: 'bold' }}>待办消息 ({messageCount})</span>
        {messageCount > 0 && (
          <Button type="link" size="small" onClick={handleClearAll}>
            全部已读
          </Button>
        )}
      </div>
      
      {messageCount === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px 0', 
          color: darkMode ? '#8c8c8c' : '#999' 
        }}>
          暂无消息
        </div>
      ) : (
        <div>
          {todoMessages.map((message) => (
            <div
              key={message.id}
              style={{
                padding: '12px 0',
                borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => handleMessageClick(message.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#1f1f1f' : '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: 4,
                color: darkMode ? '#fff' : '#000'
              }}>
                {message.title}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: darkMode ? '#8c8c8c' : '#666',
                marginBottom: 4,
                lineHeight: '1.4'
              }}>
                {message.content}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: darkMode ? '#595959' : '#999' 
              }}>
                {message.time}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {messageCount > 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '8px 0',
          borderTop: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
          marginTop: 8
        }}>
          <Button type="link" size="small">
            查看全部消息
          </Button>
        </div>
      )}
    </div>
  );

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 16px',
        background: darkMode ? '#001529' : '#fff',
        borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        lineHeight: '64px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ 
          margin: 0, 
          color: darkMode ? '#fff' : '#000',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          融安心
        </h1>
      </div>
      
      <Space>
        <GlobalPrecisionControl />
        
        <Space>
          <SunOutlined style={{ color: darkMode ? '#fff' : '#000' }} />
          <Switch 
            checked={darkMode} 
            onChange={onToggleDarkMode}
            size="small"
          />
          <MoonOutlined style={{ color: darkMode ? '#fff' : '#000' }} />
        </Space>

        {/* 待办消息入口 */}
        <Popover
          content={messageContent}
          title={null}
          trigger="click"
          placement="bottomRight"
          overlayStyle={{ 
            zIndex: 9999,
          }}
          styles={{
            body: {
              padding: '12px',
              background: darkMode ? '#1f1f1f' : '#fff',
            }
          }}
        >
          <Badge count={messageCount} size="small" offset={[-2, 2]}>
            <Button 
              type="text" 
              icon={<BellOutlined />}
              style={{ 
                color: darkMode ? '#fff' : '#000',
                fontSize: '16px'
              }}
            />
          </Badge>
        </Popover>
        
        {user && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ color: darkMode ? '#fff' : '#000' }}>
              <UserOutlined /> {user.name}
            </Button>
          </Dropdown>
        )}
      </Space>
    </AntHeader>
  );
};