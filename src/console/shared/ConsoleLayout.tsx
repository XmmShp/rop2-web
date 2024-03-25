import { Avatar, Dropdown, Flex, GetProp, Layout, Menu } from 'antd';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getUser, mapRecur, singleMatch, toArray, without } from '../../utils';
import { useState } from 'react';
import './ConsoleLayout.scss';

export default function ConsoleLayout({ routes }: { routes: GetProp<typeof Menu, 'items'> }) {
  const { pathname } = useLocation();//react-router会自动去除basename部分
  const navigate = useNavigate();
  const sub = singleMatch(pathname, /^\/console\/(\w+(\/\w+)*)(?!\/)\/?/);
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const topSub = toArray(singleMatch(sub ?? '', /^(\w+)/));
  const [openKeys, setOpenKeys] = useState<string[]>(topSub);

  if (!sub) return <Navigate to='dash' />;
  return (<Layout className='layout'>
    <Layout.Sider theme='light' className='sider'
      collapsible
      collapsed={collapsed}
      onCollapse={(col) => {
        if (!col) setOpenKeys([singleMatch(sub ?? '', /^(\w+)/)!]);
        setCollapsed(col);
      }}
    >
      <Menu className='menu'
        selectedKeys={[sub, ...topSub]} mode="inline"
        openKeys={collapsed ? undefined : openKeys}
        onOpenChange={(keys) => setOpenKeys(keys)}
        onClick={(info) => navigate(info.key)}
        items={mapRecur(routes as any, 'children', (o) => without(o as any, ['lazy', 'path', 'element'])) as any} />
    </Layout.Sider>

    <Layout.Content className='main'>
      <Flex className='title-bar' align='center' justify='space-between'>
        <span className='title'>求是潮纳新开放系统V2</span>
        <Link className='current-activity' to='/'>正在进行的纳新名称</Link>
        <Dropdown trigger={['click']} menu={{ items: [{ label: '退出', }].map((v, i) => { return { ...v, key: i } }) }}>
          <Flex className='user-area' align='center' >
            <Avatar className='avatar'>{getUser()}</Avatar>
            <span className='username'>{getUser()}</span>
          </Flex>
        </Dropdown>
      </Flex>
      <div className='content'>
        <Outlet />
      </div>
    </Layout.Content>
  </Layout>);
}
