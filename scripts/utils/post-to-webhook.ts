/**
 * Post a failure summary to an incoming webhook (plain text payload).
 */
export const postToWebhook = async (
  webhookUrl: string | undefined,
  title: string,
  skipped: Array<{name: string; reason: string}>,
): Promise<void> => {
  if (!webhookUrl || skipped.length === 0) {
    return;
  }

  const text = [
    `⚠️ *${title}*`,
    `*${skipped.length}* file(s) skipped:`,
    ...skipped.map(({name, reason}) => `• \`${name}\` — ${reason}`),
  ].join('\n');

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text}),
    });
    console.log('\n📤 Notification sent.');
  } catch {
    console.error('\n❌ Failed to send notification.');
  }
};
