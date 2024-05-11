import { Avatar, Dropdown, Flex, GetProp, Layout, Menu } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { singleMatch, useNickname } from '../../utils';
import './ConsoleLayout.scss';
import { logout } from '../../api/auth';
import { OrgContext, useOrgProvider } from './useOrg';

export default function ConsoleLayout({ routes }: { routes: (GetProp<typeof Menu, 'items'>[number] & { key: string })[] }) {
  routes = routes.map(v => { return { ...v, key: v.key.replace(/\/:\w+\??$/, '') } });
  const { pathname } = useLocation(); //react-router会自动去除basename部分
  const sub = singleMatch(pathname, /\/console\/(.+)/) ?? '';
  const navigate = useNavigate();
  const nickname = useNickname();
  const orgDataTuple = useOrgProvider(); //TODO: 根据useDeparts选择性渲染
  const [{ org: { useDeparts } }] = orgDataTuple;

  return (<Layout className='layout'>
    <Layout.Sider theme='light' className='sider'
      collapsible
      defaultCollapsed={window.innerWidth < 992}>
      <Menu className='menu' mode='inline'
        selectedKeys={[routes.find(r => sub.startsWith(r.key))?.key ?? '__default']}
        onClick={(info) => navigate(info.key)}
        items={routes} />
    </Layout.Sider>

    <Layout.Content className='main'>
      <Flex className='title-bar' align='center' justify='space-between'>
        <span className='title'>求是潮纳新开放系统V2</span>
        <Link className='current-activity' to='/'>正在进行的纳新名称</Link>
        <Dropdown trigger={['click']} menu={{
          items: [{ label: '退出', }].map((v) => { return { ...v, key: v.label } }),
          onClick(info) {
            if (info.key === '退出') {
              logout();
              //TODO 重定向登录etc
            }
          }
        }}>
          <Flex className='user-area' align='center' >
            <Avatar className='avatar'>{nickname}</Avatar>
            <span className='username'>{nickname}</span>
          </Flex>
        </Dropdown>
      </Flex>
      <div className='content'>
        <OrgContext.Provider value={orgDataTuple}>
          <Outlet />
        </OrgContext.Provider>
      </div>
    </Layout.Content>
  </Layout>);
}
