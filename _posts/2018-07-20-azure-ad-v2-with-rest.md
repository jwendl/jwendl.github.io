---
layout: post
title:  "Fetching a Bearer Token using Azure AD and REST"
date:   2018-07-20 18:57:00
categories:
 - Azure AD
tags:
 - azure ad
 - rest
 - curl
 - auth
---
Azure AD has several methods that can be used to authenticate into your application. These options are:

## Azure AD

1. Username / Password (and possibly + multi factor authentication).
2. Device Code, where the user goes to a website, enters a code in and then is authenticated.
3. Client ID and Secret (or Certificate), where the application authenticates against a client id and secret to authenticate into the application.
4. OAuth Implicit flow, where a client id and secret is used to implicitly get a token for a user.

One approach we are going to examine in this post, is getting a request code and using that code to fetch a bearer token. To get started, we will need to add an application into Azure AD. We can do this by visiting the [Application Registration Page](https://apps.dev.microsoft.com/). When working with an application in this fashion, we will want to add a platform and enter in https://localhost/ as the reply url. The other change we want to make in this screen is to add a client password as well. Save the client password as we will use it in the steps below.

## Steps to Fetch the Bearer Token

First step is to open a browser and visit the following URI (replacing the values in [] with your actual values).

``` bash
https://login.microsoftonline.com/[tenant-id]/oauth2/authorize?client_id=[client-id]&response_type=code
```

Then we will take the URL from that redirect and copy it into Notepad. It will look similar to the URL below.

``` bash
http://localhost/?code=AQABAAIAAADXzZ3i...stripped...A9DmH-uyT-f4OsQIewC1IAA&session_state=e0b7ff62-d2b4-4b05-8ae5-7bfde9ddefeb
```

In this case we want to use the text between ?code= and &session_state similar to AQABAAIAAADXzZ3i...stripped...A9DmH-uyT-f4OsQIewC1IAA

We can use the secret we created above and the code as well to generate the next required information. We will use the Windows Subsystem for Linux (on Windows) or Bash (on mac / Linux) for the next command. We could use Postman or something like that as well, but it gets complicated adding the form fields that way.

Just swap out anything in [] with the values from above.

``` bash
curl "https://login.microsoftonline.com/[tenant-id]/oauth2/token" \
  -F "redirect_uri=https://localhost/" \
  -F "grant_type=client_credentials" \
  -F "resource=https://management.azure.com/" \
  -F "client_id=[client-id]" \
  -F "client_secret=[client-password]" \
  -F "code=[code-from-above]"
```

The result will look similar to the below output.

``` bash
{"token_type":"Bearer","expires_in":"3599","ext_expires_in":"0","expires_on":"1532140443","not_before":"1532136543","resource":"https://management.azure.com/","access_token":"eyJ0eXAiOi...stripped...jVGm2c3g"}
```

We can use the value in the "access_token" field now to authenticate into a custom application (say an Azure Function) and get whatever claims we want to from our bearer token. This is only useful when testing say an Azure Function or Web API though. In a real scenario we would use a JavaScript client application (React or Angular) and the associated SDKs to get the bearer token.

## An Auth Example using Azure Functions

There is a [blog](https://blog.wille-zone.de/post/secure-azure-functions-with-jwt-token/) article by [@BorisWilhelms](https://twitter.com/BorisWilhelms), which has a good example of how to use the bearer token in an Azure function.

There is also another option of utilizing [Easy Auth](https://docs.microsoft.com/en-us/azure/app-service/app-service-authentication-overview), but that is tougher to debug and troubleshoot locally.

References:

* [Authentication Types with Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-authentication-scenarios)
* [Azure AD REST Reference](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-oidc)
