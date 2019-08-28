'use strict';

let files = require('./util/files');
let Conference = require('./model/conference');

var path = __dirname + '/assets/input/test.txt';
files.read(path, function(data) {
    let conference = new Conference(data);
    conference.printTracks();
}, function(error) {
    console.error('Erro ao tentar realizar a leitura do arquivo.');
    console.error(error);
});
