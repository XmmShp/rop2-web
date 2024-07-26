//把有关后台(console)的组件统一导出，vite构建后在一个chunk内，避免生成多个小文件

import ConsoleLayout from './ConsoleLayout';
import Dash from './dash/Dash';
import FormOverview from './form/FormOverview';
import FormEdit from './form/FormEdit';
import ResultOverview from './result/ResultOverview';
import AdminManage from './AdminManage';
import MessageManage from './MessageManage';
import StageManage from './StageManage';
import DepartManage from './DepartManage';
import InterviewManage from './interview/InterviewManage';

export { ConsoleLayout, Dash, FormOverview, FormEdit, ResultOverview, AdminManage, MessageManage, StageManage, DepartManage, InterviewManage };