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
    + (inline ? ' inline' : '')}>{text}</pre>);
}