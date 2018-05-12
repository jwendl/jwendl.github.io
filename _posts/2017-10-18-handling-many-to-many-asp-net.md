---
layout: post
title:  "Handling Many to Many Updates in ASP.NET Core"
date:   2017-10-18 12:44:00
categories:
 - ASP.NET Core
tags:
 - asp.net
 - linq
---
When updating a database object using Entity Framework Core and ASP.NET Core there is a decent amount of complexity involved with handling what's in the database and what is selected from the UI.

> Scenario

Say we have a table Post and another table Tag with a many-to-many relationship between them defined as PostTag. When the user is editing a post, they have the opportunity to select and de-select options that may already exist in the database. Below there are a few options in how to handle this, but one of the more performant options is to do more of a "merge" operation between what's in the database and what is selected in the UI.

> The Brute Force Method

One approach could be to call .Clear() on the collection and then call .Update(post) on the context. The issue with this is that we may be deleting items from the many-to-many table that we may want to keep in the database because they are still selected in the UI.

> The "Merge" Method

Merging is a bit tricky, but for us LINQ comes to the rescue. We can use something like [LINQPad](http://www.linqpad.net/) to mock this up. Essentially, we will switch the Language header on LINQPad to "Statement(s)" like the screenshot below.

![LINQPad Expression](/images/posts/LinqPadExpression.png)

Then inside the query editor window we can use the following snippet.

``` csharp
var selected = new List<int>() { 1, 2, 3, 4 };
var database = new List<int>() { 2, 4, 5 };
selected.Except(database).Dump("Added");
database.Except(selected).Dump("Removed");
```

Essentially the first line that says selected.Except() is taking the set of ids from the left and producing a set with the values inside the .Except parameter. So in our case Added ids are 1 and 3.

The second line uses database.Except() which takes the database items and creates a set of values that don't match with the selected values. So in our example, the Removed id is just 5.

The output would look like the following screenshot.

![Cluster Screen #001](/images/posts/LinqPadExpressionResults.png)
