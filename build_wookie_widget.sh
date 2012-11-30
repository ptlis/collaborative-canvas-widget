#!/bin/bash

# Export clean copy of widget
	if [ -e w3_widget ]
	then
		rm -rf w3_widget
	fi
	svn export -q svn://localhost/8LEM/prototype_17/ w3_widget


# Compile LESS to CSS
    cd w3_widget/
    ./compile_less.sh compress
    cd ..
    rm -rf w3_widget/src/less/
    rm w3_widget/compile_less.sh


# Generate real config.xml from template
	SVN_VERSION=`svnversion .`

	CMD="sed s/@@VERSION@@/${SVN_VERSION}/ w3_widget/src/wookie_template.xml"
	$CMD > w3_widget/src/config.xml


# Remove wookie template xml
    rm w3_widget/src/wookie_template.xml


# Remove ROLE widget xml
    rm w3_widget/src/role_template.xml


# Mark as wookie widget
    sed -i '1s/^/var WOOKIE=true;\n/' w3_widget/src/js/util.js


# Remove previous widget
	if [ -e w3widget.zip ]
	then
		rm w3widget.zip
	fi


# Output widget zip file
	cd w3_widget/src
	zip -q -r ../../w3widget.wgt *


# Cleanup
	cd ../..
	rm -rf w3_widget/