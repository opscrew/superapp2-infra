# superapp2-infra

Kubernetes manifests deploying [superapp2](../superapp2), with Kustomize. Sample infrastructure repository for OpsCrew: `base/` holds what every environment shares, and `overlays/prod/` what prod sets, such as superapp2's replicas and memory limit in `overlays/prod/resources.yml`, which is what OpsCrew's pull requests change.

```sh
kubectl kustomize overlays/prod   # what prod gets
```

superapp2 takes `NORMAL_MAX_RPS` (3) and `SATURATED_RPS` (6), the request rates where it starts to burn CPU and where it is saturated; its CPU limit is a full core so it can saturate one, and its readiness probe waits up to 10 seconds, so a slow superapp2 stays in its Service.

## Deploying

Argo CD in OpsCrew's preview environment (`deploy/preview/preview.sh` in the OpsCrew repository) watches `overlays/prod` on `main` for the preview's kind cluster, which OpsCrew knows as the Kubernetes Cluster `clu-prod`, but syncs superapp2 only when asked: `deploy/preview/preview.sh sync superapp2`. A merge leaves superapp2 OutOfSync until then. Self-heal is off. The image is `superapp2:dev`, built and loaded into the cluster by `preview.sh apps`.
