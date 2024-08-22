import { Avatar, Dropdown, Flex, GetProp, Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { singleMatch, useNickname } from '../utils';
import './ConsoleLayout.scss';
import { getLoginRedirectUrl, logout } from '../api/auth';
import { OrgContext, useOrg } from './shared/useOrg';
import { FormListContext, useFormList } from './shared/useFormList';

export default function ConsoleLayout({ routes }: { routes: (GetProp<typeof Menu, 'items'>[number] & { key: string })[] }) {
  routes = routes.map(v => { return { ...v, key: v.key.replace(/\/:\w+\??$/, '') } });
  const { pathname } = useLocation(); //react-router会自动去除basename部分
  const sub = singleMatch(pathname, /\/console\/(.+)/) ?? '';
  const navigate = useNavigate();
  const nickname = useNickname();
  const formListTuple = useFormList();
  const orgDataTuple = useOrg(); //TODO: 根据useDeparts选择性渲染
  const [{ org: { useDeparts }, respStatus }, orgLoading] = orgDataTuple;

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
        {/* {forms.length > 0 && <Link
          onClick={() => { setActiveForm(forms[0].id) }}
          //显示最新纳新
          className='current-activity' to={`/console/result?id=${forms[0].id}`}>
          查看最近纳新报名表：
          {forms[0].name}
        </Link>} */}
        <Dropdown trigger={['click']} menu={{
          items: [{ label: '退出', }].map((v) => { return { ...v, key: v.label } }),
          onClick(info) {
            if (info.key === '退出') {
              logout();
              location.reload();
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
          <FormListContext.Provider value={formListTuple}>
            {orgLoading
              ? <></> //未加载完组织信息时不渲染
              : (respStatus === 403
                ? <>
                  您似乎没有访问此页面的权限。
                  <br />访问纳新系统后台需要组织管理员为您授权。
                  <br />如果您已有相应权限，请尝试<a href='.' onClick={async () => { await logout(); location.reload() }}>重新登录</a>。
                </>
                : (respStatus === 401
                  ? <> 您需要<a href={getLoginRedirectUrl()}>统一认证登录</a>后才能访问纳新系统后台。</>
                  : <Outlet />)
              )
            }
          </FormListContext.Provider>
        </OrgContext.Provider>
      </div>
    </Layout.Content>
  </Layout>);
}
