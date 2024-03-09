import { ReactElement } from 'react';
import { QuestionGroup } from '../../api/models/form';
import { Id } from '../../api/models/shared';
import { GetProp, Select } from 'antd';

export default function QuestionGroupSelect(props: {
  groups: QuestionGroup[];
  thisGroup: Id;
  value: Id | null;
  onChange: (newGroup: Id | null) => void;
  allowHide?: false;
  size?: GetProp<typeof Select, 'size'>;
  title?: string;
}): ReactElement;
export default function QuestionGroupSelect(props: {
  groups: QuestionGroup[];
  thisGroup: Id;
  value: Id | null | undefined;
  onChange: (newGroup: Id | null | undefined) => void;
  allowHide: true;
  size?: GetProp<typeof Select, 'size'>;
  title?: string;
}): ReactElement;
export default function QuestionGroupSelect({ groups, thisGroup, value, onChange, allowHide, size, title }: any): ReactElement {
  const options = [
    { label: '无', value: -1 },
    ...groups.map((g: QuestionGroup) => {
      return {
        label: g.label,
        disabled: g.id === thisGroup,
        value: g.id
      };
    })
  ];
  if (allowHide)
    options.unshift({ label: '隐藏', value: -2 });
  if (value === null)
    value = -1;
  else if (value === undefined)
    value = -2;
  return (<Select title={title}
    size={size} value={value}
    className='group-select'
    popupMatchSelectWidth={false}
    onSelect={(v) => {
      if (v === -1) onChange(null);
      else if (v === -2) onChange(undefined);
      else onChange(v);
    }}
    options={options} />);
}