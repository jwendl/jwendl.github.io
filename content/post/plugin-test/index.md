---
title: Plugin Test
slug: plugin-test
date: 2024-01-16 21:28:14-08:00
comments: true

categories:
- Site

tags:
- hugo
- meta
- plugins
---

A list of random plugins to test my Hugo deployment.

<!--more-->

## Sequence Diagram

``` mermaid
sequenceDiagram
    Alice ->> Bob: Hello Bob, how are you?
    Bob-->>John: How about you John?
    Bob--x Alice: I am good thanks!
    Bob-x John: I am good thanks!
    Note right of John: Bob thinks a long<br/>long time, so long<br/>that the text does<br/>not fit on a row.

    Bob-->Alice: Checking with John...
    Alice->John: Yes... John, how are you?
```

## Gantt Chart

``` mermaid
gantt
dateFormat  YYYY-MM-DD
title Adding GANTT diagram to mermaid
excludes weekdays 2014-01-10

section A section
Completed task            :done,    des1, 2014-01-06,2014-01-08
Active task               :active,  des2, 2014-01-09, 3d
Future task               :         des3, after des2, 5d
Future task2               :         des4, after des3, 5d
```

## GoAT Diagrams

``` goat
      .               .                .               .--- 1          .-- 1     / 1
     / \              |                |           .---+            .-+         +
    /   \         .---+---.         .--+--.        |   '--- 2      |   '-- 2   / \ 2
   +     +        |       |        |       |    ---+            ---+          +
  / \   / \     .-+-.   .-+-.     .+.     .+.      |   .--- 3      |   .-- 3   \ / 3
 /   \ /   \    |   |   |   |    |   |   |   |     '---+            '-+         +
 1   2 3   4    1   2   3   4    1   2   3   4         '--- 4          '-- 4     \ 4

```

## C\#

``` csharp
// See https://aka.ms/new-console-template for more information
// https://graph.microsoft.com/v1.0/users?$filter=endsWith(userPrincipalName, 'contoso.com%23EXT%23%40microsoft.onmicrosoft.com')&$select=userPrincipalName&$count=true

using Azure.Identity;
using Microsoft.Graph;
using Microsoft.Graph.Models;

var domainList = new Dictionary<string, List<string>>()
{
    {
        "Contoso", new List<string>()
        {
            "contoso.com#EXT#@microsoft.onmicrosoft.com",
        }
    },
    {
        "Fabrikam", new List<string>()
        {
            "fabrikam.com#EXT#@microsoft.onmicrosoft.com",
        }
    }
};

var defaultAzureCredential = new DefaultAzureCredential();
var graphServiceClient = new GraphServiceClient(defaultAzureCredential);

var count = 0;
using var streamWriter = new StreamWriter("output.csv");

foreach (var kvp in domainList)
{
    foreach (var domain in kvp.Value)
    {
        var userCollectionResponse = await graphServiceClient.Users
            .GetAsync((requestConfiguration) =>
            {
                requestConfiguration.Headers.Add("ConsistencyLevel", "eventual");
                requestConfiguration.QueryParameters.Filter = $"endsWith(userPrincipalName, '{domain}')";
                requestConfiguration.QueryParameters.Select = new[] { "id, displayName, userPrincipalName" };
                requestConfiguration.QueryParameters.Count = true;
            });

        if (userCollectionResponse != null)
        {
            var pageIterator = PageIterator<User, UserCollectionResponse>
                .CreatePageIterator(graphServiceClient, userCollectionResponse, async (user) =>
                {
                    await streamWriter.WriteLineAsync($"{count++}, {kvp.Key}, {user.Id}, {user.DisplayName}, {user.UserPrincipalName}");
                    return true;
                });

            await pageIterator.IterateAsync();
        }
    }
}

graphServiceClient.Dispose();

```

## Map


## Tweet

{{< x user="jwendlatxbox" id="1898139930171523204" theme="dark" >}}

## YouTube

{{< youtube ClJ5xXcWTT4 >}}

## ECharts
