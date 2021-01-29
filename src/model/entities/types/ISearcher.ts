import { ISearchResult } from './ISearchResult';
import { ISearchResultGroup } from './ISearchResultGroup';

export interface ISearcher {
  resultGroups: ISearchResultGroup[];
  selectedResult: ISearchResult | undefined;
  searchOnServer(): void;
  onSearchFieldChange(searchTerm: string): void;
  indexMainMenu(mainMenu: any): void;
  indexWorkQueues(items: any[]): void;
  indexChats(items: any[]): void;
  clear(): void;
  selectNextResult(): void;
  selectPreviousResult(): void;
  getSelectedResultIndices() :IResultIndices;

  parent?: any;
}

export interface IResultIndices {
  groupIndex: number,
  indexInGroup: number
}
