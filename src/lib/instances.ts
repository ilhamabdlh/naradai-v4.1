export interface Instance {
  id: string;
  name: string;
}

export const INSTANCES: Instance[] = [
  { id: "bukalapak", name: "Bukalapak" },
  { id: "kapal_api_12_19_feb_2026", name: "Kapal API" },
  { id: "kopi_good_day_12_19_feb_2026", name: "Kopi Good Day" },
  { id: "kopi_abc_12_19_feb_2026", name: "Kopi ABC" },
  { id: "kopi_fresco_12_19_feb_2026", name: "Kopi Fresco" },
  { id: "excelso_12_19_feb_2026", name: "Kopi Excelso" },
  { id: "kopi_kapten_12_19_feb_2026", name: "Kopi Kapten" },
  { id: "unakaffe_12_19_feb_2026", name: "Unakaffe" },
  { id: "kopi_pikopi_12_19_feb_2026", name: "Kopi Pikopi" },
  { id: "kopi_ya_12_19_feb_2026", name: "Kopi YA" },
  { id: "pt_santos_jaya_abadi_12_19_feb_2026", name: "Santos Jaya Abadi" },
  { id: "good_day_x_babymonster_feb_2026", name: "GoodDay X BabyMonster" },
  { id: "kacc_12_19_feb_2026", name: "Kapal Api Coffee Corner" },
  { id: "krim_kafe_12_19_feb_2026", name: "Krim Kafe" },
];

export const DEFAULT_INSTANCE_ID = INSTANCES[0]?.id ?? "bukalapak";

export function getInstanceById(id: string): Instance | undefined {
  return INSTANCES.find((i) => i.id === id);
}

export function getInstanceName(id: string): string {
  return getInstanceById(id)?.name ?? id;
}
