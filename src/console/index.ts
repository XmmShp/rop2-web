//把有关后台(console)的组件统一导出，vite构建后在一个chunk内，避免生成多个小文件

import ConsoleLayout from './shared/ConsoleLayout';
import Dash from './dash/Dash';
import FormOverview from './form/FormOverview';
import FormEdit from './form/FormEdit';
import ResultOverview from './result/ResultOverview';
import UserManage from './org/UserManage';
import OrgManage from './org/OrgManage';

export { ConsoleLayout, Dash, FormOverview, FormEdit, ResultOverview, UserManage, OrgManage };