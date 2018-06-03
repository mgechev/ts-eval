import * as ts from 'typescript';
import { Evaluator } from './evaluator';
import { Symbols } from './symbols';
import { readFileSync, readFile } from 'fs';
import { MetadataEntry } from './schema';
import { MetadataCollector } from './collector';
import { getLanguageService } from './language-service';
const hypothetical = require('rollup-plugin-hypothetical');
const rollup = require('rollup');

async function build(input: string, files: { [key: string]: string }) {
  const bundle = await rollup.rollup({
    input,
    plugins: [
      hypothetical({
        files
      })
    ]
  });
  const { code, map } = await bundle.generate({
    file: 'bundle.js',
    format: 'cjs'
  });
  return code;
}

const sampleFileContent = readFileSync('__tests__/fixtures/sample.ts').toString();
// const sample = ts.createSourceFile('sample.ts', sampleFileContent, ts.ScriptTarget.ES2015);
const configFileContent = readFileSync('__tests__/fixtures/config.ts').toString();
const sampleJS = ts.transpileModule(sampleFileContent, { compilerOptions: { module: ts.ModuleKind.ES2015 } });
const configJS = ts.transpileModule(configFileContent, { compilerOptions: { module: ts.ModuleKind.ES2015 } });

const res = build(__dirname + '/sample.js', {
  [__dirname + '/sample.js']: sampleJS.outputText,
  [__dirname + '/config.js']: configJS.outputText
});

const findNodeFromDefinition = (node: ts.Node, def: ts.DefinitionInfo) => {
  const textSpan = def.textSpan;
  if (node.pos + 1 === textSpan.start) {
    return node;
  }
  let result: any;
  node.forEachChild(c => {
    if (result) {
      return;
    }
    result = findNodeFromDefinition(c, def);
  });
  return result;
};

res.then(fileContents => {
  console.log(fileContents);

  const languageService = getLanguageService(
    [__dirname + '/sample.js'],
    {
      [__dirname + '/sample.js']: fileContents,
      [__dirname + '/node_modules/typescript/lib/lib.d.ts']: readFileSync(
        __dirname + '/node_modules/typescript/lib/lib.d.ts'
      ).toString()
    },
    {
      jsx: ts.JsxEmit.React,
      allowJs: true
    }
  );

  const sf = ts.createSourceFile('sample.ts', fileContents, ts.ScriptTarget.ES5, true);
  const literalArg = <ts.ObjectLiteralExpression>(<ts.NewExpression>(<ts.ExpressionStatement>sf.statements[7])
    .expression).arguments![0];
  const args = <ts.ObjectLiteralExpression>(<ts.ArrayLiteralExpression>(<ts.PropertyAssignment>literalArg.properties[0])
    .initializer).elements![0];
  const node = (<ts.PropertyAssignment>args.properties[0]).initializer;
  const evaluator = new Evaluator(new Symbols(sf), new Map<MetadataEntry, ts.Node>());

  const def = languageService
    .getDefinitionAtPosition('/Users/mgechev/Projects/evaluator/sample.js', node.pos + 1)
    .pop();
  const nodeDef = findNodeFromDefinition(sf, def!) as ts.VariableDeclaration;
  console.log(nodeDef.initializer!.getFullText());
  console.log(evaluator.evaluateNode(nodeDef.initializer!));
});

// const arrow = <ts.ArrowFunction>(<ts.VariableStatement>sample.statements[4]).declarationList.declarations[0]
//   .initializer;
// const node = (<ts.CallExpression>arrow.body).arguments[0];
// console.log(evaluator.evaluateNode(node));

// const;
