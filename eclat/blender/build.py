"""
ÉCLAT — Blender (bpy 5.2) scene assembly shared by export + render scripts.

Usage (from eclat/blender):
  ~/.bpyenv/bin/python -I export_models.py
  ~/.bpyenv/bin/python -I render_stills.py
"""
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import geo  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

RING_STONE_D = 7.6
PENDANT_STONE_D = 6.4
TENNIS_STONE_D = 3.1


# ----------------------------------------------------------------------------
# scene / materials
# ----------------------------------------------------------------------------
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.scale_length = 0.001
    return sc


def _principled(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    return m, bsdf


def mat_metal(kind="gold"):
    name = {"gold": "metal_gold", "white": "metal_white"}[kind]
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m, b = _principled(name)
    if kind == "gold":
        b.inputs["Base Color"].default_value = (0.96, 0.74, 0.42, 1)
        b.inputs["Roughness"].default_value = 0.11
    else:
        b.inputs["Base Color"].default_value = (0.80, 0.79, 0.77, 1)
        b.inputs["Roughness"].default_value = 0.08
    b.inputs["Metallic"].default_value = 1.0
    return m


def mat_diamond():
    if "diamond" in bpy.data.materials:
        return bpy.data.materials["diamond"]
    m, b = _principled("diamond")
    b.inputs["Base Color"].default_value = (1, 1, 1, 1)
    b.inputs["Metallic"].default_value = 0.0
    b.inputs["Roughness"].default_value = 0.0
    b.inputs["IOR"].default_value = 2.417
    b.inputs["Transmission Weight"].default_value = 1.0
    if "Dispersion" in b.inputs:
        b.inputs["Dispersion"].default_value = 0.055  # ~ 1/Abbe(55) scaled
    return m


def mat_velvet():
    if "velvet" in bpy.data.materials:
        return bpy.data.materials["velvet"]
    m, b = _principled("velvet")
    b.inputs["Base Color"].default_value = (0.012, 0.011, 0.010, 1)
    b.inputs["Roughness"].default_value = 0.85
    b.inputs["Sheen Weight"].default_value = 0.6
    b.inputs["Sheen Roughness"].default_value = 0.35
    b.inputs["Sheen Tint"].default_value = (0.55, 0.48, 0.40, 1)
    return m


def make_obj(name, verts, faces, mat, smooth=True, parent=None, coll=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], [list(f) for f in faces])
    me.validate(clean_customdata=False)
    me.update()
    if smooth:
        me.shade_smooth()
    else:
        me.shade_flat()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    (coll or bpy.context.scene.collection).objects.link(ob)
    if parent is not None:
        ob.parent = parent
    return ob


def instance(name, mesh, matrix, parent=None, coll=None):
    ob = bpy.data.objects.new(name, mesh)
    (coll or bpy.context.scene.collection).objects.link(ob)
    if parent is not None:
        ob.parent = parent
    ob.matrix_world = matrix if parent is None else parent.matrix_world.inverted() @ matrix
    return ob


def empty(name, coll=None, loc=(0, 0, 0)):
    e = bpy.data.objects.new(name, None)
    e.location = loc
    (coll or bpy.context.scene.collection).objects.link(e)
    return e


def frame_matrix(pos, x, z):
    x = np.asarray(x, float)
    x = x / np.linalg.norm(x)
    z = np.asarray(z, float)
    z = z - np.dot(z, x) * x
    z /= np.linalg.norm(z)
    y = np.cross(z, x)
    m = Matrix((
        (x[0], y[0], z[0], pos[0]),
        (x[1], y[1], z[1], pos[1]),
        (x[2], y[2], z[2], pos[2]),
        (0, 0, 0, 1),
    ))
    return m


def new_collection(name):
    c = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(c)
    return c


