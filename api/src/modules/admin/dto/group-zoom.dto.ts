import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/* Accepts the shapes Zoom actually hands out — zoom.us, a vanity subdomain
   (bestway.zoom.us) and the regional hosts (us05web.zoom.us) — so a valid
   link is never rejected, while a pasted YouTube or Meet URL is.
   The empty alternative is how an admin clears the link. */
const ZOOM_JOIN_URL = /^$|^https:\/\/([a-z0-9-]+\.)*zoom\.us\/(j|s|w|my)\/[^\s]+$/i;

export class UpdateGroupZoomDto {
  /** Empty string clears the link — that is how an admin removes it. */
  @IsOptional()
  @IsString({ message: 'Havola matn boʻlishi kerak' })
  @MaxLength(500, { message: 'Havola 500 ta belgidan oshmasligi kerak' })
  @Matches(ZOOM_JOIN_URL, {
    message: 'Zoom havolasi notoʻgʻri — https://zoom.us/j/... koʻrinishida boʻlishi kerak',
  })
  zoomJoinUrl?: string;
}
