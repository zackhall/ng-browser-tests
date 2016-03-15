var config = {
  ngDir: './ng',
  ngFiles: './ng/angularFiles.js'
};

var angularFiles = require(config.ngFiles); 
var glob = require('glob');
var _ = require('lodash');
var path = require('path');
var nunjucks = require('nunjucks');
var fs = require('fs');
var mkdirp = require('mkdirp');

var template = nunjucks.compile(fs.readFileSync('_template.html', 'utf8').toString());

var tests = {
  modules: {
    include: angularFiles.mergeFilesFor('karmaModules', 'angularSrcModules'),
    exclude: []
  },
  jquery: {
    include: angularFiles.mergeFilesFor('karmaJquery'),
    exclude: angularFiles.mergeFilesFor('karmaJqueryExclude')
  }, 
  jqlite: {
    include: angularFiles.mergeFilesFor('karma'),
    exclude: angularFiles.mergeFilesFor('karmaExclude')
  }
};

var includes = _.transform(tests, function(result, value, key) {
  var files = _.flatMap(value.include, function(pattern) {
    return glob.sync(pattern, { cwd: config.ngDir, ignore: value.exclude });
  });

  result[key] = 
    _(files)
      .uniq()
      .map(function(value) {
        var src = path.join('..', config.ngDir, value);
        return `<script src="${src}"></script>`;
      })
      .join('\n');
});

mkdirp(path.join(__dirname, 'out'), function(err) {
  if (err) console.log(err);

  _.forIn(includes, function(value, key) {
    fs.writeFileSync(path.join(__dirname, 'out', key + '.html'), template.render({ scripts: value }), 'utf-8');
  });
});