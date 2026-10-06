"""Genera ilustraciones SVG de demostración (sustituibles por fotos reales).

Cada imagen lleva la etiqueta «Imagen de demostración» para que sea
claramente identificable. Uso: python3 scripts/generate-demo-images.py
"""
import os, random

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "demo")
W, H = 1600, 1000

def badge():
    return (f'<g opacity="0.92"><rect x="{W-372}" y="{H-78}" width="340" height="46" rx="23" fill="#ffffff" fill-opacity="0.82"/>'
            f'<text x="{W-202}" y="{H-48}" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" '
            f'fill="#3d4a3f" text-anchor="middle" letter-spacing="1">IMAGEN DE DEMOSTRACIÓN</text></g>')

def svg(body, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img">'
            f'<defs>{defs}</defs>{body}{badge()}</svg>')

def sky(id_, top, bottom):
    return f'<linearGradient id="{id_}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/></linearGradient>'

def tree(x, y, s, c="#6f8f6f", trunk="#8a6a4f"):
    return (f'<rect x="{x-6*s}" y="{y}" width="{12*s}" height="{60*s}" rx="{4*s}" fill="{trunk}"/>'
            f'<circle cx="{x}" cy="{y-10*s}" r="{48*s}" fill="{c}"/>'
            f'<circle cx="{x-34*s}" cy="{y+10*s}" r="{32*s}" fill="{c}" opacity="0.92"/>'
            f'<circle cx="{x+36*s}" cy="{y+6*s}" r="{34*s}" fill="{c}" opacity="0.88"/>')

def hills(colors):
    out = ""
    base = 640
    for i, c in enumerate(colors):
        y = base + i * 70
        out += (f'<path d="M0 {y} C {W*0.25} {y-90+i*20}, {W*0.55} {y+60}, {W} {y-40} L {W} {H} L 0 {H} Z" fill="{c}"/>')
    return out

def building(x, y, w, h):
    win = ""
    for row in range(3):
        for col in range(int(w // 110)):
            wx = x + 40 + col * 110
            wy = y + 70 + row * 110
            if wx + 60 < x + w:
                win += f'<rect x="{wx}" y="{wy}" width="60" height="74" rx="8" fill="#fff6dd" opacity="0.95"/><rect x="{wx}" y="{wy}" width="60" height="74" rx="8" fill="none" stroke="#c8b89d" stroke-width="4"/>'
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#f4ede1"/>'
            f'<path d="M{x-30} {y+10} L{x+w/2} {y-110} L{x+w+30} {y+10} Z" fill="#b9765a"/>'
            f'{win}<rect x="{x+w/2-55}" y="{y+h-150}" width="110" height="150" rx="10" fill="#8a6a4f"/>')

def scene_jardin():
    d = sky("s", "#cfe3e8", "#f7efe1")
    b = f'<rect width="{W}" height="{H}" fill="url(#s)"/><circle cx="1260" cy="230" r="90" fill="#ffe7a8"/><circle cx="1260" cy="230" r="140" fill="#ffe7a8" opacity="0.35"/>'
    b += hills(["#a9c3a0", "#8fb08a", "#7a9c78"])
    b += tree(260, 560, 1.6) + tree(470, 600, 1.2, "#7f9f7c") + tree(1380, 590, 1.4, "#6a8a69")
    b += '<path d="M700 1000 C 760 860, 900 760, 1000 700" stroke="#e8dcc6" stroke-width="70" fill="none" stroke-linecap="round"/>'
    for i in range(24):
        random.seed(i)
        x, y = random.randint(80, 1520), random.randint(760, 960)
        b += f'<circle cx="{x}" cy="{y}" r="9" fill="{random.choice(["#f2b8a2","#f6d58e","#ffffff","#d9a1c9"])}"/>'
    b += '<rect x="980" y="760" width="200" height="16" rx="8" fill="#8a6a4f"/><rect x="990" y="776" width="12" height="50" fill="#8a6a4f"/><rect x="1158" y="776" width="12" height="50" fill="#8a6a4f"/><rect x="980" y="720" width="200" height="14" rx="7" fill="#9c7a5c"/>'
    return svg(b, d)

def scene_fachada():
    d = sky("s", "#d9e8ec", "#fbf5ea")
    b = f'<rect width="{W}" height="{H}" fill="url(#s)"/><circle cx="300" cy="200" r="80" fill="#ffe9b0"/>'
    b += hills(["#b5cbaa", "#9dba95"])
    b += building(430, 380, 740, 470)
    b += tree(260, 640, 1.3) + tree(1350, 640, 1.5, "#6f8f6f")
    b += f'<rect x="0" y="860" width="{W}" height="140" fill="#e8dcc6"/>'
    return svg(b, d)

def scene_habitacion():
    d = '<linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f9f3e8"/><stop offset="1" stop-color="#efe5d4"/></linearGradient><linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6ee"/><stop offset="1" stop-color="#f6f0dc"/></linearGradient>'
    b = f'<rect width="{W}" height="{H}" fill="url(#w)"/><rect x="0" y="760" width="{W}" height="240" fill="#d9c6a6"/>'
    b += '<rect x="900" y="150" width="480" height="440" rx="18" fill="url(#win)" stroke="#ffffff" stroke-width="22"/><line x1="1140" y1="150" x2="1140" y2="590" stroke="#fff" stroke-width="14"/>'
    b += '<path d="M900 590 L760 1000 L1500 1000 L1380 590 Z" fill="#fff8e6" opacity="0.35"/>'
    b += '<rect x="160" y="560" width="620" height="200" rx="26" fill="#ffffff"/><rect x="140" y="470" width="90" height="300" rx="20" fill="#c9a882"/><rect x="200" y="520" width="200" height="80" rx="30" fill="#e6eee2"/>'
    b += '<rect x="160" y="680" width="620" height="90" rx="20" fill="#a9c3a0"/>'
    b += '<rect x="820" y="620" width="120" height="140" rx="12" fill="#c9a882"/><circle cx="880" cy="580" r="34" fill="#f6d58e"/><rect x="872" y="590" width="16" height="40" fill="#8a6a4f"/>'
    b += '<path d="M1450 760 C1440 640 1480 600 1520 560 C1500 640 1520 700 1500 760 Z" fill="#7a9c78"/><rect x="1430" y="740" width="100" height="80" rx="14" fill="#b9765a"/>'
    return svg(b, d)

def scene_salon():
    d = '<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8f1e4"/><stop offset="1" stop-color="#efe3cf"/></linearGradient>'
    b = f'<rect width="{W}" height="{H}" fill="url(#w)"/><rect x="0" y="780" width="{W}" height="220" fill="#cdb593"/>'
    for i in range(3):
        b += f'<rect x="{180+i*440}" y="140" width="320" height="380" rx="160" fill="#d8ebf0" stroke="#fff" stroke-width="18"/>'
    b += '<rect x="240" y="600" width="520" height="190" rx="40" fill="#7f9f7c"/><rect x="220" y="560" width="80" height="230" rx="30" fill="#6f8f6f"/><rect x="700" y="560" width="80" height="230" rx="30" fill="#6f8f6f"/>'
    b += '<rect x="900" y="640" width="260" height="20" rx="10" fill="#8a6a4f"/><rect x="920" y="660" width="14" height="120" fill="#8a6a4f"/><rect x="1126" y="660" width="14" height="120" fill="#8a6a4f"/>'
    b += '<rect x="960" y="600" width="60" height="40" rx="8" fill="#ffffff"/><circle cx="1080" cy="610" r="26" fill="#f2b8a2"/>'
    b += '<rect x="1240" y="590" width="200" height="200" rx="36" fill="#c08a5b"/><rect x="1220" y="560" width="60" height="230" rx="24" fill="#a97650"/>'
    return svg(b, d)

def scene_comedor():
    d = '<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf5ea"/><stop offset="1" stop-color="#f1e6d3"/></linearGradient>'
    b = f'<rect width="{W}" height="{H}" fill="url(#w)"/><rect x="0" y="800" width="{W}" height="200" fill="#d9c6a6"/>'
    b += '<rect x="120" y="120" width="1360" height="360" rx="24" fill="#d8ebf0" stroke="#fff" stroke-width="20"/><path d="M120 420 C 400 300, 700 380, 1480 300 L1480 480 L120 480Z" fill="#a9c3a0"/>'
    for cx in (480, 1120):
        b += f'<ellipse cx="{cx}" cy="700" rx="260" ry="60" fill="#ffffff"/><rect x="{cx-12}" y="700" width="24" height="120" fill="#8a6a4f"/>'
        for dx in (-160, 0, 160):
            b += f'<circle cx="{cx+dx}" cy="690" r="30" fill="#f6efe3" stroke="#e3d6bf" stroke-width="5"/>'
        b += f'<rect x="{cx-14}" y="610" width="28" height="60" rx="10" fill="#b9d3c9"/><circle cx="{cx}" cy="600" r="18" fill="#f2b8a2"/>'
        for dx in (-300, 300):
            b += f'<rect x="{cx+dx-40}" y="620" width="80" height="200" rx="18" fill="#c9a882"/>'
    return svg(b, d)

def scene_terraza():
    d = sky("s", "#f6d9b8", "#fbf3e6")
    b = f'<rect width="{W}" height="{H}" fill="url(#s)"/><circle cx="1180" cy="420" r="130" fill="#ffd79a"/>'
    b += hills(["#c7b48e", "#a9c3a0"])
    b += f'<rect x="0" y="760" width="{W}" height="240" fill="#e7d7bd"/>'
    for i in range(14):
        b += f'<rect x="{i*120}" y="700" width="14" height="80" fill="#ffffff"/>'
    b += f'<rect x="0" y="690" width="{W}" height="16" fill="#ffffff"/>'
    b += '<path d="M300 300 L600 300 L640 380 L260 380 Z" fill="#b9765a"/><rect x="444" y="380" width="12" height="440" fill="#8a6a4f"/>'
    b += '<rect x="330" y="760" width="240" height="18" rx="9" fill="#8a6a4f"/><rect x="250" y="700" width="70" height="140" rx="20" fill="#7f9f7c"/><rect x="580" y="700" width="70" height="140" rx="20" fill="#7f9f7c"/>'
    for x in (900, 1050, 1400):
        b += f'<rect x="{x}" y="760" width="90" height="70" rx="12" fill="#b9765a"/><circle cx="{x+45}" cy="730" r="50" fill="#7a9c78"/>'
    return svg(b, d)

def scene_actividad():
    d = '<linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf4e8"/><stop offset="1" stop-color="#eee2cc"/></linearGradient>'
    b = f'<rect width="{W}" height="{H}" fill="url(#w)"/>'
    b += '<rect x="200" y="420" width="1200" height="40" rx="20" fill="#c9a882"/>'
    b += '<rect x="300" y="300" width="300" height="200" rx="10" fill="#ffffff" transform="rotate(-6 450 400)"/><path d="M330 450 C 380 350, 450 420, 560 330" stroke="#7f9f7c" stroke-width="16" fill="none" transform="rotate(-6 450 400)"/>'
    b += '<rect x="700" y="280" width="260" height="190" rx="10" fill="#ffffff" transform="rotate(4 830 370)"/><circle cx="830" cy="370" r="60" fill="#f6d58e" transform="rotate(4 830 370)"/>'
    for i, c in enumerate(["#e57f6b", "#f6d58e", "#7f9f7c", "#6f9bb8", "#c08a5b"]):
        b += f'<rect x="{1040+i*60}" y="300" width="34" height="140" rx="10" fill="{c}"/>'
    b += '<circle cx="520" cy="640" r="70" fill="#f2b8a2"/><path d="M380 900 C 400 740, 640 740, 660 900 Z" fill="#7f9f7c"/>'
    b += '<circle cx="1080" cy="640" r="70" fill="#e9c3a0"/><path d="M940 900 C 960 740, 1200 740, 1220 900 Z" fill="#6f9bb8"/>'
    b += '<path d="M760 560 l20 -40 l20 40 l40 6 l-30 28 l8 42 l-38 -22 l-38 22 l8 -42 l-30 -28 z" fill="#f6d58e"/>'
    return svg(b, d)

def scene_fisio():
    d = '<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef4f2"/><stop offset="1" stop-color="#e2ebe6"/></linearGradient>'
    b = f'<rect width="{W}" height="{H}" fill="url(#w)"/><rect x="0" y="780" width="{W}" height="220" fill="#cfdccf"/>'
    b += '<rect x="1000" y="140" width="460" height="420" rx="18" fill="#d8ebf0" stroke="#fff" stroke-width="20"/>'
    b += '<rect x="200" y="520" width="700" height="18" rx="9" fill="#9aa7a0"/><rect x="200" y="640" width="700" height="18" rx="9" fill="#9aa7a0"/>'
    for x in (220, 860):
        b += f'<rect x="{x}" y="520" width="20" height="300" fill="#7f8a84"/>'
    b += '<circle cx="1180" cy="720" r="110" fill="#7f9f7c"/><circle cx="1150" cy="690" r="30" fill="#ffffff" opacity="0.3"/>'
    b += '<rect x="1340" y="740" width="160" height="40" rx="20" fill="#c08a5b"/><rect x="1370" y="700" width="40" height="120" rx="12" fill="#5f7d63"/><rect x="1430" y="700" width="40" height="120" rx="12" fill="#5f7d63"/>'
    return svg(b, d)

def scene_cocina():
    d = '<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf7ec"/><stop offset="1" stop-color="#f3e7d2"/></linearGradient>'
    b = f'<rect width="{W}" height="{H}" fill="url(#w)"/>'
    b += '<ellipse cx="800" cy="620" rx="560" ry="230" fill="#e9dcc4"/>'
    b += '<circle cx="640" cy="580" r="190" fill="#ffffff"/><circle cx="640" cy="580" r="140" fill="#f6efe3"/>'
    b += '<circle cx="600" cy="560" r="50" fill="#e57f6b"/><circle cx="690" cy="610" r="44" fill="#7f9f7c"/><circle cx="660" cy="520" r="30" fill="#f6d58e"/>'
    b += '<circle cx="1050" cy="520" r="110" fill="#ffffff"/><circle cx="1050" cy="520" r="80" fill="#c08a5b" opacity="0.8"/>'
    b += '<rect x="1220" y="380" width="70" height="300" rx="30" fill="#d8ebf0" opacity="0.9"/>'
    for i in range(6):
        b += f'<path d="M{300+i*30} 300 q 20 -40 0 -80" stroke="#ffffff" stroke-width="10" fill="none" opacity="0.7"/>'
    b += '<path d="M200 760 C 260 700, 320 720, 360 680 C 380 740, 300 800, 200 760 Z" fill="#7a9c78"/>'
    return svg(b, d)

def scene_biblioteca():
    d = '<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8efe0"/><stop offset="1" stop-color="#ecdcc2"/></linearGradient>'
    b = f'<rect width="{W}" height="{H}" fill="url(#w)"/><rect x="0" y="800" width="{W}" height="200" fill="#c9a882"/>'
    b += '<rect x="140" y="120" width="760" height="680" rx="16" fill="#a97650"/>'
    random.seed(7)
    for shelf in range(4):
        y = 150 + shelf * 165
        b += f'<rect x="160" y="{y+130}" width="720" height="16" fill="#8a6a4f"/>'
        x = 180
        while x < 860:
            w = random.randint(26, 46); h = random.randint(90, 128)
            b += f'<rect x="{x}" y="{y+130-h}" width="{w}" height="{h}" rx="4" fill="{random.choice(["#7f9f7c","#e57f6b","#f6d58e","#6f9bb8","#f4ede1","#5f7d63"])}"/>'
            x += w + 6
    b += '<rect x="1060" y="560" width="300" height="230" rx="50" fill="#7f9f7c"/><rect x="1030" y="500" width="80" height="300" rx="30" fill="#6f8f6f"/>'
    b += '<rect x="1300" y="300" width="14" height="500" fill="#8a6a4f"/><path d="M1240 300 L1374 300 L1340 220 L1274 220 Z" fill="#f6d58e"/><circle cx="1307" cy="330" r="80" fill="#fff4cf" opacity="0.4"/>'
    return svg(b, d)

SCENES = {
    "jardin.svg": scene_jardin,
    "fachada.svg": scene_fachada,
    "habitacion.svg": scene_habitacion,
    "salon.svg": scene_salon,
    "comedor.svg": scene_comedor,
    "terraza.svg": scene_terraza,
    "actividad.svg": scene_actividad,
    "fisioterapia.svg": scene_fisio,
    "cocina.svg": scene_cocina,
    "biblioteca.svg": scene_biblioteca,
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in SCENES.items():
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
            f.write(fn())
    print("ok", len(SCENES))
