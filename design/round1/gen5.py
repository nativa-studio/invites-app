# Round two, guest side, in the phase 1 look: monoline strip, one ink on paper.
import json, re
src = open("gen3.py").read()
# Reuse the icon dictionary and helpers from gen3 without running its file writes.
exec(src.split("# 1. Leo's pool party, full strip")[0])

ink = "#1F1B17"; paper = "#FBF6EC"
def art(h=140, label="photo"):
    return f'<div style="height:{h}px;border:2px dashed {ink};border-radius:10px;display:flex;align-items:center;justify-content:center;opacity:0.6;background:repeating-linear-gradient(135deg,#FFFFFF 0 10px,#F1EBDD 10px 20px)">{label}</div>'
def chip(t, on=False):
    bg = ink if on else "transparent"; fg = paper if on else ink
    return f'<span style="display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border:2px solid {ink};border-radius:999px;background:{bg};color:{fg};font-size:16px;font-weight:700">{t}</span>'
def chips(items, on=()):
    return '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:340px">' + "".join(chip(t, t in on) for t in items) + '</div>'
def field(label, placeholder="", value=""):
    txt = value or f'<span style="opacity:0.45">{placeholder}</span>'
    return f'<div style="display:flex;flex-direction:column;gap:6px;width:100%;max-width:340px"><div style="font-family:{HEAD};font-size:20px">{label}</div><div style="min-height:48px;border:2px solid {ink};border-radius:12px;padding:12px 14px;font-size:16px;background:#FFFFFF">{txt}</div></div>'
def stepper(label, n, unit):
    return f'''<div style="display:flex;flex-direction:column;gap:6px;align-items:center"><div style="font-family:{HEAD};font-size:20px">{label}</div>
<div style="display:inline-flex;align-items:center;border:2px solid {ink};border-radius:999px;background:#FFFFFF"><a href="#" style="width:52px;height:48px;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:26px;color:{ink}">-</a><div style="min-width:120px;text-align:center;font-weight:700;font-size:18px">{n} {unit}</div><a href="#" style="width:52px;height:48px;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:26px;color:{ink}">+</a></div></div>'''
def primary(t, w=300):
    return f'<a href="#" style="display:flex;align-items:center;justify-content:center;min-height:54px;width:{w}px;border-radius:12px;background:{ink};color:{paper};font-size:18px;font-weight:700;text-decoration:none">{t}</a>'
def ghost(t, w=300):
    return f'<a href="#" style="display:flex;align-items:center;justify-content:center;min-height:54px;width:{w}px;border-radius:12px;border:2px solid {ink};color:{ink};font-size:18px;font-weight:700;text-decoration:none">{t}</a>'
def step_dots(k, n=5):
    return '<div style="display:flex;gap:6px;justify-content:center">' + "".join(f'<span style="width:10px;height:10px;border-radius:50%;border:2px solid {ink};background:{ink if i<k else "transparent"}"></span>' for i in range(n)) + '</div>'
def card(inner):
    return f'<div style="width:100%;border:2px solid {ink};border-radius:16px;padding:18px 16px;display:flex;flex-direction:column;gap:12px;align-items:center;background:#FFFFFF">{inner}</div>'

