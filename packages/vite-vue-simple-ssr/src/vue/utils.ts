export const isNode = (): boolean =>
  typeof process !== 'undefined' && process.versions && process.versions.node
    ? true
    : false;
