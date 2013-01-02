#!/bin/bash

	# If the URL was not passed as a parameter then prompt for it
	if [[ -z "$1" ]]; then
		# Get path for absolute URL
		read -p "Provide absolute path for widget (including trailing slash): "

		WEB_PATH=$REPLY

	# If the URL was passed, store it.
	else
		WEB_PATH=$1
	fi


# Validate path
	URL_REGEX='(https?|ftp|file)://[-A-Za-z0-9\+&@#/%?=~_|!:,.;]*[-A-Za-z0-9\+&@#/%=~_|]/'
	if [[ ! $WEB_PATH =~ $URL_REGEX ]];then
	    echo "Absolute path not valid"
	    exit
	fi


# Copy widget data
	if [ -e role_widget ]
	then
		rm -rf role_widget
	fi
	mkdir role_widget
	cp -R src role_widget
	cp compile_less.sh role_widget
	cp compile_requirejs.sh role_widget


# Compile LESS to CSS
    cd role_widget/
    ./compile_less.sh compress
    cd ..
    rm -rf role_widget/src/less/
    rm role_widget/compile_less.sh
    
    
# Compile & compress requirejs deps
	cd role_widget/
	./compile_requirejs.sh
	cd ..
	rm -rf role_widget/src/requirejs/
	rm role_widget/compile_requirejs.sh


# Copy widget_template.xml contents into widget.xml
    cp role_widget/src/role_template.xml role_widget/src/widget.xml


# Force absolute path on script elements
    sed -n 's|<script.*src="\(.*\)">.*</script>|\1|gp' role_widget/src/role_template.xml | while read line; do
		if [[ ! $line =~ $URL_REGEX ]];then
		    sed "s|$line|$WEB_PATH$line|" role_widget/src/widget.xml > role_widget/src/temp
		    mv role_widget/src/temp role_widget/src/widget.xml
		fi
    done


# Force absolute path on link elements
    sed -n 's|<link.*href="\(.*\)">|\1|gp' role_widget/src/role_template.xml | while read line; do
		if [[ ! $line =~ $URL_REGEX ]];then
		    sed "s|$line|$WEB_PATH$line|" role_widget/src/widget.xml > role_widget/src/temp

		    mv role_widget/src/temp role_widget/src/widget.xml
		fi
    done


# remove role template xml
    rm role_widget/src/role_template.xml


# Remove wookie template xml
    rm role_widget/src/wookie_template.xml


# Remove index.htm
    rm role_widget/src/index.htm
    
    
# Remove requirejs javascript source
	rm -rf role-widget/src/requirejs/


# Mark as ROLE widget
    sed -i '1s/^/var ROLE=true;\n/' role_widget/src/js/main-built.js

