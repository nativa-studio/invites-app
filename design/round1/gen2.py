# Four structural sketches (wireframe fidelity) for how the invite information is presented.
import json

FONT = "https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap"
FF = "'Patrick Hand', 'Comic Sans MS', cursive"

def shell(body, h):
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="{FONT}">
  <style>
    body {{ margin: 0; background: #FFFFFF; }}
    a {{ color: #222222; }} a:hover {{ color: #777777; }}
  </style>
</helmet>
<div style="width:390px;min-height:{h}px;background:#FFFFFF;font-family:{FF};color:#222222;font-size:18px;line-height:1.3;display:flex;flex-direction:column;gap:16px;padding:24px 18px 32px;box-sizing:border-box">
{body}
</div>
</x-dc>
</body>
</html>'''

def box(inner, extra=""):
    return f'<div style="border:2px solid #222222;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:8px;{extra}">{inner}</div>'

def art(h=140, label="host's invite artwork"):
    return f'<div style="height:{h}px;border:2px dashed #999999;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#777777;background:repeating-linear-gradient(135deg,#FFFFFF 0 10px,#F2F2F2 10px 20px)">{label}</div>'

def btn(label, filled=False):
    bg = "#222222" if filled else "#FFFFFF"; fg = "#FFFFFF" if filled else "#222222"
    return f'<a href="#" style="display:flex;align-items:center;justify-content:center;min-height:52px;border:2px solid #222222;border-radius:12px;background:{bg};color:{fg};text-decoration:none;font-size:20px">{label}</a>'

def small(t):
    return f'<div style="font-size:14px;color:#777777">{t}</div>'

# 1. Conversation
def bubble(t, side="left", extra=""):
    align = "flex-start" if side == "left" else "flex-end"
    bg = "#F2F2F2" if side == "left" else "#222222"; fg = "#222222" if side == "left" else "#FFFFFF"
    return f'<div style="display:flex;justify-content:{align}"><div style="max-width:300px;background:{bg};color:{fg};border-radius:18px;padding:10px 14px;{extra}">{t}</div></div>'

conv = f'''
<div style="display:flex;align-items:center;gap:10px"><div style="width:40px;height:40px;border-radius:50%;border:2px solid #222222;display:flex;align-items:center;justify-content:center;font-size:14px">LM</div><div><div>Leo's mum</div>{small("Bunting invite")}</div></div>
{bubble("Hi Oliver! Leo is turning 6 and he'd love you there.")}
{bubble(art(160), extra="padding:6px;width:300px")}
{bubble("Saturday 14 November, 2 to 4pm, at ours: 12 Example St, Paddington. <u>Open in Maps</u>")}
{bubble("It's a pool party, so swimmers, towel and a rashie. We've got sunscreen, and a BBQ going.")}
{bubble("Can Oliver make it?")}
<div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap">
  <a href="#" style="min-height:48px;display:flex;align-items:center;padding:0 16px;border:2px solid #222222;border-radius:24px;background:#222222;color:#FFFFFF;text-decoration:none">Yes, we're coming</a>
  <a href="#" style="min-height:48px;display:flex;align-items:center;padding:0 16px;border:2px solid #222222;border-radius:24px;color:#222222;text-decoration:none">Sorry, can't make it</a>
</div>
<div style="opacity:0.45;display:flex;flex-direction:column;gap:12px">
{bubble("Brilliant! How many of you?")}
<div style="display:flex;justify-content:flex-end;gap:8px"><span style="border:2px solid #222222;border-radius:24px;padding:8px 14px">1 kid</span><span style="border:2px solid #222222;border-radius:24px;padding:8px 14px">1 adult</span></div>
{bubble("Any allergies we should know about?")}
</div>
{small("Parking, showers, gifts and the siblings note arrive as bubbles after the reply. A small 'everything at once' link opens the full list for people who hate chat.")}
'''

# 2. Ticket
ticket = f'''
<div style="border:2px solid #222222;border-radius:14px;overflow:hidden;display:flex;flex-direction:column">
  {art(120)}
  <div style="padding:14px;display:flex;flex-direction:column;gap:6px">
    <div style="font-size:14px;letter-spacing:0.1em">ADMIT</div>
    <div style="font-size:26px">Oliver, plus family</div>
    <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:10px;margin-top:6px">
      <div><div style="font-size:14px;letter-spacing:0.1em">DATE</div><div style="font-size:30px;line-height:1">SAT 14 NOV</div></div>
      <div><div style="font-size:14px;letter-spacing:0.1em">TIME</div><div style="font-size:30px;line-height:1">2 to 4pm</div></div>
      <div><div style="font-size:14px;letter-spacing:0.1em">WHERE</div><div>12 Example St, Paddington <u>Map</u></div></div>
      <div><div style="font-size:14px;letter-spacing:0.1em">BRING</div><div>Swimmers, towel, rashie</div></div>
    </div>
  </div>
  <div style="border-top:2px dashed #222222;margin:0 -2px;position:relative"></div>
  <div style="padding:14px;display:flex;flex-direction:column;gap:10px;background:#F7F7F7">
    <div style="font-size:14px;letter-spacing:0.1em">RSVP STUB, reply by 1 Nov</div>
    <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:10px">{btn("YES", True)}{btn("NO")}</div>
  </div>
</div>
<div style="font-size:14px;letter-spacing:0.1em;margin-top:6px">THE FINE PRINT</div>
{box("Visitor carpark, entry off Latrobe Terrace.<br>Showers and change rooms available.<br>Gifts optional, group gift with Sarah.<br>Invited kids only. Sorry, siblings!<br>Parents welcome to stay or drop off.")}
{small("A ticket every guest recognises. The stub is the reply. Fine print lives below the tear line.")}
'''

# 3. Fridge door
def note(t, color, rot, w=170):
    return f'<div style="width:{w}px;background:{color};padding:12px 14px;transform:rotate({rot}deg);box-shadow:0 6px 14px -8px rgba(0,0,0,0.4);font-size:17px">{t}</div>'
fridge = f'''
<div style="position:relative;padding-top:8px">
  <div style="transform:rotate(-2deg);border:2px solid #222222;border-radius:6px;overflow:hidden">{art(300)}</div>
  <div style="position:absolute;left:150px;top:-6px;width:80px;height:22px;background:rgba(255,230,120,0.9);transform:rotate(3deg)"></div>
</div>
<div style="display:flex;flex-wrap:wrap;gap:14px 10px;justify-content:space-between;padding:6px 4px">
  {note("Sat 14 Nov<br>2 to 4pm", "#FFF3A3", -3)}
  {note("12 Example St, Paddington<br><u>Open in Maps</u>", "#CFE8FF", 2)}
  {note("Bring swimmers, towel, rashie. We have sunscreen.", "#FFD6E0", 1)}
  {note("Visitor carpark. Showers and change rooms available.", "#D6F5D6", -2)}
  {note("Gifts optional. Group gift with Sarah.", "#FFF3A3", 2)}
  {note("Invited kids only, sorry siblings! Parents stay or drop off.", "#CFE8FF", -1)}
</div>
<div style="display:flex;flex-direction:column;gap:10px;align-items:center;border:3px solid #222222;border-radius:50%;width:230px;height:230px;justify-content:center;align-self:center;text-align:center;padding:14px;box-sizing:border-box;background:#FFFFFF">
  <div style="font-size:22px">Can Oliver make it?</div>
  <div style="display:flex;gap:8px"><a href="#" style="min-height:48px;display:flex;align-items:center;padding:0 16px;border:2px solid #222222;border-radius:24px;background:#222222;color:#FFFFFF;text-decoration:none">Yes</a><a href="#" style="min-height:48px;display:flex;align-items:center;padding:0 16px;border:2px solid #222222;border-radius:24px;color:#222222;text-decoration:none">No</a></div>
</div>
{small("The artwork on the fridge, the facts as notes around it, the reply as a magnet. Angles are small and the note order still follows the moment of need.")}
'''

# 4. Day timeline
def stop(time, title, body):
    return f'''<div style="display:grid;grid-template-columns:64px 1fr;gap:12px">
  <div style="font-size:16px;text-align:right;padding-top:2px">{time}</div>
  <div style="border-left:3px solid #222222;padding:0 0 18px 14px;position:relative">
    <div style="position:absolute;left:-9px;top:4px;width:14px;height:14px;border-radius:50%;background:#FFFFFF;border:3px solid #222222"></div>
    <div style="font-size:20px">{title}</div>
    <div style="font-size:16px;color:#444444">{body}</div>
  </div>
</div>'''
timeline = f'''
<div style="display:flex;gap:12px;align-items:center">{art(90, "artwork")}<div><div style="font-size:24px;line-height:1.05">Leo is turning 6</div>{small("Pool party at ours, Saturday 14 November")}</div></div>
<div style="display:flex;flex-direction:column;margin-top:8px">
{stop("Before", "Reply by 1 Nov", "Gifts optional, group gift with Sarah. Bring swimmers, towel and a rashie.")}
{stop("2:00", "Arrive", "12 Example St, Paddington. Visitor carpark, entry off Latrobe Terrace. <u>Open in Maps</u>")}
{stop("2:15", "Swim", "Showers and change rooms available, plenty of shade. Sunscreen sorted.")}
{stop("3:15", "Cake and BBQ", "We'll have a BBQ going. Tell us about allergies when you reply.")}
{stop("4:00", "Pick up", "Parents welcome to stay or drop off. Invited kids only, sorry siblings!")}
</div>
<div style="position:sticky;bottom:0;background:#FFFFFF;border-top:2px solid #222222;padding-top:12px;display:flex;flex-direction:column;gap:8px">
  <div style="font-size:20px">Can Oliver make it?</div>
  <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:10px">{btn("Yes, we're coming", True)}{btn("Sorry, can't")}</div>
</div>
{small("The day itself is the structure. Every fact hangs off the moment it matters; the host fills times, or the app places them from the fields.")}
'''

files = {
  "StructureConversation.dc.html": (conv, 1500),
  "StructureTicket.dc.html": (ticket, 1300),
  "StructureFridgeDoor.dc.html": (fridge, 1500),
  "StructureDayTimeline.dc.html": (timeline, 1300),
}
for fn, (body, h) in files.items():
    open(fn, "w").write(shell(body, h))

c = json.load(open("canvas.json"))
c["pages"] = [{"id": "page-1", "name": "Directions"}, {"id": "page-2", "name": "Structures"}]
for a in c["artboards"]:
    a.setdefault("page", "page-1")
for n in c["annotations"]:
    n.setdefault("page", "page-1")
titles = {
  "StructureConversation.dc.html": ("1. Conversation", "Reads like the text it arrived in: the host's bubbles, the guest's quick replies. Details arrive progressively after the reply.\nTrade-off: harder to scan for one fact; long events make long threads. Fits kids' parties, drinks, farewells; odd for a memorial."),
  "StructureTicket.dc.html": ("2. Ticket", "Big date and time, admit line, a tear-off stub that is the RSVP, fine print below the perforation.\nTrade-off: instantly recognisable and fun; fields strain with long text; wrong for a memorial."),
  "StructureFridgeDoor.dc.html": ("3. Fridge door", "The host's artwork taped up, facts as notes around it, the reply as a magnet. Made for the uploaded-invite mode.\nTrade-off: charming and human; angles must stay small for legibility; needs a substitute hero for text-only."),
  "StructureDayTimeline.dc.html": ("4. Day timeline", "The day is the structure: reply-by first, then arrive, swim, cake, pick up, each with its facts. RSVP pinned at the bottom.\nTrade-off: the moment-of-need rule made literal; weak for 'drinks from 7, come whenever'; the app can place facts from fields when the host does not set times."),
}
x = 0
for fn, (t, note) in titles.items():
    c["artboards"].append({"file": fn, "x": x, "y": 200, "w": 390, "h": files[fn][1], "title": t, "page": "page-2"})
    c["annotations"].append({"id": "struct-" + fn.split(".")[0][9:].lower(), "x": x, "y": -40, "w": 390, "text": t + "\n" + note, "page": "page-2"})
    x += 480
c["annotations"].append({"id": "structures-intro", "x": 1920, "y": -40, "w": 420, "page": "page-2", "text": "Four ways to organise the same invite. Sketch fidelity on purpose: judge the shape, not the styling. The Directions page shows the fifth, a plain scroll of rows, which stays as the fallback for text-only invites. Pick one shape, or one for uploaded invites and another for text-only, and the chosen direction's type and colour go on top."})
c["launch"] = {"view": "canvas", "page": "page-2"}
json.dump(c, open("canvas.json", "w"), indent=2)
print("ok", len(c["artboards"]), "artboards")
