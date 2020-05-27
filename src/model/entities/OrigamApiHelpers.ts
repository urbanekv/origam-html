

export function joinWithAND(filterItems: string[]){
  if(filterItems.length === 0) return "";
  if(filterItems.length === 1) return filterItems[0];
  return "[\"$AND\", " + filterItems.join(", ") + "]"
}

export function toFilterItem(columnId: string, value: any){
  return "[\"" + columnId  + "\", \"eq\", " + toFilterValueForm(value)+ "]";
}

function toFilterValueForm(value: any){
  return typeof value === "string" ? "\"" + value + "\"" : value
}

