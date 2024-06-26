type Check = (filename: string) => boolean;

export const isTOML: Check = (filename) => filename.endsWith('.toml');

export const isYAML: Check = (filename) =>
  filename.endsWith('.yml') || filename.endsWith('.yaml');

export const isJSONC: Check = (filename) => filename.endsWith('.jsonc');

export const isConfig: Check = (filename) =>
  isTOML(filename) || isYAML(filename) || isJSONC(filename);
