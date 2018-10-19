// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export function arrayEquals(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  const al = a.length;
  for (let i=0; i < al; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
