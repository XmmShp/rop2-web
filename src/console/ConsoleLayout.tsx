import { Avatar, Dropdown, Flex, GetProp, Layout, Menu, Skeleton, Space, Tooltip, Typography } from 'antd';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { num, singleMatch, useNickname, useReloader } from '../utils';
import './ConsoleLayout.scss';
import { getLoginRedirectUrl, logout, switchOrg } from '../api/auth';
import { OrgContext, useOrg } from './shared/useOrg';
import { createContext, useMemo } from 'react';
import { CheckOutlined, DownOutlined } from '@ant-design/icons';
import { kvGet, kvSet, zjuIdKey } from '../store/kvCache';
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
export default function ConsoleLayout({
  routes,
}: {
  routes: (Omit<GetProp<typeof Menu, 'items'>[number], 'path'> & {
    key: string;
    path?: string;
    href?: string;
  })[];
}) {
  routes = routes.map((v) => {
    return { ...v, key: v.key.replace(/\/:\w+\??$/, '') };
  });
  const { pathname } = useLocation(); //react-router会自动去除basename部分
  const sub = singleMatch(pathname, /\/console\/(.+)/) ?? '';
  const navigate = useNavigate();
  const nickname = useNickname();
  const formListTuple = useData<FormList & { respStatus: number }>(
    '/form/list',
    async (resp) => {
      const formListRespStatus = resp.status; //确保不报错，403错误在useOrg时处理
      return Object.assign(formListRespStatus === 200 ? await resp.json() : [], { respStatus: resp.status });
    },
    Object.assign([], { respStatus: 0 })
  );
  const [formList, formListLoading] = formListTuple;
  const orgDataTuple = useOrg(); //TODO: 根据useDeparts选择性渲染
  const [
    {
      org: { useDeparts, id: at },
      respStatus,
    },
    orgLoading,
  ] = orgDataTuple;
  const zjuId = useMemo(() => kvGet(zjuIdKey), []);
  const [availableOrgs] = useData<{ orgId: number; orgName: string }[]>(
    '/availableOrgs',
    async (resp) => {
      if (resp.status !== 200) return [];
      return await resp.json();
    },
    []
  );
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

    if (paramsFormId)
      if (paramsFormId !== staticFormId) {
        //如果url中有formId，优先使用url中的formId，同时kvSet
        kvSet('form', paramsFormId);
        return num(paramsFormId);
      } else return num(paramsFormId);

    if (staticFormId)
      //否则，如果localStorage中有formId，使用之
      return num(staticFormId);

    if (formList.respStatus !== 200)
      //无法静态获知formId，先过滤0,401,403等
      return -1;

    if (!formList.length) {
      //如果表单列表为空，跳转到表单管理
      if (sub !== 'form') navigate('/console/form');
      message.error('表单不存在，请新建表单');
      return -1;
    }

    //否则，使用最新的表单(+message提示)
    const latestForm = formList[0];
    kvSet('form', latestForm.id.toString());
    message.info('工作表单设置为：' + latestForm.name);
    return latestForm.id;
  }, [formList, formListLoading, reloader.count]);
  const activeFormName = useMemo(() => formList?.find((f) => f.id === activeFormId)?.name ?? '', [formList, activeFormId]);

  return (
    <Layout className="layout">
      <Layout.Sider theme="light" className="sider" collapsible defaultCollapsed={window.innerWidth < 992}>
        <Menu
          className="menu"
          mode="inline"
          selectedKeys={[routes.find((r) => sub.startsWith(r.key))?.key ?? '__default']}
          onClick={(info) => {
            if (info.key.match(/https?:\/\//)) window.open(info.key, '_blank', 'noopener,noreferrer');
            else navigate(info.key);
          }}
          items={routes}
        />
      </Layout.Sider>

      <Layout.Content className="main">
        <Flex className="title-bar" align="center" justify="space-between">
          <div className="title">
            <span className="major">求是潮纳新开放系统</span>
            {import.meta.env.VITE_IS_DOCKER_ENVIRONMENT?.match(/^(true|1)$/i) ? (
              <Tooltip title={<span style={{ whiteSpace: 'pre-wrap' }}>Docker 构建版本</span>}>
                <span className="minor">Docker 构建版本</span>
              </Tooltip>
            ) : (
              <Tooltip title={<span style={{ whiteSpace: 'pre-wrap' }}>{import.meta.env.VITE_BUILD_INFO_DETAIL ?? '未获取到构建详情'}</span>}>
                <span className="minor">{import.meta.env.VITE_BUILD_INFO ?? '构建版本未知'}</span>
              </Tooltip>
            )}
          </div>
          <Dropdown
            className="current-activity"
            trigger={['hover']}
            menu={{
              selectable: true,
              selectedKeys: [activeFormId.toString()],
              items: formList.map((f) => {
                return { label: f.name, key: f.id.toString() };
              }),
              onClick({ key }) {
                updateActiveFormId(num(key));
              },
            }}
          >
            <Typography.Link type={activeFormName.length ? undefined : 'danger'}>
              <Space>
                <DownOutlined />
                {activeFormName || '请选择要管理的表单'}
              </Space>
            </Typography.Link>
          </Dropdown>
          {nickname ? (
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'switchOrg',
                    label: '切换组织',
                    children: availableOrgs.map(({ orgId, orgName }) => {
                      return {
                        key: orgId,
                        label: orgName,
                        icon: at === orgId ? <CheckOutlined /> : undefined,
                        async onClick() {
                          if (at === orgId) return;
                          await switchOrg(orgId).msgSuccess(`已切换到组织 ${orgName}`);
                          location.reload();
                        },
                      };
                    }),
                  },
                  {
                    key: 'logout',
                    label: '退出',
                    onClick() {
                      logout();
                    },
                  },
                ],
              }}
            >
              <Flex className="user-area" align="center">
                <Avatar className="avatar">{nickname}</Avatar>
                <span className="username">{nickname}</span>
              </Flex>
            </Dropdown>
          ) : (
            <div style={{ width: 0, height: 0, overflow: 'hidden' }}>_未登录占位符_</div>
          )}
        </Flex>
        <div className="content">
          <OrgContext.Provider value={orgDataTuple}>
            <FormIdContext.Provider value={activeFormId}>
              <FormListContext.Provider value={formListTuple as DataTuple<FormList>}>
                {orgLoading ? (
                  <Skeleton active loading /> //未加载完组织信息时不渲染
                ) : respStatus === 403 ? (
                  <>
                    您似乎没有有效的管理权限。(学号：{zjuId})
                    <br />
                    访问纳新系统后台需要组织管理员为您授权。
                    <br />
                    如果您已获取相应权限，请尝试
                    <a
                      onClick={() => {
                        logout(getLoginRedirectUrl());
                      }}
                    >
                      重新登录
                    </a>
                    。
                    <br />
                    您也可以
                    <a target="_self" href="https://docs.qq.com/form/page/DSERWdXFFT3JOTEla">
                      创建新组织
                    </a>
                    。
                  </>
                ) : respStatus === 401 ? (
                  <>
                    {' '}
                    您需要<a href={getLoginRedirectUrl()}>统一认证登录</a>
                    后才能访问纳新系统后台。
                  </>
                ) : (
                  <Outlet />
                )}
              </FormListContext.Provider>
            </FormIdContext.Provider>
          </OrgContext.Provider>
        </div>
      </Layout.Content>
    </Layout>
  );
}
