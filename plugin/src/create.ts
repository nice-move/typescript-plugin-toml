// eslint-disable-next-line import/no-nodejs-modules
import { readFileSync } from 'node:fs';

import stripJsonComments from 'strip-json-comments';
import { parse as parseToml } from 'toml';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { parse as parseYaml } from 'yaml';

import type { Logger } from './logger';
import { isJSONC, isTOML, isYAML } from './util';

function parseJSONC(text: string): unknown {
  return JSON.parse(
    stripJsonComments(text, {
      trailingCommas: true,
    }),
  );
}

export const createDtsSnapshot = (
  tsModule: typeof ts,
  fileName: string,
  logger: Logger,
): ts.IScriptSnapshot => {
  const text = readFileSync(fileName, 'utf8');

  let dts;

  try {
    const data = isTOML(fileName)
      ? parseToml(text)
      : isYAML(fileName)
        ? parseYaml(text)
        : isJSONC(fileName)
          ? parseJSONC(text)
          : text;

    dts = `declare const data = ${JSON.stringify(data)} as const;`;
  } catch (error: unknown) {
    logger.error(error as Error);

    dts = 'declare const data: void;';
  }

  dts += '\nexport default data;';

  return tsModule.ScriptSnapshot.fromString(dts);
};
