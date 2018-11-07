---
layout: post
title:  "Using Insomnia to Test Azure AD V2 App"
date:   2018-11-06 16:40:00
categories:
 - Azure AD
tags:
 - azure ad
 - insomnia
 - rest
---
When building an API that is protected by an oauth token, it can be pretty complicated to test that endpoint out locally using something like [Postman](https://www.getpostman.com/) or [Insomnia](https://insomnia.rest/) because it's tough to get the bearer token. In the past, it would involve calling out via REST to the /authorize endpoint and then the /token endpoint to get the token and would involve multiple steps. Currently, both applications above utilize the ability to authenticate using "OAuth 2" instead of just a simple bearer token. This post involves the steps I used inside Insomnia and which Azure AD screens to get that information from.

The new UI for Insomnia looks like the following screen shot:

![Insomnia](/images/posts/Insomnia-001.png)

To get the information required for these options, we first can go to [App Dev Portal](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredAppsPreview).

From that portal screen, we will click on "New Registration"

![Azure AD App Registration](/images/posts/AzureAdPortal-001.png)

The next step is to create the information needed for the new application registration.

![Azure AD App Registration First Screen](/images/posts/AzureAdPortal-002.png)

After selecting the "Register" button, it should naviage you to the overview of the new preview portal experience.

The Authorization URL is essentially

``` bash
https://login.microsoftonline.com/<tenantId>/oauth2/v2.0/authorize
```

The Access Token URL is essentially

``` bash
https://login.microsoftonline.com/<tenantId>/oauth2/v2.0/token
```

The Client Id and Tenant Id fields can be retrieved from the overview page on the Azure AD Portal.

![Azure AD Client Id](/images/posts/AzureAdPortal-003.png)

To generate the Client Secret, we will need to go into the "Certificates & Secrets" screen in the Azure AD Portal. Then we can click on the "New client secret" button.

Copy the secret into the Client Secret field (it should look something like the screenshot below)

![Azure AD Client Secret](/images/posts/AzureAdPortal-004.png)

The redirect URL can be created on the "Authentication" tab under the app registration blade. I usually just set it to https://localhost/ when using Insomnia to test APIs with.

Then the scopes are the next piece. Under the "Expose an API" screen on the Azure AD Portal, we can add scopes we want to test with. If we go to the API Permissions screen as well we can add scopes for something that is a Microsoft 1st party application (like Graph, etc).

So in the Advanced Options your scopes will look something like: "openid api://36d8fb88-a8ac-4825-ae54-9644cf7bb8b4/access_as_user offline_access" if connecting to a custom web api, or "openid <https://graph.microsoft.com/User.Read> offline_access" if using Graph API etc.

For the state field, we can enter anything we want to there. It's not really used by Insomnia.

Credentials we can leave as "As Basic Auth Header (default)".

After doing this, we can select "Fetch Tokens" and the Access Token field should populate with your access token. Then you can go ahead and call your custom REST endpoint from that point on without issues.

Feel free to comment below on how easy this is to setup, or if there's feedback on how we've documented it on this blog. I'm planning on working on getting this more into some form of official documentation to make it easier to work with custom Azure AD protected REST endpoints.

The end result should look something like the following screenshot.

![End Result](/images/posts/Insomnia-002.png)