import * as fs from 'fs';
export function pathExists(p: string): boolean {
  try {
    fs.accessSync(p);
  } catch (err) {
    return false;
  }

  return true;
}

export function deepmerge(foo: any, bar: any) {
  var merged: any = {};
  for (var each in bar) {
    if (foo.hasOwnProperty(each) && bar.hasOwnProperty(each)) {
      if (typeof (foo[each]) === "object" && typeof (bar[each]) === "object") {
        merged[each] = deepmerge(foo[each], bar[each]);
      } else {
        merged[each] = [foo[each], bar[each]];
      }
    } else if (bar.hasOwnProperty(each)) {
      merged[each] = bar[each];
    }
  }
  for (var each in foo) {
    if (!(each in bar) && foo.hasOwnProperty(each)) {
      merged[each] = foo[each];
    }
  }
  return merged;
}