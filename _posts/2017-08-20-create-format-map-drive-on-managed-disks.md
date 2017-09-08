---
title:  "Working with Windows Containers"
date:   2017-08-20 22:12:00
tags:
- windows
- containers
---

If you find yourself working with Windows Containers, there might be a need to utilize data drives etc from Managed Disks.
&shy;

In order to support this, we can leverage PowerShell to run a few management tasks from an Azure Resource Management template.

{% highlight powershell %}
Get-Disk | Where partitionstyle -eq 'raw' | Initialize-Disk -PartitionStyle MBR -PassThru | New-Partition -AssignDriveLetter -UseMaximumSize | Format-Volume -FileSystem NTFS -NewFileSystemLabel "datadisk" -Confirm:$false
{% endhighlight %}

The Get-Disk commandlet lists all of the disks attached to the machine (including raw unformatted drives). 

The pipe into the Where commandlet just searches for drives that aren't assigned a drive letter. 

The Initialize-Disk commandlet sets a disk up using GPT or MBR with the -PartitionStyle flag. 

The New-Partition commandlet assigns a drive letter and partitions it to the disk manager. 

The last commandlet Format-Volume formats the drive as NTFS and puts a label on it. 