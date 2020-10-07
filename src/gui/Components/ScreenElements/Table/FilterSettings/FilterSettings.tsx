import React, { useContext } from "react";
import { FilterSettingsBoolean } from "./HeaderControls/FilterSettingsBoolean";
import { IProperty } from "../../../../../model/entities/types/IProperty";
import { FilterSettingsString } from "./HeaderControls/FilterSettingsString";
import { FilterSettingsDate } from "./HeaderControls/FilterSettingsDate";
import { observer } from "mobx-react-lite";
import { FilterSettingsNumber } from "./HeaderControls/FilterSettingsNumber";
import { FilterSettingsLookup } from "./HeaderControls/FilterSettingsLookup";
import { flow } from "mobx";
import { MobXProviderContext } from "mobx-react";
import { onApplyFilterSetting } from "../../../../../model/actions-ui/DataView/TableView/onApplyFilterSetting";
import { getFilterSettingByProperty } from "model/selectors/DataView/getFilterSettingByProperty";
import { getDataTable } from "model/selectors/DataView/getDataTable";
import { getDataView } from "model/selectors/DataView/getDataView";
import { isInfiniteScrollLoader } from "gui/Workbench/ScreenArea/TableView/InfiniteScrollLoader";

export const FilterSettings: React.FC = observer((props) => {
  const property = useContext(MobXProviderContext).property as IProperty;
  const dataTable = getDataTable(property);
  const dataView = getDataView(property);
  const setting = getFilterSettingByProperty(property, property.id);
  const handleApplyFilterSetting = onApplyFilterSetting(property);
  //console.log(setting);

  switch (property.column) {
    case "Text":
      return (
        <FilterSettingsString
          onTriggerApplySetting={handleApplyFilterSetting}
          setting={setting as any}
        />
      );
    case "CheckBox":
      return (
        <FilterSettingsBoolean
          onTriggerApplySetting={handleApplyFilterSetting}
          setting={setting as any}
        />
      );
    case "Date":
      return (
        <FilterSettingsDate
          onTriggerApplySetting={handleApplyFilterSetting}
          setting={setting as any}
        />
      );
    case "Number":
      return (
        <FilterSettingsNumber
          onTriggerApplySetting={handleApplyFilterSetting}
          setting={setting as any}
        />
      );
    case "ComboBox":
      return (
        <FilterSettingsLookup
          setting={setting as any}
          onTriggerApplySetting={handleApplyFilterSetting}
          property={property}
          lookup={property.lookup!}
          getOptions={flow(function* (searchTerm: string) {
            const allIds = isInfiniteScrollLoader(dataView.infiniteScrollLoader)
              ? yield dataView.infiniteScrollLoader.getAllValuesOfProp(property)
              :  Array.from(new Set(dataTable.getAllValuesOfProp(property)).values());
            const lookupMap = yield property.lookupEngine?.lookupResolver.resolveList(allIds);

            return Array.from(allIds.values())
              .map(item => [ item, lookupMap.get(item)])
              .filter(
                (array) =>
                  array[1] &&
                  array[1].toLocaleLowerCase().includes((searchTerm || "").toLocaleLowerCase())
              );
          })}
        />
      );
    default:
      return <>{property.column}</>;
  }
});
