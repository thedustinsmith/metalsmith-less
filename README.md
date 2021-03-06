# metalsmith-less

[![Build Status](https://travis-ci.org/christophercliff/metalsmith-less.png?branch=master)](https://travis-ci.org/christophercliff/metalsmith-less)

A [LESS][less] plugin for [Metalsmith][metalsmith].

## Installation

```
npm install metalsmith-less
```

## Usage

```js
var less = require('metalsmith-less')

Metalsmith(__dirname)
  .use(less(options))
  .build()
```

### Options

- **`pattern`** `String pattern|Array<String> pattern`

    A [pattern][multimatch] to filter source files. Default `**/*.less`.

- **`parse`** `Object parseOptions`

    An object that gets passed along to [`new less.Parser(parseOptions)`][less config]. Default `null`.

- **`render`** `Object renderOptions`

    An object that gets passed along to [`tree.toCSS(renderOptions)`][less config]. Default `null`.

- **`useDefaultSourceMap`** `Boolean useDefaultSourceMap`

    A switch to enable the default source map configuration. LESS's source map API doesn't play nice with Metalsmith, so this is a heavy-handed approach to sensible source maps. Default `false`.

## Tests

```
$ npm test
```

## License

MIT License, see [LICENSE](https://github.com/christophercliff/metalsmith-less/blob/master/LICENSE.md) for details.

[less]: http://lesscss.org/
[less config]: http://lesscss.org/#using-less-configuration
[metalsmith]: http://www.metalsmith.io/
[multimatch]: https://github.com/sindresorhus/multimatch
