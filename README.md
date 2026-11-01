# superapp2-infra

Pulumi program deploying [superapp2](../superapp2) to Kubernetes. Sample IaC repo for Ops-Crew: the memory limit lives in `Pulumi.<stack>.yaml` and `index.ts`, which is what Ops-Crew's pull requests change.

```sh
npm install
export PULUMI_BACKEND_URL=file://$PWD/.pulumi   # local state; or `pulumi login` to your backend
export PULUMI_CONFIG_PASSPHRASE=''
export KUBECONFIG=~/.local/share/opscrew-preview/kubeconfig   # the OpsCrew preview's cluster
pulumi stack select prod --create
pulumi up --yes --refresh
```

Config keys: `kubeContext` (required, pins the cluster), `image`, `memoryLimit`, `cpuLimit`.

## Stacks

One stack, `prod`, deploying to the kind cluster of OpsCrew's preview environment (`deploy/preview/preview.sh` in the OpsCrew repository): context `kind-opscrew-preview` in the preview's own kubeconfig, which OpsCrew knows as the Kubernetes Cluster `clu-prod`. The stack sets `kubeContext`, `cluster`, `image` and `memoryLimit`; the program labels the namespace with `ops-crew.io/cluster`. `--refresh` matters: when the preview cluster is recreated, the local state still lists what the old one had.

## Clusters

The cluster is the OpsCrew preview's; this repository only deploys superapp2 into it.
