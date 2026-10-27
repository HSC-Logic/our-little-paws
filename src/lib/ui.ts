import { create } from "zustand";
export const useUI = create<{
  selected: string;
  select: (id: string) => void;
  notice: string;
  notify: (text: string) => void;
}>((set) => ({
  selected: "",
  select: (selected) => set({ selected }),
  notice: "",
  notify: (notice) => set({ notice }),
}));
