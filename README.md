# FileCtor

File inspector with interactive console.

The idea is to have something similar to other file system managers, e.g. [TotalCommander](https://www.ghisler.com/). But this app is intended for Developers as it allows to run various JS scripts against files and directories.

## Installation

1. Download latest release from [here](https://github.com/tomaschyly/FileCtor/releases). Win32 is for Windows. Darwin is for MacOS.
2. For Windows, unzip anywhere you want to have the app installed. For MacOS, unzip anywhere, then copy app to your Applications folder.
3. Run the app, optionally create shortcut to use.

## Important Notes

This app is intended to be cross-platform, currently developed and tested on Windows 10 and MacOS. Ubuntu will follow.

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
