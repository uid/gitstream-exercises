#!/bin/bash
echo 'module.exports=[' > wordbank.dat
shuf wordbank.txt | sed -n "n;n;n;n;n;s/^/'/;s/$/'/;$ ! s/$/,/;p;" | tr -d '\n' >> wordbank.dat
echo '];' >> wordbank.dat
