import type { Metadata } from "next";
import { groupLinkMetadata, renderGroupLink } from "./render";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ layout?: string; art?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return groupLinkMetadata((await params).slug);
}

export default async function GroupLink({ params, searchParams }: Params) {
  const { slug } = await params;
  const { layout, art } = await searchParams;
  return renderGroupLink({ slug, layout, art });
}
