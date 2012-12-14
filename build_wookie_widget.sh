#!/bin/bash

# Copy widget data
	if [ -e w3_widget ]
	then
		rm -rf w3_widget
	fi
	mkdir w3_widget
	cp -R src w3_widget
	cp compile_less.sh w3_widget
	cp compile_requirejs.sh w3_widget


# Compile LESS to CSS
    cd w3_widget/
    ./compile_less.sh compress
    cd ..
    rm -rf w3_widget/src/less/
    rm w3_widget/compile_less.sh
    
    
# Compile & compress requirejs deps
	cd w3_widget/
	./compile_requirejs.sh
	cd ..
	rm -rf w3_widget/src/requirejs/
	rm w3_widget/compile_requirejs.sh


# Generate real config.xml from template
	VERSION='0.1'

	CMD="sed s/@@VERSION@@/${SVN_VERSION}/ w3_widget/src/wookie_template.xml"
	$CMD > w3_widget/src/config.xml


# Remove wookie template xml
    rm w3_widget/src/wookie_template.xml


# Remove ROLE widget xml
    rm w3_widget/src/role_template.xml


# Mark as wookie widget
    sed -i '1s/^/var WOOKIE=true;\n/' role_widget/src/js/main-built.js


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
