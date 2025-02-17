import { Depart } from '../shared/useOrg';
import { Interview } from './InterviewList';

/**显示面试地点、部门、人数、备注等信息。 */
export function InterviewInfo({ interview, departs, showUsedCapacity = true }: { interview: Interview; departs: Depart[]; showUsedCapacity?: boolean }) {
  const dep = departs.find(({ id }) => id === interview.depart);
  return (
    <>
      <div>面试地点：{interview.location}</div>
      {Boolean(dep) && <div>面试部门：{dep?.name}</div>}
      {showUsedCapacity && (
        <div>
          报名人数：{interview.usedCapacity} / {interview.capacity}
        </div>
      )}
      {Boolean(interview.comment) && <div>备注：{interview.comment}</div>}
    </>
  );
}
