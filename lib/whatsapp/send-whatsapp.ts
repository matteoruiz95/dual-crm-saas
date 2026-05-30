type SendDailyReminderInput = {
  to: string;
  userName: string;
  message: string;
};

export async function sendDailyTaskReminder({ to, userName, message }: SendDailyReminderInput) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_GRAPH_API_VERSION || "v20.0";
  const template = process.env.WHATSAPP_TEMPLATE_DAILY_REMINDER;
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "es_CO";

  if (!token || !phoneNumberId || !template) {
    return {
      ok: false,
      providerMessageId: null,
      error: "Missing WhatsApp environment variables.",
    };
  }

  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: language },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: userName },
              { type: "text", text: message },
            ],
          },
        ],
      },
    }),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      providerMessageId: null,
      error: JSON.stringify(json),
    };
  }

  return {
    ok: true,
    providerMessageId: json?.messages?.[0]?.id ?? null,
    error: null,
  };
}
