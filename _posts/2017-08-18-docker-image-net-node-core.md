---
layout: post
title:  "Docker Windows Image for IoT Edge"
image: ''
date:   2017-08-18 15:05:00
tags:
- docker
- windows
- .net framework
- .net core
- node
description: ''
categories:
- Docker 
---

We were in a scenario where we wanted to enable [IoT Edge]() to be enabled on a Windows Server Core docker container so that we could run some scenarios. We couldn't find a good way of doing this all in one Dockerfile, but found a way to merge a few Dockerfiles into one.

The gist of the cleaned up result is below:
{% gist 8026445ec866fb10b62f85c4eae4f0d4 %}

Looking more closely at the Dockerfile, let's walk through what each section means.
{% highlight docker %}
FROM microsoft/windowsservercore

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]
{% endhighlight %}

The first line tells Docker to utilize the [windowsservercore](https://hub.docker.com/r/microsoft/windowsservercore/) base image. 
The second line tells Docker to switch the command shell to PowerShell and to stop on any error messages, but continue on progress updates.

{% highlight docker %}
RUN Invoke-WebRequest -Uri "https://download.microsoft.com/download/D/D/3/DD35CC25-6E9C-484B-A746-C5BE0C923290/NDP47-KB3186497-x86-x64-AllOS-ENU.exe" -OutFile NDP47-KB3186497-x86-x64-AllOS-ENU.exe
RUN .\NDP47-KB3186497-x86-x64-AllOS-ENU.exe /q
RUN del .\NDP47-KB3186497-x86-x64-AllOS-ENU.exe
{% endhighlight %}

The first RUN command above downloads the latest version of .NET Framework 4.7 and places it to an .exe file.
The second line runs the .exe with the '/q' or quiet flag to avoid output and installer window.
The third RUN command removes the excess .exe after the full framework installs.

{% highlight docker %}
ENV DOTNET_SDK_VERSION 1.0.4
ENV DOTNET_SDK_DOWNLOAD_URL https://dotnetcli.blob.core.windows.net/dotnet/Sdk/$DOTNET_SDK_VERSION/dotnet-dev-win-x64.$DOTNET_SDK_VERSION.zip

RUN Invoke-WebRequest $Env:DOTNET_SDK_DOWNLOAD_URL -OutFile dotnet.zip; \
Expand-Archive dotnet.zip -DestinationPath $Env:ProgramFiles\dotnet; \
Remove-Item -Force dotnet.zip

RUN setx /M PATH $($Env:PATH + ';' + $Env:ProgramFiles + '\dotnet')
{% endhighlight %}

The first two lines set up environment variables for .NET Core.
The RUN Invoke-WebRequest line downloads the .NET Core SDK.
Expand-Archive is a PowerShell way to unzip a zip file, and we can unzip the downloaded .zip directly into program files.
The Remove-Item command deletes the .zip file using PowerShell.
The last RUN setx command here, sets the path environment variable globally (not just for this shell) to point to the new dotnet folder in Program Files.

{% highlight docker %}
ENV NUGET_XMLDOC_MODE skip
RUN New-Item -Type Directory warmup; \
cd warmup; \
dotnet new; \
cd ..; \
Remove-Item -Force -Recurse warmup
{% endhighlight %}

These next few lines are here just to warm the dotnet cli up so that future calls aren't initially slow (useful to avoid long startup times).

{% highlight docker %}
ENV NODE_VERSION 8.2.1

RUN Invoke-WebRequest $('https://nodejs.org/dist/v{0}/node-v{0}-win-x64.zip' -f $env:NODE_VERSION) -OutFile 'node.zip'; \
Expand-Archive node.zip -DestinationPath C:\ ; \
Rename-Item -Path $('C:\node-v{0}-win-x64' -f $env:NODE_VERSION) -NewName 'C:\nodejs'

ENV NPM_CONFIG_LOGLEVEL info

RUN New-Item $($env:APPDATA + '\npm') ; \
$env:PATH = 'C:\nodejs;{0}\npm;{1}' -f $env:APPDATA, $env:PATH ; \
[Environment]::SetEnvironmentVariable('PATH', $env:PATH, [EnvironmentVariableTarget]::Machine)
{% endhighlight %}

This is setting an environment variable for NODE_VERSION, then downloading that version of Node through .zip file.
The final step then extracts those contents to C:\nodejs and deletes the .zip file.

{% highlight docker %}
RUN Invoke-WebRequest $('https://download.microsoft.com/download/3/b/f/3bf6e759-c555-4595-8973-86b7b4312927/vc_redist.x64.exe') -OutFile vcredist.exe
RUN .\vcredist.exe /q
RUN del .\vcredist.exe
{% endhighlight %}

The last few lines here download the vc_redist_x64 and install it (useful for IoT Edge).
