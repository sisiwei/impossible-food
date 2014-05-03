#!/bin/bash
#coding=utf-8

export FILENAME=/Users/mtigas/Downloads/5d1521f5-a3eb-40b0-bcc4-b6651fb45c6d.xls
rm $FILENAME.csv
sed 's#</td><td>#","#g' $FILENAME | sed 's#<table><tr><td>#"#g' | sed 's#</td></tr></table>#"#g'| sed 's#</td></tr><tr><td>#"\
"#g' > $FILENAME.csv
head $FILENAME.csv
