export interface Instance {
  id: string;
  name: string;
}

export const INSTANCES: Instance[] = [
  { id: "benings_brand_analysis_01_2026",        name: "Benings – Brand Analysis" },
  { id: "benings_campaign_beningsindonesia_tracker", name: "Benings – #beningsindonesia" },
  { id: "benings_campaign_lockyourbright_tracker",   name: "Benings – #lockyourbright" },
];

export const DEFAULT_INSTANCE_ID = INSTANCES[0]?.id ?? "default";

/** ID instance yang dipakai hanya di tab Campaign Analysis (dropdown Campaign). */
export const CAMPAIGN_INSTANCE_IDS = INSTANCES.filter((i) =>
  i.id.startsWith("benings_campaign_")
).map((i) => i.id);

export function isCampaignInstanceId(id: string): boolean {
  return CAMPAIGN_INSTANCE_IDS.includes(id);
}

export function getInstanceById(id: string): Instance | undefined {
  return INSTANCES.find((i) => i.id === id);
}

export function getInstanceName(id: string): string {
  return getInstanceById(id)?.name ?? id;
}
