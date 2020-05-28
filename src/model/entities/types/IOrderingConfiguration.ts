
export enum IOrderByDirection {
  NONE = "NONE",
  ASC = "ASC",
  DESC = "DESC"
}


export interface IOrderByColumnSetting {
  ordering: IOrderByDirection;
  order: number;
}

export interface IOrderingConfiguration {
  ordering: IOrdering[];
  getOrdering(column: string): IOrderByColumnSetting;
  setOrdering(column: string): void;
  addOrdering(column: string): void;
  groupChildrenOrdering: IOrdering | undefined;
  getDefaultOrdering(): IOrdering | undefined;
  parent?: any;
  orderingFunction: () => (row1: any[], row2: any[]) => number;
}

export interface IOrdering {
  columnId: string;
  direction: IOrderByDirection;
  lookupId: string | undefined;
}

export function parseToIOrderByDirection(candidate: string | undefined): IOrderByDirection{
  switch(candidate){
    case "Descending": return IOrderByDirection.DESC;
    case "Ascending": return IOrderByDirection.ASC;
    case undefined: return IOrderByDirection.NONE;
    default: throw new Error("Option not implemented: " + candidate)
  }
}
export function parseToOrdering(candidate: any): IOrdering | undefined{
  if(!candidate || !candidate.field || !candidate.direction) return undefined;

  return {
    columnId: candidate.field,
    direction: parseToIOrderByDirection(candidate.direction),
    lookupId: undefined
  };
}
