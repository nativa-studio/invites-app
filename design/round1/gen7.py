# Page 7: a layouts test. The pool party as a stationery suite, Paperless Post feeling, cut-paper colour.
# A candidate for the future third Look card, "Our layouts".
import json
src = open("gen4.py").read()
exec(src.split("# Strip 1:")[0])

P = PAL
CREAM, PAPER, TERR, MUST, SAGE, OLIVE, PINK, BURG, COB, INK = (P[k] for k in ["cream","paper","terracotta","mustard","sage","olive","pink","burgundy","cobalt","ink"])
SHADOW = "box-shadow:0 18px 30px -18px rgba(42,35,32,0.45), 0 2px 4px rgba(42,35,32,0.08);"

def card(inner, w=330, bg=PAPER, rot=0, pad="26px 24px", tape=None, extra=""):
    t = f'<div style="position:absolute;left:50%;top:-12px;width:96px;height:26px;margin-left:-48px;background:{tape};opacity:0.85;transform:rotate(-3deg);border-radius:2px"></div>' if tape else ""
    return f'<div style="position:relative;width:{w}px;background:{bg};border-radius:10px;padding:{pad};box-sizing:border-box;transform:rotate({rot}deg);{SHADOW}display:flex;flex-direction:column;align-items:center;gap:12px;{extra}">{t}{inner}</div>'

def stamp():
    return f'''<div style="position:absolute;right:18px;top:16px;width:64px;height:76px;background:#FFFFFF;padding:5px;box-sizing:border-box;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.2)">
  <div style="width:100%;height:100%;background:{COB};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#FFFFFF;font-family:{DISPLAY}">
    {sun(30)}<div style="font-size:22px;line-height:1">6</div></div>
</div>'''

def envelope():
    # Terracotta envelope, gingham liner showing under the open flap, a stamp and a hand-written address.
    return f'''<div style="position:relative;width:346px;height:236px;margin-top:20px">
  <div style="position:absolute;left:0;right:0;top:0;height:150px;{gingham(SAGE)}clip-path:polygon(0 0,100% 0,50% 100%);border-radius:10px 10px 0 0"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:176px;background:{TERR};border-radius:10px;clip-path:polygon(0 0,50% 42%,100% 0,100% 100%,0 100%);{SHADOW}"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:176px;display:flex;align-items:flex-end;justify-content:flex-start;padding:0 0 22px 26px;box-sizing:border-box">
    <div style="font-family:{HAND};font-size:24px;line-height:1.2;color:{CREAM}">Oliver<br><span style="font-size:18px;opacity:0.9">plus family</span></div>
  </div>
  {stamp().replace('top:16px','top:80px')}
</div>'''

def scene():
    # The pool, cut paper: deck stripes, cobalt water, a ring, a diving board and the sun.
    return f'''<svg width="282" height="200" viewBox="0 0 282 200">
  <rect x="0" y="0" width="282" height="200" rx="8" fill="{CREAM}"/>
  <g>{''.join(f'<rect x="{x}" y="0" width="14" height="200" fill="{SAGE}" opacity="0.55"/>' for x in range(0,282,28))}</g>
  <circle cx="226" cy="46" r="26" fill="{MUST}"/>
  <g fill="{TERR}">{''.join(f'<rect x="222" y="6" width="8" height="14" rx="4" transform="rotate({a} 226 46)"/>' for a in range(0,360,45))}</g>
  <path d="M0 96c30-14 60-14 94 0s60 14 94 0 60-14 94 0V200H0z" fill="{COB}"/>
  <path d="M0 122c30-10 60-10 94 0s60 10 94 0 60-10 94 0" stroke="#FFFFFF" stroke-width="4" fill="none" opacity="0.6"/>
  <path d="M0 154c30-10 60-10 94 0s60 10 94 0 60-10 94 0" stroke="#FFFFFF" stroke-width="4" fill="none" opacity="0.35"/>
  <rect x="14" y="66" width="86" height="12" rx="4" fill="{OLIVE}"/><rect x="82" y="78" width="10" height="24" fill="{OLIVE}"/>
  <circle cx="150" cy="128" r="30" fill="{PINK}"/><circle cx="150" cy="128" r="14" fill="{COB}"/>
  <path d="M150 98a30 30 0 0 1 30 30h-16a14 14 0 0 0-14-14z" fill="#FFFFFF"/><path d="M150 158a30 30 0 0 1-30-30h16a14 14 0 0 0 14 14z" fill="#FFFFFF"/>
  <ellipse cx="46" cy="176" rx="28" ry="9" fill="{PINK}" opacity="0.9"/><circle cx="46" cy="166" r="9" fill="{TERR}"/>
</svg>'''

def main_card():
    return card("\n".join([
        scene(),
        f'<div style="font-family:{HAND};font-size:20px;letter-spacing:0.12em;color:{TERR};margin-top:6px">SPLASH! YOU\'RE INVITED</div>',
        title("Leo is<br>turning 6", 52, color=INK),
        f'<div style="font-family:{HAND};font-size:26px;color:{COB}">a pool party</div>',
        f'<div style="width:40px;height:3px;background:{MUST};border-radius:2px"></div>',
        para("Saturday 14 November<br>2 to 4pm", 17),
        f'<div style="font-size:13px;color:{INK};opacity:0.7">With love from Leo\'s mum and dad</div>',
    ]), rot=-1.5, tape=f"{MUST}AA")

def details_card():
    return card("\n".join([
        label("The details", TERR),
        f'<div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:16px;line-height:1.4;width:100%;max-width:290px">'
        f'<div style="font-family:{HAND};font-size:19px;color:{COB}">When</div><div>Saturday 14 November, 2 to 4pm</div>'
        f'<div style="font-family:{HAND};font-size:19px;color:{COB}">Where</div><div>Our building\'s pool<br>12 Example Street, Paddington</div>'
        f'<div style="font-family:{HAND};font-size:19px;color:{COB}">Wear</div><div>Swimmers, rashie, a hat</div></div>',
        f'<a href="#" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border-radius:999px;background:{COB};color:#FFFFFF;font-family:{DISPLAY};font-size:17px;text-decoration:none">Open in Maps</a>',
    ]), rot=1.2, bg="#FFFFFF")

def day_card():
    rows = [("2:00", gate(52), "Arrive", "Visitor carpark, entry off Example Street. We'll meet you at the pool gate."),
            ("2:15", ring(52), "Swim", "Showers and change rooms available, plenty of shade."),
            ("3:15", cake(52), "Cake and BBQ", "We'll have a BBQ going. Tell us about allergies when you reply."),
            ("4:00", car(52), "Pick up", "Parents welcome to stay or drop off.")]
    inner = "".join(f'''<div style="display:grid;grid-template-columns:44px 56px 1fr;gap:8px;align-items:start;width:100%">
  <div style="font-family:{DISPLAY};font-size:18px;color:{TERR};padding-top:14px">{t}</div><div>{ic}</div>
  <div style="padding-top:8px"><div style="font-family:{DISPLAY};font-size:20px;line-height:1">{n}</div><div style="font-size:14px;line-height:1.45;opacity:0.78">{b}</div></div></div>''' for t,ic,n,b in rows)
    return card(label("The order of the afternoon", OLIVE) + f'<div style="display:flex;flex-direction:column;gap:14px;width:100%">{inner}</div>', rot=-0.8, bg=CREAM, extra=f"border:6px solid #FFFFFF;")

def know_card():
    lines = [icon_line(towel(48), "Swimmers, towel and a rashie. We have sunscreen."),
             icon_line(gift(48), "Gifts are entirely optional. There's also a group gift, Sarah is organising it."),
             icon_line(kids(48), "We're keeping it to invited kids only. Sorry, siblings!"),
             icon_line(camera(48), "We'd love you to take photos, just please keep photos of the kids off social media. Thank you!")]
    return card(label("Good to know", COB) + f'<div style="display:flex;flex-direction:column;gap:12px">{"".join(lines)}</div>', rot=1, bg="#FFFFFF", tape=f"{SAGE}CC")

def reply_card():
    # The wedding reply card, made friendly: the guest's name is already written in.
    return card("\n".join([
        f'<div style="font-family:{DISPLAY};font-size:34px;color:{TERR};letter-spacing:0.02em">RSVP</div>',
        f'<div style="font-family:{HAND};font-size:22px;line-height:1.3;text-align:center;color:{INK}">Can <span style="border-bottom:2px solid {COB};padding:0 6px;color:{COB}">Oliver</span> make it?</div>',
        para("Please reply by 1 November so we can get the numbers right.", 15),
        btn("Yes, we're coming", TERR, "#FFFFFF"),
        btn("Sorry, can't make it", "transparent", INK, INK),
    ]), rot=-1.2, bg=PAPER, extra=f"border:3px dashed {SAGE};")

def after_card():
    return card(f'''<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%">
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center">{bubble(48)}<div style="font-family:{DISPLAY};font-size:19px">Updates</div><div style="font-size:13px;opacity:0.72">Anything that changes shows here.</div></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center">{camera(48)}<div style="font-family:{DISPLAY};font-size:19px">Photos</div><div style="font-size:13px;opacity:0.72">A photo for you after the party.</div></div></div>''', rot=0.6, bg=CREAM)

def greeting():
    return f'<div style="font-family:{HAND};font-size:15px;letter-spacing:0.14em;text-transform:uppercase;color:{INK};margin-top:28px">Hi Oliver, something for you</div>'

GROUND = f"background-color:{CREAM};background-image:radial-gradient({SAGE}66 1.5px, transparent 1.6px);background-size:18px 18px;"

def strip_shell(body, h):
    return shell(body, h, CREAM).replace(f"background:{CREAM};font-family:{BODY}", f"{GROUND}font-family:{BODY}", 1).replace("gap:26px;padding:0 22px 40px", "gap:34px;padding:0 22px 48px")

suite = "\n".join([greeting(), envelope(), main_card(), details_card(), day_card(), know_card(), reply_card(), after_card(),
    f'<div style="font-size:13px;opacity:0.7">Questions? Text Leo\'s mum</div>'])
open("SuiteStrip.dc.html", "w").write(strip_shell(suite, 2900))

# The flat lay: the whole suite spread on the table, the way a wedding suite is photographed.
def placed(x, y, rot, inner, scale=1):
    return f'<div style="position:absolute;left:{x}px;top:{y}px;transform:rotate({rot}deg) scale({scale});transform-origin:top left">{inner}</div>'
flat = f'''<div style="position:relative;width:1180px;height:980px;{GROUND}overflow:hidden;font-family:{BODY};color:{INK}">
  <div style="position:absolute;left:36px;top:30px;font-family:{DISPLAY};font-size:30px;color:{INK}">Leo's pool party as a stationery suite</div>
  <div style="position:absolute;left:36px;top:70px;font-size:15px;max-width:520px;line-height:1.5;opacity:0.8">Every piece a wedding suite has, translated: the envelope and stamp, the invitation, the details card, the order of the afternoon, good to know, the reply card with the guest's name already written in. The strip on the right stacks the same pieces for a phone.</div>
  {placed(40, 180, -6, envelope())}
  {placed(400, 130, 2, main_card(), 0.92)}
  {placed(60, 470, 3, details_card(), 0.85)}
  {placed(420, 690, -2, reply_card(), 0.85)}
  {placed(760, 120, -3, day_card(), 0.8)}
  {placed(800, 600, 2, know_card(), 0.8)}
</div>'''
open("SuiteFlatLay.dc.html", "w").write(shell(flat, 980, CREAM).replace("width:390px;min-height:980px", "width:1180px;min-height:980px").replace("padding:0 22px 40px", "padding:0"))

boards = [("SuiteFlatLay.dc.html", 0, 0, 1180, 980, "The suite, flat lay"),
          ("SuiteStrip.dc.html", 1280, 0, 390, 2900, "The suite as the guest's phone page")]
notes = [{"id": "layouts-intro", "x": 0, "y": 1040, "w": 1180, "page": "page-7", "text":
 "Layouts test: the pool party as a stationery suite. This is the wedding-suite idea from the Pinterest references (invitation, details card, order of the day, reply card) with a Paperless Post feel: an envelope, a stamp, cards on a table, and the guest's own name already written on the reply card. Cut-paper colour from the board, chunky lettering, gingham liner, washi tape.\n\n"
 "Why it matters: it is a candidate for the third Look card, Our layouts. A layout is a different skin over the same strip: the same sections in the same order (cover, the details, the day, good to know, RSVP, after), so the RSVP, calendar and everything after it are the same components. Each card here is one section of the strip wearing a card. That keeps a new layout to presentation code and artwork, not new behaviour, which is the cost test this page is for.\n\n"
 "Borderline placements, per the moment-of-need check: the details card carries a Wear line because for a pool party it decides the packing, and the order of the afternoon keeps the carpark and showers where they are needed, at arrive and swim, not on the invitation card."}]
c = json.load(open("canvas.json"))
c["artboards"] = [a for a in c["artboards"] if a.get("page") != "page-7"]
c["annotations"] = [a for a in c["annotations"] if a.get("page") != "page-7"]
for f, x, y, w, h, t in boards:
    c["artboards"].append({"file": f, "x": x, "y": y, "w": w, "h": h, "title": t, "page": "page-7"})
c["annotations"] += notes
if not any(p["id"] == "page-7" for p in c["pages"]):
    c["pages"].append({"id": "page-7", "name": "Layouts test"})
c["launch"] = {"view": "canvas", "page": "page-7"}
json.dump(c, open("canvas.json", "w"), indent=1)
print("gen7 done")
