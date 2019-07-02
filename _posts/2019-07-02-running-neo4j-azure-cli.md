---
layout: post
title:  "Running Neo4j from Azure with the Azure CLI"
date:   2019-07-02 10:11:00
categories:
 - Azure
tags:
 - neo4j
 - azcli
---
If you are considering running [Neo4J](https://neo4j.com/) there are several deployment options out there to consider.

We could consider the following:

1. Manually installing it on several VMs and configuring it like a [cluster](https://neo4j.com/docs/operations-manual/current/clustering/).
1. There is a [container](https://neo4j.com/developer/docker-run-neo4j/) for Neo4j as well that can be hosted on [AKS](https://docs.microsoft.com/en-us/azure/aks/).
1. Running Neo4J from the [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/neo4j.neo4j-enterprise-causal-cluster?tab=Overview).

Unfortunately, with AKS there is a lot of complexity with routing the traffic to the proper master node. Neo4j does it's own clustering and essentially creates a double "routing" issue. AKS will end up with some form of ingress controller like nginx that will pass data to one of the nodes that might not be the master node for Neo4J.

One approach we found successful was spinning up a high-available cluster from ARM templates. The below Azure CLI is an example of how to do this.

``` bash
# Create Neo4J Cluster
resourceGroupName="PolicyManager"
clusterNamePrefix="jwneo4j"
vmCount="3"
vmSize="Standard_A1"
adminUserName="$(whoami)"
adminCredential="$(cat ~/.ssh/id_rsa.pub)"

az group deployment create --resource-group "$resourceGroupName" --template-uri "https://raw.githubusercontent.com/neo4j/azure-neo4j/master/ha/mainTemplate.json" --parameters ClusterNamePrefix="$clusterNamePrefix" VmCount="$vmCount" VmSize="$vmSize" AdminUserName="$adminUserName" AdminAuthType="sshpublickey" AdminCredential="$adminCredential" VNetNewOrExisting="new" VNetResourceGroupName="$resourceGroupName" VNetName="neovnet" VNetAddressPrefix="10.0.0.0/16" SubnetName="neovnetsub" SubnetAddressPrefix="10.0.1.0/24" SubnetStartAddress="10.0.1.0" PublicIPNewOrExistingOrNone="new" PublicIPName="neopub" PublicIPAllocationMethod="Dynamic" PublicIPIdleTimeoutInMinutes="10" Neo4jPassword="$dataPassword" ArtifactsBase="https://raw.githubusercontent.com/neo4j/azure-neo4j/master/ha"
```
