import { IAggregationInfo } from "./IAggregationInfo";
import { IOrdering } from "./IOrderingConfiguration";

export interface IApi {
  accessToken: string;

  setAccessToken(token: string | undefined): void;

  resetAccessToken(): void;

  httpAuthHeader: { Authorization: string };

  createCanceller(): () => void;

  login(credentials: { UserName: string; Password: string }): Promise<string>;

  logout(): Promise<any>;

  // getMenu(): Promise<any>;

  getScreen(id: string): Promise<any>;

  getEntities(query: {
    MenuId: string;
    DataStructureEntityId: string;
    Ordering: Array<[string, string]>;
    ColumnNames: string[];
    Filter: string;
    RowLimit?: number;
    MasterRowId?: string;
  }): Promise<any>;

  getLookupLabels(query: {
    LookupId: string;
    MenuId: string | undefined;
    LabelIds: string[];
  }): Promise<{ [key: string]: string }>;

  getLookupLabelsEx(
    query: {
      LookupId: string;
      MenuId: string | undefined;
      LabelIds: string[];
    }[]
  ): Promise<{ [key: string]: { [key: string]: string } }>;

  newEntity(data: { DataStructureEntityId: string; MenuId: string }): Promise<any>;

  putEntity(data: {
    DataStructureEntityId: string;
    RowId: string;
    NewValues: { [key: string]: any };
    MenuId: string;
  }): Promise<any>;

  postEntity(data: {
    DataStructureEntityId: string;
    NewValues: { [key: string]: any };
    MenuId: string;
  }): Promise<any>;

  deleteEntity(data: {
    DataStructureEntityId: string;
    RowIdToDelete: string;
    MenuId: string;
  }): Promise<any>;

  createSession(data: {
    MenuId: string;
    Parameters: { [key: string]: any };
    InitializeStructure: boolean;
  }): Promise<any>;

  saveSession(sessionFormIdentifier: string): Promise<any>;
  saveSessionQuery(sessionFormIdentifier: string): Promise<any>;
  refreshSession(sessionFormIdentifier: string): Promise<any>;

  sessionChangeMasterRecord(data: {
    SessionFormIdentifier: string;
    Entity: string;
    RowId: string;
  }): Promise<any>;

  sessionGetEntity(data: {
    sessionFormIdentifier: string;
    childEntity: string;
    parentRecordId: string;
    rootRecordId: string;
  }): Promise<any>;

  sessionUpdateEntity(data: {
    SessionFormIdentifier: string;
    Entity: string;
    Id: string;
    Property: string;
    NewValue: any;
  }): Promise<any>;

  sessionCreateEntity(data: {
    SessionFormIdentifier: string;
    Entity: string;
    Values: { [key: string]: any };
    Parameters: { [key: string]: any };
    RequestingGridId: string;
  }): Promise<any>;

  sessionDeleteEntity(data: {
    SessionFormIdentifier: string;
    Entity: string;
    RowId: string;
  }): Promise<any>;

  getLookupList(data: {
    SessionFormIdentifier?: string;
    Entity?: string;
    DataStructureEntityId?: string;
    ColumnNames: string[];
    Property: string;
    Id: string;
    MenuId: string;
    LookupId: string;
    Parameters?: { [key: string]: any };
    ShowUniqueValues: boolean;
    SearchText: string;
    PageSize: number;
    PageNumber: number;
  }): Promise<any>;

  getNotificationBoxContent(): Promise<any>;

  defaultCulture(): Promise<any>;

  initPortal(): Promise<any>;

  initUI(data: {
    Type: string;
    FormSessionId: string | undefined;
    IsNewSession: boolean;
    RegisterSession: boolean;
    DataRequested: boolean;
    ObjectId: string;
    Caption: string;
    Parameters: { [key: string]: any } | undefined;
    AdditionalRequestParameters?: object | undefined;
  }): Promise<any>;
  destroyUI(data: { FormSessionId: string }): Promise<any>;

  setMasterRecord(
    data: {
      SessionFormIdentifier: string;
      Entity: string;
      RowId: string;
    },
    canceller?: any
  ): Promise<any>;

  restoreData(
    data: {
      SessionFormIdentifier: string;
      ObjectId: string;
    }
  ): Promise<void>;

  updateObject(data: {
    SessionFormIdentifier: string;
    Entity: string;
    Id: string;
    Values: { [key: string]: any };
  }): Promise<any>;

  createObject(data: {
    SessionFormIdentifier: string;
    Entity: string;
    Values: { [key: string]: any };
    Parameters: { [key: string]: any };
    RequestingGridId: string;
  }): Promise<any>;

