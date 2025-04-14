#!/usr/bin/env bash

cd $(dirname $0)

prof=dsr1
CHATGPT_TEST_ARGS="-op $prof" ./it_test.bats
