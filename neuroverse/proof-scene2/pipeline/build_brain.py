"""Build the Scene 2 proof GLB from the official BodyParts3D 4.0 OBJ files.

Usage: python -I build_brain.py <dir with isa_BP3D_4.0_obj_99/*.obj> <out.glb> <out-anchors.json>

Source: BodyParts3D release 4.0, isa_BP3D_4.0_obj_99.zip (SHA-256 4066585...409e), DBCLS.
Licence and credit lines: see neuroverse/docs/asset-verification.md.

What it does, per region:
  * groups the anatomical element files (gyri, lobes, deep structures) into named regions and
    hemispheres, assigning sided halves by the sign of their centroid on the left-right axis;
  * welds duplicate vertices and computes area-weighted smooth normals (no geometry is moved);
  * stores a cavity term in COLOR_0 (concave sulci darker) derived from local curvature;
  * converts LPS millimetres to three.js axes (x = posterior, y = superior, z = patient left),
    centred on the brain and scaled to decimetres;
  * writes one glTF 2.0 binary with a node per region and a JSON of label anchor points.
"""
import glob, json, os, re, struct, sys
import numpy as np

SRC, OUT, ANCHORS = sys.argv[1], sys.argv[2], sys.argv[3]

REGIONS = [
    # (region id, display name, regex on BodyParts3D English name)
    ('frontal', 'Frontal lobe', r'frontal gyrus|precentral gyrus|^orbital gyrus'),
    ('parietal', 'Parietal lobe', r'postcentral gyrus|supramarginal gyrus|angular gyrus|superior parietal lobule'),
    ('temporal', 'Temporal lobe', r'temporal gyrus|fusiform gyrus'),
    ('occipital', 'Occipital lobe', r'occipital lobe'),
    ('insula', 'Insula', r'^(left|right) insula'),
    ('limbic', 'Cingulate and parahippocampal gyri', r'cingulate gyrus|parahippocampal gyrus'),
    ('whitematter', 'White matter', r'white matter of'),
    ('cerebellum', 'Cerebellum', r'^cerebellum$'),
    ('brainstem', 'Brainstem', r'^(pons|medulla oblongata|midbrain|peduncle of midbrain)$'),
    ('callosum', 'Corpus callosum', r'^corpus callosum$'),
    ('thalamus', 'Thalamus', r'^(left|right) thalamus$'),
    ('fornix', 'Fornix', r'fornix of forebrain'),
    ('basal', 'Basal nuclei', r'caudate nucleus|putamen|globus pallidus'),
    ('hippocampus', 'Hippocampus', r'^(left|right) hippocampus$'),
    ('amygdala', 'Amygdala', r'^(left|right) amygdala$'),
    ('hypothalamus', 'Hypothalamus', r'^hypothalamus$'),
]


def read_obj(path):
    name, V, F = None, [], []
    with open(path, errors='replace') as h:
        for line in h:
            if line.startswith('# English name'):
                name = line.split(':', 1)[1].strip()
            elif line.startswith('v '):
                V.append([float(x) for x in line.split()[1:4]])
            elif line.startswith('f '):
                F.append([int(x.split('/')[0]) - 1 for x in line.split()[1:4]])
    return name, np.array(V, dtype=np.float64), np.array(F, dtype=np.int64)


def weld(V, F):
    key = np.round(V, 4)
    _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    return V[first], inv.reshape(-1)[F]


def normals(V, F):
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])  # area-weighted
    n = np.zeros_like(V)
    for i in range(3):
        np.add.at(n, F[:, i], fn)
    return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)


def cavity(V, F, N):
    # Mean offset of neighbours along the normal: positive when neighbours sit "above" the
    # vertex, i.e. the vertex lies in a concavity (sulcus).
    acc = np.zeros(len(V)); cnt = np.zeros(len(V))
    for a, b in ((0, 1), (1, 2), (2, 0), (1, 0), (2, 1), (0, 2)):
        d = np.einsum('ij,ij->i', V[F[:, b]] - V[F[:, a]], N[F[:, a]])
        np.add.at(acc, F[:, a], d); np.add.at(cnt, F[:, a], 1)
    c = acc / np.maximum(cnt, 1)
    s = np.percentile(np.abs(c), 95) + 1e-9
    return np.clip(1.0 - 0.55 * np.clip(c / s, 0, 1), 0.45, 1.0)  # 1 = open surface, darker in sulci


parts = {}
for path in sorted(glob.glob(os.path.join(SRC, '*.obj'))):
    with open(path, errors='replace') as h:
        head = ''.join(h.readline() for _ in range(12))
    m = re.search(r'# English name : (.*)', head)
    if not m:
        continue
    name = m.group(1).strip()
    for rid, _, rx in REGIONS:
        if re.search(rx, name, re.I):
            parts.setdefault(rid, []).append(path)
            break

# LPS mm -> three: x = posterior (Y), y = superior (Z), z = left (X)
def to_three(V):
    return V[:, [1, 2, 0]]

