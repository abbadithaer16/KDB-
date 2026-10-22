"""Quick Cycles previews for geometry checks: preview.py <piece> <out.png> camx camy camz tx ty tz [lens]"""
import math, os, sys
import bpy
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
piece, out = args[0], args[1]
cam_loc = tuple(map(float, args[2:5])); tgt = tuple(map(float, args[5:8]))
lens = float(args[8]) if len(args) > 8 else 85
sc = build.reset()
{"ring": build.build_ring, "necklace": build.build_necklace, "bracelet": build.build_bracelet}[piece]("gold")
w = bpy.data.worlds.new("w"); w.use_nodes = True
nt = w.node_tree
env = nt.nodes.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(os.path.join(build.ROOT, "assets-src", "studio.hdr"))
nt.links.new(env.outputs[0], nt.nodes["Background"].inputs[0])
nt.nodes["Background"].inputs[1].default_value = 1.0
sc.world = w
cd = bpy.data.cameras.new("c"); cd.lens = lens; cd.clip_start = 0.5; cd.clip_end = 5000
cam = bpy.data.objects.new("c", cd); sc.collection.objects.link(cam)
cam.location = cam_loc
cam.rotation_euler = (Vector(tgt) - Vector(cam_loc)).to_track_quat("-Z", "Y").to_euler()
sc.camera = cam
build.setup_cycles(sc, samples=int(os.environ.get("SAMPLES", 48)), w=int(os.environ.get("W", 900)), h=int(os.environ.get("H", 600)))
sc.render.filepath = out
sc.render.image_settings.file_format = "PNG"
bpy.ops.render.render(write_still=True)
