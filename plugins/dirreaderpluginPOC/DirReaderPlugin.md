# Specification for ReadDir ChatGPT Plugin

## Basic idea

The ReadDir plugin should be a program you can start in any directory and give ChatGPT the ability to traverse that
directory and read the files there. It is safe in the sense that ChatGPT can read only the files but change nothing.
That is, it serves only GET requests. 

## Implementation decisions

We do implement the interface stateless. That means there is no "current directory" - the full path of the directory 
or file is always transmitted.
We aim for a minimal set of operations to realize the requirements.
There should also be an operation "thought" that takes a string and logs that to the console. It should be called 
before calling the other operations, to provide for a REACT like pattern.

## Necessary commands

A minimum set of operations would be:

- `thought(string)`: Logs a string to the console. This operation should be called before any other operations to 
provide a pattern similar to React's `componentDidMount()` lifecycle method.
- `listFiles(directorypath: String, globpattern: String, recursive: boolean, grepregex: String): FileInfo[]` lists the 
  files of the directory in alphabetical order, optionally restricted to files matching a glob pattern, containing a 
  grepregex, and recursively traversing the subdirectories.
  The `FileInfo` object should contain properties such as `name`, `size`, `creationDate`, and 
  `lastModifiedDate`; if name ends with '/' it's a directory.
- `readFileContent(path: string): string`: Reads the content of a text-based file and returns it as a string. The 
  `path` parameter is the full path of the file.

Note: The file paths used in the above commands should be full paths, including the directory path and file name.

# OpenAPI specification



# Sort back

## Usecases

1. **File information retrieval**: Users can ask the plugin to retrieve information about specific files, such as the file name, size, creation date, and last modified date.
2. **Directory traversal**: Users can request the plugin to traverse through a directory and provide a list of files and subdirectories contained within.
3. **File content reading**: Users can ask the plugin to read the content of a specific file and return it as text.
4. **Filtering and searching**: Users can request the plugin to filter files based on specific criteria, such as file extension, size range, or creation date. They can also search for files containing specific keywords in their content.

For example:

1. Retrieve file information:
   - "What are the files in this directory?"
   - "Tell me about the file named 'example.txt'."
   - "Get the size of the file 'data.csv'."
   - "When was 'report.docx' last modified?"
   
3. Read file content:
   - "Read the contents of the file 'notes.txt'."
   - "Show me the content of 'readme.md'."
   
4. Filter and search files:
   - "List all files with the '.jpg' extension."
   - "Find files created in the last week."
   - "Search for files with extension .md containing the string 'foo'"

## Functional requirements

1. The plugin should provide an interface for ChatGPT to interact with the file system, allowing ChatGPT to read file information and content.
2. It should support traversing directories, listing files and subdirectories within a specified directory.
3. The plugin should be able to read the content of text-based files (e.g., .txt, .csv) and return it as text.
4. The plugin should provide options for filtering files based on criteria such as file extension, size, and creation date.
5. It should support searching for files that contain specific keywords in their content.
6. The plugin should handle errors gracefully and provide appropriate error messages when encountering issues such as inaccessible directories or invalid file paths.
7. The plugin should ensure the security of the file system by only allowing read access to files and not allowing any modifications.
