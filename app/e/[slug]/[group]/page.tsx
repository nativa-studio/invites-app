import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { groupLabel, isGroupSlug } from "@/lib/groups";
import { groupLinkMetadata, renderGroupLink } from "../render";

type Params = { params: Promise<{ slug: string; group: string }>; searchParams: Promise<{ layout?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return groupLinkMetadata((await params).slug);
}

// The same invite as /e/[slug], with the group written into the link. Whoever replies here lands
// in the guest list already marked as family, or school, or the neighbours, so the host knows
// where a name came from without having to ask them.
export default async function GroupLinkForGroup({ params, searchParams }: Params) {
  const { slug, group } = await params;
  const { layout } = await searchParams;
  if (!isGroupSlug(group)) notFound();
  return renderGroupLink({ slug, group: groupLabel(group), layout });
}
