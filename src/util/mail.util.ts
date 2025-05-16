import * as sgMail from '@sendgrid/mail';

const sendGridApiKey =
  process.env.SENDGRID_API_KEY 
sgMail.setApiKey(sendGridApiKey);

/**
 * メール送信用の汎用関数
 * @param to - 送信先のメールアドレス
 * @param subject - メールの件名
 * @param text - プレーンテキストのメール本文
 * @param html - HTML形式のメール本文
 */
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> => {
  try {
    const msg = {
      to,
      from: {
        email: 'info@blockchain-lures.com',
        name: 'BlockChainLures',
      },
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    console.log('メールが送信されました');
  } catch (error: any) {
    console.error('メール送信エラー:', error);
    if (error.response) {
      console.error('詳細:', error.response.body);
    }
    throw new Error('メール送信に失敗しました');
  }
};

/**
 * クーポンメール送信用関数
 * @param to - 送信先のメールアドレス
 * @param recipientName - 受信者の名前
 * @param convertedPoints - 変換したポイント数
 * @param couponCode - クーポンコード（複数の場合はカンマ区切りの文字列）
 */
export const sendCouponEmail = async (
  to: string,
  recipientName: string,
  convertedPoints: number,
  couponCode: string,
): Promise<void> => {
  const subject = '【TokenExchange】クーポン受け取り完了のお知らせ 🚀';

  // クーポンコードをカンマで分割して改行やリスト用に変換
  const couponList = couponCode.split(',').map((code) => code.trim());

  // プレーンテキストメール用：\r\n を利用して改行
  const text =
    `${recipientName} 様\r\n\r\n` +
    `いつもBCLをご利用いただきありがとうございます。\r\n` +
    `BBTとクーポンの交換が完了いたしました。以下の内容をご確認ください。\r\n\r\n` +
    `【クーポン情報】\r\n` +
    `変換したポイント数: ${convertedPoints} BBT\r\n` +
    `クーポンコード:\r\n` +
    `${couponList.join('\r\n')}\r\n\r\n` +
    `【クーポンの利用について】\r\n` +
    `以下のオンラインストアにて、クーポンをご利用いただけます。\r\n` +
    `👉 BCL公式ECストアはこちら\r\n` +
    `https://blockchainlures.myshopify.com/\r\n\r\n` +
    `【注意事項】\r\n` +
    `・本クーポンは、他のクーポンとの併用はできません。\r\n` +
    `・クーポンを他者に譲渡することは禁止されています。譲渡が発覚した場合、アカウントを停止させていただく可能性がございますので、ご注意ください。\r\n` +
    `・注 : 本クーポンは1決済につき、1つまでしか使用できません\r\n\r\n` +
    `クーポンを利用して、ぜひBCLの魅力的な商品をお楽しみください！\r\n` +
    `今後ともBCLをよろしくお願いいたします。\r\n\r\n` +
    `ご不明な点がございましたら、\r\n` +
    `https://docs.google.com/forms/d/e/1FAIpQLSfpmbEKCZMCEoSyv9IXpOGqGBvoi295IyJkH7CJZ4MnBAKycQ/viewform\r\n\r\n` +
    `BCLサポートチーム`;

  // HTMLメール用：<p>タグ、<ul>リストなどで整形
  const html = `
<p>${recipientName} 様</p>

<p>いつもBCLをご利用いただきありがとうございます。<br>
BBTとクーポンの交換が完了いたしました。<br>
以下の内容をご確認ください。</p>

<h3>【クーポン情報】</h3>
<p>変換したポイント数: ${convertedPoints} BBT</p>
<p>クーポンコード:</p>
<ul>
  ${couponList.map((code) => `<li>${code}</li>`).join('')}
</ul>

<h3>【クーポンの利用について】</h3>
<p>
  以下のオンラインストアにて、クーポンをご利用いただけます。<br>
  <a href="https://blockchainlures.myshopify.com/">👉 BCL公式ECストアはこちら</a>
</p>

<h3>【注意事項】</h3>
<ul>
  <li>本クーポンは、他のクーポンとの併用はできません。</li>
  <li>クーポンを他者に譲渡することは禁止されています。<br>
      譲渡が発覚した場合、アカウントを停止させていただく可能性がございますので、ご注意ください。</li>
  <li>注 : 本クーポンは1決済につき、1つまでしか使用できません</li>
</ul>

<p>
  クーポンを利用して、ぜひBCLの魅力的な商品をお楽しみください！<br>
  今後ともBCLをよろしくお願いいたします。
</p>

<p>
  ご不明な点がございましたら、<br>
  <a href="https://docs.google.com/forms/d/e/1FAIpQLSfpmbEKCZMCEoSyv9IXpOGqGBvoi295IyJkH7CJZ4MnBAKycQ/viewform">こちら</a>までお気軽にご連絡ください。
</p>

<p>BCLサポートチーム</p>
`;

  await sendEmail(to, subject, text, html);
};

/**
 * 商品メール送信用関数
 * @param to - 送信先のメールアドレス
 * @param recipientName - 受信者の名前
 * @param convertedPoints - 変換したポイント数
 */
export const sendDlureEmail = async (
  to: string,
  recipientName: string,
  convertedPoints: number,
): Promise<void> => {
  const subject = '【TokenExchange】商品受け取り完了のお知らせ 🚀';

  // プレーンテキストメール用
  const text =
    `${recipientName} 様\r\n\r\n` +
    `いつもBCLをご利用いただきありがとうございます。\r\n` +
    `BBTと商品の交換が完了いたしました。以下の内容をご確認ください。\r\n\r\n` +
    `【商品情報】\r\n` +
    `変換したポイント数: ${convertedPoints} BBT\r\n` +
    `商品名: デジタルルアー\r\n\r\n` +
    `クーポンを利用して、ぜひBCLの魅力的な商品をお楽しみください！\r\n` +
    `今後ともBCLをよろしくお願いいたします。\r\n\r\n` +
    `ご不明な点がございましたら、\r\n` +
    `https://docs.google.com/forms/d/e/1FAIpQLSfpmbEKCZMCEoSyv9IXpOGqGBvoi295IyJkH7CJZ4MnBAKycQ/viewform\r\n\r\n` +
    `BCLサポートチーム`;

  // HTMLメール用
  const html = `
<p>${recipientName} 様</p>

<p>いつもBCLをご利用いただきありがとうございます。<br>
BBTと商品の交換が完了いたしました。<br>
以下の内容をご確認ください。</p>

<h3>【商品情報】</h3>
<p>変換したポイント数: ${convertedPoints} BBT<br>
商品名: デジタルルアー</p>

<p>デジタルルアーを付与しましたので、自身のタックルボックスでご確認ください。<br>
今後ともBCLをよろしくお願いいたします。</p>

<p>
  ご不明な点がございましたら、<br>
  <a href="https://docs.google.com/forms/d/e/1FAIpQLSfpmbEKCZMCEoSyv9IXpOGqGBvoi295IyJkH7CJZ4MnBAKycQ/viewform">こちら</a>までお気軽にご連絡ください。
</p>

<p>BCLサポートチーム</p>
`;

  await sendEmail(to, subject, text, html);
};
