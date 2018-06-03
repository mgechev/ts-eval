import * as ts from 'typescript';
import { Evaluator } from '..';
import { Symbols } from '../symbols';
import { readFileSync } from 'fs';
import { MetadataEntry } from '../schema';

const sample = ts.createSourceFile(
  'sample.ts',
  readFileSync('./__tests__/fixtures/sample.ts').toString(),
  ts.ScriptTarget.ES2015
);
const evaluator = new Evaluator(new Symbols(sample), new Map<MetadataEntry, ts.Node>());

describe('Evaluator', () => {
  it('should work', () => {
    const arrow = <ts.ArrowFunction>(<ts.VariableStatement>sample.statements[4]).declarationList.declarations[0]
      .initializer;
    const node = (<ts.CallExpression>arrow.body).arguments[0];
    expect(evaluator.evaluateNode(node)).toBe('/prefix/lazy');
  });
});
