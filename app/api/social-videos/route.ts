import { NextResponse } from "next/server";
import { fallbackSocialVideos } from "@/lib/social/fallback";
import { getSocialVideos } from "@/lib/social/get-social-videos";

export const revalidate = 1800;

export async function GET() {
  try {
    const videos = await getSocialVideos(2);

    return NextResponse.json(videos, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600"
      }
    });
  } catch {
    return NextResponse.json(
      fallbackSocialVideos(2),
      { status: 200 }
    );
  }
}
