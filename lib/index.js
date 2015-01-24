var _ = require('lodash')
var async = require('async')
var less = require('less')
var multimatch = require('multimatch')
var path = require('path')

var DEFAULT_PATTERN = '**/*.less'
var MAP_RE = /less/g
var INPUT_SOURCE = 'input'

module.exports = plugin

function plugin(options) {
    options = options || {}
    var pattern = options.pattern || DEFAULT_PATTERN
    var useDefaultSourceMap = options.useDefaultSourceMap || false
    var lessOptions = options.lessOptions || {}
    return function (files, metalsmith, done) {
        var paths = Object.keys(files).filter(function (path) {
            return multimatch(path, pattern).length > 0
        })
        async.each(paths, function (filePath, done) {
            var destination = filePath.replace(MAP_RE, 'css')
            var sourceMapDestination
            var sourceMapData
            if (useDefaultSourceMap) {
                sourceMapDestination = destination + '.map'
                lessOptions = _.chain(lessOptions)
                    .clone()
                    .extend({
                        outputSourceFiles: true,
                        sourceMap: true,
                        sourceMapBasepath: undefined,
                        sourceMapFilename: undefined,
                        sourceMapOutputFilename: undefined,
                        sourceMapURL: path.basename(sourceMapDestination),
                        writeSourceMap: function (res) {
                            var sm = JSON.parse(res)
                            var inputIndex = sm.sources.indexOf(INPUT_SOURCE)
                            if (inputIndex) sm.sources[inputIndex] = 'src/' + filePath
                            sourceMapData = JSON.stringify(sm)
                        },
                    })
                    .value()
            }
            less.render(files[filePath].contents.toString(), lessOptions, function (err, output) {
                if (err) return done(err)
                if (useDefaultSourceMap) {
                    files[sourceMapDestination] = {
                        contents: new Buffer(sourceMapData),
                    }
                }
                files[destination] = {
                    contents: new Buffer(output.css),
                }
                return done()
            })
        }, done)
    }
}
