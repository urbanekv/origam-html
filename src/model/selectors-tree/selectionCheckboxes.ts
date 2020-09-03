import {getDataView} from "model/selectors/DataView/getDataView";

export default {
  getIsSelectedRowId(ctx: any, id: string) {
    return getDataView(ctx).hasSelectedRowId(id);
  },
  getSelectedRowIds(ctx: any) {
    return getDataView(ctx).selectedRowIds;
  },
};

export function  getIsAnySelected(ctx: any): any {
  return getDataView(ctx).isAnyRowIdSelected;
}
