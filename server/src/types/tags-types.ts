export interface AttrToken {
  name: string;
  line: number; col: number;
  value: string | undefined;
  valueLine: number; valueCol: number;
}

export type TagType = "open" | "self" | "close";

export interface TagToken {
  type: TagType;
  name: string;
  line: number; col: number;
  attrs: AttrToken[];
}