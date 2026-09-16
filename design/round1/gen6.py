# Two looks, one strip. Same event (Leo's 6th) under each Look choice a host can make.
import json
src = open("gen3.py").read()
exec(src.split("# 1. Leo's pool party, full strip")[0])
poster_src = open("gen.py").read()
exec("def poster():" + poster_src.split("def poster():")[1].split("\ndef page(")[0])

ink = "#1F1B17"; paper = "#FBF6EC"
OUTFIT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&display=swap">'

def frame(paper, ink, sections, h, extra_head=""):
    return strip(paper, ink, sections, h).replace("<helmet>", "<helmet>" + extra_head, 1)

def greeting():
    return '<div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;text-align:center">Hi Oliver, you\'re invited</div>'

def maps(ink):
    return f'<a href="#" style="display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;border:2px solid {ink};border-radius:999px;text-decoration:none;font-weight:700">{svg(D["map"], 22, ink)}Open in Maps</a>'

def details(ink):
    return [divider(ink), title("The details"), para("Saturday 14 November<br>2 to 4pm<br>12 Example Street, Paddington"), maps(ink)]

def day_icons(ink):
    return [divider(ink), title("The day"),
      '<div style="display:flex;flex-direction:column;gap:18px;width:100%">' + "\n".join([
        stop("2:00","gate","Arrive","Visitor carpark, entry off Example Street. We'll meet you at the pool gate.", ink),
        stop("2:15","ring","Swim","Showers and change rooms available, plenty of shade.", ink),
        stop("3:15","cake","Cake and BBQ","We'll have a BBQ going. Tell us about allergies when you reply.", ink),
      ]) + '</div>']

def plain_stop(t, label, body, ink):
    return f'''<div style="display:grid;grid-template-columns:52px 1fr;gap:14px;align-items:start;border-left:2px solid {ink};padding-left:14px">
  <div style="font-family:{HEAD};font-size:20px;padding-top:4px">{t}</div>
  <div><div style="font-family:{HEAD};font-size:22px;line-height:1">{label}</div><div style="font-size:15px;line-height:1.45;opacity:0.72">{body}</div></div>
</div>'''

def day_plain(ink):
    return [divider(ink), title("The day"),
      '<div style="display:flex;flex-direction:column;gap:18px;width:100%">' + "\n".join([
        plain_stop("2:00","Arrive","Visitor carpark, entry off Example Street. We'll meet you at the pool gate.", ink),
        plain_stop("2:15","Swim","Showers and change rooms available, plenty of shade.", ink),
        plain_stop("3:15","Cake and BBQ","We'll have a BBQ going. Tell us about allergies when you reply.", ink),
      ]) + '</div>']

def more(ink):
    return [f'<div style="font-size:13px;opacity:0.55;text-align:center">Good to know, RSVP and after continue below,<br>the same in all four</div>']

intro = para("A pool party at our building's pool. Come for a swim, a sausage and some cake.")
H = 1500

# 2. Our artwork: the monoline set, as on the Illustrated strip page.
artwork = "\n".join([greeting(), cluster(["balloon","sun","ring"], ink), title("Leo is<br>turning 6", 54), intro] + details(ink) + day_icons(ink) + more(ink))
open("CoverArtwork.dc.html","w").write(frame(paper, ink, artwork, H))

# 3. Upload a photo: the host's own photo is the cover, the app types the title under it.
photo = f'''<div style="position:relative;width:346px;height:400px;border-radius:14px;overflow:hidden;background:
 radial-gradient(circle at 30% 28%, #F2D9B8 0 22%, transparent 23%),
 radial-gradient(circle at 70% 70%, rgba(255,255,255,0.35) 0 30%, transparent 31%),
 linear-gradient(180deg,#9FCBE8 0%,#5FA8D8 55%,#2F7FBF 100%)">
  <svg width="346" height="400" viewBox="0 0 346 400" fill="none" stroke="rgba(31,27,23,0.55)" stroke-width="3" stroke-linecap="round" style="position:absolute;inset:0">
    <path d="M0 300c40-16 80-16 120 0s80 16 120 0 66-16 106 0"/><path d="M0 340c40-16 80-16 120 0s80 16 120 0 66-16 106 0"/>
    <circle cx="104" cy="118" r="40"/><path d="M84 106c8 6 32 6 40 0M94 126c4 4 16 4 20 0"/><path d="M104 158v70M104 190l-40 30M104 190l40 34M70 250c-20 10-36 30-40 50M140 250c20 10 36 30 40 50"/>
  </svg>
  <div style="position:absolute;right:14px;bottom:12px;font-size:12px;color:rgba(255,255,255,0.9);background:rgba(31,27,23,0.45);padding:4px 10px;border-radius:999px">the host's own photo</div>
</div>'''
upload_photo = "\n".join([greeting(), photo, title("Leo is<br>turning 6", 54), intro] + details("#2F5DA8") + day_plain("#2F5DA8") + more(ink))
open("CoverPhoto.dc.html","w").write(frame(paper, ink, upload_photo, H))

# 4. Upload a finished invite: shown as is, the details strip carries on below in the accent picked from it.
upload_invite = "\n".join([greeting(), poster()] + details("#1B6FC2") + day_plain("#1B6FC2") + more(ink))
open("CoverInvite.dc.html","w").write(frame(paper, ink, upload_invite, H, OUTFIT))

boards = [
 ("CoverArtwork.dc.html", "Our artwork (the default; monoline set, phase 1)"),
 ("CoverPhoto.dc.html", "Upload: a photo"),
 ("CoverInvite.dc.html", "Upload: a finished invite"),
]
notes = [{"id": "covers-intro", "x": 0, "y": -140, "w": 1420, "page": "page-6", "text": "One strip, three covers, two choices. The Look step has two cards: Our artwork (the default, so a host who skips the step still gets a drawn invite) and Upload. Upload takes a photo or a finished invite and the app tells them apart. There is no separate text-only look: the artwork already is the plain version, and the Quiet set is the plainest. Only the cover changes; the details, the day, good to know, RSVP and after are the same strip underneath.\nOur artwork: the chosen set draws the cover and the small icons down the strip. Upload a photo: the photo is the cover, the app types the title and intro under it, and the strip below runs in an ink picked from the photo. Upload a finished invite: shown as it was made, then the strip below in an ink picked from it. In both upload cases the host can keep the small drawings from any set.\n\nWhy this is cheap to grow: everything from The details down is one neutral set of components that only takes an ink colour and, optionally, an icon set. A new theme is artwork files, no code. A new cover treatment (envelope opening, ticket, cut-paper) is one component swapped at the top. A whole new page structure would be real development, which is why the strip is the one structure and the cover is where the personality lives."}]
c = json.load(open("canvas.json"))
c["artboards"] = [a for a in c["artboards"] if a.get("page") != "page-6"]
c["annotations"] = [a for a in c["annotations"] if a.get("page") != "page-6"]
for i, (f, t) in enumerate(boards):
    c["artboards"].append({"file": f, "x": i*480, "y": 200, "w": 390, "h": H, "title": t, "page": "page-6"})
c["annotations"] += notes
if not any(p["id"] == "page-6" for p in c["pages"]):
    c["pages"].append({"id": "page-6", "name": "Two looks"})
c["launch"] = {"view": "canvas", "page": "page-6"}
json.dump(c, open("canvas.json", "w"), indent=1)
print("gen6 done")
