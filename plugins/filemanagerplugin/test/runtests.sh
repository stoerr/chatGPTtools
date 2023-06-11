#!/usr/bin/env bash
overwrite=false
# if the first argument is -o, overwrite the expected files: set overwrite to true
if [ "$1" == "-o" ]; then
    overwrite=true
fi

# random port for testing the app at
port=7364
# cd to the directory of the script
cd "$(dirname "$0")"
# start the app
../FileManagerPlugin $port &
# save the pid of the app
pid=$!
trap "kill $pid" EXIT

# wait for the app to start
sleep 1

baseurl="http://localhost:$port"
failures=""

# turn this block into a function with arguments url expected actual
function executetest() {
    url="$baseurl$1"
    args="$2"
    expected="$3"
    actual=".tmp/$(basename $expected)"
    echo "testing $url"
    curl -s $args $url -o $actual
    echo >> $actual
    # if expected does not exist, copy actual to expected and add failure
    if ! diff -u $expected $actual; then
        failures="$failures $expected"
    fi
    # if expected does not exist or overwrite is true, overwrite expected with actual
    if [ ! -f $expected ] || [ "$overwrite" == "true" ]; then
        cp $actual $expected
        echo "CREATED: $expected"
        failures="$failures $expected"
    fi
}

executetest /.well-known/ai-plugin.json "" ../ai-plugin.json
executetest /dirreaderplugin.yaml "" ../dirreaderplugin.yaml
executetest /listFiles?path=. "" listFiles.json

# if there are failures, print them out and exit with a non-zero exit code
if [ -n "$failures" ]; then
    echo -e "FAILURES: $failures"
    exit 1
fi
