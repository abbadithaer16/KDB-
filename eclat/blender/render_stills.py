"""
ÉCLAT — editorial still-life renders (Cycles, path traced) of the same models used on the web.

  ~/.bpyenv/bin/python -I render_stills.py <shot> [--draft]

All imagery produced here is original (our geometry, our lighting) — no third-party rights.
"""
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build  # noqa: E402
import geo  # noqa: E402

OUT = os.path.join(build.ROOT, "assets-src", "stills")
os.makedirs(OUT, exist_ok=True)
HDR = os.path.join(build.ROOT, "assets-src", "studio.hdr")
GEM_HDR = os.path.join(build.ROOT, "assets-src", "gems.hdr")


# ----------------------------------------------------------------------------
def world(strength=1.0, rot_z=0.0, bg=(0.0, 0.0, 0.0), gem_boost=1.6):
    sc = bpy.context.scene
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    nt = w.node_tree
    bgn = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0, 0, rot_z)
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(HDR)
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
    nt.links.new(mp.outputs[0], env.inputs["Vector"])
    nt.links.new(env.outputs[0], bgn.inputs[0])
    bgn.inputs[1].default_value = strength
    # rays that have passed through a stone see the gem light-tent (jewellery-render practice,
    # identical to the web build) — metals and surfaces keep the dark studio
    gem_env = nt.nodes.new("ShaderNodeTexEnvironment")
    gem_env.image = bpy.data.images.load(GEM_HDR)
    nt.links.new(mp.outputs[0], gem_env.inputs["Vector"])
    gem_bg = nt.nodes.new("ShaderNodeBackground")
    gem_bg.inputs[1].default_value = strength * gem_boost
    nt.links.new(gem_env.outputs[0], gem_bg.inputs[0])
    lp0 = nt.nodes.new("ShaderNodeLightPath")
    mix0 = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp0.outputs["Is Transmission Ray"], mix0.inputs[0])
    nt.links.new(bgn.outputs[0], mix0.inputs[1])
    nt.links.new(gem_bg.outputs[0], mix0.inputs[2])
    # camera rays see a dark backdrop instead of the softboxes
    lp = nt.nodes.new("ShaderNodeLightPath")
    dark = nt.nodes.new("ShaderNodeBackground")
    dark.inputs[0].default_value = (*bg, 1)
    mix = nt.nodes.new("ShaderNodeMixShader")
    out = nt.nodes["World Output"]
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs[0])
    nt.links.new(mix0.outputs[0], mix.inputs[1])
    nt.links.new(dark.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    sc.world = w


def camera(loc, target, lens=100, fstop=4.0, focus=None, sensor=36, shift=(0, 0)):
    sc = bpy.context.scene
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens
    cd.sensor_width = sensor
    cd.clip_start = 1
    cd.clip_end = 20000
    cd.shift_x, cd.shift_y = shift
    cam = bpy.data.objects.new("cam", cd)
    sc.collection.objects.link(cam)
    cam.location = loc
    cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = (Vector(focus or target) - Vector(loc)).length  # scene units (mm)
        cd.dof.aperture_blades = 7
        cd.dof.aperture_rotation = 0.3
    sc.camera = cam
    return cam


def area(name, loc, target, size, power, color=(1, 0.95, 0.88), spread=180, shape="RECTANGLE", size_y=None):
    ld = bpy.data.lights.new(name, "AREA")
    ld.shape = shape
    ld.size = size
    if size_y:
        ld.size_y = size_y
    d = (Vector(target) - Vector(loc)).length
    ld.energy = power * math.pi * d * d   # power = irradiance at target relative to HDRI
    ld.color = color
    ld.spread = math.radians(spread)
    ob = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return ob


def spot(name, loc, target, power, size_deg=14, blend=0.6, radius=8, color=(1, 0.9, 0.78)):
    ld = bpy.data.lights.new(name, "SPOT")
    d = (Vector(target) - Vector(loc)).length
    ld.energy = power * 4 * math.pi * d * d
    ld.spot_size = math.radians(size_deg)
    ld.spot_blend = blend
    ld.shadow_soft_size = radius
    ld.color = color
    ob = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return ob


def slate(size=900, z=0.0, tone=0.007, gloss=0.5):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z))
    ob = bpy.context.active_object
    ob.name = "slate"
    m = bpy.data.materials.new("slate")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n1 = nt.nodes.new("ShaderNodeTexNoise")
    n1.inputs["Scale"].default_value = 9.0
    n1.inputs["Detail"].default_value = 12
    n1.inputs["Roughness"].default_value = 0.62
    n2 = nt.nodes.new("ShaderNodeTexNoise")
    n2.inputs["Scale"].default_value = 260.0
    n2.inputs["Detail"].default_value = 4
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (tone * 0.6, tone * 0.57, tone * 0.54, 1)
    ramp.color_ramp.elements[1].color = (tone * 1.6, tone * 1.5, tone * 1.38, 1)
    rr = nt.nodes.new("ShaderNodeMapRange")
    rr.inputs["To Min"].default_value = gloss
    rr.inputs["To Max"].default_value = gloss + 0.3
    b.inputs["Specular IOR Level"].default_value = 0.12
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.18
    bump.inputs["Distance"].default_value = 0.05
    nt.links.new(tc.outputs["Object"], n1.inputs["Vector"])
    nt.links.new(tc.outputs["Object"], n2.inputs["Vector"])
    nt.links.new(n1.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(n1.outputs["Fac"], rr.inputs["Value"])
    nt.links.new(rr.outputs["Result"], b.inputs["Roughness"])
    nt.links.new(n2.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    # scale noise to mm-sized object coordinates
    for n in (n1, n2):
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (0.004, 0.004, 0.004)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        nt.links.new(mp.outputs[0], n.inputs["Vector"])
    ob.data.materials.append(m)
    return ob


def silk_height(x, y):
    r = math.hypot(x, y)
    amp = 16.0 * min(1.0, max(0.0, (r - 46) / 70)) ** 1.3
    return amp * (0.6 * math.sin(0.045 * x + 0.03 * y + 0.4) + 0.4 * math.sin(0.021 * x - 0.06 * y + 1.7)
                  + 0.25 * math.sin(0.09 * y - 0.02 * x))


def silk(size=700, res=360, tint=(0.016, 0.0145, 0.014)):
    verts, faces = [], []
    for i in range(res + 1):
        for j in range(res + 1):
            x = -size / 2 + size * i / res
            y = -size / 2 + size * j / res
            verts.append((x, y, silk_height(x, y)))
    for i in range(res):
        for j in range(res):
            a = i * (res + 1) + j
            faces.append((a, a + res + 1, a + res + 2, a + 1))
    me = bpy.data.meshes.new("silk")
    me.from_pydata(verts, [], faces)
    me.shade_smooth()
    m = bpy.data.materials.new("silk")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*tint, 1)
    b.inputs["Roughness"].default_value = 0.34
    b.inputs["Anisotropic"].default_value = 0.75
    b.inputs["Sheen Weight"].default_value = 0.35
    b.inputs["Sheen Roughness"].default_value = 0.4
    b.inputs["Sheen Tint"].default_value = (0.6, 0.55, 0.5, 1)
    b.inputs["Specular IOR Level"].default_value = 0.45
    me.materials.append(m)
    ob = bpy.data.objects.new("silk", me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def flat_bracelet_path(a=33.0, b=21.0, rot=0.0, n=2400, cx=0.0, cy=0.0):
    t = np.linspace(0, math.tau, n, endpoint=False)
    x = a * np.cos(t) + 2.2 * np.cos(3 * t)
    y = b * np.sin(t) + 1.6 * np.sin(2 * t)
    c, s = math.cos(rot), math.sin(rot)
    X = cx + x * c - y * s
    Y = cy + x * s + y * c
    Z = np.array([silk_height(xx, yy) for xx, yy in zip(X, Y)]) if SURFACE == "silk" else np.zeros_like(X)
    pts = np.stack([X, Y, Z], 1)
    nrm = np.tile(np.array([0, 0, 1.0]), (n, 1))
    return pts, nrm


SURFACE = "slate"


def render(name, w, h, samples, draft):
    sc = bpy.context.scene
    if draft:
        w, h, samples = w // 3, h // 3, 24
    samples = min(samples, int(os.environ.get("MAXS", 100000)))
    build.setup_cycles(sc, samples=samples, w=w, h=h)
    sc.cycles.adaptive_threshold = 0.012
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "8"
    sc.render.filepath = os.path.join(OUT, ("draft_" if draft else "") + name + ".png")
    bpy.ops.render.render(write_still=True)
    print("WROTE", sc.render.filepath)


def place(root, loc=(0, 0, 0), rot=(0, 0, 0)):
    root.location = loc
    root.rotation_euler = rot


# ----------------------------------------------------------------------------
# shots
# ----------------------------------------------------------------------------
def shot_campaign(draft, portrait=False):
    """Ring standing on slate, pool of warm light, macro, shallow DoF."""
    build.reset()
    world(0.55, rot_z=0.6)
    slate()
    ring, info = build.build_ring("gold")
    lift = 8.5 - 0.0  # ring rests on the band's lowest point (inner r 8.5 + band 1.45)
    place(ring, (0, 0, 8.5 + 1.45), (0, 0, math.radians(-28)))
    spot("pool", (40, -60, 260), (0, 0, 6), 5.0, size_deg=11, blend=0.75, radius=10)
    area("rim", (-90, 120, 40), (0, 0, 12), 60, 1.1, color=(1, 0.92, 0.82))
    area("kick", (120, 40, 20), (0, 0, 12), 30, 0.7, color=(0.9, 0.95, 1.0))
    # warm bounce card in front of the ring — gives the band a rich gold gradient
    area("card", (-30, -150, 24), (0, 0, 10), 110, 0.55, color=(1.0, 0.86, 0.66), size_y=50)
    if portrait:
        camera((0, -118, 74), (0, 0, 13), lens=100, fstop=2.8, focus=(0, -3, 20), sensor=24)
        render("campaign_portrait", 1080, 1920, 256, draft)
    else:
        camera((26, -150, 40), (-12, 0, 14), lens=100, fstop=2.8, focus=(0, -3, 20))
        render("campaign", 2400, 1350, 224, draft)


def shot_worn(draft):
    """Necklace on the velvet display bust — portrait."""
    build.reset()
    world(0.9, rot_z=0.4)
    build.build_necklace("gold")
    area("key", (220, -380, 260), (0, -90, -30), 260, 1.6, color=(1, 0.92, 0.82))
    area("rim", (-300, 160, 120), (0, 0, 0), 200, 1.1, color=(0.95, 0.95, 1.0))
    spot("pool", (40, -420, 120), (0, -95, -44), 5.0, size_deg=7, blend=0.8, radius=20)
    camera((70, -520, -10), (0, -60, -22), lens=85, fstop=4.5, focus=(0, -100, -44))
    render("worn", 1200, 1600, 192, draft)


def shot_macro_diamond(draft):
    """Extreme close-up of crown, table and claws."""
    build.reset()
    world(1.0, rot_z=1.2)
    ring, info = build.build_ring("gold")
    area("key", (40, -60, 80), (0, 0, 14), 30, 1.6, color=(1, 0.95, 0.9))
    camera((14, -26, 30), (0, 0, 14.4), lens=100, fstop=5.6, focus=(0, -1.5, 15.2))
    render("macro_diamond", 1600, 2000, 256, draft)


def shot_macro_chain(draft):
    """Cable chain and pendant lying on slate."""
    global SURFACE
    SURFACE = "slate"
    build.reset()
    world(0.7, rot_z=2.2)
    slate()
    nk, _ = build.build_necklace("gold", flat=dict(rot=0.5, z=0.0))
    spot("pool", (-60, -80, 220), (0, 10, 0), 5.0, size_deg=16, blend=0.8, radius=12)
    area("rim", (100, 120, 30), (0, 10, 2), 60, 1.1, color=(1, 0.9, 0.8))
    camera((-18, -62, 34), (4, 8, 1), lens=100, fstop=3.2, focus=(0, 0, 2))
    render("macro_chain", 1600, 2000, 224, draft)


def shot_bracelet_silk(draft):
    global SURFACE
    SURFACE = "silk"
    build.reset()
    world(0.8, rot_z=-0.4)
    silk()
    br, _ = build.build_bracelet("gold", path_fn=lambda: flat_bracelet_path(rot=0.25))
    area("key", (-150, -160, 230), (0, 0, 0), 180, 1.6, color=(1, 0.93, 0.85))
    area("rim", (200, 220, 90), (0, 0, 0), 140, 1.1, color=(0.92, 0.95, 1.0))
    spot("pool", (30, -40, 260), (0, 0, 0), 5.0, size_deg=20, blend=0.9, radius=14)
    camera((40, -170, 92), (0, 4, 0), lens=85, fstop=3.5, focus=(4, -18, 2))
    render("bracelet_silk", 2400, 1500, 224, draft)


def shot_bracelet_macro(draft):
    global SURFACE
    SURFACE = "slate"
    build.reset()
    world(0.9, rot_z=0.9)
    slate()
    br, _ = build.build_bracelet("gold", path_fn=lambda: flat_bracelet_path(rot=-0.2))
    area("key", (-60, -90, 140), (0, 0, 0), 90, 1.6, color=(1, 0.93, 0.85))
    spot("pool", (40, -10, 200), (-20, -10, 0), 5.0, size_deg=14, blend=0.9, radius=8)
    camera((-60, -66, 22), (-28, -12, 1.5), lens=100, fstop=3.2, focus=(-30, -16, 2))
    render("bracelet_macro", 2000, 1400, 224, draft)


def shot_ring_card(draft):
    build.reset()
    world(0.8, rot_z=2.6)
    slate()
    ring, _ = build.build_ring("gold")
    # ring lying on its side, stone tilted toward camera
    place(ring, (0, 0, 8.5 + 1.45), (0, 0, math.radians(12)))
    spot("pool", (-30, -40, 240), (0, 0, 4), 5.0, size_deg=12, blend=0.85, radius=10)
    area("rim", (90, 110, 50), (0, 0, 6), 70, 1.1, color=(1, 0.9, 0.8))
    camera((0, -92, 58), (0, 0, 13.5), lens=100, fstop=4.0, focus=(0, -2, 20))
    render("card_ring", 1200, 1500, 200, draft)


def shot_necklace_card(draft):
    global SURFACE
    SURFACE = "slate"
    build.reset()
    world(0.75, rot_z=0.2)
    slate()
    build.build_necklace("gold", flat=dict(rot=0.0, z=0.0))
    spot("pool", (20, -30, 300), (0, 18, 0), 5.0, size_deg=16, blend=0.9, radius=10)
    area("rim", (-120, 160, 40), (0, 20, 2), 80, 1.1, color=(0.95, 0.95, 1.0))
    camera((0, -62, 150), (0, 28, 0), lens=60, fstop=5.6, focus=(0, 0, 3))
    render("card_necklace", 1200, 1500, 200, draft)


def shot_finale(draft, portrait=False):
    """Ring standing, bracelet laid behind it — one pool of light, deep shadow."""
    global SURFACE
    SURFACE = "slate"
    build.reset()
    world(0.5, rot_z=-0.9)
    slate()
    ring, _ = build.build_ring("gold")
    place(ring, (6, -8, 8.5 + 1.45), (0, 0, math.radians(18)))
    br, _ = build.build_bracelet("gold", path_fn=lambda: flat_bracelet_path(rot=0.35, cx=-6, cy=34))
    spot("pool", (-30, -70, 300), (0, 10, 4), 5.0, size_deg=13, blend=0.9, radius=10)
    area("rim", (-140, 200, 60), (0, 10, 6), 90, 1.1, color=(1, 0.9, 0.8))
    area("kick", (160, 60, 30), (0, 0, 10), 40, 0.7, color=(0.9, 0.95, 1.0))
    area("card", (-20, -170, 30), (6, -8, 10), 120, 0.5, color=(1.0, 0.86, 0.66), size_y=50)
    if portrait:
        camera((-4, -175, 66), (5, 6, 12), lens=85, fstop=3.2, focus=(6, -8, 18), sensor=24)
        render("finale_portrait", 1080, 1920, 224, draft)
    else:
        camera((-30, -175, 54), (-8, 10, 12), lens=85, fstop=3.2, focus=(6, -8, 18))
        render("finale", 2400, 1350, 224, draft)


SHOTS = {
    "campaign": lambda d: shot_campaign(d),
    "campaign_portrait": lambda d: shot_campaign(d, True),
    "worn": shot_worn,
    "macro_diamond": shot_macro_diamond,
    "macro_chain": shot_macro_chain,
    "bracelet_silk": shot_bracelet_silk,
    "bracelet_macro": shot_bracelet_macro,
    "card_ring": shot_ring_card,
    "card_necklace": shot_necklace_card,
    "finale": lambda d: shot_finale(d),
    "finale_portrait": lambda d: shot_finale(d, True),
}

if __name__ == "__main__":
    args = sys.argv[1:]
    draft = "--draft" in args
    names = [a for a in args if not a.startswith("--")] or list(SHOTS)
    for n in names:
        SHOTS[n](draft)
