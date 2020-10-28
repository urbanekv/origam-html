import { IFilter } from "model/entities/types/IFilter";
import { FilterSetting } from "gui/Components/ScreenElements/Table/FilterSettings/HeaderControls/FilterSetting";
import { filterTypeFromNumber } from "gui/Components/ScreenElements/Table/FilterSettings/HeaderControls/Operatots";
import { IPanelConfiguration } from "model/entities/types/IPanelConfiguration";
import { IProperty } from "model/entities/types/IProperty";
import {IFilterConfiguration} from "model/entities/types/IFilterConfiguration";

function filterJsonToFilterGroup(filterJson: any, properties: IProperty[]) {
  const filters: IFilter[] = filterJson.details.map((detail: any) => {
    const property = properties.find((prop) => prop.id === detail.property)!;
    return {
      propertyId: detail.property,
      dataType: property.column,
      setting: new FilterSetting(
        filterTypeFromNumber(detail.operator),
        true,
        detail.value1,
        detail.value2
      ),
    };
  });
  return {
    filters: filters,
    id: filterJson.id,
    isGlobal: filterJson.isGlobal,
    name: filterJson.name,
  };
}

export function addFilterGroups(
  filterConfiguration: IFilterConfiguration,
  properties: IProperty[],
  panelConfigurationJson: any
) {

  filterConfiguration.filterGroups = panelConfigurationJson.filters
    .map((filterJson: any) => filterJsonToFilterGroup(filterJson, properties))

  if (panelConfigurationJson.initialFilter) {
    filterConfiguration.defaultFilter = filterJsonToFilterGroup(
      panelConfigurationJson.initialFilter,
      properties
    );
  }
}