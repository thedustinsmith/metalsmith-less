var _ = require('lodash')
var async = require('async')
var multimatch = require('multimatch')
var less = require('less')
var path = require('path')

var DEFAULT_PATTERN = '**/*.less'
var MAP_RE = /less/g
var INPUT_SOURCE = 'input'

module.exports = plugin

function plugin(options) {
    options = options || {}
    var pattern = options.pattern || DEFAULT_PATTERN
    var useDefaultSourceMap = options.useDefaultSourceMap || false
    var renderOptions = options.render || {}
    return function (files, metalsmith, done) {
        var paths = Object.keys(files).filter(function (path) {
            return multimatch(path, pattern).length > 0
        })
        var iterator = convert.bind(null, {
            files: files,
            renderOptions: renderOptions,
            useDefaultSourceMap: useDefaultSourceMap,
            metalsmith: metalsmith
        })
        async.each(paths, iterator, done)
    }
}

function convert(options, filePath, done) {
    var files = options.files
    var renderOptions = options.renderOptions
    var useDefaultSourceMap = options.useDefaultSourceMap
    var data = files[filePath]
    var metalsmith = options.metalsmith
    console.log(metalsmith._directory, metalsmith._source)
    var metalDir = path.resolve(metalsmith._directory, metalsmith._source)
    var fileDir = path.resolve(metalDir, path.dirname(filePath))
    var lessDirs = [metalDir, fileDir]
    var destination = filePath.replace(MAP_RE, 'css')
    console.log(destination)
    var sourceMapDestination = destination + '.map'

    if (useDefaultSourceMap) {
        renderOptions = _.chain(renderOptions)
            .clone()
            .merge({
                sourceMap: {
                    outputSourceFiles: true,
                    sourceMapBasepath: undefined,
                    sourceMapFilename: undefined,
                    sourceMapOutputFilename: undefined,
                    sourceMapURL: path.basename(sourceMapDestination)
                }
            })
            .value()
    }

    renderOptions.paths = lessDirs
    less.render(data.contents.toString(), renderOptions, function (err, output) {
        if (err) return done(err)

        var contents
        var sm

        contents = output.css
        if (useDefaultSourceMap) {
            sm = JSON.parse(output.map)
            sm.sources.forEach(function (s, ix) {
                sm.sources[ix] = s.replace(process.cwd() + '/', '')
            })
            var inputIndex = sm.sources.indexOf(INPUT_SOURCE)
            if (inputIndex) sm.sources[inputIndex] = 'src/' + filePath
            sm = JSON.stringify(sm)
            files[sourceMapDestination] = {
                contents: new Buffer(sm)
            }
        }
        files[destination] = {
            contents: new Buffer(contents)
        }
        return done(null)
    })
}
