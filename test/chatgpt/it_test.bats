#!/usr/bin/env bats

# Ensure we have at least version 1.5.0 of bats
bats_require_minimum_version 1.5.0

TEST_BREW_PREFIX="$(brew --prefix)"
load "${TEST_BREW_PREFIX}/lib/bats-support/load.bash"
load "${TEST_BREW_PREFIX}/lib/bats-assert/load.bash"

@test "Simple Answer" {
  run -0 --separate-stderr chatgpt $CHATGPT_TEST_ARGS where are the united nations head quarters
  assert_output --partial "New York"
}

@test "Image Analysis" {
  run -0 --separate-stderr chatgpt $CHATGPT_TEST_ARGS -i testpic.jpg what is this
  assert_output --partial "hammer"
}

@test "Text to Speech" {
  run -0 --separate-stderr chatgpt $CHATGPT_TEST_ARGS -a testspeech.mp3 repeat this
  assert_output --partial "world peace"
}

@test "Tool use from JSON" {
  run -0 --separate-stderr chatgpt $CHATGPT_TEST_ARGS -tf duplicate.json duplicate foo
  assert_output --regexp "foo.*foo"
  [[ $stderr =~ "Calling tool duplicate" ]]
}

@test "Tool use from Shell Script" {
  run -0 --separate-stderr chatgpt $CHATGPT_TEST_ARGS -ts duplicate.sh duplicate bar
  assert_output --regexp "bar.*bar"
  [[ $stderr =~ "Calling tool duplicate" ]]
}

@test "JSON output with simple schema" {
  run -0 --separate-stderr chatgpt $CHATGPT_TEST_ARGS -ra 'name, age int, height number: height in meters' Franz is 8 years and 1 meter 20 cm tall

  expected='{"name":"Franz","age":8,"height":1.2}'
  # Use jq to canonicalize both the expected and the actual output
  diff <(echo "$expected" | jq -S .) <(echo "$output" | jq -S .) || {
    echo "Expected JSON and actual JSON differ:"
    diff <(echo "$expected" | jq -S .) <(echo "$output" | jq -S .)
    exit 1
  }
}

@test "Concatenating prompt fragments" {
  run -0 --separate-stderr chatgpt $CHATGPT_TEST_ARGS -p 'repeat this' -u 'four' -s 'Answer in German' one two three
  assert_output --regexp "[Ee]ins.*zwei.*drei.*[Vv]ier"
}
