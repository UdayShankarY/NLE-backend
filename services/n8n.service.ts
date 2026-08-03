import "dotenv/config";

export async function postOrderToN8n(order: any) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return { success: false, skipped: true, reason: "N8N_WEBHOOK_URL not configured" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`n8n webhook failed with status ${response.status}: ${body}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("n8n webhook failed:", error?.message || error);
    return { success: false, error: error?.message || error };
  }
}
