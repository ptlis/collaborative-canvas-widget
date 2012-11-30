#!/bin/bash

# LESS installation Ubuntu 10.04
#   sudo add-apt-repository ppa:chris-lea/node.js
#   sudo apt-get update
#   sudo apt-get install nodejs npm
#   npm install less
#   gedit ~/.bashrc
#   	+ PATH=$PATH:$HOME/node_modules/less/bin
#   source ~/.bashrc

BASE=$PWD

COMPRESS=0
if [ $# -eq 1 ] ; then
	if [ "$1" == 'compress' ]; then
		COMPRESS=1
	fi
fi

rm -rf src/css/screen

cd src/less/screen

find . -name '*.less' | while read baseFile; do

	path=${baseFile%/*}
	path=`echo $path | sed "s|\.||g"`
	baseName=`basename $baseFile`
	baseName=`echo $baseName | sed "s|.less||g"`

	tmpFile=`echo $BASE"/src/tmp_"$baseName".less"`
	dstFile=`echo $BASE/src/css/screen$path"/"$baseName.css`



    mkdir -p $BASE/src/css/screen$path

	cat $BASE/src/less/library/elements-0.6.less $BASE/src/less/util/screen_mixins.less $BASE/src/less/screen$path"/"$baseName.less >${tmpFile}


	if [ $COMPRESS -eq 1 ] ; then
	   lessc --yui-compress $tmpFile $dstFile
	else
		lessc $tmpFile $dstFile
	fi

	rm $tmpFile

	cd $BASE/src/less/screen/
done
