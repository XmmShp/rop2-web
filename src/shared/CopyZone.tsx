import { CopyOutlined } from '@ant-design/icons';
import { message } from '../App';
import './CopyZone.scss';

export default function CopyZone(
  { text, inline = false }: { text: string, inline?: boolean }
) {
  return (<pre onClick={() => {
    try {
      navigator.clipboard.writeText(text);
      message.success('复制文本成功');
    } catch { }
  }} className={'copy-zone'
    + (inline ? ' inline' : '')}>{inline && <><CopyOutlined className='copy-icon' /></>}{text}</pre>);
}