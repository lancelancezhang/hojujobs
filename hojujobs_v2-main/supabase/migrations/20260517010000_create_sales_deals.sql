CREATE TABLE public.sales_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id integer UNIQUE,
  title_ko text NOT NULL,
  price text NOT NULL,
  original_price text,
  delivery_ko text,
  retailer text NOT NULL,
  retailer_domain text NOT NULL,
  source_url text NOT NULL,
  deal_url text NOT NULL,
  retailer_url text,
  posted_by text,
  posted_at timestamptz,
  score integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  description_ko text[] NOT NULL DEFAULT '{}',
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read sales deals"
ON public.sales_deals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert sales deals"
ON public.sales_deals
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update sales deals"
ON public.sales_deals
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete sales deals"
ON public.sales_deals
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.sales_deals (
  source_node_id,
  title_ko,
  price,
  original_price,
  delivery_ko,
  retailer,
  retailer_domain,
  source_url,
  deal_url,
  retailer_url,
  posted_by,
  posted_at,
  score,
  comments_count,
  description_ko,
  image_url
) VALUES (
  959504,
  '삼성 55인치 U8500F 크리스탈 UHD 4K 스마트 TV (2025)',
  '$552',
  '$691',
  '무료 클릭앤콜렉트 / 매장 수령',
  'JB Hi-Fi',
  'jbhifi.com.au',
  'https://www.ozbargain.com.au/node/959504',
  'https://www.ozbargain.com.au/goto/959504',
  'https://www.jbhifi.com.au/products/samsung-55-u8500f-crystal-uhd-4k-smart-tv-2025',
  'Gavy1370',
  '2026-05-16T20:58:30+10:00',
  13,
  4,
  ARRAY[
    '55인치 TV로 괜찮아 보이는 딜입니다.',
    '화면: 강력한 4K 업스케일링을 지원하는 55인치 4K UHD LED 디스플레이',
    '게임 시 자동 저지연 모드를 지원하는 100 스무스 모션 레이트',
    '스마트 기능: 자동 콘텐츠 추천 기능이 있는 One UI Tizen OS'
  ],
  'https://files.ozbargain.com.au/n/04/959504.jpg?h=4d1259c8'
);
