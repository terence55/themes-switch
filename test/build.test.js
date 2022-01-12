var path = require('path');
var fs = require('fs-extra');
var mocha = require('mocha');
var shell = require('shelljs');
var glob = require('glob');
var it = mocha.it;
var expect = require('chai').expect;
var assert = require('chai').assert;

mocha.describe('-----Build Test-----', function () {
  beforeEach(function() {
    var cache = require.cache;
    for (var moduleId in cache) {
      delete cache[moduleId];
    }
  });

  it('Build with less', function (done) {
    testBuild('simple-less', 'simple-less', done);
  });

  it('Build with postcss', function (done) {
    testBuild('simple-postcss', 'simple-postcss', done);
  });

  it('Build with sass', function (done) {
    testBuild('simple-sass', 'simple-sass', done);
  });

  it('Build with css', function (done) {
    testBuild('simple-css', 'simple-css', done);
  });
});

function testBuild(srcName, expectName, callback) {
  var baseDir = path.join(__dirname, 'src', srcName);
  var expectDir = path.join(__dirname, 'expect', expectName);
  var actualDir = path.join(__dirname, 'src', srcName, 'build');
  fs.removeSync(actualDir);
  shell.cd(baseDir);
  var webpack = require('webpack');
  var configFile = path.join(baseDir, 'webpack.config.js');
  var config = require(configFile);
  webpack(config, function (err, stats) {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      callback();
      return;
    }
    var actualFiles = glob.sync('**/*.css', { cwd: actualDir, nodir: true });
    console.log(srcName, 'actualFile:', actualFiles);
    actualFiles.forEach(function (file) {
      var actualFile = fs.readFileSync(path.join(actualDir, file), 'utf-8').replace(/\n(\n)*( )*(\n)*\n/g, '\n');
      var expectFile = fs.readFileSync(path.join(expectDir, file), 'utf-8').replace(/\n(\n)*( )*(\n)*\n/g, '\n');
      if (file.endsWith('.css')) {
        actualFile = actualFile.replace(/[\r\n]/g, '').replace(/\s+/g, "");
        expectFile = expectFile.replace(/[\r\n]/g, '').replace(/\s+/g, "");
      }
      expect(actualFile).to.equal(expectFile);
    });
    callback();
  });
}