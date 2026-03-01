import { KlusInvoer, MaterialenResultaat } from '../types';

export async function genereerMaterialenlijst(invoer: KlusInvoer): Promise<MaterialenResultaat> {
  const response = await fetch('/api/materialen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoer),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? `Server fout (${response.status})`);
  }

  return data as MaterialenResultaat;
}
