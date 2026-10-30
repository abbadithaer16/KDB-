"""Fetch and prepare the Scene 3 proof neuron (local use only; outputs are gitignored).

Usage: python3 -I pipeline/prepare_neuron.py <out.json>

Source: NeuroMorpho.Org neuron 290955 (790_Mohan_etal_2015, DeKock archive), downloaded through
the direct file URL that NeuroMorpho's terms of use permit for programmatic access, and checked
against a pinned SHA-256. Licence: CC BY 4.0 (NeuroMorpho.Org terms, read 27 Oct 2026).

What this script changes, and nothing else:
- Rotation so the apical dendrite points up (+y) and translation so the soma is at the origin.
- Polyline simplification of each unbranched section with a 0.5 um tolerance (no point moves
  further than 0.5 um from the recorded path; branch points and tips are kept exactly).
- Computes the signal path: axon start to the deepest axon tip, along recorded points only.
No point is added beyond the recorded data, and no radius is altered.
"""
import hashlib
import json
import math
import sys
import urllib.request
from collections import defaultdict

NEURON_ID = 290955
URL = 'https://neuromorpho.org/dableFiles/dekock/CNG%20version/790_Mohan_etal_2015.CNG.swc'
SHA256 = '9b1aa8278c65868e715dc0de7ed0328ac6fe3286f3675e13e9d29aa539398569'
TOL = 0.5  # um
UA = {'User-Agent': 'Hyperform-NEUROVERSE-proof/1.0 (local scene 3 proof)'}


def fetch():
    data = urllib.request.urlopen(urllib.request.Request(URL, headers=UA), timeout=60).read()
    digest = hashlib.sha256(data).hexdigest()
    if digest != SHA256:
        sys.exit(f'SHA-256 mismatch: {digest}')
    return data.decode()


def parse(text):
    pts = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        i, t, x, y, z, r, p = line.split()[:7]
        pts[int(i)] = dict(t=int(t), p=[float(x), float(y), float(z)], r=float(r), parent=int(p))
    return pts


def sub(a, b): return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
def norm(a):
    n = math.sqrt(sum(c * c for c in a)); return [c / n for c in a]
def cross(a, b): return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
def dot(a, b): return sum(x * y for x, y in zip(a, b))


def rotation_to_y(v):
    """Rotation matrix taking unit vector v onto +y (Rodrigues)."""
    y = [0.0, 1.0, 0.0]
    axis = cross(v, y); s = math.sqrt(dot(axis, axis)); c = dot(v, y)
    if s < 1e-9:
        return [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    k = [a / s for a in axis]
    K = [[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]]
    K2 = [[sum(K[i][m] * K[m][j] for m in range(3)) for j in range(3)] for i in range(3)]
    return [[(1 if i == j else 0) + s * K[i][j] + (1 - c) * K2[i][j] for j in range(3)] for i in range(3)]


def seg_dist(p, a, b):
    ab = sub(b, a); ap = sub(p, a); L = dot(ab, ab)
    t = 0 if L == 0 else max(0, min(1, dot(ap, ab) / L))
    q = [a[i] + ab[i] * t for i in range(3)]
    return math.dist(p, q)


def simplify(chain, P):
    """Douglas-Peucker on a list of point ids; keeps both ends."""
    if len(chain) < 3:
        return chain
    a, b = P[chain[0]]['p'], P[chain[-1]]['p']
    worst, idx = 0, 0
    for k in range(1, len(chain) - 1):
        d = seg_dist(P[chain[k]]['p'], a, b)
        if d > worst:
            worst, idx = d, k
    if worst <= TOL:
        return [chain[0], chain[-1]]
    return simplify(chain[:idx + 1], P)[:-1] + simplify(chain[idx:], P)


def main(out):
    P = parse(fetch())
    kids = defaultdict(list)
    for i, n in P.items():
        if n['parent'] in P:
            kids[n['parent']].append(i)
    soma_ids = [i for i in P if P[i]['t'] == 1]
    soma = P[soma_ids[0]]['p']
    # Orientation: apical dendrite centroid points up.
    ap = [P[i]['p'] for i in P if P[i]['t'] == 4]
    up = norm(sub([sum(c) / len(ap) for c in zip(*ap)], soma))
    R = rotation_to_y(up)
    for n in P.values():
        v = sub(n['p'], soma)
        n['p'] = [sum(R[r][c] * v[c] for c in range(3)) for r in range(3)]

    # Unbranched sections: start at the soma's children or at branch points, end at tips or branches.
    sections = []
    def walk(start):
        stack = [start]
        while stack:
            s = stack.pop()
            chain = [P[s]['parent'], s] if P[s]['parent'] in P and P[P[s]['parent']]['t'] != 1 else [s]
            cur = s
            while len(kids[cur]) == 1:
                cur = kids[cur][0]; chain.append(cur)
            sections.append(chain)
            stack.extend(kids[cur])
    for s in soma_ids:
        for c in kids[s]:
            if P[c]['t'] != 1:
                walk(c)

    # Signal path: axon start to deepest axon tip, along recorded points.
    axon = [i for i in P if P[i]['t'] == 2]
    tips = [i for i in axon if not [c for c in kids[i] if P[c]['t'] == 2]]
    deep = min(tips, key=lambda i: P[i]['p'][1])
    path = [deep]
    while P[path[-1]]['parent'] in P and P[P[path[-1]]['parent']]['t'] == 2:
        path.append(P[path[-1]]['parent'])
    path.reverse()
    on_path = set(path)
    arc = {path[0]: 0.0}
    for a, b in zip(path, path[1:]):
        arc[b] = arc[a] + math.dist(P[a]['p'], P[b]['p'])
    branch_arcs = [arc[i] for i in path if len([c for c in kids[i] if P[c]['t'] == 2]) > 1]

    out_sections, raw_points, kept_points = [], 0, 0
    for chain in sections:
        raw_points += len(chain)
        # Keep path points that sit on this chain exactly (so the signal follows recorded points).
        keep = simplify(chain, P)
        kept_points += len(keep)
        pts = [[round(c, 3) for c in P[i]['p']] + [P[i]['r']] for i in keep]
        arcs = [round(arc[i], 3) if i in on_path else -1 for i in keep]
        if P[chain[0]]['parent'] in P and P[P[chain[0]]['parent']]['t'] == 1:
            # Sections leaving the soma start at the recorded soma centre (inside the soma sphere).
            pts.insert(0, [0.0, 0.0, 0.0, pts[0][3]])
            arcs.insert(0, -1)
        out_sections.append(dict(type=P[chain[-1]]['t'], pts=pts, arc=arcs))
    path_pts = [[round(c, 3) for c in P[i]['p']] for i in path]  # every recorded point: exact length
    data = dict(
        id=NEURON_ID,
        name='790_Mohan_etal_2015',
        soma_radius=P[soma_ids[0]]['r'],
        sections=out_sections,
        path=path_pts,
        path_length=round(arc[path[-1]], 2),
        path_branch_arcs=[round(a, 2) for a in branch_arcs],
        stats=dict(points=raw_points, kept=kept_points, tolerance_um=TOL),
    )
    with open(out, 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    print(json.dumps(dict(path_length_um=data['path_length'], sections=len(out_sections),
                          points=raw_points, kept=kept_points, branch_points_on_path=len(branch_arcs))))


if __name__ == '__main__':
    main(sys.argv[1])
