# The illustrated strip: one skeleton, four event types, monoline doodles in one ink colour.
import json

FONTS = "https://fonts.googleapis.com/css2?family=Patrick+Hand+SC&family=Nunito+Sans:wght@400;700&display=swap"
HEAD = "'Patrick Hand SC', 'Comic Sans MS', cursive"
BODY = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif"

def svg(paths, size=56, ink="#1F1B17"):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64" fill="none" stroke="{ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{paths}</svg>'

D = {
 "balloon": '<path d="M32 8c-9 0-15 7-15 16 0 10 8 18 15 22 7-4 15-12 15-22 0-9-6-16-15-16z"/><path d="M30 46l2 4-2 4 2 4M22 20c0-4 3-7 6-8"/>',
 "sun": '<circle cx="32" cy="32" r="11"/><path d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M15 49l5-5M44 20l5-5"/>',
 "ring": '<ellipse cx="32" cy="34" rx="22" ry="12"/><ellipse cx="32" cy="34" rx="9" ry="5"/><path d="M14 30c4-6 32-6 36 0"/>',
 "cake": '<path d="M14 38h36v14H14zM14 38c0-6 36-6 36 0M20 30c0-4 4-4 4-8M32 30c0-4 4-4 4-8M44 30c0-4 4-4 4-8M18 40c4 4 8 0 12 4s8 0 12 4"/>',
 "sausage": '<path d="M10 38c0-8 44-8 44 0M10 38c0 8 44 8 44 0M16 30c6-8 26-8 32 0"/><path d="M24 18c0-3 3-3 3-6M36 18c0-3 3-3 3-6"/>',
 "car": '<path d="M12 40l4-12h32l4 12M8 40h48v10H8z"/><circle cx="18" cy="52" r="4"/><circle cx="46" cy="52" r="4"/><path d="M20 34h24"/>',
 "gate": '<path d="M12 56V20M52 56V20M12 22c14-10 26-10 40 0M20 56V30M28 56V26M36 56V26M44 56V30"/>',
 "towel": '<path d="M16 12h32v40H16zM16 22h32M16 42h32"/>',
 "gift": '<rect x="12" y="26" width="40" height="28" rx="2"/><path d="M12 36h40M32 26v28M32 26c-6 0-12-3-12-8s8-4 12 8c4-12 12-13 12-8s-6 8-12 8z"/>',
 "kids": '<circle cx="22" cy="18" r="7"/><circle cx="44" cy="24" r="5"/><path d="M8 56v-8a14 14 0 0 1 28 0v8M36 56v-5a9 9 0 0 1 18 0v5"/>',
 "shower": '<path d="M14 14a10 10 0 0 1 20 4h8a10 10 0 0 1 10 10v2H24v-2a10 10 0 0 1 2-6"/><path d="M28 38v3M36 38v8M44 38v3M32 50v3M40 50v3"/>',
 "glasses": '<path d="M12 12h16l-2 16a6 6 0 0 1-12 0zM20 34v16M12 50h16"/><path d="M40 20l8 4-4 22M36 46l14 4"/>',
 "disco": '<circle cx="32" cy="34" r="16"/><path d="M32 8v10M16 34h32M32 18v32M20 24c8 6 16 6 24 0M20 44c8-6 16-6 24 0"/>',
 "pram": '<path d="M10 20h8l4 16h28a12 12 0 0 1-12 12H22a12 12 0 0 1-12-12V20z"/><circle cx="24" cy="54" r="4"/><circle cx="46" cy="54" r="4"/><path d="M30 12c8-6 18 0 20 8"/>',
 "bunting": '<path d="M6 18c14 6 38 6 52 0"/><path d="M12 20l5 10 5-10M26 22l5 10 5-10M40 22l5 10 5-10"/>',
 "candle": '<path d="M26 30h12v24H26zM32 22c-4-4-2-9 0-10 2 1 4 6 0 10z"/><path d="M20 56h24"/>',
 "leaf": '<path d="M16 48C16 28 32 14 50 12c-2 18-14 34-34 36z"/><path d="M18 46c8-10 18-20 28-28"/>',
 "camera": '<rect x="10" y="20" width="44" height="30" rx="4"/><circle cx="32" cy="35" r="9"/><path d="M22 20l4-6h12l4 6"/>',
 "bubble": '<path d="M12 14h40v26H30l-10 10V40h-8z"/><path d="M20 24h24M20 30h16"/>',
 "map": '<path d="M32 56s16-14 16-28a16 16 0 0 0-32 0c0 14 16 28 16 28z"/><circle cx="32" cy="28" r="6"/>',
}

def title(t, size=40):
    return f'<div style="font-family:{HEAD};font-size:{size}px;line-height:1;text-align:center;letter-spacing:0.04em">{t}</div>'

def para(t, size=16):
    return f'<div style="font-size:{size}px;line-height:1.5;text-align:center;max-width:300px">{t}</div>'

def icon_line(name, t, ink):
    return f'<div style="display:flex;gap:12px;align-items:center;max-width:320px">{svg(D[name], 40, ink)}<div style="font-size:16px;line-height:1.45;flex:1">{t}</div></div>'

def stop(t, name, label, body, ink):
    return f'''<div style="display:grid;grid-template-columns:52px 44px 1fr;gap:10px;align-items:start">
  <div style="font-family:{HEAD};font-size:20px;text-align:right;padding-top:8px">{t}</div>
  <div style="display:flex;justify-content:center">{svg(D[name], 44, ink)}</div>
  <div style="padding-top:6px"><div style="font-family:{HEAD};font-size:22px;line-height:1">{label}</div><div style="font-size:15px;line-height:1.45;color:#4A443F">{body}</div></div>
</div>'''

def rsvp(q, ink, yes="Yes, we're coming", no="Sorry, can't make it"):
    return f'''<div style="display:flex;flex-direction:column;gap:12px;align-items:center;width:100%">
  {title("RSVP", 64)}
  {para(q)}
  <a href="#" style="display:flex;align-items:center;justify-content:center;min-height:54px;width:300px;border-radius:12px;background:{ink};color:#FFFFFF;font-size:18px;font-weight:700;text-decoration:none">{yes}</a>
  <a href="#" style="display:flex;align-items:center;justify-content:center;min-height:54px;width:300px;border-radius:12px;border:2px solid {ink};color:{ink};font-size:18px;font-weight:700;text-decoration:none;background:transparent">{no}</a>
</div>'''

def strip(paper, ink, sections, h):
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="{FONTS}">
  <style>
    body {{ margin: 0; background: {paper}; }}
    a {{ color: {ink}; }} a:hover {{ opacity: 0.8; }}
  </style>
</helmet>
<div style="width:390px;min-height:{h}px;background:{paper};color:{ink};font-family:{BODY};display:flex;flex-direction:column;align-items:center;gap:34px;padding:36px 22px 44px;box-sizing:border-box">
{sections}
</div>
</x-dc>
</body>
</html>'''

def cluster(names, ink):
    return '<div style="display:flex;gap:10px;justify-content:center;align-items:flex-end">' + "".join(svg(D[n], 56, ink) for n in names) + '</div>'

def divider(ink):
    return f'<div style="width:120px;border-top:2px dashed {ink};opacity:0.5"></div>'

# 1. Leo's pool party, full strip
ink = "#1F1B17"; paper = "#FBF6EC"
leo = "\n".join([
  f'<div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;text-align:center">Hi Oliver, you\'re invited</div>',
  cluster(["balloon","sun","ring"], ink),
  title("Leo is<br>turning 6", 54),
  para("A pool party in the backyard. Come for a swim, a sausage and some cake."),
  divider(ink),
  title("The details"),
  para("Saturday 14 November<br>2 to 4pm<br>12 Example Street, Paddington"),
  f'<a href="#" style="display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;border:2px solid {ink};border-radius:999px;text-decoration:none;font-weight:700">{svg(D["map"], 22, ink)}Open in Maps</a>',
  divider(ink),
  title("The day"),
  '<div style="display:flex;flex-direction:column;gap:18px;width:100%">' + "\n".join([
    stop("2:00","gate","Arrive","Through the side gate. Visitor carpark, entry off Latrobe Terrace.", ink),
    stop("2:15","ring","Swim","Showers and change rooms, plenty of shade. Sunscreen sorted.", ink),
    stop("3:15","cake","Cake and BBQ","We'll have a BBQ going. Tell us about allergies when you reply.", ink),
    stop("4:00","car","Pick up","Parents welcome to stay or drop off.", ink),
  ]) + '</div>',
  divider(ink),
  title("Good to know"),
  '<div style="display:flex;flex-direction:column;gap:14px">' + "\n".join([
    icon_line("towel","Swimmers, towel and a rashie. We have sunscreen.", ink),
    icon_line("gift","Gifts are entirely optional. There's also a group gift, Sarah is organising it.", ink),
    icon_line("kids","We're keeping it to invited kids only. Sorry, siblings!", ink),
  ]) + '</div>',
  divider(ink),
  rsvp("Can Oliver make it? Please reply by 1 November so we can get the numbers right.", ink),
  divider(ink),
  '<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:16px;width:100%">'
  + f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center">{svg(D["bubble"],48,ink)}<div style="font-family:{HEAD};font-size:22px">Updates</div><div style="font-size:14px;color:#4A443F">Anything that changes shows here.</div></div>'
  + f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center">{svg(D["camera"],48,ink)}<div style="font-family:{HEAD};font-size:22px">Photos</div><div style="font-size:14px;color:#4A443F">A photo for you after the party.</div></div></div>',
  f'<div style="font-size:13px;color:#4A443F;text-align:center">With love from Leo\'s mum and dad</div>',
])
open("StripPoolParty.dc.html","w").write(strip(paper, ink, leo, 2080))

# 2. Birthday drinks (adult)
ink2 = "#2C2A5A"; paper2 = "#F7F4FB"
drinks = "\n".join([
  '<div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;text-align:center">Hi Tom, you\'re invited</div>',
  cluster(["glasses","disco","glasses"], ink2),
  title("Marcia's<br>birthday drinks", 50),
  para("A Friday night at the pub, no speeches, one good playlist."),
  divider(ink2),
  title("The details"),
  para("Friday 21 November<br>from 6:30pm<br>The Paddo Tavern, upstairs bar"),
  divider(ink2),
  title("The night"),
  '<div style="display:flex;flex-direction:column;gap:18px;width:100%">' + "\n".join([
    stop("6:30","glasses","Drinks","Bar tab open for the first hour. Come whenever.", ink2),
    stop("8:00","cake","Cake","Very small, very chocolate.", ink2),
    stop("late","disco","Dancing","The playlist is not up for discussion.", ink2),
  ]) + '</div>',
  divider(ink2),
  '<div style="display:flex;flex-direction:column;gap:14px">' + icon_line("gift","No gifts please. Your company is the present.", ink2) + icon_line("kids","Bring a partner or a friend, just add them to your numbers.", ink2) + '</div>',
  divider(ink2),
  rsvp("Can you make it?", ink2, "Yes, I'm in", "Sorry, can't"),
])
open("StripBirthdayDrinks.dc.html","w").write(strip(paper2, ink2, drinks, 1720))

# 3. Baby shower
ink3 = "#4F6B4A"; paper3 = "#F6F8F2"
shower = "\n".join([
  '<div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;text-align:center">Hi Ava, you\'re invited</div>',
  cluster(["bunting","pram","bunting"], ink3),
  title("A shower<br>for Priya", 54),
  para("Before the baby arrives, an afternoon of tea, cake and terrible advice."),
  divider(ink3),
  title("The details"),
  para("Sunday 9 November<br>2 to 5pm<br>Sarah\'s place, 8 Fig Tree Lane, Ashgrove"),
  divider(ink3),
  title("Bring a plate"),
  para("We\'ll have afternoon tea and cake. Bring something for the table if you like, claim it after you reply so we don\'t end up with five pavlovas."),
  '<div style="display:flex;flex-direction:column;gap:14px">' + icon_line("gift","There\'s a group gift for the pram. Emma is organising it, details after you reply.", ink3) + icon_line("car","Street parking on Fig Tree Lane, step-free entry at the side.", ink3) + '</div>',
  divider(ink3),
  rsvp("Can you make it?", ink3, "Yes, I\'ll be there", "Sorry, can\'t make it"),
])
open("StripBabyShower.dc.html","w").write(strip(paper3, ink3, shower, 1560))

# 4. Memorial, the quiet version of the same skeleton
ink4 = "#3A3A3A"; paper4 = "#F4F3EF"
memorial = "\n".join([
  cluster(["leaf","candle","leaf"], ink4),
  title("Remembering<br>June Carter", 46),
  para("A service to celebrate June\'s life, followed by afternoon tea. All who knew her are warmly welcome."),
  divider(ink4),
  title("The details", 34),
  para("Thursday 27 November<br>11am<br>St Mary\'s, Kangaroo Point"),
  divider(ink4),
  title("The afternoon", 34),
  '<div style="display:flex;flex-direction:column;gap:18px;width:100%">' + "\n".join([
    stop("11:00","candle","Service","At St Mary\'s. Please arrive a little early.", ink4),
    stop("12:30","cake","Afternoon tea","In the hall next door. Stay as long as you like.", ink4),
  ]) + '</div>',
  divider(ink4),
  '<div style="display:flex;flex-direction:column;gap:14px">' + icon_line("leaf","In lieu of flowers, a donation to the RSPCA would have made June very happy.", ink4) + icon_line("car","Parking behind the church, accessible entry from the car park.", ink4) + '</div>',
  divider(ink4),
  f'<div style="display:flex;flex-direction:column;gap:12px;align-items:center;width:100%">{title("Let us know", 40)}{para("It helps the family to know who is coming for the afternoon tea.")}<a href="#" style="display:flex;align-items:center;justify-content:center;min-height:54px;width:300px;border-radius:12px;background:{ink4};color:#FFFFFF;font-size:18px;font-weight:700;text-decoration:none">I\'ll be there</a><a href="#" style="display:flex;align-items:center;justify-content:center;min-height:54px;width:300px;border-radius:12px;border:2px solid {ink4};color:{ink4};font-size:18px;font-weight:700;text-decoration:none">I can\'t be there, but I\'m thinking of you</a></div>',
])
open("StripMemorial.dc.html","w").write(strip(paper4, ink4, memorial, 1560))

c = json.load(open("canvas.json"))
c["pages"].append({"id": "page-3", "name": "Illustrated strip"})
boards = [("StripPoolParty.dc.html", 2080, "Leo's pool party, the full strip"), ("StripBirthdayDrinks.dc.html", 1720, "Birthday drinks, same skeleton"), ("StripBabyShower.dc.html", 1560, "Baby shower, same skeleton"), ("StripMemorial.dc.html", 1560, "Memorial, the quiet version")]
x = 0
for fn, h, t in boards:
    c["artboards"].append({"file": fn, "x": x, "y": 220, "w": 390, "h": h, "title": t, "page": "page-3"})
    x += 480
c["annotations"].append({"id": "strip-intro", "x": 0, "y": -60, "w": 900, "page": "page-3", "text": "The illustrated strip. One skeleton for every event: cover, the details, the day, good to know, RSVP, after. What changes between events is the illustration set and the ink colour, never the structure.\nThe illustrations here are quick monoline stand-ins in one colour; the real sets would be drawn properly. An uploaded invite replaces the cover cluster and title; everything below it stays.\nThis is the fifth structure, and the one the Pinterest references point at."})
c["annotations"].append({"id": "strip-gallery", "x": 960, "y": -60, "w": 900, "page": "page-3", "text": "What this does to the theme gallery: the six themes become six illustration sets (kids' party, birthday, baby, home and family, celebration, quiet) in one ink colour on paper, rather than six colour schemes. Hosts pick a set and an ink; the accent can still come from an uploaded design.\nThe timeline reads from the runsheet items marked visible to guests, so hosts who write a runsheet get the illustrated day for free."})
c["launch"] = {"view": "canvas", "page": "page-3"}
json.dump(c, open("canvas.json", "w"), indent=2)
print("ok", len(c["artboards"]))
