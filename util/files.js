'use strict';

// modulo para gestão de arquivos do sistema
let fs = require('fs');

module.exports.read = function(filename, success, failure) {
  read(filename, success, failure)
}

function read(path, success, failure) {
    fs.readFile(path, 'utf8', function(error, data) {
        if (error && failure != null) {
            failure(error);
        } else if (success != null) {
            success(data);
        }
    });
}
