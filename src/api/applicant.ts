import { pkgPost } from './core';

export async function saveResult(formId: number, profile: { phone: string }, content: any) {
  return (await pkgPost('/applicant/form', { formId, phone: profile.phone, content: JSON.stringify(content) }));
}