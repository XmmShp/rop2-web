import { Layout, Menu } from 'antd';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { paths } from './consoleRoute';
import { singleMatch } from '../utils';
import { useState } from 'react';

export function ConsoleLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const subFunc = singleMatch(pathname, /^\/console\/(\w+(\/\w+)*)(?!\/)\/?\??/);
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const matched = singleMatch(subFunc ?? '', /^(\w+)/);
    if (!matched) return [];
    return [matched];
  });
  if (!subFunc) return <Navigate to='dash' />;
  return (<Layout style={{ minHeight: '100vh' }}>
    <Layout.Sider theme='light' style={{ maxHeight: 'calc(100vh - 48px)', overflow: 'hidden auto' }} collapsible defaultCollapsed={false}
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
      <Outlet />
    </Layout.Content>
  </Layout>);
}
