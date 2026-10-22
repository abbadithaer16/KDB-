"""Build each piece and export optimised-ready GLBs + the studio HDRI."""
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build  # noqa: E402

OUT = os.path.join(build.ROOT, "assets-src")
os.makedirs(OUT, exist_ok=True)


def export(name):
    path = os.path.join(OUT, name + ".glb")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_gpu_instances=True,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_materials="EXPORT",
        export_extras=False,
    )
    print("exported", path, os.path.getsize(path))


if "--hdri" in sys.argv or "--all" in sys.argv:
    build.make_studio_hdri(os.path.join(OUT, "studio.hdr"))

build.reset()
build.build_ring("gold")
export("ring")

build.reset()
build.build_necklace("gold")
export("necklace")

build.reset()
build.build_bracelet("gold", path_fn=build.flat_path)
export("bracelet")
