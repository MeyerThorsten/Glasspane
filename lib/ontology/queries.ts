import {
  BlastRadiusEntry,
  EntityKind,
  OntologyGraph,
  OntologyNode,
  OntologySummary,
  RelatedEntity,
} from "@/types";

export function getNode(graph: OntologyGraph, id: string): OntologyNode | undefined {
  return graph.nodes.find((n) => n.id === id);
}

export function getNeighbors(graph: OntologyGraph, id: string): RelatedEntity[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const related: RelatedEntity[] = [];
  for (const edge of graph.edges) {
    if (edge.from === id) {
      const node = byId.get(edge.to);
      if (node) related.push({ node, relation: edge.kind, direction: "out" });
    } else if (edge.to === id) {
      const node = byId.get(edge.from);
      if (node) related.push({ node, relation: edge.kind, direction: "in" });
    }
  }
  return related;
}

export function blastRadius(
  graph: OntologyGraph,
  startId: string,
  maxHops = 2
): BlastRadiusEntry[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to]);
    adjacency.set(edge.to, [...(adjacency.get(edge.to) ?? []), edge.from]);
  }

  const visited = new Map<string, number>([[startId, 0]]);
  let frontier = [startId];
  for (let hop = 1; hop <= maxHops && frontier.length > 0; hop++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const neighbor of adjacency.get(id) ?? []) {
        if (!visited.has(neighbor)) {
          visited.set(neighbor, hop);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
  }

  return [...visited.entries()]
    .filter(([id]) => id !== startId)
    .map(([id, hops]) => ({ node: byId.get(id)!, hops }))
    .filter((entry) => entry.node !== undefined)
    .sort((a, b) => a.hops - b.hops || a.node.label.localeCompare(b.node.label));
}

export function findEntities(graph: OntologyGraph, query: string): OntologyNode[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return graph.nodes;
  return graph.nodes.filter(
    (n) =>
      n.label.toLowerCase().includes(needle) ||
      n.kind.toLowerCase().includes(needle) ||
      (n.status ?? "").toLowerCase().includes(needle) ||
      Object.values(n.meta).some((v) => String(v).toLowerCase().includes(needle))
  );
}

export function graphSummary(graph: OntologyGraph): OntologySummary {
  const byKind: Partial<Record<EntityKind, number>> = {};
  for (const node of graph.nodes) {
    byKind[node.kind] = (byKind[node.kind] ?? 0) + 1;
  }
  return { total: graph.nodes.length, byKind, edgeCount: graph.edges.length };
}