# 1. After yes: the questions, one short conversation
q = "\n".join([
  f'<div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;text-align:center">Leo is turning 6</div>',
  cluster(["balloon"], ink),
  title("Brilliant!<br>A few quick questions", 40),
  step_dots(1),
  card(stepper("How many kids?", 1, "kid") + stepper("How many grown-ups?", 1, "grown-up") + f'<div style="font-size:14px;opacity:0.7;text-align:center">Siblings are not on the list this time, so kids means Oliver.</div>'),
  card(f'<div style="font-family:{HEAD};font-size:20px">Any dietary needs?</div>' + chips(["Vegetarian","Vegan","Gluten free","Dairy free","Nut allergy","Halal","Other"], on=("Nut allergy",)) + field("Allergies or anything else we should know", "Oliver is anaphylactic to peanuts, has an EpiPen", "Oliver is anaphylactic to peanuts, EpiPen in his bag.")),
  card(field("Any access needs?", "Step-free entry, a quiet corner, anything that helps") + f'<div style="font-size:14px;opacity:0.7">Only if it helps us. Skip if not.</div>'),
  card(f'<div style="font-family:{HEAD};font-size:20px">Staying or dropping off?</div>' + chips(["I\'ll stay","Drop off","Not sure yet"], on=("Drop off",)) + field("Best number on the day", "04...", "0400 111 222")),
  card(field("A note for Leo\'s mum", "Anything at all, optional")),
  primary("Send my reply"),
  f'<div style="font-size:14px;opacity:0.7;text-align:center">You can come back to this link and change anything later.</div>',
])
open("R2Questions.dc.html","w").write(strip(paper, ink, q, 1900))

# 2. Thank-you screen with calendar and the extras
ty = "\n".join([
  cluster(["cake","balloon","ring"], ink),
  title("You're coming!", 50),
  para("We've got Oliver down, dropping off, with a nut allergy noted. Leo can't wait."),
  '<div style="display:flex;flex-direction:column;gap:10px;align-items:center;width:100%">' + primary("Add to Google Calendar") + ghost("Apple / Outlook calendar") + '</div>',
  divider(ink),
  title("Bring a plate", 36),
  para("We'll have a BBQ going. Bring something for the table if you like. Claim an item below or add your own so we don't end up with five pavlovas."),
  f'<div style="width:100%;border:2px dashed {ink};border-radius:12px;padding:12px 14px;font-size:14px;line-height:1.5">Please keep in mind: 1 guest with a nut allergy, 2 need gluten free.</div>',
  '<div style="display:flex;flex-direction:column;gap:8px;width:100%">' + "".join(
    f'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;border:2px solid {ink};border-radius:12px;padding:10px 14px;background:#FFFFFF"><div><div style="font-weight:700">{a}</div><div style="font-size:13px;opacity:0.7">{b}</div></div>{chip(c, c=="Mine")}</div>'
    for a,b,c in [("Fruit platter","Sarah is bringing it","Claimed"),("Salad, gluten free","Tom, nut free","Claimed"),("Drinks and ice","Nobody yet","I\'ll bring it"),("Pavlova","You","Mine")]) + '</div>',
  ghost("Add something else"),
  divider(ink),
  title("Group gift", 36),
  para("Sarah is organising a group gift, a scooter. $20 each is plenty. PayID 0400 333 444, reference \"Leo\", by 10 November."),
  chips(["I\'ve chipped in"]),
  divider(ink),
  ghost("Change my answer"),
])
open("R2ThankYou.dc.html","w").write(strip(paper, ink, ty, 1900))

# 3. Group link: yes or no first, then who's this from
gl = "\n".join([
  cluster(["balloon","sun","ring"], ink),
  title("Leo is<br>turning 6", 54),
  para("You're invited to Leo's 6th! Tell us whether you can make it."),
  '<div style="display:flex;flex-direction:column;gap:10px;align-items:center;width:100%">' + primary("Yes, we\'re coming") + ghost("Sorry, can\'t make it") + '</div>',
  divider(ink),
  title("Who's this from?", 40),
  card(field("Child\'s name", "e.g. Ava", "Ava and Mia") + field("Your name", "e.g. Tom", "Tom") + field("Mobile, optional", "In case the host needs to reach you") + f'<div style="font-size:14px;opacity:0.7;text-align:center">Your reply is matched to the guest list if the host already added you.</div>' + primary("Continue")),
  f'<div style="font-size:14px;opacity:0.7;text-align:center">After you reply you get your own link, so you never type this again.</div>',
])
open("R2GroupLink.dc.html","w").write(strip(paper, ink, gl, 1500))

