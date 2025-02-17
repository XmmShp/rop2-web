import { SearchOutlined } from '@ant-design/icons';
import { GetProps, Input } from 'antd';

export default function Search({ onChangeTrimmed, ...otherProps }: GetProps<typeof Input> & { onChangeTrimmed?: (value: string) => void }) {
  return (
    <Input
      allowClear
      prefix={<SearchOutlined />}
      placeholder="筛选"
      {...otherProps}
      onChange={(ev) => {
        if (onChangeTrimmed) onChangeTrimmed(ev.target.value.trim());
        otherProps.onChange?.(ev);
      }}
    />
  );
}
