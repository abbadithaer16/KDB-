"""
ÉCLAT — parametric jewellery geometry (Blender-independent, numpy only).

All units are millimetres. Every generator returns (verts, faces) where verts is an
(N,3) float array and faces is a list of index lists (planar n-gons or quads).

Pieces:
  brilliant()      57-facet round brilliant cut built from true facet planes
  tube()           swept wire along a path (parallel-transport frames)
  ring_band()      tapered comfort-fit band (superellipse section)
  solitaire_head() 4-claw cathedral head for the ring
  pendant_head()   6-claw basket with twisted rope galleries
  cable_link()     single oval cable-chain link
  tennis_setting() 4-claw basket for one bracelet stone
  bust_surface()   sculptural display neck-form
"""
import math
import numpy as np

TAU = math.tau


# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------
def _pol(r, a, z):
    return np.array([r * math.cos(a), r * math.sin(a), z], dtype=float)


def _plane_z(A, B, C, x, y):
    """Height of the plane through A,B,C at (x, y)."""
    n = np.cross(B - A, C - A)
    return A[2] - (n[0] * (x - A[0]) + n[1] * (y - A[1])) / n[2]


class MeshBuilder:
    def __init__(self):
        self.v = []
        self.f = []

    def add_v(self, p):
        self.v.append(np.asarray(p, dtype=float))
        return len(self.v) - 1

    def add_f(self, idx):
        self.f.append(list(idx))

    def extend(self, verts, faces):
        off = len(self.v)
        self.v.extend([np.asarray(p, dtype=float) for p in verts])
        self.f.extend([[i + off for i in face] for face in faces])

    def result(self):
        return np.array(self.v), self.f


def orient_outward(verts, faces, center=(0, 0, 0)):
    """Make every polygon's winding face away from `center` (valid for convex solids)."""
    c = np.asarray(center, dtype=float)
    out = []
    for face in faces:
        p = verts[face]
        n = np.zeros(3)
        for i in range(len(p)):  # Newell normal
            a, b = p[i], p[(i + 1) % len(p)]
            n += np.cross(a, b)
        if np.dot(n, p.mean(axis=0) - c) < 0:
            face = face[::-1]
        out.append(face)
    return out


