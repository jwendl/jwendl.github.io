---
layout: post
title:  "SQL Azure with Hierarchyid"
date:   2019-07-01 12:13:00
categories:
 - Azure
tags:
 - sql
 - azure
---
We recently needed to represent data in a hierarchical format where we could inherit rules going through the ancestors and descendants from a given record in the database.

Relating data in the format of a hierarchy works very well for handling a permissions database.

SQL Server has had the hierarchyid data type available since [SQL Server 2014](https://docs.microsoft.com/en-us/sql/relational-databases/hierarchical-data-sql-server?view=sql-server-2017). 

For instance, if we had a schema similar to the below.

``` sql
create table Permission
(
  Id int not null,
  LevelId hierarchyid not null,
  PermissionName nvarchar(30) not null,
  Scope nvarchar(128) not null,
);
```

Where the data looks similar to the following results.

``` sql
select LevelId.ToString(), LevelId.GetLevel(), * from Permission;
```

| LevelId  | LevelDepth | LevelString | PermissionName              | Scope                           | 
|----------|------------|-------------|-----------------------------|---------------------------------| 
| 0x58     | 1          | /1          | Earth                       | /Earth                          | 
| 0x5AC0   | 2          | /1/1        | North America               | /Earth/NA                       | 
| 0x5B40   | 2          | /1/2        | Europe Middle East and Asia | /Earth/EMEA                     | 
| 0x5AD6   | 3          | /1/1/1      | Washington                  | /Earth/NA/Washington            | 
| 0x5AD6B0 | 4          | /1/1/1/1    | Building 1                  | /Earth/NA/Washington/Building-1 | 

## Example Queries

Here's an example stored procedure that can be used to add a node to a parent.

``` sql
alter procedure AddPermissionNode(@parentScope nvarchar(128), @permissionName nvarchar(30), @scope nvarchar(128))
as
begin
 declare @levelId hierarchyid, @leastCommon hierarchyid
 select @levelId = LevelId from Permission where Scope = @parentScope
 set transaction isolation level serializable
 begin transaction
	select @leastCommon = max(LevelId) from Permission where LevelId.GetAncestor(1) = @levelId;
	insert into Permission (LevelId, PermissionName, Scope) values (@levelId.GetDescendant(@leastCommon, NULL), @workspaceName, @scope);
 commit
end;
```

``` sql
exec AddPermissionNode '/Earth', 'Test', '/Earth/Test';
```

> The above query will automatically assign it to the next child id value available. So if we have a record of "/1/1" and a record of "/1/2" and we add a new node to "/1" that new record will get "/1/3" as it's hierarchyid.

The below query will list all of the children that's below a given scope value. 

``` sql
with parent as (select LevelId from Permission where scope = '/Earth/NA')
select *, LevelId.ToString() from Permission where LevelId.IsDescendantOf((select * from parent)) = 1;
```

| LevelId  | LevelString | PermissionName | Scope                           | 
|----------|-------------|----------------|---------------------------------| 
| 0x5AC0   | /1/1        | North America  | /Earth/NA                       | 
| 0x5AD6   | /1/1/1      | Washington     | /Earth/NA/Washington            | 
| 0x5AD6B0 | /1/1/1/1    | Building 1     | /Earth/NA/Washington/Building-1 | 

The below example will list all of the records that are parents to the given scope value.

``` sql
with Ancestors(LevelId, PermissionName, ParentLevelId) as
(
      select
            LevelId, PermissionName, LevelId.GetAncestor(1)
      from
            Permission
      where
            Scope = '/Earth/NA/Washington/Building-1'
      union all
      select
            p.LevelId, p.PermissionName, p.LevelId.GetAncestor(1)
      from
            Permission p
      inner join
            Ancestors a on p.LevelId = a.ParentLevelId
)
select *, LevelId.ToString() from Ancestors
```

| LevelId  | LevelString | PermissionName | ParentLevelId | 
|----------|-------------|----------------|---------------| 
| 0x5AD6B0 | /1/1/1/1    | Building 1     | 0x5AD6        | 
| 0x5AD6   | /1/1/1      | Washington     | 0x5AC0        | 
| 0x5AC0   | /1/1        | North America  | 0x58          | 
| 0x58     | /1          | Earth          | 0x            | 

This data type lends itself to a power list of [operations](https://docs.microsoft.com/en-us/sql/t-sql/data-types/hierarchyid-data-type-method-reference?view=sql-server-2017) that can be added into your SQL statements to treat the hierarchy as a proper data structure for this type of scenario.
