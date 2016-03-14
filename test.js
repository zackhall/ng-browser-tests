var ngDir = process.argv[2];
var ngFiles = process.argv[3];

var angularFiles = require(ngFiles); 
var glob = require('glob');
var _ = require('lodash');
var path = require('path');
var nunjucks = require('nunjucks');
var fs = require('fs');

var template = nunjucks.compile(fs.readFileSync('_template.html', 'utf8').toString());

var config = {
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
}

var includes = _.transform(config, function(result, value, key) {
  var files = _.flatMap(value.include, function(pattern) {
    return glob.sync(pattern, { cwd: ngDir, ignore: value.exclude });
  });

  result[key] = 
    _(files)
      .uniq()
      .map(function(value) {
        var src = path.join('..', ngDir, value);
        return `<script src="${src}"></script>`;
      })
      .join('\n');
});

_.forIn(includes, function(value, key) {
  fs.writeFileSync(path.join(__dirname, 'out', key + '.html'), template.render({ scripts: value }), 'utf-8');
});