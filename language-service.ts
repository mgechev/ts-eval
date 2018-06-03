import * as ts from 'typescript';

export const getLanguageService = (
  rootFileNames: string[],
  virtualFS: { [key: string]: string },
  options: ts.CompilerOptions
) => {
  const files: ts.MapLike<{ version: number }> = {};

  // initialize the list of files
  rootFileNames.forEach(fileName => {
    files[fileName] = { version: 1 };
  });
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => rootFileNames,
    getScriptVersion: fileName => files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: fileName => {
      if (fileName === 'foo.d.ts') {
        return undefined;
      }
      return ts.ScriptSnapshot.fromString(virtualFS[fileName]);
    },
    getCurrentDirectory: () => '',
    getCompilationSettings: () => options,
    getDefaultLibFileName: o => 'foo.d.ts'
  };

  return ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
};