# ----------------------------------------------------------------------------
# RING
# ----------------------------------------------------------------------------
def build_ring(metal="gold", coll=None):
    coll = coll or new_collection("Ring")
    root = empty("Ring", coll)
    D = RING_STONE_D
    v, f, info = geo.brilliant(D=D)
    info_mm = info
    ri = 8.5
    band_top = ri + 1.9
    gz = band_top - info["culet_z"] + 0.35
    v = v + np.array([0, 0, gz])
    make_obj("ring_diamond", v, f, mat_diamond(), smooth=False, parent=root, coll=coll)

    mb = geo.MeshBuilder()
    mb.extend(*geo.ring_band(ri=ri))
    mb.extend(*geo.solitaire_head(info_mm, gz, ri=ri))
    mv, mf = mb.result()
    make_obj("ring_metal", mv, mf, mat_metal(metal), smooth=True, parent=root, coll=coll)
    return root, dict(girdle_z=gz, table_z=gz + info["table_z"], stone_r=D / 2)


# ----------------------------------------------------------------------------
# NECKLACE (on display bust)
# ----------------------------------------------------------------------------
def flat_necklace_curve(n=1400, scale=1.0, z=0.0, rot=0.0):
    """Loose teardrop loop lying on a surface; pendant at the origin (tip), chain loops away (+Y)."""
    pts, fu = [], []
    for i in range(n):
        t = 0.06 + (math.tau - 0.12) * i / (n - 1)
        x = 40 * math.sin(t) * (1 - 0.3 * math.cos(t)) + 6 * math.sin(2 * t) * (1 - math.cos(t)) / 2
        y = 70 * (1 - math.cos(t)) / 2 + 10 * math.sin(t) ** 2
        c, s = math.cos(rot), math.sin(rot)
        pts.append((scale * (x * c - y * s), scale * (x * s + y * c), z))
        fu.append(max(0.0, 1 - min(t, math.tau - t) / 0.5))
    pts = np.array(pts)
    nrm = np.tile(np.array([0, 0, 1.0]), (n, 1))
    return pts, nrm, np.array(fu)


