import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/configuration';

interface CachedToken {
  value: string;
  /** Epoch ms; refreshed a minute early so a request never races expiry. */
  expiresAt: number;
}

export interface CreatedMeeting {
  id: string;
  joinUrl: string;
}

/* Server-to-Server OAuth: the account_credentials grant needs no user
   interaction, just the three values from a Zoom Marketplace app. */
@Injectable()
export class ZoomService {
  private readonly logger = new Logger(ZoomService.name);
  private cachedToken: CachedToken | null = null;

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return this.config.get<AppConfig['zoom']>('zoom') !== null;
  }

  /** Creates a recurring, no-fixed-time meeting. */
  async createRecurringMeeting(topic: string): Promise<CreatedMeeting> {
    const token = await this.accessToken();

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        /* type 8 = recurring with no fixed time — the same meeting id and
           join link work for every future lesson, nothing to regenerate. */
        type: 8,
        recurrence: { type: 1, repeat_interval: 1 },
        settings: { join_before_host: true, waiting_room: false },
      }),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.join_url || !body?.id) {
      this.logger.error(`Zoom meeting creation failed: ${response.status} ${JSON.stringify(body)}`);
      throw new BadGatewayException('Zoom meeting yaratib boʻlmadi');
    }
    return { id: String(body.id), joinUrl: body.join_url as string };
  }

  /**
   * Builds a link that starts the meeting with host controls, with no prior
   * Zoom login required — the click itself carries the authorisation.
   *
   * Mechanism: /users/me/zak mints a Zoom Access Key valid for five minutes,
   * folded into https://zoom.us/s/{id}?zak=… . Minted fresh on every call
   * rather than stored, both because it expires far too fast to cache
   * usefully and because a five-minute host credential has no business
   * sitting in the database between requests.
   */
  async getStartUrl(meetingId: string): Promise<string> {
    const token = await this.accessToken();

    const response = await fetch('https://api.zoom.us/v2/users/me/token?type=zak', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.token) {
      this.logger.error(`Zoom ZAK request failed: ${response.status} ${JSON.stringify(body)}`);
      throw new BadGatewayException('Zoom bilan bogʻlanib boʻlmadi');
    }

    return `https://zoom.us/s/${meetingId}?zak=${encodeURIComponent(body.token)}`;
  }

  private async accessToken(): Promise<string> {
    const zoom = this.config.get<AppConfig['zoom']>('zoom');
    if (!zoom) {
      throw new ServiceUnavailableException('Zoom integratsiyasi sozlanmagan');
    }

    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now) {
      return this.cachedToken.value;
    }

    const basic = Buffer.from(`${zoom.clientId}:${zoom.clientSecret}`).toString('base64');
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoom.accountId}`,
      { method: 'POST', headers: { Authorization: `Basic ${basic}` } },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.access_token) {
      this.logger.error(`Zoom token request failed: ${response.status} ${JSON.stringify(body)}`);
      throw new BadGatewayException('Zoom bilan bogʻlanib boʻlmadi');
    }

    this.cachedToken = {
      value: body.access_token,
      expiresAt: now + (Number(body.expires_in ?? 3600) - 60) * 1000,
    };
    return this.cachedToken.value;
  }
}
