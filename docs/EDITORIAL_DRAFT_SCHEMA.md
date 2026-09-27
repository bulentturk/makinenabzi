# Makine Nabzı Editoryal Taslak Şeması

## Akış
candidate -> drafted -> reviewed -> published / rejected

## Aday alanları
- id
- source_name
- source_url
- published_at
- sector
- technologies
- relevance_score
- editorial_fit_score
- summary_source

## AI editörün üreteceği alanlar
- title_tr
- dek_tr
- summary_tr
- why_it_matters_tr
- key_facts[]
- seo_title
- meta_description
- suggested_tags[]
- suggested_sector
- suggested_technologies[]
- source_facts_used[]
- uncertainty_notes[]

## İnsan onayı gerektiren alanlar
- reviewed
- reviewed_by
- reviewed_at
- publish
- hero_image
- final_title
- final_summary

## Kurallar
1. Kaynak metin kopyalanmaz.
2. Kaynakta olmayan sayı/iddia eklenmez.
3. Kaynak URL ve yayın tarihi korunur.
4. Teknik yorum ile kaynakta geçen olgu birbirinden ayrılır.
5. "Neden önemli?" alanı Makine Nabzı editoryal yorumu olarak işaretlenir.
6. Otomatik yayın ilk aşamada kapalıdır.
7. Görsel telif durumu doğrulanmadan hero image atanmaz.
