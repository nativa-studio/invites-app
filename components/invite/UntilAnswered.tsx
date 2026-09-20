"use client";
import { useReply } from "./ReplyState";

// The plate and gift announcements, for as long as they are news.
//
// Both of them already stop drawing once a guest has answered: their whole job is telling
// somebody who is still deciding what the day will involve, and the last line of each promises
// the list opens up when they reply, which is a strange thing to read beside the list.
//
// But they were told by a prop the server worked out when the page was built, and a guest answers
// in the browser. So from the moment they pressed yes until they next loaded the page, the
// announcement and the board a guest had just unlocked were both on the screen: "Bring a plate,
// the list opens up once you have replied" directly above the open list. On every design.
//
// The answer lives in the reply provider, which is where the board reads it from, so this reads
// it from the same place. The server prop stays as well and does the other half: a guest coming
// back to an invite they answered last week never renders the announcement at all.
//
// In the host's editor the provider says pending and never changes, so the announcements stay,
// which is what that screen needs: the switch that turns them off is in the drawer behind them.
export function UntilAnswered({ children }: { children: React.ReactNode }) {
  const ctx = useReply();
  if (ctx && ctx.reply.status !== "pending") return null;
  return <>{children}</>;
}