# 4. See you soon view, the day before
sys_ = "\n".join([
  f'<div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;text-align:center">Tomorrow</div>',
  cluster(["sun"], ink),
  title("See you soon,<br>Oliver!", 48),
  para("Everything you need for tomorrow, in one place."),
  card(f'<div style="font-family:{HEAD};font-size:22px">Getting there</div>' + f'<div style="display:flex;flex-direction:column;gap:12px;width:100%">' + icon_line("map","12 Example Street, Paddington. <u>Open in Maps</u>", ink) + icon_line("car","Visitor carpark, entry off Example Street.", ink) + icon_line("gate","Pool gate code 4321. We\'ll be there from 1:45.", ink) + '</div>'),
  card(f'<div style="font-family:{HEAD};font-size:22px">The day</div>' + '<div style="display:flex;flex-direction:column;gap:14px;width:100%">' + stop("2:00","gate","Arrive","Visitor carpark, pool gate.", ink) + stop("2:15","ring","Swim","Showers and change rooms.", ink) + stop("3:15","cake","Cake and BBQ","", ink) + stop("4:00","car","Pick up","Drop off noted, 0400 111 222.", ink) + '</div>'),
  divider(ink),
  icon_line("camera","A reminder from Leo's mum: please keep photos of the kids off social media. Thank you!", ink),
  para("Plans changed?"),
  ghost("Sorry, I can no longer make it"),
  f'<div style="font-size:14px;opacity:0.7;text-align:center">Leo\'s mum will see it straight away, no need to text.</div>',
])
open("R2SeeYouSoon.dc.html","w").write(strip(paper, ink, sys_, 1640))

# 5. Thank-you page after the party
after = "\n".join([
  cluster(["camera"], ink),
  title("Thank you,<br>Oliver!", 48),
  para("Leo loved the scooter. Here's a moment for you."),
  f'<div style="width:100%;border:2px solid {ink};border-radius:14px;overflow:hidden">{art(320, "photo of Leo opening the scooter")}</div>',
  ghost("Save photo"),
  divider(ink),
  title("From the day", 36),
  '<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:8px;width:100%">' + "".join(f'<div style="border:2px solid {ink};border-radius:10px;overflow:hidden">{art(100, "photo")}</div>' for _ in range(6)) + '</div>',
  f'<div style="font-size:14px;opacity:0.7;text-align:center">With love from Leo\'s mum and dad</div>',
])
open("R2AfterParty.dc.html","w").write(strip(paper, ink, after, 1500))

c = json.load(open("canvas.json"))
c["artboards"] = [a for a in c["artboards"] if a.get("page") != "page-5"]
c["annotations"] = [n for n in c["annotations"] if n.get("page") != "page-5"]
c["pages"] = [p for p in c["pages"] if p["id"] != "page-5"] + [{"id": "page-5", "name": "Round two, guest"}]
boards = [("R2Questions.dc.html", 1900, "After yes: the questions"), ("R2ThankYou.dc.html", 1900, "Thank you, calendar, plate, gift"), ("R2GroupLink.dc.html", 1500, "Group link: who's this from"), ("R2SeeYouSoon.dc.html", 1640, "See you soon, the day before"), ("R2AfterParty.dc.html", 1500, "After the party")]
x = 0
for fn, h, t in boards:
    c["artboards"].append({"file": fn, "x": x, "y": 200, "w": 390, "h": h, "title": t, "page": "page-5"})
    x += 480
c["annotations"].append({"id": "r2-guest-intro", "x": 0, "y": -80, "w": 1000, "page": "page-5", "text": "Round two, guest side, phase 1 look: monoline in one ink on paper (charcoal here). Left to right: the questions after a yes as one short conversation (only the ones the host switched on; here all of them, for a drop-off kids' party), the thank-you screen with calendar buttons and the extras, the group link with the name asked after the buttons, the see-you-soon view the day before, and the thank-you page after the party.\nEvery line is the approved default wording. Cards are one-ink outlines; chips are pills; a filled pill is a selected chip."})
c["launch"] = {"view": "canvas", "page": "page-5"}
json.dump(c, open("canvas.json", "w"), indent=2)
print("ok", len(c["artboards"]))
