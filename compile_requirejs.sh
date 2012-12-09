#!/bin/bash

# RequireJS installation Ubuntu 10.04
#   sudo add-apt-repository ppa:chris-lea/node.js
#   sudo apt-get update
#   sudo apt-get install nodejs npm
#   npm install requrejs
#   gedit ~/.bashrc
#   	+ PATH=$PATH:$HOME/node_modules/requirejs/bin
#   source ~/.bashrc


BASE=$PWD

rm -rf src/compressed_js/

mkdir src/compressed_js/