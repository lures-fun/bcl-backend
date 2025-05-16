import { Injectable } from '@nestjs/common';
import { TranslateDto } from './dto/translate.dto';
import { Translate } from '@google-cloud/translate/build/src/v2';

@Injectable()
export class TranslateService {
  async translate(request: TranslateDto): Promise<string[]> {
    const projectId = process.env.GOOGLE_TRANSLATE_PROJECT_ID;
    const key = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!projectId || !key) {
      throw new Error('Google Translate settings are not set.');
    }
    const translate = new Translate({
      projectId: projectId,
      key: key,
    });

    const translations = await translate.translate(
      request.texts,
      request.targetLanguage,
    );
    const translation = translations[0];
    return translation;
  }
}
