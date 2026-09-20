import { loadEvent } from "@/lib/db/host";
import { loadShopping } from "@/lib/db/shopping";
import { ShoppingList } from "@/components/host/ShoppingList";

// Shopping: what still has to be bought, and who bought it.
//
// Its own tab rather than a card on Potluck, because the two are opposites that look alike. The
// potluck list is the guests' and they write to it; this one is the hosts' and guests never see
// it. Putting them on one screen would mean a host reading two lists of food and having to
// remember which of them anybody else can see.
export default async function Shopping({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, items] = await Promise.all([loadEvent(id), loadShopping(id)]);
  return <ShoppingList eventId={e.id} items={items} />;
}
