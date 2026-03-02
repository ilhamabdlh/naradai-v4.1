export interface EmailNotificationPayload {
  to: string[];
  subject: string;
  htmlBody: string;
}

// Gunakan proxy di development untuk menghindari CORS
// Proxy akan mengarahkan request ke http://localhost:8000
const EMAIL_API_URL = import.meta.env.DEV 
  ? "/api/v1/send-email"
  : "http://localhost:8000/api/v1/send-email";

export async function sendEmailNotification(
  to: string[],
  subject: string,
  htmlBody: string
): Promise<void> {
  try {
    const payload: EmailNotificationPayload = {
      to,
      subject,
      htmlBody,
    };

    const response = await fetch(EMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `Failed to send email. Status: ${response.status}`
      );
    }

    console.log("Email notification sent successfully");
  } catch (error) {
    console.error("Error sending email notification:", error);
    // Don't throw error to prevent blocking the main flow
    // Just log it for debugging
  }
}

export function generateIngestionCompletionEmailHTML(
  projectName: string,
  instanceId: string,
  completionTime: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Ingestion Completed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .email-body {
      padding: 40px 30px;
    }
    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: #ffffff;
    }
    .info-section {
      background-color: #f1f5f9;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #64748b;
      font-size: 14px;
    }
    .info-value {
      color: #1e293b;
      font-weight: 500;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      margin-top: 30px;
      padding: 14px 32px;
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .highlight {
      color: #8b5cf6;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Data Ingestion Completed</h1>
    </div>
    <div class="email-body">
      <div class="success-icon">✓</div>
      <h2 style="text-align: center; color: #1e293b; margin-bottom: 20px;">
        Successfully Populated Dashboard Data
      </h2>
      <p style="text-align: center; color: #64748b; font-size: 16px; margin-bottom: 30px;">
        The data ingestion process has been completed successfully. All dashboard content has been updated and synchronized.
      </p>
      
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Project Name:</span>
          <span class="info-value">${escapeHtml(projectName)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Instance ID:</span>
          <span class="info-value">${escapeHtml(instanceId)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Completed At:</span>
          <span class="info-value">${escapeHtml(completionTime)}</span>
        </div>
      </div>

      <p style="color: #475569; font-size: 15px; line-height: 1.8;">
        All dashboard sections have been updated with the latest data, including:
      </p>
      <ul style="color: #475569; font-size: 15px; line-height: 2;">
        <li>Stats Overview</li>
        <li>Priority Actions</li>
        <li>Risks & Opportunities</li>
        <li>Competitive Analysis</li>
        <li>What's Happening Insights</li>
        <li>Source Content Data</li>
      </ul>

      <div style="text-align: center; margin-top: 40px;">
        <a href="#" class="cta-button">View Dashboard</a>
      </div>
    </div>
    <div class="email-footer">
      <p style="margin: 0;">
        This is an automated notification from <span class="highlight">NaradAI Platform</span>
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px;">
        Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  if (typeof text !== "string") {
    return String(text);
  }
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
