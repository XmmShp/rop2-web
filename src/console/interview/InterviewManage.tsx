import { Button, Card, Flex, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getStepLabel } from '../result/ResultOverview';
import { useFilterDeparts, FilterDeparts } from '../shared/FilterDeparts';
import Search from '../shared/Search';

export default function InterviewManage() {
  const [filterDeparts, setFilterDeparts, { departs }] = useFilterDeparts();
  return (<Card>
    {departs.length > 0 //当至少有一个部门(除默认部门)才显示部门筛选
      && <FilterDeparts filterDeparts={filterDeparts}
        setFilterDeparts={setFilterDeparts} departs={departs} />}
    <Tabs centered
      items={[1, 2].map(s => {
        return {
          label: getStepLabel(s),
          key: String(s)
        }
      })}>
    </Tabs>
    <Flex vertical align='flex-start' gap='small'>
      {/* <Radio.Group value={1} disabled>
        <Radio value={1}>本阶段分志愿部门面试</Radio>
        <Radio value={2}>本阶段统一面试</Radio>
      </Radio.Group> */}
      <Button icon={<PlusOutlined />} type='primary'
      >新建面试</Button>
      <Search placeholder='筛选' />
    </Flex >
  </Card >);
}
