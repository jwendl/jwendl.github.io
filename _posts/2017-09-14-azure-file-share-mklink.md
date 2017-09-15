---
title:  "Azure File Share and mklink"
date:   2017-09-14 17:54:00
tags:
- dos
- docker
---

One situation we ran into was figuring out how to store files to be shared across multiple virtual machines inside docker containers on an Azure VM. To solve for this problem, we created an Azure File Share and mounted it using net use. Then we used mklink to point a folder in the container to the file share.
&shy;

Creating an Azure File Share is fairly simple. First create the Azure Storage Account using the information below.

![Storage Account Steps](/images/StorageAccount.png)

Then the next step is to go and create a new file share.

![File Share Steps](/images/FileService.png)

From that point we will the command net use to setup the share to a physical drive letter.
{% highlight cmd %}
net use F: \\jwminecraftshare.file.core.windows.net\share /u:AZURE\jwminecraftshare [key]
{% endhighlight %}

Then the next command below will link a local path to that drive share.
{% highlight cmd %}
mklink /d "c:\Data" "\\jwminecraftshare.file.core.windows.net\share" 
{% endhighlight %}

From that point, inside the container we should be able to save files to c:\data and have it save out to the Azure File Service.