def build_necklace(metal="gold", coll=None, with_bust=True, z_front=-44.0, z_back=30.0, flat=None):
    """flat: None (on bust) or dict(rot=..., z=...) to lay it flat with the pendant at the origin."""
    coll = coll or new_collection("Necklace")
    root = empty("Necklace", coll)
    if with_bust and flat is None:
        bv, bf = geo.bust_surface()
        make_obj("bust", bv, bf, mat_velvet(), smooth=True, parent=root, coll=coll)

    D = PENDANT_STONE_D
    dv, df, info = geo.brilliant(D=D)
    hv, hf, loops = geo.pendant_head(info)
    back_depth = -info["culet_z"] + 0.65   # basket button sits on the chest

    # pendant frame on the bust at phi=0 (or flat on a surface)
    if flat is None:
        p0 = geo.bust_point(0.0, z_front)
        n0 = geo.bust_normal(0.0, z_front)
        side = np.array([1.0, 0, 0])
    else:
        p0 = np.array([0, 0, flat.get("z", 0.0)])
        n0 = np.array([0, 0, 1.0])
        r = flat.get("rot", 0.0)
        side = np.array([math.cos(r), math.sin(r), 0])
    side = side - np.dot(side, n0) * n0
    side /= np.linalg.norm(side)
    pc = p0 + n0 * back_depth
    M = frame_matrix(pc, side, n0)
    M_np = np.array(M)

    def to_world(p):
        q = M_np @ np.array([p[0], p[1], p[2], 1.0])
        return q[:3]

    dvw = np.array([to_world(p) for p in dv])
    hvw = np.array([to_world(p) for p in hv])
    make_obj("pendant_diamond", dvw, df, mat_diamond(), smooth=False, parent=root, coll=coll)
    make_obj("pendant_metal", hvw, hf, mat_metal(metal), smooth=True, parent=root, coll=coll)
    loops_w = [to_world(l) for l in loops]  # [left(-x), right(+x)]

    # chain path along the bust: right loop → neck → back → neck → left loop
    if flat is None:
        pts, nrm, fu = geo.necklace_drape(z_front=z_front, z_back=z_back)
    else:
        pts, nrm, fu = flat_necklace_curve(z=flat.get("z", 0.0), rot=flat.get("rot", 0.0))
    off_base = 0.72
    lx = abs(float(np.dot(loops_w[1] - pc, side))) + 1.2
    keep = [i for i in range(len(pts)) if abs(float(np.dot(pts[i] - pc, side))) > lx or fu[i] < 0.5]
    path = []
    for i in keep:
        loop = loops_w[1] if float(np.dot(pts[i] - pc, side)) > 0 else loops_w[0]
        w = max(0.0, (fu[i] - 0.82) / 0.18) ** 1.6
        loop_off = float(np.dot(loop - pts[i], nrm[i]))
        off = off_base + max(0.0, loop_off - off_base) * w
        path.append(pts[i] + nrm[i] * off)
    path = [loops_w[1]] + path + [loops_w[0]]
    path = geo.catmull(geo.resample(np.array(path), 220), samples=2200)

    link_v, link_f = geo.cable_link()
    link_me = bpy.data.meshes.new("chain_link")
    link_me.from_pydata([tuple(p) for p in link_v], [], link_f)
    link_me.shade_smooth()
    link_me.materials.append(mat_metal(metal))
    chain_root = empty("chain", coll)
    chain_root.parent = root
    xf = geo.chain_transforms(path, pitch=1.5)
    # clasp at the back: the links nearest phi = pi are replaced
    back_i = int(np.argmax([np.linalg.norm(p - pc) for p, _, _ in xf]))
    clasp_skip = set(range(back_i - 2, back_i + 3))
    for i, (pos, x, y) in enumerate(xf):
        if i in clasp_skip:
            continue
        z = np.cross(x, y)
        instance("link_%03d" % i, link_me, frame_matrix(pos, x, z), parent=chain_root, coll=coll)

    # spring-ring clasp + end tag
    pos, x, y = xf[back_i]
    z = np.cross(x, y)
    mb = geo.MeshBuilder()
    cl_v, cl_f = geo.tube(geo.torus_path(1.55, (0, 0, 0), 64), 0.42, seg=12, closed=True)
    mb.extend(cl_v + np.array([-1.0, 0, 0]), cl_f)
    lever, lf = geo.tube([(-1.0 - 0.6, 1.45, 0), (-1.0 + 0.2, 1.62, 0)], 0.22, seg=8)
    mb.extend(lever, lf)
    tag_pts = []
    for k in range(64):
        a = math.tau * k / 64
        tag_pts.append((2.7 + 1.5 * math.cos(a), 0, 0.95 * math.sin(a)))
    mb.extend(*geo.tube(tag_pts, 0.3, seg=10, closed=True))
    mb.extend(*geo.tube(geo.torus_path(0.75, (0.75, 0, 0), 40, axis="y"), 0.16, seg=8, closed=True))
    cv, cf = mb.result()
    Mc = np.array(frame_matrix(pos, x, z))
    cvw = np.array([(Mc @ np.array([*p, 1.0]))[:3] for p in cv])
    make_obj("chain_clasp", cvw, cf, mat_metal(metal), smooth=True, parent=root, coll=coll)
    return root, dict(pendant_center=pc, pendant_normal=n0)


# ----------------------------------------------------------------------------
# BRACELET
# ----------------------------------------------------------------------------
def worn_path(a=29.5, b=25.0, n=2000):
    """Vertical oval in the XZ plane (axis = Y). Returns pts, outward normals."""
    t = np.linspace(0, math.tau, n, endpoint=False)
    pts = np.stack([a * np.sin(t), np.zeros_like(t), b * np.cos(t)], 1)
    nr = np.stack([np.sin(t) / a, np.zeros_like(t), np.cos(t) / b], 1)
    nr /= np.linalg.norm(nr, axis=1, keepdims=True)
    return pts, nr


def flat_path(a=33.0, b=21.0, n=2400):
    """Bracelet laid flat, stones facing up (+Z): a relaxed oval."""
    t = np.linspace(0, math.tau, n, endpoint=False)
    x = a * np.cos(t) + 2.2 * np.cos(3 * t)
    y = b * np.sin(t) + 1.6 * np.sin(2 * t)
    pts = np.stack([x, y, np.zeros_like(x)], 1)
    nrm = np.tile(np.array([0, 0, 1.0]), (n, 1))
    return pts, nrm


