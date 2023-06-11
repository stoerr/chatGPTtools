#!/usr/bin/env bash
set -vx
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
    curl $args $url -o $actual
    if ! diff -u $expected $actual; then
        failures="$failures\nGET $url"
    fi
}

executetest /.well-known/ai-plugin.json "" ../ai-plugin.json
executetest /dirreaderplugin.yaml "" ../dirreaderplugin.yaml

# if there are failures, print them out and exit with a non-zero exit code
if [ -n "$failures" ]; then
    echo -e "FAILURES:\n$failures"
    exit 1
fi
