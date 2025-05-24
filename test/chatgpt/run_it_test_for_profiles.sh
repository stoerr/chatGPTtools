#!/usr/bin/env bash

cd $(dirname $0)

for prof in claude dsr1 dsv3 gemini phi4; do

  echo

  echo "###############################################################################"
  echo "Running tests for profile: $prof"
  echo "###############################################################################"
  CHATGPT_TEST_ARGS="-op $prof" ./it_test.bats
  echo
done

