'use strict';


module.exports = function(config) {
  var configuration = {
    frameworks: ['mocha', 'browserify'],
    browsers: ['PhantomJS'],
    preprocessors: {
      '/**/*.browserify': 'browserify'
    },
    browserify: {
      files: [
        'test/test-setup.js',
        'test/**/*-spec.js'
      ],
      debug: true,
      watch: true
    },
    urlRoot: '/karma/',
    reporters : ['spec'],
    singleRun: true
  };

  config.set(configuration);
};
