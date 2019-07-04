import { IApplication, IApplicationData } from "./types/IApplication";
import { IWorkbench } from "./types/IWorkbench";
import { ApplicationLifecycle } from "./ApplicationLifecycle";
import { IApplicationLifecycle } from "./types/IApplicationLifecycle";
import { OrigamAPI } from "./OrigamAPI";
import { IApi } from "./types/IApi";
import { action } from "mobx";
import { IOpenedScreens } from "./types/IOpenedScreens";

export class Application implements IApplication {

  constructor(data: IApplicationData) {
    Object.assign(this, data);
    this.applicationLifecycle.parent = this;
    this.openedScreens.parent = this;
  }

  applicationLifecycle: IApplicationLifecycle = null as any;
  openedScreens:IOpenedScreens = null as any;
  api: IApi = null as any;

  workbench?: IWorkbench;

  resetWorkbench(): void {
    this.workbench = undefined;
  }

  setWorkbench(workbench: IWorkbench): void {
    this.workbench = workbench;
    workbench.parent = this;
  }

  @action.bound
  run(): void {
    this.applicationLifecycle.run();
  }
  
  parent?: any;
}
