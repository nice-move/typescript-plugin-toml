import type * as ts from 'typescript/lib/tsserverlibrary';

export interface Logger {
  log: (message: string) => void;
  error: (error: Error) => void;
}

export const createLogger = (info: ts.server.PluginCreateInfo): Logger => {
  const log = (message: string) => {
    info.project.projectService.logger.info(
      `[typescript-plugin-config] ${message}`,
    );
  };

  const error = (err: Error) => {
    log(`Failed ${err.toString()}`);
    log(`Stack trace: ${err.stack}`);
  };

  return { log, error };
};