def build_bracelet(metal="gold", coll=None, path_fn=None, n_slots=44):
    coll = coll or new_collection("Bracelet")
    root = empty("Bracelet", coll)
    pts, nrm = (path_fn or worn_path)()
    # arc-length positions
    P = np.vstack([pts, pts[:1]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    total = s[-1]
    pitch = total / n_slots

    D = TENNIS_STONE_D
    dv, df, info = geo.brilliant(D=D)
    sv, sf, gz = geo.tennis_setting(info, half=1.5)
    # hinge pieces scaled to pitch
    hb = geo.MeshBuilder()
    hb.extend(sv, sf)
    for yy in (-0.62, 0.62):
        hb.extend(*geo.tube([(1.0, yy, 0.55), (pitch / 2, yy, 0.55)], 0.17, seg=8))
    hb.extend(*geo.tube([(pitch / 2, -0.95, 0.55), (pitch / 2, 0.95, 0.55)], 0.2, seg=10))
    hb.extend(*geo.tube([(-1.0, 0, 0.55), (-pitch / 2, 0, 0.55)], 0.2, seg=8))
    sv, sf = hb.result()
    # strip the original hinge-from-geo (kept small; harmless overlap)
    set_me = bpy.data.meshes.new("tennis_setting")
    set_me.from_pydata([tuple(p) for p in sv], [], sf)
    set_me.shade_smooth()
    set_me.materials.append(mat_metal(metal))
    dia_me = bpy.data.meshes.new("tennis_diamond")
    dia_me.from_pydata([tuple(p + np.array([0, 0, gz])) for p in dv], [], df)
    dia_me.shade_flat()
    dia_me.materials.append(mat_diamond())

    settings = empty("settings", coll)
    settings.parent = root
    stones = empty("stones", coll)
    stones.parent = root

    def at(sv_):
        sv_ = sv_ % total
        i = np.searchsorted(s, sv_) - 1
        i = max(0, min(i, len(pts) - 1))
        u = (sv_ - s[i]) / max(seg[i], 1e-9)
        p = pts[i] * (1 - u) + pts[(i + 1) % len(pts)] * u
        nn = nrm[i] * (1 - u) + nrm[(i + 1) % len(pts)] * u
        nn /= np.linalg.norm(nn)
        tng = pts[(i + 1) % len(pts)] - pts[i]
        return p, tng, nn

    clasp_slot = 0  # occupies slots 0 and 1
    for k in range(n_slots):
        if k in (clasp_slot, clasp_slot + 1):
            continue
        p, tng, nn = at((k + 0.5) * pitch)
        M = frame_matrix(p, tng, nn)
        instance("setting_%02d" % k, set_me, M, parent=settings, coll=coll)
        instance("stone_%02d" % k, dia_me, M, parent=stones, coll=coll)

    # box clasp spanning two slots
    p, tng, nn = at((clasp_slot + 1.0) * pitch)
    mb = geo.MeshBuilder()
    mb.extend(*geo.superellipsoid(pitch * 0.96, 1.75, 1.15, e=0.22, center=(0, 0, 1.35)))
    mb.extend(*geo.tube([(-pitch * 0.55, 1.9, 1.0), (pitch * 0.45, 1.95, 1.25)], 0.26, seg=10))
    mb.extend(*geo.sphere((pitch * 0.45, 1.95, 1.25), 0.34, seg=12, rings=8))
    mb.extend(*geo.tube([(-pitch * 0.9, -0.85, 1.35), (pitch * 0.9, -0.85, 1.35)], 0.09, seg=6))
    mb.extend(*geo.tube([(-pitch * 0.9, 0.85, 1.35), (pitch * 0.9, 0.85, 1.35)], 0.09, seg=6))
    for yy in (-0.62, 0.62):
        mb.extend(*geo.tube([(pitch * 0.85, yy, 0.55), (pitch, yy, 0.55)], 0.17, seg=8))
    mb.extend(*geo.tube([(-pitch * 0.85, 0, 0.55), (-pitch, 0, 0.55)], 0.2, seg=8))
    cv, cf = mb.result()
    Mc = np.array(frame_matrix(p, tng, nn))
    cvw = np.array([(Mc @ np.array([*q, 1.0]))[:3] for q in cv])
    make_obj("bracelet_clasp", cvw, cf, mat_metal(metal), smooth=True, parent=root, coll=coll)
    return root, dict(pitch=pitch, total=total)


# ----------------------------------------------------------------------------
# Studio HDRI (self-made, equirectangular)
# ----------------------------------------------------------------------------
def emissive_plane(name, size, loc, look_at, strength, color=(1, 1, 1), falloff=0.0):
    """Emissive card. falloff>0 gives a soft radial gradient (softbox diffusion)."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0], size[1], 1)
    d = Vector(look_at) - Vector(loc)
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    m = bpy.data.materials.new(name + "_mat")
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    em.inputs["Strength"].default_value = strength
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    if falloff > 0:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Location"].default_value = (-1, -1, 0)
        mp.inputs["Scale"].default_value = (2, 2, 1)
        gr = nt.nodes.new("ShaderNodeTexGradient")
        gr.gradient_type = "QUADRATIC_SPHERE"
        pw = nt.nodes.new("ShaderNodeMath")
        pw.operation = "POWER"
        pw.inputs[1].default_value = falloff
        mul = nt.nodes.new("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        mul.inputs[1].default_value = strength
        nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
        nt.links.new(mp.outputs[0], gr.inputs["Vector"])
        nt.links.new(gr.outputs["Fac"], pw.inputs[0])
        nt.links.new(pw.outputs[0], mul.inputs[0])
        nt.links.new(mul.outputs[0], em.inputs["Strength"])
    nt.links.new(em.outputs[0], out.inputs[0])
    ob.data.materials.append(m)
    return ob


def make_gem_hdri(path, w=1024, h=512):
    """Light-tent environment used only for the diamonds' refraction lookups on the web:
    a bright diffuse dome broken by alternating white and black strips (the 'zebra' set-up
    jewellery photographers use to give stones crisp contrast)."""
    sc = reset()
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.11, 0.105, 0.1, 1)
    sc.world = world
    warm = (1.0, 0.96, 0.9)
    cool = (0.95, 0.97, 1.0)
    # zenith: radial "petal" softboxes around a black disc (the camera's own reflection)
    for i in range(10):
        a = math.tau * i / 10
        loc = (2.6 * math.cos(a), 2.6 * math.sin(a), 6.0)
        ob = emissive_plane("petal%d" % i, (0.9, 2.6), loc, (loc[0] * 0.5, loc[1] * 0.5, 0), 7.0 if i % 2 else 3.5, warm)
        ob.rotation_euler.rotate_axis("Z", a)
    emissive_plane("eye", (1.5, 1.5), (0, 0, 5.8), (0, 0, 0), 0.0, (0, 0, 0))
    # a scatter of small panels over the upper hemisphere — every facet finds a light
    import random
    rnd = random.Random(7)
    for i in range(70):
        az = rnd.uniform(0, math.tau)
        el = rnd.uniform(0.15, 1.25)
        r = 5.6
        loc = (r * math.cos(el) * math.cos(az), r * math.cos(el) * math.sin(az), 0.5 + r * math.sin(el))
        s = rnd.uniform(0.12, 0.55)
        emissive_plane("p%d" % i, (s, s * rnd.uniform(0.6, 2.4)), loc, (0, 0, 0.5), rnd.choice([3.0, 6.0, 12.0, 25.0]), warm if i % 3 else cool)
    # zebra ring around the horizon: bright strips alternating with black flags
    n = 18
    for i in range(n):
        a = math.tau * i / n
        r = 5.0
        loc = (r * math.cos(a), r * math.sin(a), 1.0)
        if i % 2 == 0:
            emissive_plane("w%d" % i, (0.55, 5.5), loc, (0, 0, 1.0), 7.0, warm if i % 4 else cool)
        else:
            emissive_plane("b%d" % i, (0.45, 6.0), loc, (0, 0, 1.0), 0.0, (0, 0, 0))
    # black ceiling ring between dome and strips
    for i in range(8):
        a = math.tau * i / 8 + 0.2
        emissive_plane("cb%d" % i, (1.4, 2.6), (3.6 * math.cos(a), 3.6 * math.sin(a), 4.2), (0, 0, 0), 0.0, (0, 0, 0))
    for i in range(12):
        a = math.tau * i / 12 + 0.4
        emissive_plane("k%d" % i, (0.18, 0.18), (4.6 * math.cos(a), 4.6 * math.sin(a), 3.4), (0, 0, 0), 70.0, warm)
    emissive_plane("floor", (14, 14), (0, 0, -3), (0, 0, 0), 0.25, (1.0, 0.93, 0.84), falloff=0.4)
    cam_d = bpy.data.cameras.new("pano")
    cam_d.type = "PANO"
    cam_d.panorama_type = "EQUIRECTANGULAR"
    cam = bpy.data.objects.new("pano", cam_d)
    sc.collection.objects.link(cam)
    cam.location = (0, 0, 0.5)
    cam.rotation_euler = (math.radians(90), 0, 0)
    sc.camera = cam
    setup_cycles(sc, samples=16, w=w, h=h, denoise=False)
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.image_settings.file_format = "HDR"
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def setup_cycles(sc, samples=128, w=1600, h=1000, denoise=True):
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = denoise
    sc.cycles.max_bounces = 24
    sc.cycles.transmission_bounces = 24
    sc.cycles.glossy_bounces = 12
    sc.cycles.diffuse_bounces = 3
    sc.cycles.transparent_max_bounces = 16
    sc.cycles.caustics_reflective = True
    sc.cycles.caustics_refractive = True
    sc.cycles.blur_glossy = 0.4
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.render.threads_mode = "AUTO"


def make_studio_hdri(path, w=2048, h=1024):
    sc = reset()
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0, 0.0, 0.0, 1)
    sc.world = world
    warm = (1.0, 0.92, 0.82)
    neutral = (1.0, 0.97, 0.94)
    cool = (0.92, 0.96, 1.0)
    # overhead softbox (diffused) + crisp inner panel
    emissive_plane("top", (7, 4.5), (0, 0.6, 8), (0, 0, 0), 7.0, neutral, falloff=0.8)
    emissive_plane("topCore", (2.2, 1.2), (0, 0.6, 7.9), (0, 0, 0), 16.0, neutral)
    # large gradient side panels (give gold its rich falloff)
    emissive_plane("sideL", (9, 9), (-6.0, 1.0, 1.5), (0, 0, 1), 3.0, cool, falloff=0.9)
    emissive_plane("sideR", (8, 9), (5.8, -1.5, 1.5), (0, 0, 1), 2.6, warm, falloff=0.9)
    emissive_plane("back", (10, 5), (0, 7.5, 1.0), (0, 0, 1), 0.8, warm, falloff=1.0)
    # crisp vertical strips (diamond contrast)
    emissive_plane("stripL", (0.45, 6), (-5.5, -3.8, 2.2), (0, 0, 1), 18.0, cool)
    emissive_plane("stripR", (0.45, 6), (5.0, 4.2, 2.5), (0, 0, 1), 16.0, warm)
    emissive_plane("stripB", (0.4, 5), (-1.5, 8, 3), (0, 0, 1), 12.0, neutral)
    # small hard keys (scintillation)
    emissive_plane("key", (0.45, 0.45), (3, -5.5, 6), (0, 0, 0), 140.0, warm)
    emissive_plane("key2", (0.3, 0.3), (-4.5, -3.5, 4.5), (0, 0, 0), 110.0, cool)
    emissive_plane("key3", (0.25, 0.25), (1.5, 6, 5.5), (0, 0, 0), 90.0, neutral)
    # broad low front fill
    emissive_plane("fill", (11, 4), (0, -7.5, 0.4), (0, 0, 1), 1.6, warm, falloff=0.8)
    # floor bounce (very dim, warm)
    emissive_plane("floor", (14, 14), (0, 0, -4), (0, 0, 0), 0.05, (1.0, 0.85, 0.68), falloff=0.5)
    cam_d = bpy.data.cameras.new("pano")
    cam_d.type = "PANO"
    cam_d.panorama_type = "EQUIRECTANGULAR"
    cam = bpy.data.objects.new("pano", cam_d)
    sc.collection.objects.link(cam)
    cam.location = (0, 0, 0.5)
    cam.rotation_euler = (math.radians(90), 0, 0)
    sc.camera = cam
    setup_cycles(sc, samples=16, w=w, h=h, denoise=False)
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.image_settings.file_format = "HDR"
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
