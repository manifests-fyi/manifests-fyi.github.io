import * as k8s from "@kubernetes/client-node";

const builtins = {
  "k8s.io": {
    v1: new Set([
      k8s.V1Binding,
      k8s.V1ComponentStatus,
      k8s.V1ConfigMap,
      k8s.V1Endpoints,
      k8s.CoreV1Event,
      k8s.V1LimitRange,
      k8s.V1Namespace,
      k8s.V1Node,
      k8s.V1PersistentVolumeClaim,
      k8s.V1PersistentVolume,
      k8s.V1Pod,
      k8s.V1PodTemplate,
      k8s.V1ReplicationController,
      k8s.V1ResourceQuota,
      k8s.V1Secret,
      k8s.V1ServiceAccount,
      k8s.V1Service,
    ]),
  },
  "admissionregistration.k8s.io": {
    v1: new Set([
      k8s.V1MutatingWebhookConfiguration,
      k8s.V1ValidatingAdmissionPolicy,
      k8s.V1ValidatingAdmissionPolicyBinding,
      k8s.V1ValidatingWebhookConfiguration,
    ]),
  },
  "apiextensions.k8s.io": {
    v1: new Set([
      k8s.V1CustomResourceDefinition,
    ]),
  },
  "apiregistration.k8s.io": {
    v1: new Set([
      k8s.V1APIService,
    ]),
  },
  "apps": {
    v1: new Set([
      k8s.V1ControllerRevision,
      k8s.V1DaemonSet,
      k8s.V1Deployment,
      k8s.V1ReplicaSet,
      k8s.V1StatefulSet,
    ]),
  },
  "authentication.k8s.io": {
    v1: new Set([
      k8s.V1SelfSubjectReview,
      k8s.V1TokenReview,
    ]),
  },
  "authorization.k8s.io": {
    v1: new Set([
      k8s.V1LocalSubjectAccessReview,
      k8s.V1SelfSubjectAccessReview,
      k8s.V1SelfSubjectRulesReview,
      k8s.V1SubjectAccessReview,
    ]),
  },
  "autoscaling": {
    v2: new Set([
      k8s.V2HorizontalPodAutoscaler,
    ]),
  },
  "batch": {
    v1: new Set([
      k8s.V1CronJob,
      k8s.V1Job,
    ]),
  },
  "certificates.k8s.io": {
    v1: new Set([
      k8s.V1CertificateSigningRequest,
    ]),
  },
  "coordinator.k8s.io": {
    v1: new Set([
      k8s.V1Lease,
    ]),
  },
  "discovery.k8s.io": {
    v1: new Set([
      k8s.V1EndpointSlice,
      k8s.V1EndpointSliceList,
    ]),
  },
  "events.k8s.io": {
    v1: new Set([
      k8s.CoreV1Event,
    ]),
  },
  "flowcontrol.apiserver.k8s.io": {
    v1: new Set([
      k8s.V1FlowSchema,
      k8s.V1PriorityLevelConfiguration,
    ]),
  },
  "networking.k8s.io": {
    v1: new Set([
      k8s.V1Ingress,
      k8s.V1IngressClass,
      k8s.V1NetworkPolicy,
    ]),
  },
  "node.k8s.io": {
    v1: new Set([
      k8s.V1RuntimeClass,
    ]),
  },
  "policy": {
    v1: new Set([
      k8s.V1PodDisruptionBudget,
    ]),
  },
  "rbac.authorization.k8s.io": {
    v1: new Set([
      k8s.V1ClusterRole,
      k8s.V1ClusterRoleBinding,
      k8s.V1Role,
      k8s.V1RoleBinding,
    ]),
  },
  "scheduling.k8s.io": {
    v1: new Set([
      k8s.V1PriorityClass,
    ]),
  },
  "storage.k8s.io": {
    v1: new Set([
      k8s.V1CSIDriver,
      k8s.V1CSINode,
      k8s.V1CSIStorageCapacity,
      k8s.V1StorageClass,
      k8s.V1VolumeAttachment,
    ]),
  },
};
