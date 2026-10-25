# superapp2-infra

Pulumi program deploying [superapp2](../superapp2) to Kubernetes. Sample IaC repo for Ops-Crew: the memory limit lives in `Pulumi.<stack>.yaml` and `index.ts`, which is what Ops-Crew's pull requests change.

```sh
npm install
export PULUMI_BACKEND_URL=file://$PWD/.pulumi   # local state; or `pulumi login` to your backend
export PULUMI_CONFIG_PASSPHRASE=''
pulumi stack select dev --create
pulumi up --yes
```

Config keys: `kubeContext` (required, pins the cluster), `image`, `memoryLimit`, `cpuLimit`.

## Stacks

One stack per cluster: `prod` deploys to `kind-clu-prod` (cluster `clu-prod`), `dev` to `kind-clu-dev` (cluster `clu-dev`). Each stack sets `kubeContext`, `cluster`, `image` and `memoryLimit`; the program labels the namespace with `ops-crew.io/cluster`.

## Clusters

The Kubernetes Clusters are defined in `superapp-infra/clusters/`; this repository only deploys superapp2 into them.
