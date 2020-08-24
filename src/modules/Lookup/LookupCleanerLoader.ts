import { LookupCacheIndividual, ILookupCacheIndividual } from "./LookupCacheIndividual";
import { LookupResolver, ILookupResolver } from "./LookupResolver";
import { TypeSymbol } from "dic/Container";

export class LookupLabelsCleanerReloader {
  constructor(private cache: LookupCacheIndividual, private resolver: LookupResolver) {}

  reloadLookupLabels() {
    this.cache.clean();
    this.resolver.cleanAndReload();
  }
}
export const ILookupLabelsCleanerReloader = TypeSymbol<LookupLabelsCleanerReloader>("ILookupLabelsCleanerReloader");
export const IGetLookupLabelsCleanerReloader = TypeSymbol<(lookupId: string) => LookupLabelsCleanerReloader>(
  "IGetLookupLabelsCleanerReloader"
);