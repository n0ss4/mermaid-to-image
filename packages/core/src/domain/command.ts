export interface Command {
  id: string;
  label: string;
  category: string;
  shortcut?: string[];
  action: () => void;
}
