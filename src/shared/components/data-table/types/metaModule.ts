/* eslint-disable @typescript-eslint/no-unused-vars */
import { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    title: string;
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */
