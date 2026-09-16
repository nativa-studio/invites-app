# Page 8: Gabriel's 4th, a Pokemon party, in the retro poster style of Marcia's reference.
# Same stationery-suite layout as page 7 with the palette swapped, which is the point: a layout takes a palette.
import json
src = open("gen7.py").read()
exec(src.split("suite = ")[0])

# The poster palette: cobalt sky, navy outlines, yellow field, cream clouds, red cheeks.
SKY, NAVY, YEL, CRM, RED, FOREST, DEEP = "#2B6CB0", "#1B2A4A", "#F5C531", "#F3E3B5", "#D9432C", "#2F7F7A", "#E0A424"
TERR, COB, MUST, SAGE, OLIVE, PINK, BURG, INK, CREAM, PAPER = RED, SKY, YEL, "#8FBFD8", NAVY, CRM, RED, NAVY, "#F7EBCB", "#FFF8E6"
for k, v in dict(terracotta=RED, cobalt=SKY, mustard=YEL, sage="#8FBFD8", olive=NAVY, pink=CRM, burgundy=RED, ink=NAVY, cream="#F7EBCB", paper="#FFF8E6").items():
    PAL[k] = v
GROUND = f"background-color:{SKY};background-image:radial-gradient({NAVY}33 1.6px, transparent 1.7px);background-size:14px 14px;"

def halftone(id_, c, r=1.6, s=8):
    return f'<pattern id="{id_}" width="{s}" height="{s}" patternUnits="userSpaceOnUse"><circle cx="{s/2}" cy="{s/2}" r="{r}" fill="{c}"/></pattern>'

def poster_scene():
    # Original landscape in the reference's style: sky, halftone clouds, mountain, tree line, field. No characters.
    return f'''<svg width="282" height="250" viewBox="0 0 282 250">
  <defs>{halftone("ht1", NAVY, 1.3, 7)}{halftone("ht2", DEEP, 1.8, 8)}{halftone("ht3", "#FFFFFF", 1.4, 7)}
    <clipPath id="pc"><rect x="0" y="0" width="282" height="250" rx="8"/></clipPath></defs>
  <g clip-path="url(#pc)">
  <rect width="282" height="250" fill="{SKY}"/>
  <rect width="282" height="250" fill="url(#ht3)" opacity="0.18"/>
  <g stroke="{NAVY}" stroke-width="3" stroke-linejoin="round">
    <path d="M-10 120c0-22 30-30 46-22 6-24 44-30 58-10 14-18 50-12 54 10 24-8 44 10 40 30H-10z" fill="{CRM}"/>
    <path d="M150 112c2-30 46-40 66-18 10-22 54-22 62 4 16-4 30 6 28 22H150z" fill="{CRM}"/>
    <path d="M96 66c4-10 24-10 28 0z" fill="{CRM}"/><path d="M180 60c4-8 20-8 24 0z" fill="{CRM}"/>
  </g>
  <rect x="0" y="86" width="282" height="40" fill="url(#ht1)" opacity="0.35"/>
  <g stroke="{NAVY}" stroke-width="3" stroke-linejoin="round">
    <path d="M40 170l70-76 40 22 36-42 70 96z" fill="#4A78B6"/>
    <path d="M110 94l-18 22 12-4 10 12 10-10 12 8 6-14 8 8 4-14-8 2-10-10-14 4z" fill="#FFFFFF"/>
    <path d="M186 74l-16 20 10-2 8 10 10-8 10 6 6-10 6 6 2-12-8 2-10-8-12 2z" fill="#FFFFFF"/>
    <path d="M-10 172l30-14 26 10 24-8 26 6 30-10 40 12 40-8 40 10 36-6v22H-10z" fill="{FOREST}"/>
    <path d="M-10 174c30 6 60-4 90 4s70-8 100 2 60-4 102 0v14H-10z" fill="{NAVY}"/>
  </g>
  <rect x="-10" y="186" width="302" height="70" fill="{YEL}" stroke="{NAVY}" stroke-width="3"/>
  <rect x="0" y="186" width="282" height="70" fill="url(#ht2)" opacity="0.6"/>
  <g fill="{FOREST}" stroke="{NAVY}" stroke-width="2.5" stroke-linejoin="round">
    <path d="M30 216l10-18 10 18z"/><path d="M52 222l9-16 9 16z"/><path d="M228 214l10-18 10 18z"/><path d="M250 220l9-16 9 16z"/>
  </g>
  <g stroke="{NAVY}" stroke-width="3" stroke-linejoin="round">
    <path d="M150 196l-16 30h14l-8 26 30-36h-16l10-20z" fill="{YEL}"/>
  </g>
  </g>
  <rect x="1.5" y="1.5" width="279" height="247" rx="8" fill="none" stroke="{NAVY}" stroke-width="3"/>
</svg>'''

def artwork_slot():
    # Where the host's own Pikachu image sits, cropped into the corner the way the reference does it.
    return f'''<div style="position:absolute;right:-6px;bottom:-6px;width:150px;height:120px;border:3px dashed {NAVY};border-radius:14px 0 8px 0;background:{YEL}CC;display:flex;align-items:center;justify-content:center;text-align:center;font-family:{HAND};font-size:15px;line-height:1.2;color:{NAVY};padding:10px;box-sizing:border-box">Your Pikachu picture goes here</div>'''

def stamp():
    return f'''<div style="position:absolute;right:18px;top:200px;width:64px;height:76px;background:#FFFFFF;padding:5px;box-sizing:border-box;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.2)">
  <div style="width:100%;height:100%;background:{SKY};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#FFFFFF;font-family:{DISPLAY};border:2px solid {NAVY}">
    <svg width="26" height="30" viewBox="0 0 26 30"><path d="M14 1L2 17h9l-4 12 17-18h-9l5-10z" fill="{YEL}" stroke="{NAVY}" stroke-width="2" stroke-linejoin="round"/></svg><div style="font-size:22px;line-height:1">4</div></div>
</div>'''

def envelope():
    return f'''<div style="position:relative;width:346px;height:300px;margin-top:6px;filter:drop-shadow(0 16px 14px rgba(27,42,74,0.35))">
  <div style="position:absolute;left:0;right:0;top:0;height:120px;{gingham(SKY)}clip-path:polygon(50% 0,100% 100%,0 100%)"></div>
  <div style="position:absolute;left:0;right:0;top:0;height:120px;background:{RED};clip-path:polygon(50% 0,100% 100%,97% 100%,50% 6%,3% 100%,0 100%)"></div>
  <div style="position:absolute;left:0;right:0;top:118px;height:182px;background:{RED};border-radius:0 0 10px 10px"></div>
  <div style="position:absolute;left:34px;right:34px;top:64px;height:150px;background:{PAPER};border-radius:6px 6px 0 0;box-shadow:0 -2px 6px rgba(27,42,74,0.15);display:flex;flex-direction:column;align-items:center;padding-top:14px;gap:4px;border:3px solid {NAVY};border-bottom:0">
    <div style="font-family:{HAND};font-size:14px;letter-spacing:0.12em;color:{RED}">TRAINER WANTED</div>
    <div style="font-family:{DISPLAY};font-size:26px;line-height:1;color:{NAVY}">Gabriel is turning 4</div>
  </div>
  <div style="position:absolute;left:0;right:0;top:118px;height:182px;background:#B5301C;border-radius:0 0 10px 10px;clip-path:polygon(0 0,50% 58%,100% 0,100% 100%,0 100%)"></div>
  <div style="position:absolute;left:0;right:0;top:118px;height:182px;background:{RED};border-radius:0 0 10px 10px;clip-path:polygon(0 0,50% 58%,100% 0,100% 6%,50% 64%,0 6%);opacity:0.6"></div>
  <div style="position:absolute;left:26px;bottom:20px;font-family:{HAND};font-size:24px;line-height:1.2;color:{CRM}">Mia<br><span style="font-size:18px;opacity:0.9">plus family</span></div>
  {stamp()}
</div>'''

def pcard(inner, **kw):
    # Poster-style card: navy keyline, no rounded softness.
    return card(inner, **kw).replace("border-radius:10px;", f"border-radius:8px;border:3px solid {NAVY};", 1)

def main_card():
    return pcard("\n".join([
        f'<div style="position:relative">{poster_scene()}{artwork_slot()}</div>',
        f'<div style="font-family:{HAND};font-size:20px;letter-spacing:0.12em;color:{RED};margin-top:10px">TRAINER WANTED</div>',
        title("Gabriel is<br>turning 4", 52, color=NAVY),
        f'<div style="font-family:{HAND};font-size:26px;color:{SKY}">a Pok&eacute;mon party</div>',
        f'<div style="width:40px;height:4px;background:{YEL};border:2px solid {NAVY};border-radius:2px"></div>',
        para("Saturday 21 November<br>10am to 12pm", 17, color=NAVY),
        f'<div style="font-size:13px;color:{NAVY};opacity:0.75">With love from Gabriel\'s mum and dad</div>',
    ]), rot=-1.5, bg=PAPER, tape=f"{YEL}DD")

def details_card():
    return pcard("\n".join([
        label("The details", RED),
        f'<div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:16px;line-height:1.4;width:100%;max-width:290px;color:{NAVY}">'
        f'<div style="font-family:{HAND};font-size:19px;color:{SKY}">When</div><div>Saturday 21 November, 10am to 12pm</div>'
        f'<div style="font-family:{HAND};font-size:19px;color:{SKY}">Where</div><div>At our place<br>12 Example Street, Paddington</div>'
        f'<div style="font-family:{HAND};font-size:19px;color:{SKY}">Wear</div><div>Come as your favourite Pok&eacute;mon, or just come</div></div>',
        f'<a href="#" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border-radius:999px;background:{SKY};color:#FFFFFF;border:3px solid {NAVY};font-family:{DISPLAY};font-size:17px;text-decoration:none">Open in Maps</a>',
    ]), rot=1.2, bg="#FFFFFF")

def bolt(size=52):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M36 4L12 36h18l-8 24 30-36H34l10-20z" fill="{YEL}" stroke="{NAVY}" stroke-width="3" stroke-linejoin="round"/></svg>'
def ball(size=52):
    # A red and white ball with a band: the closest we go to the trademark.
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#FFFFFF" stroke="{NAVY}" stroke-width="3"/><path d="M6 32a26 26 0 0 1 52 0z" fill="{RED}" stroke="{NAVY}" stroke-width="3"/><path d="M6 32h52" stroke="{NAVY}" stroke-width="4"/><circle cx="32" cy="32" r="8" fill="#FFFFFF" stroke="{NAVY}" stroke-width="3"/></svg>'
def cakep(size=52):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><rect x="12" y="34" width="40" height="22" rx="3" fill="{YEL}" stroke="{NAVY}" stroke-width="3"/><path d="M12 38c6 6 10-4 16 2s10-4 16 2 6-2 8 0v-4H12z" fill="{RED}" stroke="{NAVY}" stroke-width="2"/><g stroke="{NAVY}" stroke-width="3" stroke-linecap="round"><path d="M20 34V22M32 34V20M44 34V22"/></g><g fill="{RED}"><circle cx="20" cy="18" r="3"/><circle cx="32" cy="16" r="3"/><circle cx="44" cy="18" r="3"/></g></svg>'
def carp(size=52):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M10 40l6-12h32l6 12z" fill="{SKY}" stroke="{NAVY}" stroke-width="3" stroke-linejoin="round"/><rect x="6" y="38" width="52" height="14" rx="4" fill="{RED}" stroke="{NAVY}" stroke-width="3"/><circle cx="18" cy="54" r="5" fill="{NAVY}"/><circle cx="46" cy="54" r="5" fill="{NAVY}"/></svg>'
def giftp(size=48):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><rect x="12" y="26" width="40" height="30" rx="3" fill="{RED}" stroke="{NAVY}" stroke-width="3"/><rect x="28" y="26" width="8" height="30" fill="{YEL}" stroke="{NAVY}" stroke-width="2"/><rect x="10" y="20" width="44" height="10" rx="3" fill="{SKY}" stroke="{NAVY}" stroke-width="3"/></svg>'
def camp(size=48):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><rect x="8" y="20" width="48" height="32" rx="6" fill="{SKY}" stroke="{NAVY}" stroke-width="3"/><circle cx="32" cy="36" r="10" fill="{CRM}" stroke="{NAVY}" stroke-width="3"/><circle cx="32" cy="36" r="4" fill="{NAVY}"/><rect x="22" y="12" width="20" height="10" rx="3" fill="{RED}" stroke="{NAVY}" stroke-width="3"/></svg>'
def kidsp(size=48):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><circle cx="22" cy="18" r="8" fill="{YEL}" stroke="{NAVY}" stroke-width="3"/><circle cx="44" cy="24" r="6" fill="{CRM}" stroke="{NAVY}" stroke-width="3"/><path d="M8 56v-8a14 14 0 0 1 28 0v8z" fill="{RED}" stroke="{NAVY}" stroke-width="3"/><path d="M36 56v-5a9 9 0 0 1 18 0v5z" fill="{SKY}" stroke="{NAVY}" stroke-width="3"/></svg>'
def capp(size=48):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64"><path d="M12 36a20 20 0 0 1 40 0z" fill="{RED}" stroke="{NAVY}" stroke-width="3"/><path d="M8 36h52l-6 8H14z" fill="{CRM}" stroke="{NAVY}" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="34" r="6" fill="#FFFFFF" stroke="{NAVY}" stroke-width="3"/></svg>'

