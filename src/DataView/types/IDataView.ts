import { IFormView } from "../FormView/types";
import { ITableView } from "../TableView/ITableView";
import { IViewType } from "./IViewType";
import { IAvailViews, IView } from "./IAvailViews";
import { IRecCursor } from "./IRecCursor";
import { IForm } from "./IForm";
import { IDataTable } from "./IDataTable";
import { IRecords } from "./IRecords";
import { IAStartEditing } from "./IAStartEditing";
import { IAFinishEditing } from "./IAFinishEditing";
import { IACancelEditing } from "./IACancelEditing";
import { IASwitchView } from "./IASwitchView";
import { IAInitForm } from "./IAInitForm";
import { IASubmitForm } from "./IASubmitForm";
import { IProperties } from "./IProperties";
import { IEditing } from "./IEditing";
import { IAStartView } from './IAStartView';
import { IAStopView } from "./IAStopView";
import { IDataViewMediator } from "./IDataViewMediator";
import { IAReloadChildren } from "./IAReloadChildren";
import { IADeleteRow } from "./IADeleteRow";
import { IDataViewMachine } from "./IDataViewMachine";

export interface IDataView {
  mediator: IDataViewMediator;
  availViews: IAvailViews;
  recCursor: IRecCursor;
  form: IForm;
  editing: IEditing;
  dataTable: IDataTable;
  records: IRecords;
  aStartView: IAStartView;
  aStopView: IAStopView;
  aStartEditing: IAStartEditing;
  aFinishEditing: IAFinishEditing;
  aCancelEditing: IACancelEditing;
  aSwitchView: IASwitchView;
  aInitForm: IAInitForm;
  aSubmitForm: IASubmitForm;
  aReloadChildren: IAReloadChildren;
  aDeleteRow: IADeleteRow;
  isHeadless: boolean;
  props: IProperties;
  specificDataViews: Array<IFormView | ITableView>;
  initialDataView: IViewType;
  id: string;
  label: string;
  machine: IDataViewMachine
}
