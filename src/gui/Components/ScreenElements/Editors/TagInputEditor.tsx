import React, { useContext, useEffect, useMemo, useRef } from "react";
import { Tooltip } from "react-tippy";

import CS from "./CommonStyle.module.css";
import S from "./TagInputEditor.module.css";

import {
  TagInput,
  TagInputAdd,
  TagInputItem,
  TagInputItemDelete,
} from "gui/Components/TagInput/TagInput";
import { inject, observer } from "mobx-react";
import { IProperty } from "model/entities/types/IProperty";
import { getDataTable } from "model/selectors/DataView/getDataTable";
import { CtxDropdownEditor } from "../../../../modules/Editors/DropdownEditor/DropdownEditor";
import { CtxDropdownRefCtrl } from "../../../../modules/Editors/DropdownEditor/Dropdown/DropdownCommon";

export const TagInputEditor = inject(({ property }: { property: IProperty }, { value }) => {
  const dataTable = getDataTable(property);
  return {
    textualValues: dataTable.resolveCellText(property, value),
  };
})(
  observer(
    (props: {
      value: string[];
      textualValues?: string[];
      isReadOnly: boolean;
      isInvalid: boolean;
      invalidMessage?: string;
      isFocused: boolean;
      backgroundColor?: string;
      foregroundColor?: string;
      customStyle?: any;
      refocuser?: (cb: () => void) => () => void;
      onChange?(event: any, value: any): void;
      onKeyDown?(event: any): void;
      onClick?(event: any): void;
      onDoubleClick?(event: any): void;
      onEditorBlur?(event: any): void;
    }) => {

      function getStyle() {
        if (props.customStyle) {
          return props.customStyle;
        } else {
          return {
            color: props.foregroundColor,
            backgroundColor: props.backgroundColor,
          };
        }
      }

      function removeItem(event: any, item: string) {
        const index = props.value.indexOf(item);
        if (index > -1) {
          props.value.splice(index, 1);
          if (props.onChange) {
            props.onChange(event, props.value);
          }
          if (props.onEditorBlur) {
            props.onEditorBlur(event);
          }
        }
      }

      const beh = useContext(CtxDropdownEditor).behavior;
      const ref = useContext(CtxDropdownRefCtrl);
      const data = useContext(CtxDropdownEditor).editorData;
      const refInput = useMemo(() => {
        return (elm: any) => {
          beh.refInputElement(elm);
        };
      }, []);

      const previousValueRef = useRef<string[]>();

      useEffect(() => {
        if (
          previousValueRef.current?.length !== props.value?.length
        ) {
          beh.elmInputElement.value = "";
        }
        previousValueRef.current = props.value;
      });

      function handleInputKeyDown(event: any) {
        if (event.key === "Backspace" && event.target.value === "" && props.value.length > 0) {
          removeItem(event, props.value[props.value.length - 1]);
        }
        beh.handleInputKeyDown(event);
      }

      return (
        <div className={CS.editorContainer} ref={ref}>
          <TagInput className={S.tagInput}>
            {props.value
              ? props.value.map((valueItem, idx) => (
                  <TagInputItem key={valueItem}>
                    <TagInputItemDelete
                      onClick={(event) => {
                        removeItem(event, valueItem);
                      }}
                    />
                    {props.textualValues![idx] || ""}
                  </TagInputItem>
                ))
              : null}
            <TagInputAdd onClick={(event) => beh.elmInputElement.focus()} />
            <input
              className={S.filterInput}
              ref={refInput}
              placeholder={data.isResolving ? "Loading..." : ""}
              onChange={beh.handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={beh.handleInputFocus}
              onBlur={beh.handleInputBlur}
              tabIndex={beh.tabIndex ? beh.tabIndex : undefined}
              onDoubleClick={props.onDoubleClick}
              style={getStyle()}
            />
          </TagInput>
          {props.isInvalid && (
            <div className={CS.notification}>
              <Tooltip html={props.invalidMessage} arrow={true}>
                <i className="fas fa-exclamation-circle red" />
              </Tooltip>
            </div>
          )}
        </div>
      );
    }
  )
);
