# FileCtor

File inspector with interactive console.

The idea is to have something similar to other file system managers, e.g. [TotalCommander](https://www.ghisler.com/). But this app is intended for Developers as it allows to run various JS scripts against files and directories.

There are multiple script Snippets installed with the app. They will give you some functionality right away, without having to write your own first.

## Contents

1. [Installation](#installation)
2. [Important Notes](#important-notes)
3. [How to Use](#how-to-use)
4. [Included script Snippets](#included-script-snippets)
5. [Roadmap](#roadmap)

## Installation

**Windows**

1. Download latest Win32 release from [here](https://github.com/tomaschyly/FileCtor/releases).
2. Unzip anywhere, then you can copy the folder wherever you want the app to be, there is no installation.
3. Run the app, optionally create shortcut to use.

**MacOS**

1. Download latest Darwin release from [here](https://github.com/tomaschyly/FileCtor/releases).
2. Unzip anywhere, then copy app to your Applications folder.
3. Run the app, optionally create shortcut to use.

**Ubuntu**

1. Download latest Deb release from [here](https://github.com/tomaschyly/FileCtor/releases).
2. Unzip anywhere, then install the package.
3. Run the app, optionally create shortcut to use.

## Important Notes

This app is intended to be cross-platform, currently developed and tested on Windows 10, MacOS and Ubuntu 18.04 LTS.

App is using [Electron](https://electronjs.org/) and [React](https://reactjs.org/) as it was originally meant for me to improve my skill with Electron and learn properly React.

## How to Use

### Execute script
1. On the main Files view, click the code button. Either in the files row on the right or at the bottom near the current directory.
2. 
	1. Now you have console open for you with current directory preselected for use by script.
	2. If you used the button inside the files row, then you have also the file/s preselected, but this is not yet fully implemented.
3. Inside the top box is Javascript editor, here you can write code that will be executed.
4. If you hit the question mark button, you will see current API reference for global variables and functions.
5. Execute the code by hitting execute button. **WARNING: be sure that you are in the correct directory and have correct selected files before you execute the script. I will NOT be responsible for any damage that you cause to yor own PC.**
6. Inside the middle box you will see result and any console.log that you used with your script. Here you will also see error.

### Save script
1.
	1. When you have already open console with written script, click the save button.
	2. Go to the Snippets view and click new snippet button to open the console. Write your script and then save with the save button.
	
### Script API reference
1. Open the console using any of the previously mentioned ways.
2. Click the question mark button. 

### Want more capabilities (variables/methods)
1. 
	1. Write your request in [here](https://github.com/tomaschyly/FileCtor/issues).
	2. Or use the contact form inside the app's About view.

## Included script Snippets

### Simple Example

This is just a basic script example that does almost nothing, but demonstrate that execution works.

### Rename Files

Rename files to a new name and append with number if there are more than one.

### Rename Files (part of name)

Rename files to a new name by changing part of name with provided new part.

### Rename Host Sql

Script for renaming host inside Sql query. E.g. rename host of WP website when migrating from Dev to Prod. Should work on large Sql files.

### TinyPNG Compress/Resize/Crop Images

Two scripts for images (PNG & JPG), one can compress them, the other can resize or crop. Crop is intelligent in determining area of interest. You need TinyPNG API key for them to work.

## Roadmap

* Various improvements - an ongoing process happening regularly
* Dark Mode
* More files explorer like actions - **LOW PRIORITY**
* More script capabilities - an ongoing process/dependant also on requests

* MacOS touchbar - **TBD**
* Linux (Ubuntu) - **TBD**
* Simple GUI for snippets - **TBD**

* Monaco Editor - **DISTANT FUTURE POSSIBILITY**
