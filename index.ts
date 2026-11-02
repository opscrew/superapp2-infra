import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
// The kube context is required so this program can never land on whatever context kubectl happens to point at.
const kubeContext = config.require("kubeContext");
// The cluster's name as Ops-Crew knows it; written onto the namespace so what runs where is visible from the cluster too.
const cluster = config.require("cluster");
const image = config.get("image") ?? "ghcr.io/opscrew/superapp2:latest";
const memoryLimit = config.get("memoryLimit") ?? "128Mi";
const cpuLimit = config.get("cpuLimit") ?? "1";
// Up to normalMaxRps requests per second superapp2 answers at once; from saturatedRps it burns a full core.
const normalMaxRps = config.get("normalMaxRps") ?? "3";
const saturatedRps = config.get("saturatedRps") ?? "6";
// Each pod counts its own request rate, so more replicas split the load: keep each under normalMaxRps.
const replicas = config.getNumber("replicas") ?? 1;

const provider = new k8s.Provider(cluster, { context: kubeContext });

const ns = new k8s.core.v1.Namespace("superapp2", { metadata: { name: "superapp2", labels: { "ops-crew.io/cluster": cluster } } }, { provider });

const labels = { app: "superapp2" };

const deployment = new k8s.apps.v1.Deployment(
  "superapp2",
  {
    metadata: { name: "superapp2", namespace: ns.metadata.name, labels },
    spec: {
      replicas,
      selector: { matchLabels: labels },
      template: {
        metadata: { labels },
        spec: {
          containers: [
            {
              name: "superapp2",
              image,
              imagePullPolicy: image.startsWith("ghcr.io/") ? "Always" : "IfNotPresent",
              ports: [{ containerPort: 8080, name: "http" }],
              env: [
                { name: "APP_VERSION", value: "1.0.0" },
                { name: "NORMAL_MAX_RPS", value: normalMaxRps },
                { name: "SATURATED_RPS", value: saturatedRps },
              ],
              resources: {
                requests: { cpu: "50m", memory: "32Mi" },
                limits: { cpu: cpuLimit, memory: memoryLimit },
              },
              // Slow is not down: a saturated superapp2 answers its probe late but answers, and stays in its Service.
              readinessProbe: { httpGet: { path: "/healthz", port: "http" }, periodSeconds: 10, timeoutSeconds: 10, failureThreshold: 3 },
            },
          ],
        },
      },
    },
  },
  { provider },
);

const service = new k8s.core.v1.Service(
  "superapp2",
  {
    metadata: { name: "superapp2", namespace: ns.metadata.name, labels },
    spec: { selector: labels, ports: [{ port: 80, targetPort: "http", name: "http" }] },
  },
  { provider },
);

export const namespace = ns.metadata.name;
export const deploymentName = deployment.metadata.name;
export const serviceName = service.metadata.name;
