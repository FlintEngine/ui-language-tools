export function levenshtein(src: string, tar: string): number {
  if (src === tar) return 0;
  if (src.length === 0) return tar.length;
  if (tar.length === 0) return src.length;

  if (src.length < tar.length) {
    const temp = src;
    src = tar;
    tar = temp;
  }

  const srcLength = src.length;
  const tarLength = tar.length;

  const tarCharacters = new Int32Array(tarLength);
  for (let i = 0; i < tarLength; i++) {
    tarCharacters[i] = tar.charCodeAt(i);
  }

  let prev = new Int32Array(tarLength + 1);
  let cur = new Int32Array(tarLength + 1);

  for (let i = 0; i <= tarLength; i++) {
    prev[i] = i;
  }

  for (let srcIdx = 1; srcIdx <= srcLength; srcIdx++) {
    cur[0] = srcIdx;
    const srcChar = src.charCodeAt(srcIdx - 1);

    for (let tarIdx = 1; tarIdx <= tarLength; tarIdx++) {
      const cost = srcChar === tarCharacters[tarIdx - 1] ? 0 : 1;

      const deleteCost = prev[tarIdx] + 1;
      const insertCost = cur[tarIdx - 1] + 1;
      const substituteCost = prev[tarIdx - 1] + cost;

      cur[tarIdx] = Math.min(deleteCost, insertCost, substituteCost);
    }

    const tempArr = prev;
    prev = cur;
    cur = tempArr;
  }

  return prev[tarLength];
}