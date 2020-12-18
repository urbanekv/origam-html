import { action, computed, flow, reaction } from "mobx";
import { parse as wktParse, stringify as wtkStringify } from "wkt";
import { getDataSourceFieldIndexByName } from "model/selectors/DataSources/getDataSourceFieldIndexByName";
import { MapRootStore } from "./MapRootStore";
import { getSelectedRow } from "model/selectors/DataView/getSelectedRow";
import { getDataViewPropertyById } from "model/selectors/DataView/getDataViewPropertyById";
import { onFieldChangeG } from "model/actions-ui/DataView/TableView/onFieldChange";
import { getDataTable } from "model/selectors/DataView/getDataTable";
import { getFormScreenLifecycle } from "model/selectors/FormScreen/getFormScreenLifecycle";
import _ from "lodash";
import { getDataView } from "model/selectors/DataView/getDataView";
import { getSelectedRowId } from "model/selectors/TablePanelView/getSelectedRowId";

export class MapObjectsStore {
  constructor(private root: MapRootStore) {}

  get dataView() {
    return this.root.dataView;
  }

  get setup() {
    return this.root.mapSetupStore;
  }

  get search() {
    return this.root.mapSearchStore;
  }

  get navigationStore() {
    return this.root.mapNavigationStore;
  }

  @computed get fldLocationIndex() {
    return this.setup.mapLocationMember
      ? getDataSourceFieldIndexByName(this.dataView, this.setup.mapLocationMember)
      : undefined;
  }

  @computed get fldNameIndex() {
    return this.setup.mapTextMember
      ? getDataSourceFieldIndexByName(this.dataView, this.setup.mapTextMember)
      : undefined;
  }

  @computed get fldIconIndex() {
    return this.setup.mapIconMember
      ? getDataSourceFieldIndexByName(this.dataView, this.setup.mapIconMember)
      : undefined;
  }

  @computed get fldIconAzimuth() {
    return this.setup.mapAzimuthMember
      ? getDataSourceFieldIndexByName(this.dataView, this.setup.mapAzimuthMember)
      : undefined;
  }

  @computed get fldIdentifier() {
    return getDataSourceFieldIndexByName(this.dataView, "Id");
  }

  @computed
  get mapObjects() {
    const result: IMapObject[] = [];
    if (this.setup.isReadOnlyView) {
      const tableRows = this.dataView.tableRows;

      for (let row of tableRows) {
        if (_.isArray(row) && this.fldLocationIndex !== undefined) {
          const objectGeoJson = wktParse(row[this.fldLocationIndex]);
          if (objectGeoJson)
            result.push({
              ...objectGeoJson,
              id: row[this.fldIdentifier],
              name: this.fldNameIndex !== undefined ? row[this.fldNameIndex] : "",
              icon: this.fldIconIndex && row[this.fldIconIndex],
              azimuth: this.fldIconAzimuth && row[this.fldIconAzimuth],
            });
        }
      }
    } else {
      const selectedRow = getSelectedRow(this.dataView);
      if (selectedRow) {
        const row = selectedRow;
        if (_.isArray(row) && this.fldLocationIndex && row[this.fldLocationIndex]) {
          let objectGeoJson: any;
          try {
            objectGeoJson = wktParse(row[this.fldLocationIndex]);
          } catch (e) {
            // TODO: Erorr dialog?
            console.error(e);
          }
          if (objectGeoJson) {
            result.push({
              ...objectGeoJson,
              id: row[this.fldIdentifier],
              name: this.fldNameIndex !== undefined ? row[this.fldNameIndex] : "",
              icon: this.fldIconIndex && row[this.fldIconIndex],
              azimuth: this.fldIconAzimuth && row[this.fldIconAzimuth],
            });
          }
        }
      }
    }
    console.log(result);
    return result;
  }

  @action.bound
  handleGeometryChange(geoJson: any) {
    const self = this;
    return flow(function* () {
      const property = getDataViewPropertyById(self.dataView, self.setup.mapLocationMember);
      const selectedRow = getSelectedRow(self.dataView);
      console.log(property, selectedRow);
      if (property && selectedRow) {
        yield* onFieldChangeG(self.dataView)(
          undefined,
          selectedRow,
          property,
          geoJson ? wtkStringify(geoJson) : null
        );
        getDataTable(self.dataView).flushFormToTable(selectedRow);
        yield* getFormScreenLifecycle(self.dataView).onFlushData();
      }
    })();
  }

  @action.bound
  handleLayerClick(id: string) {
    if (this.setup.isReadOnlyView) {
      getDataView(this.dataView).selectRowById(id);
      this.search.selectSearchResultById(id);
      this.navigationStore.highlightSelectedSearchResult();
    }
  }

  @action.bound
  handleMapMounted() {
    return reaction(
      () => getSelectedRowId(this.dataView),
      (rowId: string | undefined) => {
        if (this.setup.isReadOnlyView && rowId) {
          this.search.selectSearchResultById(rowId);
          this.navigationStore.highlightSelectedSearchResult();
        }
      },
      { fireImmediately: true }
    );
  }
}

export enum IMapObjectType {
  POINT = "Point",
  POLYGON = "Polygon",
  LINESTRING = "LineString",
}

export interface IMapObjectBase {
  id: string;
  name: string;
  icon: string;
  azimuth: number;
}

export interface IMapPoint extends IMapObjectBase {
  type: IMapObjectType.POINT;
  coordinates: [number, number];
}

export interface IMapPolygon extends IMapObjectBase {
  type: IMapObjectType.POLYGON;
  coordinates: [number, number][][];
}

export interface IMapPolyline extends IMapObjectBase {
  type: IMapObjectType.LINESTRING;
  coordinates: [number, number][][];
}

export type IMapObject = IMapPoint | IMapPolygon | IMapPolyline;
