#!/bin/bash
find $1 -type f -exec wc -c {} + \
  > $(dirname "$0")/data/filesize.txt 