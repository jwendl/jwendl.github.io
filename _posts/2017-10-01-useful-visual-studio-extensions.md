---
title:  "Useful Visual Studio Extensions"
date:   2017-10-01 16:15:00
tags:
- extensibility
- visual studio
---

Visual Studio is currently my favorite development environment. The ability to extend and build out extra functionality such as code analysis and code formatting in my opinion makes me a lot more productive while building larger solutions.
&shy;

### Unifying Code

[Mixed Tabs](https://marketplace.visualstudio.com/items?itemName=VisualStudioProductTeam.FixMixedTabs) - This extension fixes tabs and spaces to be "tabs" to visual studio (which is defaulted to 4 spaces).

[Power Commands](https://marketplace.visualstudio.com/items?itemName=VisualStudioProductTeam.PowerCommandsforVisualStudio) - Multiple extensions, but the most important one here is the "Format document on save" and "Remove and Sort Usings on save" functions. This used to not work on .NET Core projects, but it has been lately updated to support those project types as well. This will format the document (Ctrl + E, Ctrl + D) and remove / sort usings on save (Ctrl + R, Ctrl + G).

### Visual Editors

[Markdown Editor](https://github.com/madskristensen/MarkdownEditor) - This extension provides a split screen view of markdown files with their actual output. Very handy if you build markdown files.

### Visual Studio Shortcuts

The rest of the functionality I use Visual Studio for can be done with the vanilla installation of Visual Studio 2017 Update 3 through keyboard shortcuts. Here are some shortcuts I use quite often.

* F12 : Go to definition.
* F8 : Go to next issue. So if you have build errors, it goes to the next build error. If you searched for symbols Visual Studio will go to the next symbol.
* Ctrl + . : Resolve code issue (the yellow lightbulb). Useful if a namespace is not recognized and you want to add the using statement for it.
* Ctrl + , : "Go to All" functionality. Useful to go to a class and open the class file. 
* Ctrl + R, Ctrl + T : If inside a unit test method, it will debug that specific test method.

Please comment below if there are other shortcuts and or extensions that you find useful.