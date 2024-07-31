import { Flex, Card } from "antd";

import './StatusPage.scss';
import { useData } from "../api/useData";
import { Depart } from "../console/shared/useOrg";
import { useForm } from "../console/shared/useForm";

export default function StatusPage() {
  const [form, formLoading] = useForm('applicant', false);
  const { id: formId, owner } = form;
  //虽然form的实际数据(owner)需要等待useForm加载，但是formId是有效的，故intents获取不需要等待useForm
  const [intents] = useData<{ depart: number; order: number; step: number }[]>('/applicant/status', async (resp) => resp.json(), [], { formId }, [formId]);
  const [departs] = useData<Depart[]>('/applicant/org', (resp) => resp.json(), [], { id: owner }, [owner], !formLoading);
  return (<Flex justify='center' className='status'>
    <Card className='card'>
      {JSON.stringify(intents)}
    </Card>
  </Flex>);
}