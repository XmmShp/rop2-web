import { pkgPost } from './core';

export async function saveResult(formId: number, profile: { phone: string }, intentDeparts: number[], content: any) {
  return await pkgPost('/applicant/form', { formId, phone: profile.phone, intentDeparts, content: JSON.stringify(content) });
}
