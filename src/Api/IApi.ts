import { AxiosPromise } from "axios";

export interface IApi {
  setAccessToken(token: string | undefined): void;
  resetAccessToken(): void;
  httpAuthHeader: { Authorization: string };
  login(credentials: { UserName: string; Password: string }): Promise<string>;
  logout(): Promise<void>;
  getMenu(): Promise<any>;
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
    MenuId: string;
    LabelIds: string[];
  }): Promise<{ [key: string]: string }>;

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

  sessionChangeMasterRecord(data: {
    SessionFormIdentifier: string;
    Entity: string;
    RowId: string;
  }): Promise<any>;

  getSessionEntity(data: {
    sessionFormIdentifier: string;
    childEntity: string;
    parentRecordId: string;
    rootRecordId: string;
  }): Promise<any>;

  updateSessionEntity(data: {
    SessionFormIdentifier: string;
    Entity: string;
    Id: string;
    Property: string;
    NewValue: any;
  }): Promise<any>;



  getLookupListEx(data: {
    DataStructureEntityId: string;
    ColumnNames: string[];
    Property: string;
    Id: string;
    MenuId: string;
    LookupId: string;
    ShowUniqueValues: boolean;
    SearchText: string;
    PageSize: number;
    PageNumber: number;
  }): Promise<any>;
}