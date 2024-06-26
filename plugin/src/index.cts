import { basename, dirname, join } from 'node:path';

import type * as ts from 'typescript/lib/tsserverlibrary';

import { createDtsSnapshot } from './create';
import { createLogger } from './logger';
import { isConfig } from './util';

function init({
  typescript: tsModule,
}: {
  typescript: typeof ts;
}): ts.server.PluginModule {
  const create = (info: ts.server.PluginCreateInfo) => {
    const logger = createLogger(info);

    const languageServiceHost: Partial<ts.LanguageServiceHost> = {
      getScriptKind(fileName) {
        if (!info.languageServiceHost.getScriptKind) {
          return tsModule.ScriptKind.Unknown;
        }

        if (isConfig(fileName)) {
          return tsModule.ScriptKind.TS;
        }

        return info.languageServiceHost.getScriptKind(fileName);
      },
      getScriptSnapshot(fileName) {
        if (isConfig(fileName)) {
          return createDtsSnapshot(tsModule, fileName, logger);
        }

        return info.languageServiceHost.getScriptSnapshot(fileName);
      },
      resolveModuleNameLiterals(moduleNames, containingFile, ...rest) {
        if (!info.languageServiceHost.resolveModuleNameLiterals) {
          return [];
        }

        const resolvedModules =
          info.languageServiceHost.resolveModuleNameLiterals(
            moduleNames,
            containingFile,
            ...rest,
          );

        return moduleNames.map(({ text: moduleName }, i) => {
          if (!isConfig(moduleName)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return resolvedModules[i]!;
          }

          return {
            resolvedModule: {
              resolvedFileName: join(
                dirname(containingFile),
                dirname(moduleName),
                basename(moduleName),
              ),
              extension: tsModule.Extension.Dts,
              isExternalLibraryImport: false,
            },
          };
        });
      },
    };
    const languageServiceHostProxy = new Proxy(info.languageServiceHost, {
      get(target, key: keyof ts.LanguageServiceHost) {
        return languageServiceHost[key] ?? target[key];
      },
    });
    const languageService = tsModule.createLanguageService(
      languageServiceHostProxy,
    );

    if (info.languageServiceHost.resolveModuleNameLiterals) {
      logger.log('resolveModuleNameLiterals not found');
    }

    return languageService;
  };

  const getExternalFiles = (project: ts.server.ConfiguredProject) => {
    return project.getFileNames().filter((name) => isConfig(name));
  };

  return { create, getExternalFiles };
}

export = init;
