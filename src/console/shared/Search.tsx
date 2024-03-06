import { SearchOutlined } from '@ant-design/icons';
import { GetProps, Input } from 'antd';

export default function Search({ ...otherProps }: GetProps<typeof Input>) {
  return (<Input allowClear prefix={<SearchOutlined />} placeholder='筛选' {...otherProps} />);
}