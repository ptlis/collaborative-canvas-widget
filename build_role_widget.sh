#!/bin/bash


# Get path for absolute URL
	read -p "Provide absolute path for widget (including trailing slash): "


# Validate path
    regex='(https?|ftp|file)://[-A-Za-z0-9\+&@#/%?=~_|!:,.;]*[-A-Za-z0-9\+&@#/%=~_|]/'
    if [[ $REPLY =~ $regex ]]
    then
        WEB_PATH=$REPLY
    else
        echo "Absolute path not valid"
        exit
    fi

# Export clean copy of widget
	if [ -e role_widget ]
	then
		rm -rf role_widget
	fi
	svn export -q svn://localhost/8LEM/prototype_17/ role_widget


# Compile LESS to CSS
    cd role_widget/
    ./compile_less.sh compress
    cd ..
    rm -rf role_widget/src/less/
    rm role_widget/compile_less.sh


# Copy widget_template.xml contents into widget.xml
    cp role_widget/src/role_template.xml role_widget/src/widget.xml


# Force absolute path on script elements
    sed -n 's|<script.*src="\(.*\)">.*</script>|\1|gp' role_widget/src/role_template.xml | while read line; do
        sed "s|$line|$WEB_PATH$line|" role_widget/src/widget.xml > role_widget/src/temp

        mv role_widget/src/temp role_widget/src/widget.xml
    done


# Force absolute path on link elements
    sed -n 's|<link.*href="\(.*\)">|\1|gp' role_widget/src/role_template.xml | while read line; do
        sed "s|$line|$WEB_PATH$line|" role_widget/src/widget.xml > role_widget/src/temp

        mv role_widget/src/temp role_widget/src/widget.xml
    done


# remove role template xml
    rm role_widget/src/role_template.xml


# Remove wookie template xml
    rm role_widget/src/wookie_template.xml


# Remove Index.htm
    rm role_widget/src/index.htm


# Mark as ROLE widget
    sed -i '1s/^/var ROLE=true;\n/' role_widget/src/js/util.js