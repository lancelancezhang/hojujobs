ALTER TABLE public.sales_deals
ADD COLUMN product_type_ko text NOT NULL DEFAULT '기타';

UPDATE public.sales_deals
SET product_type_ko = '전자제품'
WHERE source_node_id = 959504;
