import type { ProjectConfigPayload } from "./ai-analysis-service";

const TRIGGER_INGESTION_API_URL = "http://127.0.0.1:8000/api/v1/trigger-ingestion";

export async function triggerIngestion(
  config: ProjectConfigPayload
): Promise<any> {
  try {
    const response = await fetch(TRIGGER_INGESTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to trigger ingestion");
  }
}