  copyObject(data: {
    Entity: string;
    SessionFormIdentifier: string;
    ForcedValues: {};
    RequestingGridId: string;
    OriginalId: string;
    Entities: string[];
  }): Promise<any>;

  deleteObject(data: { SessionFormIdentifier: string; Entity: string; Id: string }): Promise<any>;

  executeActionQuery(data: {
    SessionFormIdentifier: string;
    Entity: string;
    ActionType: string;
    ActionId: string;
    ParameterMappings: { [key: string]: any };
    SelectedItems: string[];
    InputParameters: { [key: string]: any };
  }): Promise<any>;

  executeAction(data: {
    SessionFormIdentifier: string;
    Entity: string;
    ActionType: string;
    ActionId: string;
    ParameterMappings: { [key: string]: any };
    SelectedItems: string[];
    InputParameters: { [key: string]: any };
    RequestingGrid: string;
  }): Promise<any>;

  getRows(data: {
    MenuId: string;
    SessionFormIdentifier: string;
    DataStructureEntityId: string;
    Filter: string;
    Ordering: IOrdering[];
    RowLimit: number;
    RowOffset: number;
    ColumnNames: string[];
    MasterRowId: string | undefined;
    FilterLookups?: { [key: string]: string };
  }): Promise<any>;

  getGroups(data: {
    MenuId: string;
    DataStructureEntityId: string;
    Filter: string | undefined;
    Ordering: IOrdering[];
    RowLimit: number;
    GroupBy: string;
    MasterRowId: string | undefined;
    GroupByLookupId: string | undefined;
    SessionFormIdentifier: string | undefined;
    AggregatedColumns: IAggregationInfo[] | undefined;
  }): Promise<any[]>;

  getAggregations(data: {
    MenuId: string;
    DataStructureEntityId: string;
    Filter: string | undefined;
    AggregatedColumns: IAggregationInfo[];
    SessionFormIdentifier: string | undefined;
    MasterRowId: string | undefined;
  }): Promise<any[]>;

  getData(data: {
    SessionFormIdentifier: string;
    ChildEntity: string;
    ParentRecordId: string;
    RootRecordId: string;
  }): Promise<any>;

  getRowStates(data: {
    SessionFormIdentifier: string;
    Entity: string;
    Ids: string[];
  }): Promise<any>;

  getWorkQueueList(): Promise<any>;

  saveObjectConfiguration(data: {
    instanceId: string;
    columnSettings: Array<{
      propertyId: string;
      width: number;
      isHidden: boolean;
    }>;
    defaultView: string;
  }): Promise<any>;

  saveSplitPanelConfiguration(data: { InstanceId: string; Position: number }): Promise<any>;

  workflowAbort(data: { sessionFormIdentifier: string }): Promise<any>;

  workflowRepeat(data: { sessionFormIdentifier: string }): Promise<any>;

  workflowNext(data: { sessionFormIdentifier: string; CachedFormIds: string[] }): Promise<any>;

  workflowNextQuery(data: { sessionFormIdentifier: string }): Promise<any>;

  getRecordInfo(data: {
    MenuId: string;
    DataStructureEntityId: string;
    RowId: string;
  }): Promise<any>;

  getRecordAudit(data: {
    MenuId: string;
    DataStructureEntityId: string;
    RowId: string;
  }): Promise<
    Array<{
      id: string;
      dateTime: string;
      userName: string;
      fieldName: string;
      oldValue: string | null;
      newValue: string | null;
      actionType: number;
    }>
  >;

  getReport(data: { reportUrl: string }): Promise<any>;

  getDownloadToken(data: {
    SessionFormIdentifier: string;
    MenuId: string;
    DataStructureEntityId: string;
    Entity: string;
    RowId: string;
    Property: string;
    FileName: string;
    parameters: any;
  }): Promise<any>;

  getBlob(data: { downloadToken: string }): Promise<any>;

  getUploadToken(data: {
    SessionFormIdentifier: string;
    MenuId: string;
    DataStructureEntityId: string;
    Entity: string;
    RowId: string;
    Property: string;
    FileName: string;
    DateCreated: string;
    DateLastModified: string;
    parameters: any;
  }): Promise<any>;

  putBlob(
    data: { uploadToken: string; fileName: string; file: any },
    onUploadProgress?: (event: any) => void
  ): Promise<any>;

  pendingChanges(data: { sessionFormIdentifier: string }): Promise<any[]>;
  saveDataQuery(data: { sessionFormIdentifier: string }): Promise<void>;
  saveData(data: { sessionFormIdentifier: string }): Promise<void>;
}
