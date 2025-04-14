# Development Guide for ChatGPT Tools

## Build & Test Commands
- **Build**: `make all` - Generates usages, personal HTML files, README.md, and templates
- **Run tests**: `cd test/chatgpt && ./it_test.bats` - Run integration tests
- **Run profile tests**: `cd test/chatgpt && CHATGPT_TEST_ARGS="-op profile_name" ./it_test.bats`
- **Lint**: No explicit linting tool found

## Code Style Guidelines
- **Scripts**: Scripts should be documented with usage text extracted by bin/_makeusagetxt
- **Imports**: Place imports at the top of JS files, standard Node modules first
- **JS Style**: Follow clean code conventions, use camelCase for variables, maintain readability
- **Error Handling**: Provide descriptive error messages with exit codes
- **Naming**: IDs in HTML should have the prefix "hps-chatgpt-"
- **Tools**: Tool functions should have clear descriptions and properly handle input/output
- **Comments**: Document complex logic, avoid unnecessary comments for obvious operations
- **Consistency**: Maintain same error message patterns across tools
- **Files**: Use absolute paths when reading/writing files, properly check for existence

## Project Structure
- Scripts in bin/ directory
- Templates in templates/ directory
- Tests in test/ directory
- Web content in docs/ directory