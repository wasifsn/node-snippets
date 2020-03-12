"use strict";

const argv = require("yargs").argv;
const path = require("path");
const fs = require("fs");
const util = require("util");
const Transform = require("stream").Transform;
const zlib = require("zlib");

var stream1; //readable
var stream2; //writable

// stream1.pipe(stream2);
console.log(argv);

var BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);
var OUTFILE = path.join(BASE_PATH, "out.txt");

function processFile(inStream) {
  var outStream = inStream;

  if (argv._.includes("uncompress")) {
    let gunzipStream = zlib.createGunzip();
    outStream = outStream.pipe(gunzipStream);
  }

  var upperStream = new Transform({
    transform(chunk, enc, cb) {
      this.push(chunk.toString().toUpperCase());
      cb();
    }
  });

  outStream = outStream.pipe(upperStream);
  var targetStream;
  if (argv._.includes("out")) {
    targetStream = fs.createWriteStream(OUTFILE);
  } else if (argv._.includes("compress")) {
    var gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUTFILE = `${OUTFILE}.gz`;
    targetStream = fs.createWriteStream(OUTFILE);
  } else {
    targetStream = process.stdout;
  }
  outStream.pipe(targetStream);
}

function init() {
  var stream = fs.createReadStream("./lorem.txt");

  processFile(stream);
}

init();
