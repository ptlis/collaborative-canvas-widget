#!/bin/bash

# pngcrush installation Ubuntu 10.04
# sudo apt-get install pngcrush

	BASE=$PWD

# Process images with pngcrush
	rm -rf src/images_new/
	mkdir src/images_new

	cd src/images/
	find . -name '*.png' | while read IMAGE_FILE; do

		IMAGE_PATH=${IMAGE_FILE%/*}
		IMAGE_PATH=`echo $IMAGE_PATH | sed "s|\.||g"`
		IMAGE_NAME=`basename $IMAGE_FILE`

		SRC_FILE=`echo $BASE"/src/images"$IMAGE_PATH"/"$IMAGE_NAME`
		DST_FILE=`echo $BASE"/src/images_new"$IMAGE_PATH"/"$IMAGE_NAME`

		DIRECTORY=$BASE"/src/images_new"$IMAGE_PATH
		if [ ! -d $DIRECTORY ]; then
			mkdir -p $DIRECTORY
		fi

		pngcrush -q -rem alla -reduce -brute $SRC_FILE $DST_FILE

	done

# Generate user prompt for replace
	cd $BASE

	ORIG_SIZE_BYTES=`find src/images/ -name '*.png' -print0 | du --files0-from=- -cb | tail -1 | sed "s/[^0-9]//g"`
	ORIG_SIZE_HUMAN=`find src/images/ -name '*.png' -print0 | du --files0-from=- -ch | tail -1`
	NEW_SIZE_BYTES=`find src/images_new/ -name '*.png' -print0 | du --files0-from=- -cb | tail -1 | sed "s/[^0-9]//g"`
	NEW_SIZE_HUMAN=`find src/images_new/ -name '*.png' -print0 | du --files0-from=- -ch | tail -1`

	REDUCTION=`echo "100-(($NEW_SIZE_BYTES/$ORIG_SIZE_BYTES)*100)" | bc -l`
	REDUCTION=`echo $REDUCTION | awk '{ printf("%.2f\n", $1) }'`

	echo "original size: "$ORIG_SIZE_HUMAN
	echo "new size:      "$NEW_SIZE_HUMAN
	echo "reduction:     "$REDUCTION"%"

	read -p "Overwrite original files? (y/N) "

	if [ "$REPLY" == "y" ]; then
		cd src/images_new/
		find . -name '*.png' | while read IMAGE_FILE; do

			IMAGE_PATH=${IMAGE_FILE%/*}
			IMAGE_PATH=`echo $IMAGE_PATH | sed "s|\.||g"`
			IMAGE_NAME=`basename $IMAGE_FILE`

			SRC_FILE=`echo $BASE"/src/images_new"$IMAGE_PATH"/"$IMAGE_NAME`
			DST_FILE=`echo $BASE"/src/images"$IMAGE_PATH"/"$IMAGE_NAME`
			mv $SRC_FILE $DST_FILE
		done
	fi


	cd $BASE

	rm -rf src/images_new/