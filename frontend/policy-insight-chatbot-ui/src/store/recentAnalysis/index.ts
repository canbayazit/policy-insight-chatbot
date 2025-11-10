import { create } from 'zustand';

import type { IUpload } from '../../global/interfaces/Upload';
import { persist } from 'zustand/middleware'

interface RecentAnalysesState {
  items: IUpload[];
  addOrUpdate: (u: IUpload) => void;
  remove: (policy_id: string) => void;
  clear: () => void;
};

export const useRecentAnalyses = create<RecentAnalysesState>()(
  persist(
    (set, get) => ({
      items: [],
      addOrUpdate: (u: IUpload) => {
        const deduped = [u, ...get().items.filter(x => x.policy_id !== u.policy_id)];
        // En fazla 20 kayıt tut
        set({ items: deduped.slice(0, 20) });
      },
      remove: (policy_id: string) => {
        set({ items: get().items.filter(x => x.policy_id !== policy_id) });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "recentAnalyses", // default olarak localstorage kaydeder
      // sadece items alanını sakla
      partialize: (state) => ({ items: state.items }),
    }
  )
);
