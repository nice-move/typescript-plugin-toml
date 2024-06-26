# typescript-plugin-config

A typescript language service plugin providing support for toml files.

## Install

```shell
npm i -D typescript-plugin-config
```

## Usage

And then add this to `tsconfig.json`.

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "typescript-plugin-config"
      }
    ]
  }
}
```

If you're using VSCode, [switch to workspace version](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript).

## `.toml`

`test.toml`

```toml
key = 'val'
```

`index.ts`

```ts
import test from './test.toml';

type Test = typeof test; // { readonly key: 'val' }
```