def day_card():
    rows = [("10:00", capp(52), "Arrive", "Trainers welcome from 10. Park on the street, come through the side gate."),
            ("10:15", ball(52), "Catch them all", "A treasure hunt around the garden. Every trainer goes home with a catch."),
            ("11:00", cakep(52), "Cake", "Pikachu cake and party food. Tell us about allergies when you reply."),
            ("12:00", carp(52), "Pick up", "Parents welcome to stay, this one's short and sweet.")]
    inner = "".join(f'''<div style="display:grid;grid-template-columns:48px 56px 1fr;gap:8px;align-items:start;width:100%">
  <div style="font-family:{DISPLAY};font-size:17px;color:{RED};padding-top:14px">{t}</div><div>{ic}</div>
  <div style="padding-top:8px"><div style="font-family:{DISPLAY};font-size:20px;line-height:1;color:{NAVY}">{n}</div><div style="font-size:14px;line-height:1.45;color:{NAVY};opacity:0.78">{b}</div></div></div>''' for t,ic,n,b in rows)
    return pcard(label("The morning", SKY) + f'<div style="display:flex;flex-direction:column;gap:14px;width:100%">{inner}</div>', rot=-0.8, bg=CREAM)

def know_card():
    lines = [icon_line(capp(48), "Dress-ups are welcome and completely optional. Gabriel will be Pikachu, obviously."),
             icon_line(giftp(48), "No need for a gift. If you'd like to, something small: Gabriel loves books and anything with wheels."),
             icon_line(kidsp(48), "Little brothers and sisters are welcome, just let us know in your reply."),
             icon_line(camp(48), "We'd love you to take photos, just please keep photos of the kids off social media. Thank you!")]
    return pcard(label("Good to know", RED) + f'<div style="display:flex;flex-direction:column;gap:12px">{"".join(lines)}</div>', rot=1, bg="#FFFFFF", tape=f"{SKY}AA")