meshes = []  # (node name, region id, side, positions, normals, colors, indices)
allv = []
for rid, label, _ in REGIONS:
    for side in ('left', 'right', 'mid'):
        Vs, Fs, off = [], [], 0
        for path in parts.get(rid, []):
            name, V, F = read_obj(path)
            # Meshes that cross the midline by more than 2 mm on both sides (corpus callosum,
            # commissure of fornix) form their own group; others go by centroid (left is +X).
            spans = V[:, 0].min() < -2 and V[:, 0].max() > 2
            mesh_side = 'mid' if spans else ('left' if V[:, 0].mean() > 0 else 'right')
            if mesh_side != side:
                continue
            Vs.append(V); Fs.append(F + off); off += len(V)
        if not Vs:
            continue
        V, F = weld(np.concatenate(Vs), np.concatenate(Fs))
        V = to_three(V)
        meshes.append([f'{rid}_{side}', rid, side, V, F])
        allv.append(V)

centre = np.concatenate(allv).mean(0)
scale = 0.01  # mm -> decimetres (brain is about 1.7 units long)
anchors = {}
for m in meshes:
    V = (m[3] - centre) * scale
    F = m[4]
    N = normals(V, F)
    C = cavity(V, F, N)
    m[3] = V.astype(np.float32); m.append(N.astype(np.float32)); m.append(C.astype(np.float32))
    # Label anchor on the visible lateral surface: among vertices facing the viewer side most,
    # take the one closest to the region's centroid in the sagittal plane.
    side_sign = -1.0 if m[2] == 'right' else 1.0
    facing = N[:, 2] * side_sign
    cand = np.where(facing > np.percentile(facing, 85))[0]
    cxy = V[:, :2].mean(0)
    best = cand[np.argmin(np.linalg.norm(V[cand, :2] - cxy, axis=1))]
    anchors[m[0]] = {
        'lateral': [round(float(x), 4) for x in V[best]],
        'centroid': [round(float(x), 4) for x in V.mean(0)],
        'zmax': round(float(V[:, 2].max()), 4),
    }


def pad4(b, fill=b'\0'):
    return b + fill * ((4 - len(b) % 4) % 4)

buf = bytearray(); views = []; accessors = []; gl_meshes = []; nodes = []

def add_view(data, target):
    global buf
    off = len(buf); buf += pad4(data); views.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data), 'target': target})
    return len(views) - 1

for node_name, rid, side, V, F, N, C in meshes:
    pv = add_view(V.tobytes(), 34962)
    accessors.append({'bufferView': pv, 'componentType': 5126, 'count': len(V), 'type': 'VEC3',
                      'min': V.min(0).tolist(), 'max': V.max(0).tolist()})
    pa = len(accessors) - 1
    nv = add_view(N.tobytes(), 34962)
    accessors.append({'bufferView': nv, 'componentType': 5126, 'count': len(N), 'type': 'VEC3'}); na = len(accessors) - 1
    col = np.repeat(C[:, None], 3, axis=1).astype(np.float32)
    cv = add_view(col.tobytes(), 34962)
    accessors.append({'bufferView': cv, 'componentType': 5126, 'count': len(col), 'type': 'VEC3'}); ca = len(accessors) - 1
    iv = add_view(F.astype(np.uint32).tobytes(), 34963)
    accessors.append({'bufferView': iv, 'componentType': 5125, 'count': F.size, 'type': 'SCALAR'}); ia = len(accessors) - 1
    gl_meshes.append({'name': node_name, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na, 'COLOR_0': ca}, 'indices': ia}]})
    nodes.append({'name': node_name, 'mesh': len(gl_meshes) - 1, 'extras': {'region': rid, 'side': side}})

credit = ('BodyParts3D, (c) The Database Center for Life Science licensed under CC Attribution 4.0 '
          'International. Source files state CC Attribution-Share Alike 2.1 Japan; see asset-verification.md. '
          'Modified: regions merged, vertices welded, normals and cavity computed, axes converted.')
gltf = {
    'asset': {'version': '2.0', 'generator': 'neuroverse build_brain.py', 'copyright': credit},
    'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}], 'nodes': nodes, 'meshes': gl_meshes,
    'accessors': accessors, 'bufferViews': views, 'buffers': [{'byteLength': len(buf)}],
}
js = pad4(json.dumps(gltf, separators=(',', ':')).encode(), b' ')
with open(OUT, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(buf)))
    f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
    f.write(struct.pack('<II', len(buf), 0x004E4942)); f.write(bytes(buf))
json.dump({'regions': {r: l for r, l, _ in REGIONS}, 'anchors': anchors}, open(ANCHORS, 'w'), indent=1)
tris = sum(len(m[4]) for m in meshes)
print(f'{len(meshes)} region meshes, {tris} triangles, {os.path.getsize(OUT)/1e6:.2f} MB -> {OUT}')
