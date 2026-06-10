export type EntityKind =
  | "customer"
  | "service"
  | "incident"
  | "change"
  | "costCategory"
  | "certificate"
  | "cve";

export type RelationKind =
  | "subscribes"
  | "affects"
  | "targets"
  | "spend-on"
  | "secures"
  | "threatens";

export interface OntologyNode {
  id: string;
  kind: EntityKind;
  label: string;
  status?: string;
  meta: Record<string, string | number>;
}

export interface OntologyEdge {
  from: string;
  to: string;
  kind: RelationKind;
}

export interface OntologyGraph {
  customerId: string;
  nodes: OntologyNode[];
  edges: OntologyEdge[];
}

export interface RelatedEntity {
  node: OntologyNode;
  relation: RelationKind;
  direction: "in" | "out";
}

export interface BlastRadiusEntry {
  node: OntologyNode;
  hops: number;
}

export interface OntologySummary {
  total: number;
  byKind: Partial<Record<EntityKind, number>>;
  edgeCount: number;
}