def reply_card():
    return pcard("\n".join([
        f'<div style="display:flex;align-items:center;gap:10px">{bolt(34)}<div style="font-family:{DISPLAY};font-size:34px;color:{RED};letter-spacing:0.02em">RSVP</div>{bolt(34)}</div>',
        f'<div style="font-family:{HAND};font-size:22px;line-height:1.3;text-align:center;color:{NAVY}">Can <span style="border-bottom:2px solid {SKY};padding:0 6px;color:{SKY}">Mia</span> make it?</div>',
        para("Please reply by 7 November so we can get the numbers right.", 15, color=NAVY),
        btn("Yes, we're coming", RED, "#FFFFFF", NAVY),
        btn("Sorry, can't make it", "transparent", NAVY, NAVY),
    ]), rot=-1.2, bg=PAPER)

def after_card():
    return pcard(f'''<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%">
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center">{bolt(48)}<div style="font-family:{DISPLAY};font-size:19px;color:{NAVY}">Updates</div><div style="font-size:13px;color:{NAVY};opacity:0.72">Anything that changes shows here.</div></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center">{camp(48)}<div style="font-family:{DISPLAY};font-size:19px;color:{NAVY}">Photos</div><div style="font-size:13px;color:{NAVY};opacity:0.72">A photo for you after the party.</div></div></div>''', rot=0.6, bg=CREAM)

def greeting():
    return f'<div style="font-family:{HAND};font-size:15px;letter-spacing:0.14em;text-transform:uppercase;color:{CRM};margin-top:28px">Hi Mia, something for you</div>'

def strip_shell(body, h):
    return shell(body, h, SKY).replace(f"background:{SKY};font-family:{BODY}", f"{GROUND}font-family:{BODY}", 1).replace("gap:26px;padding:0 22px 40px", "gap:34px;padding:0 22px 48px")

suite = "\n".join([greeting(), envelope(), main_card(), details_card(), day_card(), know_card(), reply_card(), after_card(),
    f'<div style="font-size:13px;color:{CRM}">Questions? Text Gabriel\'s mum</div>'])
open("GabrielSuite.dc.html", "w").write(strip_shell(suite, 3140))

# The cover card on its own, large, so the poster scene can be judged.
cover = f'<div style="padding:40px 0">{main_card()}</div>'
open("GabrielCover.dc.html", "w").write(strip_shell(cover, 760))

boards = [("GabrielCover.dc.html", 0, 0, 390, 760, "The invitation card"),
          ("GabrielSuite.dc.html", 480, 0, 390, 3140, "Gabriel's 4th, the whole suite")]
notes = [{"id": "gabriel-intro", "x": 0, "y": 820, "w": 390, "page": "page-8", "text":
 "Gabriel's 4th, a Pokemon party, in the style of the reference: cobalt sky, halftone clouds, navy keylines, a snowy mountain over a yellow field, red and yellow accents. It is the page 7 suite layout with the palette swapped, and nothing else changed, which is the proof that a layout takes a palette.\n\n"
 "The landscape is drawn fresh in that style. Pikachu himself is not: he is Nintendo's character, so he cannot ship inside the app's artwork. The dashed corner on the invitation card is where Marcia's own Pikachu picture drops in, cropped into the corner exactly as the reference does it. That is the upload path, and for a private party it is fine.\n\n"
 "Guest here is Mia. Dates, address and the programme are stand-ins for Marcia to replace. Access details (side gate, street parking) sit on Arrive, and the dress-up line sits in good to know because it decides what to bring, not whether to come."}]
c = json.load(open("canvas.json"))
c["artboards"] = [a for a in c["artboards"] if a.get("page") != "page-8"]
c["annotations"] = [a for a in c["annotations"] if a.get("page") != "page-8"]
for f, x, y, w, h, t in boards:
    c["artboards"].append({"file": f, "x": x, "y": y, "w": w, "h": h, "title": t, "page": "page-8"})
c["annotations"] += notes
if not any(p["id"] == "page-8" for p in c["pages"]):
    c["pages"].append({"id": "page-8", "name": "Gabriel's 4th"})
c["launch"] = {"view": "canvas", "page": "page-8"}
json.dump(c, open("canvas.json", "w"), indent=1)
print("gen8 done")
