#!/usr/bin/env bash
# We run the FileManager in testdir and execute a number of tests with curl and
# compare the output to the expected output in test-expected
#
# If the first argument is -o, overwrite the expected files to adapt them to the tests: set overwrite to true

overwrite=false
if [ "$1" == "-o" ]; then
    overwrite=true
fi

# random port for testing the app at
port=7364
# cd to the directory of the script
cd "$(dirname "$0")"
# start the app
cd testdir
../FileManagerPlugin $port &
# save the pid of the app
pid=$!
trap "kill $pid" EXIT
cd ..
mkdir -p test-expected/.tmp

# wait for the app to start
sleep 1

baseurl="http://localhost:$port"
failures=""

# turn this block into a function with arguments url expected actual
function executetest() {
    url="$baseurl$1"
    args="$2"
    expected="test-expected/$3"
    actual="test-expected/.tmp/$(basename $expected)"
    echo
    echo "Testing $url"
    curl -s $args $url -o $actual

    if ! diff -u $expected $actual; then
        failures="$failures $expected"
        # if overwrite is true, overwrite expected with actual
        if [ "$overwrite" == "true" ]; then
            cp $actual $expected
            echo "OVERWRITTEN: $expected"
        fi
    fi
}

executetest /.well-known/ai-plugin.json "" ai-plugin.json
executetest /dirreaderplugin.yaml "" dirreaderplugin.yaml
executetest /listFiles?path=. "" listFiles.json
executetest /listFiles?path=subdir "" listFilesSubdir.json
executetest /readFile?path=firstfile.txt "" getFirstfile.txt
executetest / "" index.html
executetest /unknown "" unknown

# cannot really test this because that has no output, just logs to stdoud, but maybe we'll notice
echo
echo expecting output "testreason"
curl -s $baseurl/reason '-d {\"reason\": \"testreason\"}'

# if there are failures, print them out and exit with a non-zero exit code
if [ -n "$failures" ]; then
    echo -e "FAILURES: $failures"
    exit 1
fi
