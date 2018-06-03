import * as ts from 'typescript';
import { Evaluator } from '..';
import { Symbols } from '../symbols';
import { readFileSync } from 'fs';
import { MetadataEntry } from '../schema';

const file = ts.createSourceFile(
  'sample.ts',
  readFileSync('./__tests__/fixtures/sample.ts').toString(),
  ts.ScriptTarget.ES2015
);
const meta = new Map<MetadataEntry, ts.Node>();
const evaluator = new Evaluator(new Symbols(file), meta);

describe('Evaluator', () => {
  it('should work', () => {
    const arrow = <ts.ArrowFunction>(<ts.VariableStatement>file.statements[4]).declarationList.declarations[0]
      .initializer;
    const node = (<ts.CallExpression>arrow.body).arguments[0];
    expect(evaluator.evaluateNode(node)).toBe('/prefix/lazy');
  });
});
