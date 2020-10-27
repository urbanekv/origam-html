import { DateTimeEditor } from "gui/Components/ScreenElements/Editors/DateTimeEditor";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import {
  FilterSettingsComboBox,
  FilterSettingsComboBoxItem,
} from "gui/Components/ScreenElements/Table/FilterSettings/FilterSettingsComboBox";
import produce from "immer";
import { FilterSetting } from "./FilterSetting";
import { T } from "utils/translation";
import { Operator } from "./Operatots";

const OPERATORS = () =>
  [
    Operator.equals,
    Operator.notEquals,
    Operator.lessThanOrEquals,
    Operator.greaterThanOrEquals,
    Operator.lessThan,
    Operator.greaterThan,
    Operator.between,
    Operator.notBetween,
    Operator.isNull,
    Operator.isNotNull
  ] as Operator[];

const OpCombo: React.FC<{
  setting: any;
  onChange: (newSetting: any) => void;
}> = (props) => {
  return (
    <FilterSettingsComboBox
      trigger={<>{(OPERATORS().find((item) => item.type === props.setting.type) || {}).human}</>}
    >
      {OPERATORS().map((op) => (
        <FilterSettingsComboBoxItem
          key={op.type}
          onClick={() =>
            props.onChange(
              produce(props.setting, (draft: any) => {
                draft.type = op.type;
              })
            )
          }
        >
          {op.human}
        </FilterSettingsComboBoxItem>
      ))}
    </FilterSettingsComboBox>
  );
};

const OpEditors: React.FC<{
  setting: any;
  onChange?: (newSetting: any) => void;
  onBlur?: (event: any) => void;
  onKeyDown?: (event: any) => void;
}> = (props) => {
  const { setting } = props;
  switch (setting.type) {
    case "eq":
    case "neq":
    case "lt":
    case "gt":
    case "lte":
    case "gte":
      return (
        <DateTimeEditor
          value={setting.val1}
          outputFormat="D.M.YYYY"
          onChange={(event, isoDay) =>
            props.onChange &&
            props.onChange(
              produce(setting, (draft: any) => {
                draft.val1 = isoDay === null ? undefined : removeTimeZone(isoDay);
              })
            )
          }
          onEditorBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
        />
      );

    case "between":
    case "nbetween":
      return (
        <>
          <DateTimeEditor
            value={setting.val1}
            outputFormat="D.M.YYYY"
            onChange={(event, isoDay) =>
              props.onChange &&
              props.onChange(
                produce(setting, (draft: any) => {
                  draft.val1 = isoDay === null ? undefined : removeTimeZone(isoDay);
                })
              )
            }
            onEditorBlur={props.onBlur}
            onKeyDown={props.onKeyDown}
          />
          <DateTimeEditor
            value={setting.val2}
            outputFormat="D.M.YYYY"
            onChange={(event, isoDay) =>
              props.onChange &&
              props.onChange(
                produce(setting, (draft: any) => {
                  draft.val2 = isoDay === null ? undefined : removeTimeZone(isoDay);
                })
              )
            }
            onEditorBlur={props.onBlur}
            onKeyDown={props.onKeyDown}
          />
        </>
      );
    case "null":
    case "nnull":
    default:
      return null;
  }
};

@observer
export class FilterSettingsDate extends React.Component<{
  onTriggerApplySetting?: (setting: any) => void;
  setting?: any;
}> {
  constructor(props: any) {
    super(props);
    (this.setting as any).val1 = undefined;
    (this.setting as any).val2 = undefined;
  }

  @observable.ref setting: FilterSetting = new FilterSetting(OPERATORS()[0].type);

  componentDidMount() {
    this.takeSettingFromProps();
  }

  componentDidUpdate() {
    this.takeSettingFromProps();
  }

  @action.bound takeSettingFromProps() {
    if (this.props.setting) {
      this.setting = this.props.setting;
    }
  }

  @action.bound
  handleChange(newSetting: any) {
    this.setting = newSetting;
    this.handleSettingChange();
  }

  handleSettingChange() {
    switch (this.setting.type) {
      case "eq":
      case "neq":
      case "lt":
      case "gt":
      case "lte":
      case "gte":
        this.setting.isComplete = this.setting.val1 !== undefined;
        this.setting.val2 = undefined;
        this.props.onTriggerApplySetting && this.props.onTriggerApplySetting(this.setting);
        break;
      case "between":
      case "nbetween":
        this.setting.isComplete =
          this.setting.val1 !== undefined && this.setting.val2 !== undefined;
        this.props.onTriggerApplySetting && this.props.onTriggerApplySetting(this.setting);
        break;
      default:
        this.setting.val1 = undefined;
        this.setting.val2 = undefined;
        this.setting.isComplete = this.setting.type === "null" || this.setting.type === "nnull";
        this.props.onTriggerApplySetting && this.props.onTriggerApplySetting(this.setting);
    }
  }

  render() {
    return (
      <>
        <OpCombo setting={this.setting} onChange={this.handleChange} />
        <OpEditors setting={this.setting} onChange={this.handleChange} />
      </>
    );
  }
}

function removeTimeZone(isoDateString: string | null | undefined) {
  if (!isoDateString) return isoDateString;
  return isoDateString.substring(0, 23);
}
