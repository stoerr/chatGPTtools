#!/usr/bin/env bats

@test "Simple Answer" {
  run chatgpt where are the united nations head quarters
  [ "$status" -eq 0 ]
  echo "$output" | grep -iq "new york"
}

@test "Image Analysis" {
  run chatgpt -i testpic.jpg what is this
  [ "$status" -eq 0 ]
  echo "$output" | grep -iq "hammer"
}

@test "Text to Speech" {
  run chatgpt -a testspeech.mp3 repeat this
  [ "$status" -eq 0 ]
  echo "$output" | grep -iq "world peace"
}

@test "Tool use from JSON" {
  run chatgpt -tf duplicate.json duplicate foo
  [ "$status" -eq 0 ]
  # Check that "foo" appears twice (case-insensitive)
  count=$(echo "$output" | grep -io "foo" | wc -l)
  [ "$count" -eq 2 ] || { echo "Expected 2 occurrences of 'foo', got $count"; exit 1; }
  # Check stderr for tool call message
  echo "$stderr" | grep -iq "calling tool duplicate"
}

@test "Tool use from Shell Script" {
  run chatgpt -ts duplicate.sh duplicate bar
  [ "$status" -eq 0 ]
  count=$(echo "$output" | grep -io "bar" | wc -l)
  [ "$count" -eq 2 ] || { echo "Expected 2 occurrences of 'bar', got $count"; exit 1; }
  echo "$stderr" | grep -iq "calling tool duplicate"
}

@test "JSON output with simple schema" {
  run chatgpt -ra 'name, age int, height number: height in meters' Franz is 8 years and 1 meter 20 cm tall
  [ "$status" -eq 0 ]
  expected='{"name":"Franz","age":8,"height":1.2}'
  [ "$output" = "$expected" ] || { echo "Expected: $expected, Got: $output"; exit 1; }
}

@test "Concatenating prompt fragments" {
  run chatgpt -p 'repeat this' -u 'four' -s 'Answer in German' one two three
  [ "$status" -eq 0 ]
  # Normalize whitespace (squeeze spaces) and check for expected result
  norm_output=$(echo "$output" | tr -s ' ')
  echo "$norm_output" | grep -iq "eins zwei drei vier"
}
