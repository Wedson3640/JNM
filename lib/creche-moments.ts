import { createClient } from "@supabase/supabase-js";

export type CrecheMomentCategoryKey =
  | "formaturas"
  | "colacao-grau"
  | "dia-maes"
  | "dia-pais"
  | "dia-criancas"
  | "outros";

export type CrecheMomentCategory = {
  key: CrecheMomentCategoryKey;
  title: string;
  text: string;
  count: string;
};

export type CrecheMomentGroup = CrecheMomentCategory & {
  images: string[];
};

type CrecheMomentRow = {
  category_key: CrecheMomentCategoryKey;
  image_url: string | null;
  status: string | null;
  order_index: number | null;
  created_at: string | null;
};

const SUPABASE_TIMEOUT_MS = 3500;

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Tempo esgotado ao carregar fotos da creche.")), ms);
    }),
  ]);
}

export const crecheMomentCategories: CrecheMomentCategory[] = [
  {
    key: "formaturas",
    title: "Formaturas",
    text: "Celebrando conquistas e novos comecos.",
    count: "24 fotos",
  },
  {
    key: "colacao-grau",
    title: "Colacao de Grau",
    text: "Reconhecimento da dedicacao e aprendizado.",
    count: "15 fotos",
  },
  {
    key: "dia-maes",
    title: "Dia das Maes",
    text: "Homenagens cheias de amor e gratidao.",
    count: "35 fotos",
  },
  {
    key: "dia-pais",
    title: "Dia dos Pais",
    text: "Momentos especiais ao lado de quem inspira.",
    count: "31 fotos",
  },
  {
    key: "dia-criancas",
    title: "Dia das Criancas",
    text: "Alegria, brincadeiras e sorrisos envolvidos.",
    count: "47 fotos",
  },
  {
    key: "outros",
    title: "Outros Momentos",
    text: "Pequenas lembrancas que marcam para sempre.",
    count: "39 fotos",
  },
];

export const fallbackCrecheMomentGroups: CrecheMomentGroup[] = [
  {
    ...crecheMomentCategories[0],
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    ...crecheMomentCategories[1],
    images: [
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1522661067900-ab829854a57f?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    ...crecheMomentCategories[2],
    images: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    ...crecheMomentCategories[3],
    images: [
      "https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    ...crecheMomentCategories[4],
    images: [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    ...crecheMomentCategories[5],
    images: [
      "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=420&q=85",
    ],
  },
];

export async function getCrecheMomentGroups(): Promise<CrecheMomentGroup[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return fallbackCrecheMomentGroups;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const response = await withTimeout(
    supabase
      .from("creche_moments")
      .select("category_key,image_url,status,order_index,created_at")
      .eq("status", "published")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false }),
    SUPABASE_TIMEOUT_MS
  ).catch(() => ({ data: null, error: true }));
  const { data, error } = response;

  if (error || !data?.length) {
    return fallbackCrecheMomentGroups;
  }

  const rows = data as CrecheMomentRow[];
  return crecheMomentCategories.map((category, index) => {
    const images = rows
      .filter((row) => row.category_key === category.key && row.image_url)
      .map((row) => row.image_url as string);

    return {
      ...category,
      images: images.length ? images : fallbackCrecheMomentGroups[index].images,
      count: images.length ? `${images.length} fotos` : category.count,
    };
  });
}
