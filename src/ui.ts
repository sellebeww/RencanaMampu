/* RencanaMampu — state UI sementara (filter, draf formulir, dll.). Tidak disimpan ke localStorage. */
import type { UiState } from './types';

export const ui: UiState = {
  filter: 'semua', q: '', formStep: 0, draft: null, draftId: null, formErrors: [],
  formStart: null, taskForm: null, editDecision: null, followDay: 7,
  reviewStart: null, lastKey: null, scrollTask: false
};
