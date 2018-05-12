---
layout: post
title:  "Using Expect with Bash"
date:   2017-08-17 13:24:00
categories:
 - Linux
tags:
 - bash
 - linux
---
Most command line applications in Linux use parameters to take arguments in, similar to the following example.

``` bash
user@pc:~$ mycommand --parameter value
```

What happens in the situation when the command asks for a prompt? It makes it difficult to utilize that command in a shell script, because there is no way to redirect input into it. For instance, < or \| would fail.

``` bash
user@pc:~$ mycommand < echo "value we want to pass"
```

The above example fails primarily because it's really passing the value to the input stream of the command not a prompt on the command line. One way to work around this issue is to use a library called [Expect](https://packages.ubuntu.com/search?keywords=expect). Expect can be installed on Ubuntu using apt-get.

``` bash
user@pc:~$ apt-get install expect
```

Once the expect application is installed, it can be used by creating a "recording" of a session. So if our "mycommand" application above prompted for a value, we could then write a macro script to pass data into the prompted value.

``` bash
expect <<- DONE
    set timeout -1

    spawn mycommand --parameter value

    expect "?hat's your name:*"
    send -- "Justin\r"
    send -- "\r"

    expect eof
DONE
```

Breaking down the steps above. The set timeout -1 line just tells expect to instantly put the value when it detects the prompt. If it's set to any value above 0, then that is the time in seconds it delays before putting the value in.

The next command is the "spawn" command. This executes your application and any command line parameters that need to be used for the application.

The expect statement below that is the prompt that we want to take action on. In our example, it might prompt the text "What's your name:" and our regex above, the '?' just is a character wildcard.

The next send statements below that will pass that text key by key into the prompt on linux.

The final statement expect eof tells expect that the macro session is over and it can move on to any other commands in the shell script.

Hopefully, the use cases for this are pretty rare. When you do run into this situation though, it's good to know that there is a way to work around passing values into an input prompt for bash shell scripting.
