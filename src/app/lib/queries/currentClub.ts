
import sanityClient from '@/sanity/client';
import { RunClub } from '@/app/lib/types/runClub'

export async function getCurrentRunClub(slug: string): Promise<RunClub | null> {
  const query = `*[_type == "runClub" && slug.current == $slug][0]`;
  return await sanityClient.fetch(query, { slug }, { next: { revalidate: 30 } });
}