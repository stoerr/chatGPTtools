# FileManagerPlugin Documentation

## Purpose

The `FileManagerPlugin` is a Java application designed to provide a plugin for ChatGPT that allows the AI to access,
read, and write files in the directory where the plugin is started. The plugin is implemented as a standalone Java
application that can be run from the shell, without requiring any dependencies outside of the JDK.

The plugin provides several operations, including:

- Listing the files in a directory
- Reading the contents of a file
- Writing content to a file
- Executing a shell script with given content as standard input

Caution: you currently need to be a paying user of ChatGPT (to have access to ChatGPT-4) and to registered for the
ChatGPT Plugin beta, possibly as a plugin developer.

## Status

It's stable and useable, but I don't plan any extensions to it, since I'm working on a rewrite
[Developers ChatGPT toolbench](https://github.com/stoerr/DevelopersChatGPTToolbench) that already has more
functionality. But you're welcome to use this, too.

## Usage

To use the `FileManagerPlugin`, you need to have registered as a plugin developer with ChatGPT. Once you've done that,
you can add the `FileManagerPlugin` using the "Develop your own plugin" option in the ChatGPT web interface.

To start the plugin, navigate to the directory you want to access and run the `FileManagerPlugin` class. The plugin will
start a server on port 3001 (by default) and will be ready to accept requests from ChatGPT.

The plugin is written so that it cannot be used to go outside of the directory ("../somedfile" won't work) and also
files starting with a dot or containg /target/ are invisible and not writeable. That prevents directories like .git
to be touched and maven target folders tend to contain very much stuff.
(Compare regex IGNORE_FILE in the script).

Use the writing features at your own risk. There will likely be problems with large files. A possible approach is
have ChatGPT write things, but frequently make a git commit to easily inspect changes and be able to revert.

## Examples

Here are some examples of how to use the `FileManagerPlugin`:

- **List Files**: To list the files in the current directory, you can use the `listFiles` operation. In ChatGPT, you
  would ask the AI to list the files in the directory, and it would send a request to the plugin to perform this
  operation. It currently lists all files recursively, so don't use a too large directory.

- **Read File**: To read the contents of a file, you can use the `readFile` operation. In ChatGPT, you would ask the AI
  to read a specific file, and it would send a request to the plugin to perform this operation.

- **Write File**: To write content to a file, you can use the `writeFile` operation. In ChatGPT, you would ask the AI to
  write a specific content to a file, and it would send a request to the plugin to perform this operation.

- **Execute Action**: To execute a shell script with given content as standard input, you can use the `executeAction`
  operation. In ChatGPT, you would ask the AI to execute a specific action, and it would send a request to the plugin to
  perform this operation. The shell script should be located at `.cgptfmgr/{actionName}.sh`, where `{actionName}` is a
  parameter provided in the query string. The content is passed as standard input to the shell script.

Remember, the `FileManagerPlugin` operates on the directory where it was started, so be careful to start it in a
directory that contains the files you want to access, and that you have the necessary permissions to read and write
those files.

## Configuring FileManagerPlugin for use in ChatGPT

To use the `FileManagerPlugin` with ChatGPT, you need to register it as a plugin in the ChatGPT interface. Here's a
step-by-step guide on how to do this:

1. **Register as a Plugin Developer**: If you haven't already, register as a plugin developer with ChatGPT. This will
   give you access to the plugin developer interface where you can add your own plugins.

2. **Start the Plugin**: Navigate to the directory you want to access and run the `FileManagerPlugin` program. This will
   start a server on port 3001 (by default).

3. **Add the Plugin**: In the ChatGPT interface, navigate to the plugin developer section and select "Develop your own
   plugin", and enter the url http://localhost:3001

4. **Test the Plugin**: Once you've added the plugin, you can test it in the ChatGPT interface. Try asking the AI to
   list the files in the directory, read a specific file, write to a file, or execute a specific action. If everything
   is set up correctly, the AI should be able to perform these operations using the `FileManagerPlugin`.

Remember, the `FileManagerPlugin` operates on the directory where it was started, so be sure to start it in a directory
that contains the files you want to access, and that you have the necessary permissions to read and write those files.
