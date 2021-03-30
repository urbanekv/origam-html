import { IDataView } from "model/entities/types/IDataView";
import { createContext } from "react";
import { MapNavigationStore } from "./MapNavigationStore";
import { MapObjectsStore } from "./MapObjectsStore";
import { MapRoutefinderStore } from "./MapRoutefinderStore";
import { SearchStore } from "./MapSearchStore";
import { MapSetupStore } from "./MapSetupStore";

export class MapRootStore {
  constructor(public dataView: IDataView) {}

  mapSearchStore = new SearchStore(this);
  mapObjectsStore = new MapObjectsStore(this);
  mapSetupStore = new MapSetupStore(this);
  mapNavigationStore = new MapNavigationStore(this);
  mapRoutefinderStore=new MapRoutefinderStore(this);
}

export const CtxMapRootStore = createContext<MapRootStore>(null!);



