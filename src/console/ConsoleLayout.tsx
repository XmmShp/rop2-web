import { Avatar, Dropdown, Layout, Menu } from 'antd';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { paths } from './consoleRoute';
import { singleMatch } from '../utils';
import { useState } from 'react';
import useToken from 'antd/es/theme/useToken';
import './ConsoleLayout.scss';

export function ConsoleLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const subFunc = singleMatch(pathname, /^\/console\/(\w+(\/\w+)*)(?!\/)\/?\??/);
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const matched = singleMatch(subFunc ?? '', /^(\w+)/);
    if (!matched) return [];
    return [matched];
  });
  const [, { colorBgContainer, fontSizeHeading5 }] = useToken();
  if (!subFunc) return <Navigate to='dash' />;
  return (<Layout style={{ minHeight: '100vh' }}>
    <Layout.Sider theme='light' style={{
      maxHeight: 'calc(100vh - 48px)',
      overflow: 'hidden auto',
      userSelect: 'none'
    }} collapsible defaultCollapsed={false}
      onCollapse={(col) => {
        if (!col) setOpenKeys([singleMatch(subFunc ?? '', /^(\w+)/)!]);
      }}
    >
      <Menu selectedKeys={[subFunc]} mode="inline"
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys)}
        onClick={(info) => navigate(info.key)}
        items={paths} />
    </Layout.Sider>

    <Layout.Content>
      <div className='title-bar' >
        <span className='title' >求是潮纳新开放系统V2</span>
        <Link to='.'>求是潮2024春季纳新</Link>

        <Dropdown trigger={['click']} menu={{ items: [{ label: '退出', }].map((v, i) => { return { ...v, key: i } }) }}>
          <div className='user-area' >
            <Avatar className='avatar'>test</Avatar>
            <span className='username'>测试用户</span></div>
        </Dropdown>
      </div>
      <Outlet />
    </Layout.Content>
  </Layout>);
}
