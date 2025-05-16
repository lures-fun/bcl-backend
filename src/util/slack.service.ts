import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IncomingWebhook } from '@slack/webhook';

@Injectable()
export class SlackService {
  private readonly webhook: IncomingWebhook;
  constructor(private readonly configService: ConfigService) {
    this.webhook = new IncomingWebhook(
      configService.get<string>('SLACK_WEBHOOK_URL'),
    );
  }

  private static HERE = 'here';

  async sendMessage(message: string, here = false): Promise<void> {
    if (!here) {
      this.webhook.send({ text: message });
      return;
    }

    this.webhook.send({
      text: `<!${SlackService.HERE}>\r\n${message}`,
    });
  }
}
