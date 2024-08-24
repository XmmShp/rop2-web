import { Avatar, Dropdown, Flex, GetProp, Layout, Menu, Skeleton, Space, Typography } from 'antd';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { num, singleMatch, useNickname, useReloader } from '../utils';
import './ConsoleLayout.scss';
import { getLoginRedirectUrl, logout } from '../api/auth';
import { OrgContext, useOrg } from './shared/useOrg';
import { createContext, useMemo } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { kvGet, kvSet } from '../store/kvCache';
import { message } from '../App';
import { FormIdContext } from './shared/useForm';
import { DataTuple, useData } from '../api/useData';

export const FormListContext = createContext<DataTuple<FormList>>(null as any);

let consoleLayoutUpdater: (formId: number) => void;
export function updateActiveFormId(formId: number) {
  console.log('updateActiveForm', formId);
  if (formId) kvSet('form', formId.toString());
  consoleLayoutUpdater(formId);
}
export type FormOutline = {
  id: number;
  name: string;
  startAt: string | null;
  endAt: string | null;
  createAt: string;
  // updateAt: string;//not used yet
};
export type FormList = FormOutline[];
export default function ConsoleLayout({ routes }: { routes: (GetProp<typeof Menu, 'items'>[number] & { key: string })[] }) {
  routes = routes.map(v => { return { ...v, key: v.key.replace(/\/:\w+\??$/, '') } });
  const { pathname } = useLocation(); //react-router会自动去除basename部分
  const sub = singleMatch(pathname, /\/console\/(.+)/) ?? '';
  const navigate = useNavigate();
  const nickname = useNickname();
  const formListTuple = useData<FormList>('/form/list', async (resp) => {
    if (resp.status !== 200) return []; //确保不报错，403错误在useOrg时处理
    else return await resp.json()
  }, [])
  const [formList, formListLoading] = formListTuple;
  const orgDataTuple = useOrg(); //TODO: 根据useDeparts选择性渲染
  const [{ org: { useDeparts }, respStatus }, orgLoading] = orgDataTuple;
  const reloader = useReloader();
  consoleLayoutUpdater = (newFormId: number) => {
    //把/console/result/:formId重定向到/console/result/newFormId
    //如果本来没有:formId，不会重定向(result、edit的formId参数为可选)
    if (paramsFormId) navigate(pathname.replace(/\/\d+\/?$/, `/${newFormId}`));
    reloader();
  };
  const { formId: paramsFormId } = useParams();
  const activeFormId = useMemo(() => {
    const staticFormId = kvGet('form');
    if (paramsFormId) {
      if (paramsFormId !== staticFormId)
        kvSet('form', paramsFormId);
      return num(paramsFormId);
    }
    if (staticFormId) return num(staticFormId);
    if (respStatus !== 200) return -1;//401,403等
    if (!formList.length) {
      if (sub !== 'form')
        navigate('/console/form');
      message.error('表单不存在，请新建表单');
      return -1;
    } else {
      const latestForm = formList[0];
      kvSet('form', latestForm.id.toString());
      message.info('工作表单设置为：' + latestForm.name);
      return latestForm.id;
    }
  }, [formList, formListLoading, reloader.count]);
  const activeFormName = useMemo(() => formList?.find(f => f.id === activeFormId)?.name ?? '', [formList, activeFormId]);

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
        <Dropdown trigger={['hover']}
          menu={{
            selectable: true,
            selectedKeys: [activeFormId.toString()],
            items: formList.map(f => { return { label: f.name, key: f.id.toString() } }),
            onClick({ key }) { updateActiveFormId(num(key)) }
          }}>
          <Typography.Link type={activeFormName.length ? undefined : 'danger'}>
            <Space>
              <DownOutlined />
              {activeFormName || '请选择要管理的表单'}
            </Space>
          </Typography.Link>
        </Dropdown>
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
          <FormIdContext.Provider value={activeFormId}>
            <FormListContext.Provider value={formListTuple}>
              {orgLoading
                ? <Skeleton active loading /> //未加载完组织信息时不渲染
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
          </FormIdContext.Provider>
        </OrgContext.Provider>
      </div>
    </Layout.Content>
  </Layout>);
}

