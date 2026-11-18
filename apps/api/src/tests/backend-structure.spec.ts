import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const sourceRoot = join(__dirname, '..');

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

describe('backend structure', () => {
  it('keeps every backend test and spec inside a tests folder', () => {
    const misplaced = walk(sourceRoot)
      .map((path) => relative(sourceRoot, path))
      .filter((path) => /\.(?:test|spec)\.ts$/.test(path))
      .filter((path) => !path.split('/').includes('tests'));

    expect(misplaced).toEqual([]);
  });
});