# ----------------------------------------------------------------------------
# Round brilliant (57 facets + faceted girdle)
# ----------------------------------------------------------------------------
def brilliant(D=1.0, table=0.56, crown_deg=34.5, pav_deg=40.75, girdle=0.034,
              star=0.5, lower=0.78, sub=4):
    """
    Tolkowsky-style round brilliant. Girdle centre at z=0, table facing +Z.
    Facets are exact planes; the girdle edge is computed by intersecting the
    upper/lower girdle planes with the girdle cylinder (so it scallops like a
    real stone).  Returns verts, faces (flat-shade it).
    """
    r = D / 2
    c225 = math.cos(math.radians(22.5))
    t = (table * D / 2) / c225                     # table corner radius
    g = girdle * D
    hgt, hgb = g / 2, -g / 2
    ht = hgt + (r - t) * math.tan(math.radians(crown_deg))
    hc = hgb - r * math.tan(math.radians(pav_deg))  # culet

    def kite_z(u):  # crown main plane height at radial coordinate u
        return ht + (hgt - ht) * (u - t) / (r - t)

    def pav_z(u):
        return hc + (hgb - hc) * u / r

    a = [k * TAU / 8 for k in range(8)]
    T = [_pol(t, a[k], ht) for k in range(8)]
    s = t * c225 + star * (r - t * c225)
    S = [_pol(s, a[k] + TAU / 16, kite_z(s * c225)) for k in range(8)]
    l = r * (1 - lower)
    L = [_pol(l, a[k] + TAU / 16, pav_z(l * c225)) for k in range(8)]
    C = np.array([0, 0, hc])

    mb = MeshBuilder()
    iT = [mb.add_v(p) for p in T]
    iS = [mb.add_v(p) for p in S]
    iL = [mb.add_v(p) for p in L]
    iC = mb.add_v(C)

    nseg = 16 * sub
    top, bot = [], []
    for i in range(nseg):
        ang = i * TAU / nseg
        k = (i // (2 * sub)) % 8
        half = (i // sub) % 2
        x, y = r * math.cos(ang), r * math.sin(ang)
        G0 = _pol(r, a[k], hgt)
        G1 = _pol(r, a[(k + 1) % 8], hgt)
        M = _pol(r, a[k] + TAU / 16, hgt)
        zt = _plane_z(S[k], G0, M, x, y) if half == 0 else _plane_z(S[k], M, G1, x, y)
        Gb0 = _pol(r, a[k], hgb)
        Gb1 = _pol(r, a[(k + 1) % 8], hgb)
        Mb = _pol(r, a[k] + TAU / 16, hgb)
        zb = _plane_z(L[k], Gb0, Mb, x, y) if half == 0 else _plane_z(L[k], Mb, Gb1, x, y)
        top.append(mb.add_v((x, y, min(zt, hgt))))
        bot.append(mb.add_v((x, y, max(zb, hgb))))

    # table
    mb.add_f(iT)
    for k in range(8):
        kn = (k + 1) % 8
        kp = (k - 1) % 8
        gi = k * 2 * sub              # girdle index of main point k
        mi = gi + sub                 # girdle index of mid point
        gn = ((k + 1) * 2 * sub) % nseg
        # star
        mb.add_f([iT[k], iT[kn], iS[k]])
        # bezel kite
        mb.add_f([iT[k], iS[kp], top[gi], iS[k]])
        # upper girdle facets (fans to scalloped girdle)
        mb.add_f([iS[k]] + [top[j] for j in range(gi, mi + 1)])
        mb.add_f([iS[k]] + [top[j % nseg] for j in range(mi, gi + 2 * sub + 1)])
        # pavilion main kite
        mb.add_f([iC, iL[kp], bot[gi], iL[k]])
        # lower girdle facets
        mb.add_f([iL[k]] + [bot[j] for j in range(gi, mi + 1)])
        mb.add_f([iL[k]] + [bot[j % nseg] for j in range(mi, gi + 2 * sub + 1)])
        _ = gn
    # girdle band
    for i in range(nseg):
        j = (i + 1) % nseg
        mb.add_f([top[i], top[j], bot[j], bot[i]])

    v, f = mb.result()
    f = orient_outward(v, f, center=(0, 0, (ht + hc) / 2))
    info = dict(r=r, table_z=ht, girdle_top=hgt, girdle_bot=hgb, culet_z=hc,
                crown_deg=crown_deg, pav_deg=pav_deg)
    return v, f, info


def pavilion_radius(info, z):
    """Radius of the pavilion cone at height z (girdle-centred coordinates)."""
    r, hb, hc = info["r"], info["girdle_bot"], info["culet_z"]
    return max(0.0, r * (z - hc) / (hb - hc))


def crown_height(info, rho):
    r, hgt = info["r"], info["girdle_top"]
    return hgt + (r - rho) * math.tan(math.radians(info["crown_deg"]))


# ----------------------------------------------------------------------------
# Curves & tubes
# ----------------------------------------------------------------------------
def catmull(points, samples=48, closed=False):
    P = [np.asarray(p, float) for p in points]
    n = len(P)
    out = []
    segs = n if closed else n - 1
    for i in range(segs):
        p0 = P[(i - 1) % n] if (closed or i > 0) else P[0] * 2 - P[1]
        p1 = P[i]
        p2 = P[(i + 1) % n]
        if closed or i + 2 < n:
            p3 = P[(i + 2) % n]
        else:
            p3 = P[-1] * 2 - P[-2]
        steps = max(2, samples // segs)
        for s in range(steps):
            u = s / steps
            u2, u3 = u * u, u * u * u
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * u3))
    if not closed:
        out.append(P[-1])
    return np.array(out)


def resample(path, n, closed=False):
    """Uniform arc-length resample."""
    P = np.asarray(path, float)
    if closed:
        P = np.vstack([P, P[:1]])
    d = np.linalg.norm(np.diff(P, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(d)])
    total = s[-1]
    ts = np.linspace(0, total, n + (0 if closed else 0), endpoint=not closed)
    out = np.stack([np.interp(ts, s, P[:, i]) for i in range(3)], axis=1)
    return out


def frames(path, closed=False, up_hint=(0, 0, 1)):
    P = np.asarray(path, float)
    n = len(P)
    T = np.zeros_like(P)
    for i in range(n):
        if closed:
            T[i] = P[(i + 1) % n] - P[(i - 1) % n]
        else:
            T[i] = P[min(i + 1, n - 1)] - P[max(i - 1, 0)]
        T[i] /= np.linalg.norm(T[i]) + 1e-12
    up = np.asarray(up_hint, float)
    N = np.cross(T[0], up)
    if np.linalg.norm(N) < 1e-6:
        N = np.cross(T[0], (1, 0, 0))
    N /= np.linalg.norm(N)
    Ns = [N]
    for i in range(1, n):
        v = Ns[-1] - np.dot(Ns[-1], T[i]) * T[i]
        v /= np.linalg.norm(v) + 1e-12
        Ns.append(v)
    Ns = np.array(Ns)
    if closed:  # distribute twist error
        last = Ns[-1]
        first = Ns[0] - np.dot(Ns[0], T[-1]) * T[-1]
        first /= np.linalg.norm(first)
        ang = math.atan2(np.dot(np.cross(last, first), T[-1]), np.dot(last, first))
        for i in range(n):
            th = ang * i / n
            b = np.cross(T[i], Ns[i])
            Ns[i] = Ns[i] * math.cos(th) + b * math.sin(th)
    B = np.cross(T, Ns)
    return T, Ns, B


def tube(path, radius, seg=12, closed=False, caps=True, up_hint=(0, 0, 1)):
    P = np.asarray(path, float)
    n = len(P)
    R = np.broadcast_to(np.asarray(radius, float), (n,))
    T, N, B = frames(P, closed, up_hint)
    mb = MeshBuilder()
    rings = []
    for i in range(n):
        ring = []
        for j in range(seg):
            th = j * TAU / seg
            ring.append(mb.add_v(P[i] + R[i] * (math.cos(th) * N[i] + math.sin(th) * B[i])))
        rings.append(ring)
    last = n if closed else n - 1
    for i in range(last):
        a, b = rings[i], rings[(i + 1) % n]
        for j in range(seg):
            k = (j + 1) % seg
            mb.add_f([a[j], a[k], b[k], b[j]])
    if caps and not closed:
        c0 = mb.add_v(P[0])
        c1 = mb.add_v(P[-1])
        for j in range(seg):
            k = (j + 1) % seg
            mb.add_f([c0, rings[0][k], rings[0][j]])
            mb.add_f([c1, rings[-1][j], rings[-1][k]])
    return mb.result()


def sphere(center, radius, seg=16, rings=10):
    mb = MeshBuilder()
    c = np.asarray(center, float)
    top = mb.add_v(c + (0, 0, radius))
    grid = []
    for i in range(1, rings):
        ph = math.pi * i / rings
        row = []
        for j in range(seg):
            th = TAU * j / seg
            row.append(mb.add_v(c + radius * np.array([math.sin(ph) * math.cos(th),
                                                       math.sin(ph) * math.sin(th),
                                                       math.cos(ph)])))
        grid.append(row)
    bot = mb.add_v(c - (0, 0, radius))
    for j in range(seg):
        k = (j + 1) % seg
        mb.add_f([top, grid[0][j], grid[0][k]])
        mb.add_f([bot, grid[-1][k], grid[-1][j]])
    for i in range(len(grid) - 1):
        for j in range(seg):
            k = (j + 1) % seg
            mb.add_f([grid[i][j], grid[i + 1][j], grid[i + 1][k], grid[i][k]])
    return mb.result()


def torus_path(R, center=(0, 0, 0), n=64, axis="z"):
    c = np.asarray(center, float)
    pts = []
    for i in range(n):
        a = TAU * i / n
        if axis == "z":
            pts.append(c + (R * math.cos(a), R * math.sin(a), 0))
        elif axis == "y":
            pts.append(c + (R * math.cos(a), 0, R * math.sin(a)))
        else:
            pts.append(c + (0, R * math.cos(a), R * math.sin(a)))
    return np.array(pts)


def rope(R, z, strand_r=0.12, twist=28, n=360, strands=2):
    """Twisted rope gallery ring around the Z axis (two interlaced strands)."""
    mb = MeshBuilder()
    off = strand_r * 0.95
    for s in range(strands):
        ph = TAU * s / strands
        pts = []
        for i in range(n):
            a = TAU * i / n
            radial = np.array([math.cos(a), math.sin(a), 0])
            q = twist * a + ph
            p = R * radial + off * (math.cos(q) * radial + math.sin(q) * np.array([0, 0, 1]))
            pts.append(p + (0, 0, z))
        mb.extend(*tube(pts, strand_r, seg=8, closed=True))
    return mb.result()


# ----------------------------------------------------------------------------
# Ring
# ----------------------------------------------------------------------------
def ring_band(ri=8.5, w0=1.75, w1=2.25, h0=1.45, h1=1.9, n_around=256, n_sec=40, ex=3.2):
    """Comfort-fit band, finger axis = Y. Top (theta=0) at +Z, tapering wider/taller there."""
    mb = MeshBuilder()
    rings = []
    for i in range(n_around):
        th = TAU * i / n_around
        wrap = math.atan2(math.sin(th), math.cos(th))
        bump = math.exp(-(wrap / 0.85) ** 2)
        W = w0 + (w1 - w0) * bump
        H = h0 + (h1 - h0) * bump
        radial = np.array([math.sin(th), 0, math.cos(th)])
        ring = []
        for j in range(n_sec):
            s = TAU * j / n_sec
            cs, sn = math.cos(s), math.sin(s)
            w = (W / 2) * math.copysign(abs(cs) ** (2 / ex), cs)
            h = (H / 2) * math.copysign(abs(sn) ** (2 / ex), sn)
            rad = ri + H / 2 + h
            ring.append(mb.add_v(radial * rad + np.array([0, w, 0])))
        rings.append(ring)
    for i in range(n_around):
        a, b = rings[i], rings[(i + 1) % n_around]
        for j in range(n_sec):
            k = (j + 1) % n_sec
            mb.add_f([a[j], b[j], b[k], a[k]])
    return mb.result()


def band_outer_z(x, ri=8.5, h1=1.9, h0=1.45):
    th = math.asin(max(-1, min(1, x / (ri + h1))))
    bump = math.exp(-(th / 0.85) ** 2)
    H = h0 + (h1 - h0) * bump
    return (ri + H) * math.cos(th)


def solitaire_head(info, gz, wr=0.42, n_prongs=4, base_x=2.15, base_y=0.62, ri=8.5):
    """Cathedral 4-claw head. Stone girdle centre at height gz on the Z axis."""
    mb = MeshBuilder()
    r = info["r"]
    rail_z = gz - 1.25
    rail_R = pavilion_radius(info, rail_z - gz) + 0.32
    low_z = gz - 2.35
    low_R = pavilion_radius(info, low_z - gz) + 0.3
    mb.extend(*tube(torus_path(rail_R, (0, 0, rail_z), 96), 0.3, seg=10, closed=True))
    # cathedral arches: from the band shoulders up into the gallery rail
    band_r = ri + 1.9
    for sx in (-1, 1):
        th0 = 0.46
        p0 = (sx * band_r * math.sin(th0) * 0.985, 0.0, band_r * math.cos(th0) * 0.985 - 0.05)
        p1 = (sx * (rail_R + 1.05), 0.0, rail_z - 1.75)
        p3 = (sx * (rail_R + 0.05), 0.0, rail_z - 0.05)
        path = catmull([p0, p1, p3], samples=60)
        n = len(path)
        rad = np.linspace(0.62, 0.36, n)
        mb.extend(*tube(path, rad, seg=16, caps=False))
        mb.extend(*sphere(path[-1], 0.37, seg=12, rings=8))
    tip_rho = r - 0.32
    tip_z = gz + crown_height(info, tip_rho) + wr * 0.55
    for k in range(n_prongs):
        az = math.radians(45 + 90 * k)
        sx = 1 if math.cos(az) > 0 else -1
        sy = 1 if math.sin(az) > 0 else -1
        bx, by = sx * base_x, sy * base_y
        bz = band_outer_z(bx, ri) - 0.35
        d = np.array([math.cos(az), math.sin(az), 0])
        pts = [
            (bx, by, bz - 0.3),
            (bx, by, bz + 0.4),
            tuple(np.array([bx * 0.92, by * 1.6, 0]) * 1.0 + (0, 0, low_z + 0.2)),
            tuple(d * (rail_R + 0.22) + (0, 0, rail_z)),
            tuple(d * (pavilion_radius(info, -0.55) + wr * 0.95) + (0, 0, gz - 0.55)),
            tuple(d * (r + wr * 0.72) + (0, 0, gz + 0.05)),
            tuple(d * (r + wr * 0.25) + (0, 0, gz + info["girdle_top"] + 0.32)),
            tuple(d * tip_rho + (0, 0, tip_z - 0.12)),
        ]
        path = catmull(pts, samples=70)
        n = len(path)
        rad = np.linspace(wr * 1.08, wr * 0.92, n)
        mb.extend(*tube(path, rad, seg=14, caps=False))
        mb.extend(*sphere(path[-1], wr * 0.98, seg=18, rings=12))
        mb.extend(*sphere(path[0], wr * 1.06, seg=12, rings=8))
    return mb.result()


# ----------------------------------------------------------------------------
# Pendant
# ----------------------------------------------------------------------------
def pendant_head(info, wr=0.3, n_prongs=6):
    """6-claw basket with twisted-rope galleries; stone girdle at z=0, table +Z.
    Returns verts, faces, loop positions (chain attachment, local coords)."""
    mb = MeshBuilder()
    r = info["r"]
    z1 = -0.85
    z2 = -2.0
    R1 = pavilion_radius(info, z1) + 0.3
    R2 = pavilion_radius(info, z2) + 0.28
    mb.extend(*rope(R1, z1, strand_r=0.15, twist=34))
    mb.extend(*rope(R2, z2, strand_r=0.14, twist=26))
    tip_rho = r - 0.26
    tip_z = crown_height(info, tip_rho) + wr * 0.5
    base_z = info["culet_z"] - 0.1
    for k in range(n_prongs):
        az = math.radians(30 + 60 * k)
        d = np.array([math.cos(az), math.sin(az), 0])
        pts = [
            tuple(d * 0.55 + (0, 0, base_z)),
            tuple(d * (R2 + 0.12) + (0, 0, z2)),
            tuple(d * (R1 + 0.14) + (0, 0, z1)),
            tuple(d * (r + wr * 0.7) + (0, 0, 0.0)),
            tuple(d * (r + wr * 0.2) + (0, 0, info["girdle_top"] + 0.26)),
            tuple(d * tip_rho + (0, 0, tip_z - 0.08)),
        ]
        path = catmull(pts, samples=60)
        mb.extend(*tube(path, np.linspace(wr * 1.1, wr * 0.95, len(path)), seg=12, caps=False))
        mb.extend(*sphere(path[-1], wr * 1.0, seg=14, rings=10))
    # base button under the culet
    mb.extend(*tube(torus_path(0.55, (0, 0, base_z), 40), 0.22, seg=10, closed=True))
    mb.extend(*sphere((0, 0, base_z - 0.05), 0.42, seg=16, rings=10))
    # side attachment loops (chain passes through) — on the ±X sides
    loops = []
    for sx in (-1, 1):
        c = np.array([sx * (R1 + 0.75), 0, z1 + 0.15])
        pts = []
        for i in range(48):
            a = TAU * i / 48
            pts.append(c + (0.55 * math.cos(a) * 0.9, 0, 0.55 * math.sin(a)))
        mb.extend(*tube(pts, 0.17, seg=10, closed=True))
        loops.append(c)
    return (*mb.result(), loops)


# ----------------------------------------------------------------------------
# Chain
# ----------------------------------------------------------------------------
def cable_link(inner_len=1.5, outer_w=1.25, wire=0.155, n_path=28, seg=8):
    """Oval cable link, long axis X, in the XY plane, centred at origin."""
    rho = outer_w / 2 - wire
    half = inner_len / 2 + wire
    c = half - rho
    pts = []
    per_arc = n_path // 2
    for side in (1, -1):
        cx = side * c
        for i in range(per_arc):
            a = -math.pi / 2 + math.pi * i / per_arc
            a = a if side == 1 else a + math.pi
            pts.append((cx + rho * math.cos(a), rho * math.sin(a), 0))
    return tube(pts, wire, seg=seg, closed=True)


def chain_transforms(path, pitch=1.5):
    """Place links along an open path. Returns list of (position, x_axis, y_axis)."""
    P = resample_by_pitch(path, pitch)
    out = []
    prev_y = None
    for i in range(len(P) - 1):
        a, b = P[i], P[i + 1]
        x = b - a
        x /= np.linalg.norm(x)
        mid = (a + b) / 2
        if prev_y is None:
            ref = np.array([0, 0, 1]) if abs(x[2]) < 0.9 else np.array([1, 0, 0])
            y = np.cross(ref, x)
        else:
            y = prev_y - np.dot(prev_y, x) * x
        y /= np.linalg.norm(y)
        prev_y = y
        if i % 2:
            y_use = np.cross(x, y)
        else:
            y_use = y
        out.append((mid, x, y_use))
    return out


def resample_by_pitch(path, pitch):
    P = np.asarray(path, float)
    d = np.linalg.norm(np.diff(P, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(d)])
    n = int(s[-1] // pitch)
    ts = np.arange(n + 1) * pitch
    return np.stack([np.interp(ts, s, P[:, i]) for i in range(3)], axis=1)


# ----------------------------------------------------------------------------
# Bust (display neck form)
# ----------------------------------------------------------------------------
BUST_EX = 2.5


def bust_params(z):
    f = 1 / (1 + math.exp((z - 4) / 13))
    A = 50 + 112 * f
    B = 44 + 46 * f
    yc = 6 - 12 * f
    return A, B, yc


def bust_point(phi, z, ex=BUST_EX):
    """phi=0 is front (−Y). x to the side."""
    A, B, yc = bust_params(z)
    s, c = math.sin(phi), math.cos(phi)
    x = A * math.copysign(abs(s) ** (2 / ex), s)
    y = yc - B * math.copysign(abs(c) ** (2 / ex), c)
    return np.array([x, y, z])


def bust_normal(phi, z):
    e = 1e-3
    dp = bust_point(phi + e, z) - bust_point(phi - e, z)
    dz = bust_point(phi, z + e) - bust_point(phi, z - e)
    n = np.cross(dp, dz)
    n /= np.linalg.norm(n)
    # make sure it points outward
    p = bust_point(phi, z)
    A, B, yc = bust_params(z)
    if np.dot(n, p - np.array([0, yc, z])) < 0:
        n = -n
    return n


def bust_surface(z0=-120, z1=105, nphi=160, nz=120):
    mb = MeshBuilder()
    rows = []
    zs = np.linspace(z0, z1, nz)
    for z in zs:
        row = [mb.add_v(bust_point(TAU * j / nphi, z)) for j in range(nphi)]
        rows.append(row)
    for i in range(nz - 1):
        for j in range(nphi):
            k = (j + 1) % nphi
            mb.add_f([rows[i][j], rows[i][k], rows[i + 1][k], rows[i + 1][j]])
    # caps: neck top with soft bevel, flat bottom
    _, _, yct = bust_params(z1)
    ct = mb.add_v((0, yct, z1 + 1.5))
    for j in range(nphi):
        k = (j + 1) % nphi
        mb.add_f([rows[-1][j], rows[-1][k], ct])
    _, _, ycb = bust_params(z0)
    cb = mb.add_v((0, ycb, z0))
    for j in range(nphi):
        k = (j + 1) % nphi
        mb.add_f([rows[0][k], rows[0][j], cb])
    return mb.result()


def necklace_curve(z_back=30.0, z_front=-44.0, power=2.4, lift=0.0, n=900):
    """Closed drape curve on the bust surface. Returns phis, points, normals."""
    phis = np.linspace(-math.pi, math.pi, n, endpoint=False)
    pts, nrm = [], []
    for ph in phis:
        w = ((1 + math.cos(ph)) / 2) ** power
        z = z_back - (z_back - z_front) * w
        p = bust_point(ph, z)
        nn = bust_normal(ph, z)
        pts.append(p)
        nrm.append(nn)
    return phis, np.array(pts), np.array(nrm)


# ----------------------------------------------------------------------------
# Tennis bracelet
# ----------------------------------------------------------------------------
def tennis_setting(info, wr=0.19, half=1.5):
    """One 4-claw basket. Local frame: X = along chain, Z = stone axis (out), Y = across.
    Stone girdle centre at z = gz returned."""
    mb = MeshBuilder()
    r = info["r"]
    gz = 2.05
    # square galleries (rounded)
    def sq_loop(h, z, rad=0.22, n=72, rr=0.45):
        pts = []
        for i in range(n):
            a = TAU * i / n
            # superellipse square
            ca, sa = math.cos(a), math.sin(a)
            ex = 6
            x = h * math.copysign(abs(ca) ** (2 / ex), ca)
            y = h * math.copysign(abs(sa) ** (2 / ex), sa)
            pts.append((x, y, z))
        return tube(pts, rad, seg=8, closed=True)
    mb.extend(*sq_loop(half - 0.05, gz - 0.95, 0.2))
    mb.extend(*sq_loop(half - 0.45, 0.22, 0.2))
    tip_rho = r - 0.2
    tip_z = gz + crown_height(info, tip_rho) + wr * 0.5
    for k in range(4):
        az = math.radians(45 + 90 * k)
        d = np.array([math.cos(az), math.sin(az), 0])
        c = np.array([math.copysign(1, d[0]), math.copysign(1, d[1]), 0])
        pts = [
            tuple(c * (half - 0.5) + (0, 0, 0.1)),
            tuple(c * (half - 0.25) + (0, 0, gz - 0.95)),
            tuple(d * (r + wr * 0.75) + (0, 0, gz - 0.05)),
            tuple(d * (r + wr * 0.2) + (0, 0, gz + info["girdle_top"] + 0.18)),
            tuple(d * tip_rho + (0, 0, tip_z - 0.06)),
        ]
        path = catmull(pts, samples=40)
        mb.extend(*tube(path, np.linspace(wr * 1.15, wr * 0.95, len(path)), seg=10, caps=False))
        mb.extend(*sphere(path[-1], wr * 1.02, seg=12, rings=8))
    return (*mb.result(), gz)


def superellipsoid(a, b, c, e=0.25, nu=32, nv=20, center=(0, 0, 0)):
    """Rounded box."""
    mb = MeshBuilder()
    cen = np.asarray(center, float)

    def f(w, m):
        return math.copysign(abs(w) ** m, w)
    rows = []
    for i in range(1, nv):
        v = -math.pi / 2 + math.pi * i / nv
        row = []
        for j in range(nu):
            u = -math.pi + TAU * j / nu
            x = a * f(math.cos(v), e) * f(math.cos(u), e)
            y = b * f(math.cos(v), e) * f(math.sin(u), e)
            z = c * f(math.sin(v), e)
            row.append(mb.add_v(cen + (x, y, z)))
        rows.append(row)
    bot = mb.add_v(cen + (0, 0, -c))
    top = mb.add_v(cen + (0, 0, c))
    for j in range(nu):
        k = (j + 1) % nu
        mb.add_f([bot, rows[0][k], rows[0][j]])
        mb.add_f([top, rows[-1][j], rows[-1][k]])
    for i in range(len(rows) - 1):
        for j in range(nu):
            k = (j + 1) % nu
            mb.add_f([rows[i][j], rows[i][k], rows[i + 1][k], rows[i + 1][j]])
    return mb.result()


def solve_phi_for_x(x, z, side=1):
    """Find phi on the front half so that bust_point(phi, z).x == x (side=+1 right)."""
    lo, hi = 0.0, math.pi / 2
    for _ in range(60):
        mid = (lo + hi) / 2
        if bust_point(mid, z)[0] < abs(x):
            lo = mid
        else:
            hi = mid
    return side * (lo + hi) / 2


def necklace_drape(z_front=-44.0, z_side=20.0, z_back=31.0, phi_s=1.15, bow=0.82, n_loop=500, n_front=260):
    """Necklace path on the bust: rests on the neck base around the back, then falls in a
    gently bowed line across the chest to the pendant. Returns (pts, normals, front_u) for
    the right side front, back loop, left side front — ordered right-front-bottom → back → left-front-bottom.
    front_u: 1 at pendant, 0 at neck — used for lifting the chain to the pendant loops."""
    pts, nrm, fu = [], [], []
    # right front (pendant → neck)
    xs0 = bust_point(phi_s, z_side)[0]
    for i in range(n_front):
        u = 1 - i / (n_front - 1)          # 1 = pendant, 0 = neck
        z = z_side + (z_front - z_side) * (u ** bow)
        x = xs0 * (1 - u)
        ph = solve_phi_for_x(max(x, 1e-3), z, 1)
        pts.append(bust_point(ph, z)); nrm.append(bust_normal(ph, z)); fu.append(u)
    # back loop phi_s → 2pi - phi_s
    for i in range(1, n_loop):
        ph = phi_s + (TAU - 2 * phi_s) * i / n_loop
        w = (1 - math.cos(ph - math.pi)) / 2   # 0 at back, 1 toward the front
        wb = (math.cos(ph - math.pi) + 1) / 2
        k = (math.cos(ph) - math.cos(phi_s)) / (-1 - math.cos(phi_s))  # 0 at sides, 1 at back
        z = z_side + (z_back - z_side) * (k ** 0.7)
        _ = (w, wb)
        pts.append(bust_point(ph, z)); nrm.append(bust_normal(ph, z)); fu.append(0.0)
    # left front (neck → pendant)
    for i in range(n_front):
        u = i / (n_front - 1)
        z = z_side + (z_front - z_side) * (u ** bow)
        x = xs0 * (1 - u)
        ph = solve_phi_for_x(max(x, 1e-3), z, -1)
        pts.append(bust_point(ph, z)); nrm.append(bust_normal(ph, z)); fu.append(u)
    return np.array(pts), np.array(nrm), np.array(fu)
