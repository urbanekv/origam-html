import * as React from "react";
import {observer} from "mobx-react";
import S from './BoolEditor.module.scss';
import cx from 'classnames';


@observer
export class BoolEditor extends React.Component<{
  value: boolean;
  isReadOnly: boolean;
  onChange?(event: any, value: boolean): void;
  onKeyDown?(event: any): void;
  onClick?(event: any): void;
}> {
  
  render() {
    return (
      <div className={cx(S.editorContainer)}>
        <input
          className="editor"
          type="checkbox"
          checked={this.props.value}
          readOnly={this.props.isReadOnly}
          onChange={(event: any) => {
            this.props.onChange && !this.props.isReadOnly &&
              this.props.onChange(event, event.target.checked);
          }}
          onKeyDown={this.props.onKeyDown}
          onClick={this.props.onClick}
          onBlur={() => 'bool blur'}
        />
      </div>
    );
  }
}
