// types/ui.ts

export type MenuSubItem = {
  label: string;
};

export type MenuItem = {
  icon: React.ElementType;
  label: string;
  badge?: number;
  children?: MenuSubItem[];
};
