/*
Copyright 2005 - 2021 Advantage Solutions, s. r. o.

This file is part of ORIGAM (http://www.origam.org).

ORIGAM is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

ORIGAM is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with ORIGAM. If not, see <http://www.gnu.org/licenses/>.
*/

import { IMainMenuItemType } from "model/entities/types/IMainMenu";
import {getOpenedScreen} from "./getOpenedScreen";

export function isLazyLoading(ctx: any) {
  const openScreen = getOpenedScreen(ctx);
  return openScreen.lazyLoading && openScreen.menuItemType !== IMainMenuItemType.FormRefWithSelection;
  // openScreen.menuItemType !== IMainMenuItemType.FormRefWithSelection means menu item opens a selection dialog
  // (which is never lazy loaded) and value of the "openScreen.lazyLoading" field is actually relevant to the form
  // which will be open after the selection dialog is closed.
}
