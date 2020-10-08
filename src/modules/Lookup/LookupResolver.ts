import { createAtom, IAtom, action } from "mobx";
import _ from "lodash";
import { LookupCacheIndividual, ILookupCacheIndividual } from "./LookupCacheIndividual";
import {
  LookupLoaderIndividual,
  ILookupIndividualResultListenerArgs,
  ILookupLoaderIndividual,
} from "./LookupLoaderIndividual";
import { TypeSymbol } from "dic/Container";

export class LookupResolver {
  constructor(private cache: LookupCacheIndividual, private loader: LookupLoaderIndividual) {}

  resolved = new Map<any, any>();
  atoms = new Map<any, IAtom>();

  globalAtom = createAtom(
    "LookupGlobal",
    () => {},
    () => {}
  );

  handleAtomObserved(key: any, atom: IAtom) {
    this.atoms.set(key, atom);
    if (!this.resolved.has(key)) {
      this.loader.setInterrest(key);
    }
  }

  handleAtomUnobserved(key: any, atom: IAtom) {
    this.atoms.delete(key);
    this.loader.resetInterrest(key);
  }

  @action.bound
  cleanAndReload() {
    const keysToDelete: any[] = [];
    for (let [k, v] of this.resolved.entries()) {
      if (!this.atoms.has(k)) {
        keysToDelete.push(k);
      } else {
        this.loader.setInterrest(k);
      }
    }
    for (let k of keysToDelete) {
      this.resolved.delete(k);
    }
    // This one might not be needed?
    this.globalAtom.reportChanged();
  }

  @action.bound
  handleResultingLabels(args: ILookupIndividualResultListenerArgs) {
    for (let [k, v] of args.labels) {
      this.resolved.set(k, v);
    }
    this.cache.addLookupLabels(this.resolved);
    this.globalAtom.reportChanged();
  }

  resolveValue(key: any) {
    // This runs in COMPUTED scope
    //debugger
    if (_.isString(key)) key = String(key).toLowerCase();

    let value: any = null;

    this.globalAtom.reportObserved();

    if (this.resolved.has(key)) value = this.resolved.get(key)!;

    if (value === null) {
      const cachedLabels = this.cache.getLookupLabels();
      if (cachedLabels.has(key)) {
        this.resolved.set(key, cachedLabels.get(key!));
        value = this.resolved.get(key)!;
      }
    }

    if (!this.atoms.has(key)) {
      const atom = createAtom(
        `ALookup@${key}`,
        () => this.handleAtomObserved(key, atom),
        () => this.handleAtomUnobserved(key, atom)
      );
      atom.reportObserved();
    } else {
      const atom = this.atoms.get(key)!;
      atom.reportObserved();
    }


    return value;
  }

  async resolveList(keys: Set<any>): Promise<Map<any, any>> {
    const missingKeys = new Set(keys);
    const cachedLabels = this.cache.getLookupLabels();
    const cachedResultMap = new Map<any, any>();
    for (let labelId of Array.from(missingKeys.keys())) {
      if (this.resolved.has(labelId)) {
        missingKeys.delete(labelId);
        cachedResultMap.set(labelId, this.resolved.get(labelId));
      }
      if (cachedLabels.has(labelId)) {
        missingKeys.delete(labelId);
        cachedResultMap.set(labelId, cachedLabels.get(labelId));
      }
    }

    const loadedResultMap = await this.loader.loadList(missingKeys);
    const entryArray = Array.from(loadedResultMap);
    if (entryArray.length === 1) {
      this.cache.addLookupLabels(loadedResultMap);
      const innerLoadedMap = entryArray[0][1];
      this.resolved = new Map([...innerLoadedMap, ...this.resolved]);
      return new Map([...innerLoadedMap, ...cachedResultMap]);
    }
    if (entryArray.length === 0) {
      return cachedResultMap;
    }
    throw new Error("More that one lookup result maps");
  }

  isEmptyAndLoading(key: any) {
    if (_.isString(key)) key = String(key).toLowerCase();

    if (!this.resolved.has(key)) {
      return this.loader.isWorking(key);
    } else return false;
  }
}
export const ILookupResolver = TypeSymbol<LookupResolver>("ILookupResolver");
