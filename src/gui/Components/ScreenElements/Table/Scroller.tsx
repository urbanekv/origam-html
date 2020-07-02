import {action, observable} from "mobx";
import * as React from "react";
import {IScrollerProps} from "./types";
import {observer} from "mobx-react";
import S from "./Scroller.module.css";

/*
  Two divs broadcasting the outer one's scroll state to scrollOffsetTarget.
*/
@observer
export default class Scroller extends React.Component<IScrollerProps> {
  @observable.ref private elmScrollerDiv: HTMLDivElement | null = null;
  private lastScrollLeft: number = 0;
  private lastScrollTop: number = 0;

  @action.bound scrollTo(coords: { scrollLeft?: number; scrollTop?: number }) {
    if (this.elmScrollerDiv) {
      if (coords.scrollTop !== undefined) {
        this.elmScrollerDiv.scrollTop = coords.scrollTop;
      }
      if (coords.scrollLeft !== undefined) {
        this.forceScrollLeft(coords.scrollLeft); // will scroll even if this.props.scrollingDisabled is true
        this.elmScrollerDiv.scrollLeft = coords.scrollLeft;
      }
    }
  }

  @action.bound private handleScroll(event: any) {

    if(this.props.scrollingDisabled){
      event.target.scrollLeft = this.lastScrollLeft;
      event.target.scrollTop = this.lastScrollTop;
    }
    else{
      this.lastScrollLeft =  event.target.scrollLeft
      this.lastScrollTop =  event.target.scrollTop
    }

    this.props.onScroll(
      event,
      event.target.scrollLeft,
      event.target.scrollTop
    );
  }

  forceScrollLeft(left: number){
    this.lastScrollLeft = left;
  }

  set scrollTop(value: number) {
    if (this.elmScrollerDiv) {
      this.elmScrollerDiv.scrollTop = value;
    }
  }

  set scrollLeft(value: number) {
    if (this.elmScrollerDiv) {
      this.elmScrollerDiv.scrollLeft = value;
    }
  }

  get scrollTop() {
    return this.elmScrollerDiv ? this.elmScrollerDiv.scrollTop : 0;
  }

  get scrollLeft() {
    return this.elmScrollerDiv ? this.elmScrollerDiv.scrollLeft : 0;
  }

  public get horizontalScrollbarSize() {
    return this.elmScrollerDiv
      ? this.elmScrollerDiv.offsetHeight - this.elmScrollerDiv.clientHeight
      : 0;
  }

  public get verticalScrollbarSize() {
    return this.elmScrollerDiv
      ? this.elmScrollerDiv.offsetWidth - this.elmScrollerDiv.clientWidth
      : 0;
  }

  public focus() {
    this.elmScrollerDiv && this.elmScrollerDiv.focus();
  }

  @action.bound
  private refScrollerDiv(elm: HTMLDivElement) {
    this.elmScrollerDiv = elm;
  }

  @action.bound private handleClick(event: any, double: boolean) {
    event.persist();
    event.preventDefault();
    event.isDouble = double;
    const scrollerRect = this.elmScrollerDiv!.getBoundingClientRect();
    this.props.onClick &&
      this.props.onClick(
        event,
        event.clientX - scrollerRect.left,
        event.clientY - scrollerRect.top
      );
  }

  @action.bound private handleWindowClick(event: any) {
    if (this.elmScrollerDiv && !this.elmScrollerDiv.contains(event.target)) {
      this.props.onOutsideClick && this.props.onOutsideClick(event);
    }
  }

  public componentDidMount() {
    window.addEventListener("click", this.handleWindowClick);
  }

  public componentWillUnmount() {
    window.removeEventListener("click", this.handleWindowClick);
  }

  public render() {
    return (
      <div
        className={
          S.scroller +
          (1 ? " horiz-scrollbar" : "") +
          (1 ? " vert-scrollbar" : "") +
          (!this.props.isVisible ? " hidden" : "")
        }
        tabIndex={1}
        style={{ width: this.props.width, height: this.props.height }}
        onScroll={this.handleScroll}
        onClick={(e) => this.handleClick(e, false)}
        onDoubleClick={(e) => this.handleClick(e, true)}
        onMouseDown={(e) => e.preventDefault()} // To prevent selection when double clicking
        onKeyDown={this.props.onKeyDown}
        ref={this.refScrollerDiv}
      >
        <div
          className={S.fakeContent}
          style={{
            width: this.props.contentWidth + this.horizontalScrollbarSize,
            height: this.props.contentHeight + this.verticalScrollbarSize,
          }}
        />
      </div>
    );
  }
}
