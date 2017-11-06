---
layout: post
title:  "Handy Docker Commands"
date:   2017-08-15 13:39:00
categories:
 - Docker
tags:
 - docker
 - shell
 - commands
 - bash
 - linux
---
Docker has been involved in the majority of the projects I have helped out with in the past few weeks. The inspiration of this post comes mainly from several folks who ask similar questions about performing generic development tasks with Docker (and more specifically hosting an ASP.NET Core on a Docker container)

The first thing for me was installation. Since WSL (Windows Subsystem for Linux) has been released, I have used that command line as my primary way of using anything with the command prompt. The steps I took to install Docker on my machine were:

* Install [Docker for Windows](https://docs.docker.com/docker-for-windows/install/).
* Configure Docker for Windows with setting up the proxy port access.

![Docker for Windows Settings](/images/docker-settings.png)

* Install docker on your Bash instance.

``` bash
wget -qO- https://get.docker.com/ | sh
sudo usermod -aG docker jwendl
```

* Open the Ubuntu on Windows application and create a file ~./bash_aliases

``` bash
user@pc:~$ cat ~/.bash_aliases
alias docker="docker -H localhost:2375"
alias docker-compose="docker-compose -H localhost:2375"
```

The above bash_aliases file allows you to type in "docker" commands from your Bash on Windows shell.

Here is the list of commands that I find handy for Docker:

## Find all running containers

``` bash
user@pc:~$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                   CREATED             STATUS                  PORTS               NAMES
e96ebbbe0e96        microsoft/iis       "C:\\ServiceMonitor..."   25 seconds ago      Up Less than a second   80/tcp              keen_wescoff
fd476fc28b42        microsoft/iis       "C:\\ServiceMonitor..."   54 seconds ago      Up 44 seconds           80/tcp              friendly_kare
bb45a1bba814        microsoft/iis       "C:\\ServiceMonitor..."   29 minutes ago      Up 28 minutes           80/tcp              adoring_mclean
```

## Finding all images on your machine

``` bash
user@pc:~$ docker images -a
REPOSITORY                                                      TAG                 IMAGE ID            CREATED             SIZE
microsoft/iis                                                   latest              4f803ffceb53        8 days ago          10.6GB
microsoft/aspnetcore                                            1.1.2-nanoserver    b450022c856b        13 days ago         1.22GB
microsoft/aspnetcore                                            1.1                 bff3f324b4c7        2 weeks ago         1.22GB
microsoft/dotnet-framework                                      latest              624ffeea3816        5 weeks ago         11.3GB
microsoft/windowsservercore                                     latest              2c42a1b4dea8        5 weeks ago         10.2GB
```

## Killing all containers on your machine

``` bash
user@pc:~$ docker kill `docker ps -aq`
```

## Removing all containers from your machine

``` bash
user@pc:~$ docker rm `docker ps -aq`
```

## Removing all images from your machine

``` bash
user@pc:~$ docker rmi `docker images -aq`
```

## Referencing a specific image id

One thing I learned during my investigation of Docker as well, is that the full image id can be reduced in the command line to the most unique set of characters.

For instance, if your container id is 4f803ffceb5301bd94cfa2b9f931a36493effd50e9d14a53586ffb27a48bb580 (the long version), you can reference it by the shorter version gained from docker ps -a (like 4f803ffceb53). Also if it's easier, you can type in just the 2 characters (if they are unique) when using them in a command. For us, to kill this container, we can use the following example.

``` bash
user@pc:~$ docker kill 4f
```

## Building a docker image and uploading to a private repository

This example is assuming an ASP.NET Core application.

``` bash
dotnet publish -c Release out
cp Dockerfile out
docker build -t my-tag:v1 out
docker run -d -p 8080:8080 my-tag:v1
docker login myregistry.azurecr.io -u guid -p P4SSW0rd!
docker tag 4f myregistry.azurecr.io/samples/my-tag
docker push myregistry.azurecr.io/samples/my-tag
```

After all of the commands finish, you can now reference myregistry.azurecr.io in your docker container.

## Open a command prompt in an already running container

For a Linux container

``` bash
user@pc:~$ docker exec -it 4f bash
```

For a Windows container

``` bash
user@pc:~$ docker exec -it 4f powershell
```
