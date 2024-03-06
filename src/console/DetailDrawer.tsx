import { Descriptions, Drawer } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';

export function DetailDrawer({ items, onClose }: { items: DescriptionsItemType[] | undefined; onClose: () => void; }) {
  return <Drawer size='large' title='部门详情' placement='right' closable open={Boolean(items)} onClose={onClose}>
    <Descriptions column={3} bordered items={items} />
  </Drawer>;
}
