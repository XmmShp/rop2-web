import { Avatar, Dropdown, Flex, GetProp, Layout, Menu, Typography } from 'antd';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { mapRecur, singleMatch, without } from '../../utils';
import { useState } from 'react';
import './ConsoleLayout.scss';

export default function ConsoleLayout({ routes }: { routes: GetProp<typeof Menu, 'items'> }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const subFunc = singleMatch(pathname, /^\/console\/(\w+(\/\w+)*)(?!\/)\/?\??/);
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const matched = singleMatch(subFunc ?? '', /^(\w+)/);
    if (!matched) return [];
    return [matched];
  });
  if (!subFunc) return <Navigate to='dash' />;
  return (<Layout style={{ minHeight: '100vh' }}>
    <Layout.Sider theme='light' style={{
      maxHeight: 'calc(100vh - 48px)',
      overflow: 'hidden auto',
      userSelect: 'none'
    }}
      collapsible
      collapsed={collapsed}
      onCollapse={(col) => {
        if (!col) setOpenKeys([singleMatch(subFunc ?? '', /^(\w+)/)!]);
        setCollapsed(col);
      }}
    >
      <Menu selectedKeys={[subFunc]} mode="inline"
        openKeys={collapsed ? undefined : openKeys}
        onOpenChange={(keys) => setOpenKeys(keys)}
        onClick={(info) => navigate(info.key)}
        items={mapRecur(routes as any, 'children', (o) => without(o as any, ['lazy', 'path'])) as any} />
    </Layout.Sider>

    <Layout.Content className='main'>
      <Flex className='title-bar' align='center' justify='space-between'>
        <span className='title'>求是潮纳新开放系统V2</span>
        <Link className='current-activity' to='/'>正在进行的纳新名称</Link>
        <Dropdown trigger={['click']} menu={{ items: [{ label: '退出', }].map((v, i) => { return { ...v, key: i } }) }}>
          <Flex className='user-area' align='center' >
            <Avatar className='avatar'>test</Avatar>
            <span className='username'>测试用户 </span>
          </Flex>
        </Dropdown>
      </Flex>
      <div className='content'>
        <Outlet />
      </div>
    </Layout.Content>
  </Layout>);
}
