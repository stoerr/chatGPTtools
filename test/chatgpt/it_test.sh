#!/bin/bash
# it_test.sh - Automated integration tests for the chatgpt script.
# Runs several test cases using the real API and checks outputs, exit codes, etc.
# Note: Running these tests uses the real API and will incur a small cost.

# Arrays for test results
declare -a TEST_NAMES
declare -a TEST_RESULTS
declare -a TEST_MESSAGES
pass_count=0
fail_count=0

# ------------------------------------------------------------------
# Helper functions
# ------------------------------------------------------------------

# Record a test result
record_result() {
  local name="$1" status="$2" message="$3"
  TEST_NAMES+=("$name")
  TEST_RESULTS+=("$status")
  TEST_MESSAGES+=("$message")
  if [ "$status" = "PASS" ]; then
    ((pass_count++))
  else
    ((fail_count++))
  fi
}

# Run a command and capture stdout, stderr, and exit code.
# Usage: run_command <command> [args...]
run_command() {
  local tmp_stdout tmp_stderr
  tmp_stdout=$(mktemp)
  tmp_stderr=$(mktemp)
  "$@" >"$tmp_stdout" 2>"$tmp_stderr"
  CMD_STATUS=$?
  CMD_STDOUT=$(cat "$tmp_stdout")
  CMD_STDERR=$(cat "$tmp_stderr")
  rm "$tmp_stdout" "$tmp_stderr"
}

# Normalize whitespace (squeeze spaces, trim leading/trailing spaces).
normalize() {
  echo "$1" | tr -s ' ' | sed 's/^ *//;s/ *$//'
}

# Assertion: Check exit code equals expected value.
assert_exit_code() {
  local expected="$1"
  if [ $CMD_STATUS -ne $expected ]; then
    echo "Exit code $CMD_STATUS instead of $expected."
    return 1
  fi
}

# Assertion: Check that stdout contains a given string (case-insensitive).
assert_contains() {
  local needle="$1"
  if ! echo "$CMD_STDOUT" | grep -iq "$needle"; then
    echo "Output does not contain '$needle'."
    return 1
  fi
}

# Assertion: Check that stderr contains a given string (case-insensitive).
assert_stderr_contains() {
  local needle="$1"
  if ! echo "$CMD_STDERR" | grep -iq "$needle"; then
    echo "Stderr does not contain '$needle'."
    return 1
  fi
}

# Assertion: Check that stdout contains a given string a specific number of times.
assert_occurrence_count() {
  local needle="$1"
  local expected="$2"
  local count
  count=$(echo "$CMD_STDOUT" | grep -io "$needle" | wc -l | tr -d ' ')
  if [ "$count" -ne "$expected" ]; then
    echo "Expected '$needle' $expected times in output; found $count times."
    return 1
  fi
}

# ------------------------------------------------------------------
# Test Cases
# ------------------------------------------------------------------

# Test 1: Simple Answer
# Expected: Output contains "New York" (case-insensitive)
run_command chatgpt where are the united nations head quarters
if assert_exit_code 0 && assert_contains "new york"; then
  record_result "Simple Answer" "PASS" ""
else
  record_result "Simple Answer" "FAIL" "$(assert_contains "new york" 2>/dev/null || echo "Output missing expected text")"
fi

# Test 2: Image Analysis
# Expected: Output contains "hammer" (case-insensitive)
run_command chatgpt -i testpic.jpg what is this
if assert_exit_code 0 && assert_contains "hammer"; then
  record_result "Image Analysis" "PASS" ""
else
  record_result "Image Analysis" "FAIL" "Output missing 'hammer'."
fi

# Test 3: Text to Speech
# Expected: Output contains "world peace" (case-insensitive)
run_command chatgpt -a testspeech.mp3 repeat this
if assert_exit_code 0 && assert_contains "world peace"; then
  record_result "Text to Speech" "PASS" ""
else
  record_result "Text to Speech" "FAIL" "Output missing 'world peace'."
fi

# Test 4: Tool use from JSON
# Expected:
#   - Output contains 'foo' exactly twice.
#   - Stderr contains 'Calling tool duplicate'.
run_command chatgpt -tf duplicate.json duplicate foo
if assert_exit_code 0 && assert_occurrence_count "foo" 2 && assert_stderr_contains "calling tool duplicate"; then
  record_result "Tool use from JSON" "PASS" ""
else
  record_result "Tool use from JSON" "FAIL" "Tool JSON test failure."
fi

# Test 5: Tool use from Shell Script
# Expected:
#   - Output contains 'bar' exactly twice.
#   - Stderr contains 'Calling tool duplicate'.
run_command chatgpt -ts duplicate.sh duplicate bar
if assert_exit_code 0 && assert_occurrence_count "bar" 2 && assert_stderr_contains "calling tool duplicate"; then
  record_result "Tool use from Shell Script" "PASS" ""
else
  record_result "Tool use from Shell Script" "FAIL" "Tool Shell Script test failure."
fi

# Test 6: JSON output with simple schema
# Expected: Output is exactly: {"name":"Franz","age":8,"height":1.2}
expected_json='{"name":"Franz","age":8,"height":1.2}'
run_command chatgpt -ra 'name, age int, height number: height in meters' Franz is 8 years and 1 meter 20 cm tall
norm_output=$(normalize "$CMD_STDOUT")
if assert_exit_code 0 && [ "$norm_output" = "$expected_json" ]; then
  record_result "JSON output with simple schema" "PASS" ""
else
  record_result "JSON output with simple schema" "FAIL" "Expected '$expected_json', got '$norm_output'."
fi

# Test 7: Concatenating prompt fragments
# Expected: Normalized output contains "eins zwei drei vier" (case-insensitive)
run_command chatgpt -p 'repeat this' -u 'four' -s 'Answer in German' one two three
norm_output=$(normalize "$CMD_STDOUT")
if assert_exit_code 0 && echo "$norm_output" | grep -iq "eins zwei drei vier"; then
  record_result "Concatenating prompt fragments" "PASS" ""
else
  record_result "Concatenating prompt fragments" "FAIL" "Output missing 'eins zwei drei vier'."
fi

# ------------------------------------------------------------------
# Summary Table
# ------------------------------------------------------------------

echo
printf "%-40s %-8s %s\n" "Test" "Status" "Message"
printf "%-40s %-8s %s\n" "----" "------" "-------"
for i in "${!TEST_NAMES[@]}"; do
  printf "%-40s %-8s %s\n" "${TEST_NAMES[$i]}" "${TEST_RESULTS[$i]}" "${TEST_MESSAGES[$i]}"
done
echo
printf "Total tests: %d, Passed: %d, Failed: %d\n" $((pass_count+fail_count)) $pass_count $fail_count

# Exit with non-zero status if any test failed.
if [ $fail_count -ne 0 ]; then
  exit 1
fi

