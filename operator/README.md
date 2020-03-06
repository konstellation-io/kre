# KRE Operator

- [KRE Operator](#kre-operator)
  - [Description](#description)
  - [Custom Resources](#custom-resources)
  - [Development](#development)
    - [Install operator-sdk](#install-operator-sdk)
    - [Prepare Kubernetes cluster](#prepare-kubernetes-cluster)
    - [Start local operator](#start-local-operator)
  - [References](#references)


## Description

This folder contains code to generate the KRE Operator that follows the [kubernetes operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) 

The KRE Operator will be deployed within the namespace of each Runtime. This is created by the `K8s Manager` service, that is running in the **Engine**.


## Custom Resources

* **Runtime**: This object generates the needed infrastructure containers used by the RuntimeVersions. example: mongo, nats and minio.  

* **RuntimeVersion** (TODO): This object generate all the containers needed to perform the inference of an AI/ML model.


## Development

This operator is handled by the `operator-sdk` and is helm based and the templates are located inside `helm-charts` folder. 

To start the operator for development you need to create all the necessary permissions and then start the operator with the `operator-sdk`. 


### Install operator-sdk

You need to have `operator-sdk` installed on your system to develop this operator. See [operator-sdk helm guide](https://github.com/operator-framework/operator-sdk/blob/master/doc/user/install-operator-sdk.md)

### Prepare Kubernetes cluster

In order to deploy this operator you need to create the following resources in your Kuberentes cluster:

* **CRD (Custom Resource Definition)**

    To add the features of this operator to your cluster need to extend the Kuberentes API, this can be done with
    CRD object. Run the following command to create it.
    
    ```bash
    kubectl create -f deploy/crds/kre.konstellation.io_runtimes_crd.yaml
    ```

* **RBAC (Role Based Access Control)**

    We need to define the required permission within the cluster to perform the requied action. There are a definition 
    of the Roles needed that we have to apply to our **Namemspace**. Following are listed the required commands to create
    the `Role`, `ServiceAccount` and `RoleBinding` objects.

    ```bash
    kubectl create -f deploy/role.yaml
    kubectl create -f deploy/service_account.yaml
    kubectl create -f deploy/role_binding.yaml
    ```


### Start local operator

To start development of the operator follow this steps:


1. Make a symlink to the chart:

    `sudo ln -s $PWD/helm-charts/kre-chart /opt/helm/helm-charts/kre-chart`

2. Start the operator controller locally:

    `operator-sdk up local --namespace SOME_NAMESPACE`

3. Create the CRD on the cluster:

    `kubectl apply -f deploy/crds/kre.konstellation.io_runtimes_crd.yaml`

4. Test the operator by creating a new `Runtime` resource: 

    `kubectl -n SOME_NAMESPACE apply -f deploy/crds/kre.konstellation.io_v1alpha1_runtime_cr.yaml`

5. Now you can check the resources are created inside that namespace

    ```bash
    kubectl -n SOME_NAMESPACE get pods
    # sample output
    NAME          READY   STATUS      RESTARTS   AGE
    kre-minio-0   0/1     Running     0          8s
    kre-mongo-0   1/1     Running     0          8s
    kre-nats-0    1/1     Running     0          8s
    kre-nats-1    1/1     Running     0          8s
    ```


## References

* [Writing Your First Kubernetes Operator](https://medium.com/faun/writing-your-first-kubernetes-operator-8f3df4453234)
* [Operators based on Helm charts | Operators](https://docs.okd.io/latest/operators/osdk-helm.html)

