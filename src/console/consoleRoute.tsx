import { ApartmentOutlined, AuditOutlined, DashboardOutlined, FormOutlined } from '@ant-design/icons';
import { RouteObject } from 'react-router-dom';
import { mapRecur } from '../utils';
import { ConsoleLayout } from './ConsoleLayout';

export const paths = mapRecur([{
  label: '仪表盘',
  title: '仪表盘',
  path: 'dash',
  icon: <DashboardOutlined />,
  element: <div>仪表盘</div>
}, {
  label: '组织管理',
  path: 'org',
  icon: <ApartmentOutlined />,
  element: <></>,
  children: [{
    label: '部门',
    path: 'department',
    element: <></>,
  }, {
    label: '阶段',
    path: 'stage',
    element: <></>,
  }, {
    label: '管理员',
    path: 'admin',
    element: <></>
  }]
}, {
  label: '表单管理',
  path: 'form',
  icon: <FormOutlined />,
  element: <></>,
  children: [{
    label: '概览',
    path: 'overview',
    element: <></>,
  }, {
    label: '编辑表单',
    path: 'edit',
    element: <></>,
  }]
}, {
  label: '候选人审查',
  path: 'inspect',
  icon: <AuditOutlined />,
  element: <></>,
  children: [
    {
      label: '概览',
      path: 'overview',
      element: <></>,
    }, {
      label: '面试管理',
      path: 'interview',
      element: <></>,
    }
  ]
}], 'children', (v, stack) => { return { ...v, key: [...stack.map(v => v.path), v.path].join('/') } });

export const consoleRoute = {
  path: 'console',
  element: <ConsoleLayout />,
  children: paths
} satisfies RouteObject;