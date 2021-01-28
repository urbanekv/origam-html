import { Icon } from "gui02/components/Icon/Icon";
import { observer } from "mobx-react";
import React from "react";
import { T } from "utils/translation";
import { ModalWindow } from "../Dialog/Dialog";
import S from "gui/Components/Dialogs/SearchDialog.module.scss";
import { observable } from "mobx";
import { ISearchResult } from "model/entities/types/ISearchResult";
import { getSearcher } from "model/selectors/getSearcher";
import { getIconUrl } from "gui/getIconUrl";
import { ISearchResultGroup } from "model/entities/types/ISearchResultGroup";

const DELAY_BEFORE_SERVER_SEARCH_MS = 1000;
export const SEARCH_DIALOG_KEY = "Search Dialog";

@observer
export class SearchDialog extends React.Component<{
  ctx: any;
  onCloseClick: () => void;
}> {

  input: HTMLInputElement | undefined;
  refInput = (elm: HTMLInputElement) => (this.input = elm);

  searcher = getSearcher(this.props.ctx);
  
  @observable
  value = "";

  timeout: NodeJS.Timeout | undefined;

  componentDidMount(){
    this.input?.focus();
  }

  onKeyDown(event: any){
    if(event.key === "Escape"){
      this.props.onCloseClick();
      return;
    }
    if (event.key === "ArrowDown") {
      this.searcher.selectNextResult();
      return;
    }
    if (event.key === "ArrowUp") {
      this.searcher.selectPreviousResult();
      return;
    }
    if (event.key === "Enter") {
      if(this.searcher.selectedResult){
        this.searcher.selectedResult.onClick();
        this.onResultItemClick();
      }
      else
      {
        this.searcher.searchOnServer();
      }
      return;
    }
  }

  onResultItemClick(){
    this.props.onCloseClick();
  }

  async onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if(this.timeout)
    {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(()=>{
      this.timeout = undefined;
      this.searcher.searchOnServer();
    }, DELAY_BEFORE_SERVER_SEARCH_MS)
  }

  onInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.value = event.target.value;
    this.searcher.onSearchFieldChange(this.value);
  }

  render() {
    return (
      <ModalWindow
        title={null}
        titleButtons={null}
        buttonsCenter={null}
        onKeyDown={(event:any) => this.onKeyDown(event)}
        buttonsLeft={null}
        buttonsRight={null}
      >
        <div className={S.root}>
          <div className={S.inputRow}>
            <Icon className={S.icon} src="./icons/search.svg" />
            <input
              ref={this.refInput}
              className={S.input}
              placeholder={T("Search for anything here", "type_search_here")}
              onKeyDown={(event) => this.onInputKeyDown(event)}
              onChange={(event) => this.onInputChange(event)}
            />
          </div>
          {(this.searcher.resultGroups.length > 0 ) &&
            <div className={S.resultArea}>
              <div className={S.resultsContainer}>
                {this.searcher.resultGroups
                  .map(group=> 
                    <ResultGroup 
                      name={group.name} 
                      group={group}
                      onResultItemClick={()=> this.onResultItemClick()}
                      selectedResult={this.searcher.selectedResult}
                      />) 
                }
              </div>
            </div>
          }
        </div>
      </ModalWindow>
    );
  }
}

@observer
export class ResultGroup extends React.Component<{
  name: string;
  group: ISearchResultGroup;
  onResultItemClick: ()=> void;
  selectedResult: ISearchResult | undefined;
}> {

  onGroupClick() {
    this.props.group.isExpanded = !this.props.group.isExpanded;
  } 

  render() {
    return (
      <div>
        <div className={S.resultGroupRow} onClick={() => this.onGroupClick()}>
          {this.props.group.isExpanded ? (
            <i className={"fas fa-angle-up " + S.arrow} />
          ) : (
            <i className={"fas fa-angle-down " + S.arrow} />
          )}
          <div className={S.groupName}>
            {this.props.name}
          </div>
        </div>
        <div>
        {this.props.group.isExpanded && this.props.group.results.map(result => 
            <ResultItem 
              result={result} 
              onResultItemClick={()=> this.props.onResultItemClick()}
              selected={this.props.selectedResult?.id === result.id}
              />)
        }
        </div>
      </div>
    );
  }
}

@observer
export class ResultItem extends React.Component<{
  result: ISearchResult;
  onResultItemClick: ()=> void;
  selected: boolean;
}> {

  onClick(){
    this.props.onResultItemClick();
    this.props.result.onClick();
  }

  render() {
    return (
      <div 
        className={S.resultIemRow + " " + (this.props.selected ? S.resultIemRowSelected : "")} 
        onClick={() => this.onClick()} >
        <div className={S.itemIcon}>
          <Icon src= {getIconUrl(this.props.result.icon)} />
        </div>
        <div className={S.itemContents}>
          <div className={S.itemTitle}>
            {this.props.result.label}
          </div>
          <div className={S.itemTextSeparator}>
            {" "}
          </div>
          <div className={S.itemText}>
            {this.props.result.description}
          </div>
        </div>
      </div>
    );
  }
}

