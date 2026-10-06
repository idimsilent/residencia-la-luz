-- =============================================================================
-- DATOS DE DEMOSTRACIÓN (generado por scripts/build-seed.mjs)
-- Todo el contenido es ficticio y debe sustituirse desde el panel.
-- =============================================================================
begin;

insert into public.site_settings (id, site_name, tagline, phone, email, address_line, postal_code, city, province,
  map_url, opening_hours, social_links, seo_title, seo_description, contact_form_enabled, testimonials_enabled,
  contact_privacy_note, show_demo_notice)
values (1, 'Residencia la Luz', 'Un hogar tranquilo donde cada persona se siente cuidada y acompañada. (Texto de demostración)',
  '+34 900 000 000', 'contacto@example.com', 'Calle de Ejemplo, 1', '00000', 'Ciudad de ejemplo', 'Provincia',
  'https://www.openstreetmap.org', '[{"label":"Lunes a viernes","hours":"9:00 – 19:00 (horario de ejemplo)"},{"label":"Sábados","hours":"10:00 – 14:00 (horario de ejemplo)"}]'::jsonb, '[]'::jsonb,
  'Residencia la Luz · Residencia de mayores', 'Web de demostración de una residencia de personas mayores. Sustituye este texto por la descripción real del centro.',
  true, false,
  'Responsable: [pendiente de completar]. Finalidad: responder a tu consulta. Puedes ejercer tus derechos escribiendo al correo del centro. Texto provisional pendiente de revisión jurídica.',
  true)
on conflict (id) do nothing;

insert into public.themes (name, is_preset, tokens, original_tokens, is_active)
values ('Salvia cálida', true, '{"version":1,"colors":{"primary":"#5f7d63","primaryContrast":"#ffffff","secondary":"#e9e1d3","accent":"#c08a5b","background":"#fbf8f3","surface":"#ffffff","surfaceAlt":"#f3eee5","text":"#2b2f2a","textMuted":"#5d625b","border":"#e3dccf","buttonBg":"#5f7d63","buttonText":"#ffffff","headerBg":"#fbf8f3","headerText":"#2b2f2a","footerBg":"#2f3a31","footerText":"#eef0ea"},"typography":{"headingFont":"fraunces","bodyFont":"nunito-sans","baseSize":17,"headingScale":1.25,"headingWeight":"600"},"shape":{"radius":18,"shadow":"soft","spacing":"normal","contentWidth":"normal"},"components":{"buttonStyle":"pill","cardStyle":"elevated","headerLayout":"classic","headerSticky":true,"menuStyle":"underline","footerLayout":"columns","galleryStyle":"mosaic","newsCardStyle":"feed","blockStyle":"open"}}'::jsonb, '{"version":1,"colors":{"primary":"#5f7d63","primaryContrast":"#ffffff","secondary":"#e9e1d3","accent":"#c08a5b","background":"#fbf8f3","surface":"#ffffff","surfaceAlt":"#f3eee5","text":"#2b2f2a","textMuted":"#5d625b","border":"#e3dccf","buttonBg":"#5f7d63","buttonText":"#ffffff","headerBg":"#fbf8f3","headerText":"#2b2f2a","footerBg":"#2f3a31","footerText":"#eef0ea"},"typography":{"headingFont":"fraunces","bodyFont":"nunito-sans","baseSize":17,"headingScale":1.25,"headingWeight":"600"},"shape":{"radius":18,"shadow":"soft","spacing":"normal","contentWidth":"normal"},"components":{"buttonStyle":"pill","cardStyle":"elevated","headerLayout":"classic","headerSticky":true,"menuStyle":"underline","footerLayout":"columns","galleryStyle":"mosaic","newsCardStyle":"feed","blockStyle":"open"}}'::jsonb, true);
insert into public.themes (name, is_preset, tokens, original_tokens, is_active)
values ('Arena y terracota', true, '{"version":1,"colors":{"primary":"#9a5b3c","primaryContrast":"#ffffff","secondary":"#efe4d6","accent":"#6f8a6a","background":"#fcf7f1","surface":"#ffffff","surfaceAlt":"#f5ebdf","text":"#2b2f2a","textMuted":"#5d625b","border":"#e3dccf","buttonBg":"#9a5b3c","buttonText":"#ffffff","headerBg":"#fcf7f1","headerText":"#2b2f2a","footerBg":"#3b2e27","footerText":"#f6efe8"},"typography":{"headingFont":"lora","bodyFont":"source-sans","baseSize":17,"headingScale":1.25,"headingWeight":"600"},"shape":{"radius":12,"shadow":"soft","spacing":"normal","contentWidth":"normal"},"components":{"buttonStyle":"solid","cardStyle":"elevated","headerLayout":"classic","headerSticky":true,"menuStyle":"underline","footerLayout":"columns","galleryStyle":"grid","newsCardStyle":"feed","blockStyle":"open"}}'::jsonb, '{"version":1,"colors":{"primary":"#9a5b3c","primaryContrast":"#ffffff","secondary":"#efe4d6","accent":"#6f8a6a","background":"#fcf7f1","surface":"#ffffff","surfaceAlt":"#f5ebdf","text":"#2b2f2a","textMuted":"#5d625b","border":"#e3dccf","buttonBg":"#9a5b3c","buttonText":"#ffffff","headerBg":"#fcf7f1","headerText":"#2b2f2a","footerBg":"#3b2e27","footerText":"#f6efe8"},"typography":{"headingFont":"lora","bodyFont":"source-sans","baseSize":17,"headingScale":1.25,"headingWeight":"600"},"shape":{"radius":12,"shadow":"soft","spacing":"normal","contentWidth":"normal"},"components":{"buttonStyle":"solid","cardStyle":"elevated","headerLayout":"classic","headerSticky":true,"menuStyle":"underline","footerLayout":"columns","galleryStyle":"grid","newsCardStyle":"feed","blockStyle":"open"}}'::jsonb, false);
insert into public.themes (name, is_preset, tokens, original_tokens, is_active)
values ('Azul sereno', true, '{"version":1,"colors":{"primary":"#3f6e8c","primaryContrast":"#ffffff","secondary":"#e3ebef","accent":"#c99a52","background":"#f8fafb","surface":"#ffffff","surfaceAlt":"#edf2f5","text":"#2b2f2a","textMuted":"#5d625b","border":"#dbe3e8","buttonBg":"#3f6e8c","buttonText":"#ffffff","headerBg":"#ffffff","headerText":"#2b2f2a","footerBg":"#22323d","footerText":"#e9f0f4"},"typography":{"headingFont":"dm-serif","bodyFont":"inter","baseSize":17,"headingScale":1.25,"headingWeight":"500"},"shape":{"radius":8,"shadow":"medium","spacing":"normal","contentWidth":"normal"},"components":{"buttonStyle":"solid","cardStyle":"bordered","headerLayout":"centered","headerSticky":true,"menuStyle":"pill","footerLayout":"columns","galleryStyle":"mosaic","newsCardStyle":"cards","blockStyle":"open"}}'::jsonb, '{"version":1,"colors":{"primary":"#3f6e8c","primaryContrast":"#ffffff","secondary":"#e3ebef","accent":"#c99a52","background":"#f8fafb","surface":"#ffffff","surfaceAlt":"#edf2f5","text":"#2b2f2a","textMuted":"#5d625b","border":"#dbe3e8","buttonBg":"#3f6e8c","buttonText":"#ffffff","headerBg":"#ffffff","headerText":"#2b2f2a","footerBg":"#22323d","footerText":"#e9f0f4"},"typography":{"headingFont":"dm-serif","bodyFont":"inter","baseSize":17,"headingScale":1.25,"headingWeight":"500"},"shape":{"radius":8,"shadow":"medium","spacing":"normal","contentWidth":"normal"},"components":{"buttonStyle":"solid","cardStyle":"bordered","headerLayout":"centered","headerSticky":true,"menuStyle":"pill","footerLayout":"columns","galleryStyle":"mosaic","newsCardStyle":"cards","blockStyle":"open"}}'::jsonb, false);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-000000000001', 'demo/jardin.svg', 'jardin.svg', 'Jardín', 'Ilustración de demostración: jardín con bancos y árboles', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-000000000002', 'demo/fachada.svg', 'fachada.svg', 'Fachada', 'Ilustración de demostración: fachada de un edificio rodeado de árboles', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-000000000003', 'demo/habitacion.svg', 'habitacion.svg', 'Habitación', 'Ilustración de demostración: habitación luminosa con cama y ventana', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-000000000004', 'demo/salon.svg', 'salon.svg', 'Salón', 'Ilustración de demostración: salón con sofá y ventanales', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-000000000005', 'demo/comedor.svg', 'comedor.svg', 'Comedor', 'Ilustración de demostración: comedor con mesas preparadas', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-000000000006', 'demo/terraza.svg', 'terraza.svg', 'Terraza', 'Ilustración de demostración: terraza al atardecer con plantas', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-000000000007', 'demo/actividad.svg', 'actividad.svg', 'Taller de actividades', 'Ilustración de demostración: mesa de taller con pinturas y manualidades', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-000000000008', 'demo/fisioterapia.svg', 'fisioterapia.svg', 'Sala de fisioterapia', 'Ilustración de demostración: sala de ejercicio con barras y pelota', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-000000000009', 'demo/cocina.svg', 'cocina.svg', 'Alimentación', 'Ilustración de demostración: platos con comida casera', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);
insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('6f1c2a3e-1b2c-4d3e-8f40-00000000000a', 'demo/biblioteca.svg', 'biblioteca.svg', 'Biblioteca', 'Ilustración de demostración: rincón de lectura con estanterías', 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);

insert into public.gallery_categories (id, name, slug, sort_order) values
  ('7a2b3c4d-1111-4aaa-8bbb-000000000001', 'Exteriores', 'exteriores', 1),
  ('7a2b3c4d-1111-4aaa-8bbb-000000000002', 'Zonas comunes', 'zonas-comunes', 2),
  ('7a2b3c4d-1111-4aaa-8bbb-000000000003', 'Habitaciones', 'habitaciones', 3),
  ('7a2b3c4d-1111-4aaa-8bbb-000000000004', 'Actividades', 'actividades', 4);

insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('6f1c2a3e-1b2c-4d3e-8f40-000000000002', '7a2b3c4d-1111-4aaa-8bbb-000000000001', 'Entrada principal', 0);
insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('6f1c2a3e-1b2c-4d3e-8f40-000000000001', '7a2b3c4d-1111-4aaa-8bbb-000000000001', 'Jardín', 1);
insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('6f1c2a3e-1b2c-4d3e-8f40-000000000006', '7a2b3c4d-1111-4aaa-8bbb-000000000001', 'Terraza', 2);
insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('6f1c2a3e-1b2c-4d3e-8f40-000000000004', '7a2b3c4d-1111-4aaa-8bbb-000000000002', 'Salón', 3);
insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('6f1c2a3e-1b2c-4d3e-8f40-000000000005', '7a2b3c4d-1111-4aaa-8bbb-000000000002', 'Comedor', 4);
insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('6f1c2a3e-1b2c-4d3e-8f40-00000000000a', '7a2b3c4d-1111-4aaa-8bbb-000000000002', 'Rincón de lectura', 5);
insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('6f1c2a3e-1b2c-4d3e-8f40-000000000003', '7a2b3c4d-1111-4aaa-8bbb-000000000003', 'Habitación', 6);
insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('6f1c2a3e-1b2c-4d3e-8f40-000000000007', '7a2b3c4d-1111-4aaa-8bbb-000000000004', 'Taller', 7);
insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('6f1c2a3e-1b2c-4d3e-8f40-000000000008', '7a2b3c4d-1111-4aaa-8bbb-000000000004', 'Sala de ejercicio', 8);
insert into public.services (title, slug, summary, content_html, icon, media_id, sort_order, status, is_demo)
values ('Atención personal', 'atencion-personal', 'Acompañamiento en las actividades de la vida diaria, respetando el ritmo y las preferencias de cada persona.', '<p>Acompañamiento en las actividades de la vida diaria, respetando el ritmo y las preferencias de cada persona.</p><p><strong>Contenido de demostración.</strong> Describe aquí, con datos reales y confirmados, en qué consiste este servicio en vuestro centro. No publiques servicios que no se ofrezcan.</p><h2>¿Qué incluye?</h2><ul><li>Punto de ejemplo 1</li><li>Punto de ejemplo 2</li><li>Punto de ejemplo 3</li></ul>', 'hand-heart', '6f1c2a3e-1b2c-4d3e-8f40-000000000003', 0, 'published', true);
insert into public.services (title, slug, summary, content_html, icon, media_id, sort_order, status, is_demo)
values ('Actividades y ocio', 'actividades', 'Talleres, música, lectura y celebraciones para mantener la mente activa y compartir momentos.', '<p>Talleres, música, lectura y celebraciones para mantener la mente activa y compartir momentos.</p><p><strong>Contenido de demostración.</strong> Describe aquí, con datos reales y confirmados, en qué consiste este servicio en vuestro centro. No publiques servicios que no se ofrezcan.</p><h2>¿Qué incluye?</h2><ul><li>Punto de ejemplo 1</li><li>Punto de ejemplo 2</li><li>Punto de ejemplo 3</li></ul>', 'music', '6f1c2a3e-1b2c-4d3e-8f40-000000000007', 1, 'published', true);
insert into public.services (title, slug, summary, content_html, icon, media_id, sort_order, status, is_demo)
values ('Fisioterapia', 'fisioterapia', 'Ejercicio adaptado para favorecer la movilidad y el bienestar físico.', '<p>Ejercicio adaptado para favorecer la movilidad y el bienestar físico.</p><p><strong>Contenido de demostración.</strong> Describe aquí, con datos reales y confirmados, en qué consiste este servicio en vuestro centro. No publiques servicios que no se ofrezcan.</p><h2>¿Qué incluye?</h2><ul><li>Punto de ejemplo 1</li><li>Punto de ejemplo 2</li><li>Punto de ejemplo 3</li></ul>', 'activity', '6f1c2a3e-1b2c-4d3e-8f40-000000000008', 2, 'published', true);
insert into public.services (title, slug, summary, content_html, icon, media_id, sort_order, status, is_demo)
values ('Alimentación', 'alimentacion', 'Menús caseros y equilibrados, con atención a las necesidades de cada persona.', '<p>Menús caseros y equilibrados, con atención a las necesidades de cada persona.</p><p><strong>Contenido de demostración.</strong> Describe aquí, con datos reales y confirmados, en qué consiste este servicio en vuestro centro. No publiques servicios que no se ofrezcan.</p><h2>¿Qué incluye?</h2><ul><li>Punto de ejemplo 1</li><li>Punto de ejemplo 2</li><li>Punto de ejemplo 3</li></ul>', 'utensils', '6f1c2a3e-1b2c-4d3e-8f40-000000000009', 3, 'published', true);
insert into public.services (title, slug, summary, content_html, icon, media_id, sort_order, status, is_demo)
values ('Espacios comunes', 'espacios-comunes', 'Salones, jardín y terrazas pensados para la convivencia y la tranquilidad.', '<p>Salones, jardín y terrazas pensados para la convivencia y la tranquilidad.</p><p><strong>Contenido de demostración.</strong> Describe aquí, con datos reales y confirmados, en qué consiste este servicio en vuestro centro. No publiques servicios que no se ofrezcan.</p><h2>¿Qué incluye?</h2><ul><li>Punto de ejemplo 1</li><li>Punto de ejemplo 2</li><li>Punto de ejemplo 3</li></ul>', 'home', '6f1c2a3e-1b2c-4d3e-8f40-000000000004', 4, 'published', true);
insert into public.services (title, slug, summary, content_html, icon, media_id, sort_order, status, is_demo)
values ('Acompañamiento a familias', 'acompanamiento', 'Comunicación cercana con las familias y apoyo en cada etapa.', '<p>Comunicación cercana con las familias y apoyo en cada etapa.</p><p><strong>Contenido de demostración.</strong> Describe aquí, con datos reales y confirmados, en qué consiste este servicio en vuestro centro. No publiques servicios que no se ofrezcan.</p><h2>¿Qué incluye?</h2><ul><li>Punto de ejemplo 1</li><li>Punto de ejemplo 2</li><li>Punto de ejemplo 3</li></ul>', 'users', '6f1c2a3e-1b2c-4d3e-8f40-000000000001', 5, 'published', true);

insert into public.news_categories (id, name, slug, sort_order) values
  ('8b3c4d5e-2222-4bbb-8ccc-000000000001', 'Vida en el centro', 'vida-en-el-centro', 1),
  ('8b3c4d5e-2222-4bbb-8ccc-000000000002', 'Actividades', 'actividades', 2),
  ('8b3c4d5e-2222-4bbb-8ccc-000000000003', 'Avisos', 'avisos', 3);

insert into public.news_posts (title, slug, excerpt, content_html, featured_media_id, category_id, author_name, status, published_at, is_featured, is_demo)
values ('Bienvenida a nuestra nueva web', 'bienvenida-a-nuestra-nueva-web', 'Estrenamos un espacio para compartir la vida diaria del centro con las familias.', '<p>Estrenamos un espacio para compartir la vida diaria del centro con las familias.</p><p><strong>Texto de demostración.</strong> Sustituye este contenido por una noticia real. Recuerda no publicar fotografías en las que se pueda identificar a residentes sin su autorización expresa.</p><h2>Un subtítulo de ejemplo</h2><p>Puedes usar títulos, listas, enlaces y citas desde el editor de noticias.</p><blockquote>Una cita de ejemplo.</blockquote>', '6f1c2a3e-1b2c-4d3e-8f40-000000000002', '8b3c4d5e-2222-4bbb-8ccc-000000000001', 'Equipo del centro', 'published', now() - interval '2 days', true, true);
insert into public.news_posts (title, slug, excerpt, content_html, featured_media_id, category_id, author_name, status, published_at, is_featured, is_demo)
values ('Taller de pintura de otoño', 'taller-de-pintura-de-otono', 'Colores cálidos y mucha conversación en el taller de esta semana.', '<p>Colores cálidos y mucha conversación en el taller de esta semana.</p><p><strong>Texto de demostración.</strong> Sustituye este contenido por una noticia real. Recuerda no publicar fotografías en las que se pueda identificar a residentes sin su autorización expresa.</p><h2>Un subtítulo de ejemplo</h2><p>Puedes usar títulos, listas, enlaces y citas desde el editor de noticias.</p><blockquote>Una cita de ejemplo.</blockquote>', '6f1c2a3e-1b2c-4d3e-8f40-000000000007', '8b3c4d5e-2222-4bbb-8ccc-000000000002', 'Equipo del centro', 'published', now() - interval '6 days', false, true);
insert into public.news_posts (title, slug, excerpt, content_html, featured_media_id, category_id, author_name, status, published_at, is_featured, is_demo)
values ('El jardín se llena de flores', 'el-jardin-se-llena-de-flores', 'Plantamos nuevas especies aromáticas en el jardín.', '<p>Plantamos nuevas especies aromáticas en el jardín.</p><p><strong>Texto de demostración.</strong> Sustituye este contenido por una noticia real. Recuerda no publicar fotografías en las que se pueda identificar a residentes sin su autorización expresa.</p><h2>Un subtítulo de ejemplo</h2><p>Puedes usar títulos, listas, enlaces y citas desde el editor de noticias.</p><blockquote>Una cita de ejemplo.</blockquote>', '6f1c2a3e-1b2c-4d3e-8f40-000000000001', '8b3c4d5e-2222-4bbb-8ccc-000000000001', 'Equipo del centro', 'published', now() - interval '12 days', false, true);
insert into public.news_posts (title, slug, excerpt, content_html, featured_media_id, category_id, author_name, status, published_at, is_featured, is_demo)
values ('Nuevo horario de visitas (ejemplo)', 'nuevo-horario-de-visitas', 'Información de ejemplo sobre horarios de visita.', '<p>Información de ejemplo sobre horarios de visita.</p><p><strong>Texto de demostración.</strong> Sustituye este contenido por una noticia real. Recuerda no publicar fotografías en las que se pueda identificar a residentes sin su autorización expresa.</p><h2>Un subtítulo de ejemplo</h2><p>Puedes usar títulos, listas, enlaces y citas desde el editor de noticias.</p><blockquote>Una cita de ejemplo.</blockquote>', null, '8b3c4d5e-2222-4bbb-8ccc-000000000003', 'Equipo del centro', 'published', now() - interval '20 days', false, true);
insert into public.news_posts (title, slug, excerpt, content_html, featured_media_id, category_id, author_name, status, published_at, is_featured, is_demo)
values ('Menú de temporada (borrador)', 'borrador-menu-de-temporada', 'Esta noticia es un borrador: no debe verse en la web pública.', '<p>Esta noticia es un borrador: no debe verse en la web pública.</p><p><strong>Texto de demostración.</strong> Sustituye este contenido por una noticia real. Recuerda no publicar fotografías en las que se pueda identificar a residentes sin su autorización expresa.</p><h2>Un subtítulo de ejemplo</h2><p>Puedes usar títulos, listas, enlaces y citas desde el editor de noticias.</p><blockquote>Una cita de ejemplo.</blockquote>', '6f1c2a3e-1b2c-4d3e-8f40-000000000009', '8b3c4d5e-2222-4bbb-8ccc-000000000001', 'Equipo del centro', 'draft', null, false, true);
insert into public.news_posts (title, slug, excerpt, content_html, featured_media_id, category_id, author_name, status, published_at, is_featured, is_demo)
values ('Noticia programada de ejemplo', 'noticia-programada-de-ejemplo', 'Programada para dentro de 5 días: no se verá hasta esa fecha.', '<p>Programada para dentro de 5 días: no se verá hasta esa fecha.</p><p><strong>Texto de demostración.</strong> Sustituye este contenido por una noticia real. Recuerda no publicar fotografías en las que se pueda identificar a residentes sin su autorización expresa.</p><h2>Un subtítulo de ejemplo</h2><p>Puedes usar títulos, listas, enlaces y citas desde el editor de noticias.</p><blockquote>Una cita de ejemplo.</blockquote>', '6f1c2a3e-1b2c-4d3e-8f40-00000000000a', '8b3c4d5e-2222-4bbb-8ccc-000000000002', 'Equipo del centro', 'published', now() + interval '5 days', false, true);
insert into public.news_post_media (post_id, media_id, sort_order)
select id, unnest(array['6f1c2a3e-1b2c-4d3e-8f40-000000000001'::uuid, '6f1c2a3e-1b2c-4d3e-8f40-000000000006'::uuid, '6f1c2a3e-1b2c-4d3e-8f40-000000000004'::uuid]), generate_series(0, 2)
from public.news_posts where slug = 'bienvenida-a-nuestra-nueva-web';

insert into public.event_categories (id, name, slug, color, sort_order) values
  ('9c4d5e6f-3333-4ccc-8ddd-000000000001', 'Celebraciones', 'celebraciones', '#c08a5b', 1),
  ('9c4d5e6f-3333-4ccc-8ddd-000000000002', 'Talleres', 'talleres', '#5f7d63', 2),
  ('9c4d5e6f-3333-4ccc-8ddd-000000000003', 'Familias', 'familias', '#3f6e8c', 3);

insert into public.events (title, slug, summary, description_html, starts_at, ends_at, all_day, location, media_id, category_id, status, is_featured, is_demo)
values ('Taller de música', 'taller-de-musica', 'Evento de demostración: taller de música.', '<p>Evento de demostración: taller de música.</p><p>Describe aquí la actividad: qué se hará, a quién va dirigida y cualquier indicación útil para las familias.</p>', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '2 days') + time '17:00') at time zone 'Europe/Madrid', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '2 days') + time '18:30') at time zone 'Europe/Madrid', false, 'Salón principal (ejemplo)', '6f1c2a3e-1b2c-4d3e-8f40-000000000007', '9c4d5e6f-3333-4ccc-8ddd-000000000002', 'published', false, true);
insert into public.events (title, slug, summary, description_html, starts_at, ends_at, all_day, location, media_id, category_id, status, is_featured, is_demo)
values ('Merienda con familias', 'merienda-con-familias', 'Evento de demostración: merienda con familias.', '<p>Evento de demostración: merienda con familias.</p><p>Describe aquí la actividad: qué se hará, a quién va dirigida y cualquier indicación útil para las familias.</p>', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '5 days') + time '17:30') at time zone 'Europe/Madrid', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '5 days') + time '19:00') at time zone 'Europe/Madrid', false, 'Salón principal (ejemplo)', '6f1c2a3e-1b2c-4d3e-8f40-000000000006', '9c4d5e6f-3333-4ccc-8ddd-000000000003', 'published', true, true);
insert into public.events (title, slug, summary, description_html, starts_at, ends_at, all_day, location, media_id, category_id, status, is_featured, is_demo)
values ('Paseo por el jardín', 'paseo-por-el-jardin', 'Evento de demostración: paseo por el jardín.', '<p>Evento de demostración: paseo por el jardín.</p><p>Describe aquí la actividad: qué se hará, a quién va dirigida y cualquier indicación útil para las familias.</p>', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '8 days') + time '11:00') at time zone 'Europe/Madrid', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '8 days') + time '12:00') at time zone 'Europe/Madrid', false, 'Salón principal (ejemplo)', '6f1c2a3e-1b2c-4d3e-8f40-000000000001', '9c4d5e6f-3333-4ccc-8ddd-000000000002', 'published', false, true);
insert into public.events (title, slug, summary, description_html, starts_at, ends_at, all_day, location, media_id, category_id, status, is_featured, is_demo)
values ('Semana cultural', 'semana-cultural', 'Evento de demostración: semana cultural.', '<p>Evento de demostración: semana cultural.</p><p>Describe aquí la actividad: qué se hará, a quién va dirigida y cualquier indicación útil para las familias.</p>', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '12 days') + time '00:00') at time zone 'Europe/Madrid', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '12 days') + interval '4 days' + time '23:59:59') at time zone 'Europe/Madrid', true, 'Salón principal (ejemplo)', '6f1c2a3e-1b2c-4d3e-8f40-00000000000a', '9c4d5e6f-3333-4ccc-8ddd-000000000001', 'published', true, true);
insert into public.events (title, slug, summary, description_html, starts_at, ends_at, all_day, location, media_id, category_id, status, is_featured, is_demo)
values ('Cine de tarde', 'cine-de-tarde', 'Evento de demostración: cine de tarde.', '<p>Evento de demostración: cine de tarde.</p><p>Describe aquí la actividad: qué se hará, a quién va dirigida y cualquier indicación útil para las familias.</p>', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '19 days') + time '16:30') at time zone 'Europe/Madrid', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '19 days') + time '18:30') at time zone 'Europe/Madrid', false, 'Salón principal (ejemplo)', null, '9c4d5e6f-3333-4ccc-8ddd-000000000002', 'published', false, true);
insert into public.events (title, slug, summary, description_html, starts_at, ends_at, all_day, location, media_id, category_id, status, is_featured, is_demo)
values ('Celebración de cumpleaños del mes', 'celebracion-de-cumpleanos', 'Evento de demostración: celebración de cumpleaños del mes.', '<p>Evento de demostración: celebración de cumpleaños del mes.</p><p>Describe aquí la actividad: qué se hará, a quién va dirigida y cualquier indicación útil para las familias.</p>', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '26 days') + time '17:00') at time zone 'Europe/Madrid', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '26 days') + time '18:00') at time zone 'Europe/Madrid', false, 'Salón principal (ejemplo)', '6f1c2a3e-1b2c-4d3e-8f40-000000000005', '9c4d5e6f-3333-4ccc-8ddd-000000000001', 'published', false, true);
insert into public.events (title, slug, summary, description_html, starts_at, ends_at, all_day, location, media_id, category_id, status, is_featured, is_demo)
values ('Reunión informativa para familias', 'reunion-informativa', 'Evento de demostración: reunión informativa para familias.', '<p>Evento de demostración: reunión informativa para familias.</p><p>Describe aquí la actividad: qué se hará, a quién va dirigida y cualquier indicación útil para las familias.</p>', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '33 days') + time '18:00') at time zone 'Europe/Madrid', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '33 days') + time '19:00') at time zone 'Europe/Madrid', false, 'Salón principal (ejemplo)', '6f1c2a3e-1b2c-4d3e-8f40-000000000004', '9c4d5e6f-3333-4ccc-8ddd-000000000003', 'published', false, true);
insert into public.events (title, slug, summary, description_html, starts_at, ends_at, all_day, location, media_id, category_id, status, is_featured, is_demo)
values ('Evento en borrador (no visible)', 'evento-borrador', 'Evento de demostración: evento en borrador (no visible).', '<p>Evento de demostración: evento en borrador (no visible).</p><p>Describe aquí la actividad: qué se hará, a quién va dirigida y cualquier indicación útil para las familias.</p>', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '3 days') + time '10:00') at time zone 'Europe/Madrid', ((date_trunc('day', now() at time zone 'Europe/Madrid') + interval '3 days') + time '11:00') at time zone 'Europe/Madrid', false, 'Salón principal (ejemplo)', null, '9c4d5e6f-3333-4ccc-8ddd-000000000002', 'draft', false, true);
insert into public.testimonials (quote, author_label, consent_confirmed, status, sort_order) values
  ('Texto de ejemplo. Publica solo testimonios reales con autorización por escrito.', 'Familiar (ejemplo)', false, 'draft', 1);

-- Página: inicio
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('inicio', 'Inicio', true, 'home', 'published', 'Residencia la Luz · Residencia de mayores', 'Un hogar tranquilo y cercano para personas mayores. Contenido de demostración.')
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, 'hero', '{"eyebrow":"Residencia de mayores","title":"Un hogar luminoso donde sentirse cuidado","subtitle":"Acompañamos a cada persona con cariño, respeto y profesionalidad, en un entorno tranquilo y acogedor. (Texto de demostración)","mediaId":"6f1c2a3e-1b2c-4d3e-8f40-000000000001","primaryCta":{"label":"Conocer la residencia","href":"/conocenos"},"secondaryCta":{"label":"Solicitar información","href":"/contacto"},"height":"large","overlay":"gradient","style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb),
         (1, 'image-text', '{"eyebrow":"Bienvenidos","title":"Cuidar es también escuchar","html":"<p>Presenta aquí la residencia en pocas líneas: quiénes sois, qué os hace diferentes y cómo es el día a día. <strong>Este texto es de demostración</strong> y se edita desde el panel.</p><p>Cuenta vuestra historia con datos reales y comprobados.</p>","mediaId":"6f1c2a3e-1b2c-4d3e-8f40-000000000002","imagePosition":"left","imageRatio":"landscape","cta":{"label":"Nuestra historia","href":"/conocenos"},"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb),
         (2, 'values', '{"title":"Nuestra forma de cuidar","intro":"Valores de ejemplo: adáptalos a la filosofía real del centro.","columns":4,"items":[{"icon":"heart","title":"Cercanía","text":"Trato cálido y personal en cada momento."},{"icon":"shield","title":"Seguridad","text":"Espacios adaptados y atención cuidadosa."},{"icon":"smile","title":"Bienestar","text":"Actividades que dan sentido al día."},{"icon":"users","title":"Familia","text":"Comunicación constante con las familias."}],"style":{"align":"center","spacing":"md","background":"soft","width":"normal","anchor":""}}'::jsonb),
         (3, 'services', '{"title":"Servicios","intro":"Algunos ejemplos editables. Publica solo los servicios confirmados.","limit":6,"columns":3,"variant":"cards","cta":{"label":"Ver todos los servicios","href":"/servicios"},"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb),
         (4, 'gallery', '{"title":"Nuestras instalaciones","intro":"Espacios luminosos pensados para la calma y la convivencia.","source":"gallery","mediaIds":[],"limit":6,"columns":3,"cta":{"label":"Ver la galería completa","href":"/instalaciones"},"style":{"align":"left","spacing":"md","background":"surface","width":"normal","anchor":""}}'::jsonb),
         (5, 'image-text', '{"eyebrow":"Vida diaria","title":"Días con propósito","html":"<p>Describe cómo es una jornada: talleres, paseos, música, lectura o celebraciones. <em>Contenido de demostración.</em></p>","mediaId":"6f1c2a3e-1b2c-4d3e-8f40-000000000007","imagePosition":"right","imageRatio":"landscape","cta":{"label":"Ver próximos eventos","href":"/eventos"},"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb),
         (6, 'events', '{"title":"Próximos eventos","intro":"","limit":3,"cta":{"label":"Ver calendario","href":"/eventos"},"style":{"align":"left","spacing":"md","background":"soft","width":"normal","anchor":""}}'::jsonb),
         (7, 'news', '{"title":"Actualidad","intro":"","limit":3,"onlyFeatured":false,"cta":{"label":"Todas las noticias","href":"/noticias"},"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb),
         (8, 'testimonials', '{"title":"Lo que dicen las familias","limit":3,"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb),
         (9, 'cta', '{"title":"¿Quieres visitarnos?","text":"Te enseñamos el centro y resolvemos tus dudas sin compromiso.","primaryCta":{"label":"Solicitar información","href":"/contacto"},"secondaryCta":{"label":"Llamar","href":"tel:+34900000000"},"variant":"primary","mediaId":null,"style":{"align":"center","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Página: conocenos
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('conocenos', 'Conócenos', true, 'blocks', 'published', 'Conócenos', 'Historia, misión y valores de la residencia (contenido de demostración).')
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, 'hero-split', '{"eyebrow":"Conócenos","title":"Una casa con historia y con alma","subtitle":"Texto de demostración para presentar la residencia. Sustitúyelo por la historia real del centro.","mediaId":"6f1c2a3e-1b2c-4d3e-8f40-000000000002","imagePosition":"right","primaryCta":{"label":"Visítanos","href":"/contacto"},"secondaryCta":null,"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb),
         (1, 'rich-text', '{"title":"Nuestra historia","html":"<p>Cuenta aquí cómo nació la residencia, su trayectoria y las personas que la hacen posible. <strong>No inventes datos</strong>: utiliza información verificada.</p>","style":{"align":"left","spacing":"md","background":"default","width":"narrow","anchor":""}}'::jsonb),
         (2, 'values', '{"title":"Misión y valores","intro":"","columns":3,"items":[{"icon":"hand-heart","title":"Misión","text":"Texto de ejemplo sobre la misión del centro."},{"icon":"sun","title":"Visión","text":"Texto de ejemplo sobre la visión del centro."},{"icon":"leaf","title":"Valores","text":"Texto de ejemplo sobre los valores."}],"style":{"align":"left","spacing":"md","background":"soft","width":"normal","anchor":""}}'::jsonb),
         (3, 'image-text', '{"eyebrow":"Filosofía de atención","title":"La persona, en el centro","html":"<p>Explica el modelo de atención del centro. Contenido de demostración.</p>","mediaId":"6f1c2a3e-1b2c-4d3e-8f40-000000000004","imagePosition":"left","imageRatio":"landscape","cta":null,"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb),
         (4, 'team', '{"title":"Equipo profesional","intro":"Solo se muestran personas que hayan autorizado su aparición.","members":[],"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb),
         (5, 'gallery', '{"title":"Fotografías","intro":"","source":"manual","mediaIds":["6f1c2a3e-1b2c-4d3e-8f40-000000000001","6f1c2a3e-1b2c-4d3e-8f40-00000000000a","6f1c2a3e-1b2c-4d3e-8f40-000000000006"],"limit":6,"columns":3,"cta":null,"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Página: servicios
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('servicios', 'Servicios', true, 'services', 'published', 'Servicios', 'Servicios de la residencia (contenido de demostración).')
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, 'hero-split', '{"eyebrow":"Qué ofrecemos","title":"Servicios pensados para cada persona","subtitle":"Ejemplos editables. Publica únicamente los servicios confirmados por el centro.","mediaId":"6f1c2a3e-1b2c-4d3e-8f40-000000000004","imagePosition":"right","primaryCta":null,"secondaryCta":null,"style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Página: instalaciones
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('instalaciones', 'Instalaciones', true, 'gallery', 'published', 'Instalaciones', 'Galería de las instalaciones (imágenes de demostración).')
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, 'hero', '{"eyebrow":"Instalaciones","title":"Espacios para vivir con calma","subtitle":"Imágenes de demostración: sustitúyelas por fotografías reales de las instalaciones.","mediaId":"6f1c2a3e-1b2c-4d3e-8f40-000000000006","primaryCta":null,"secondaryCta":null,"height":"medium","overlay":"gradient","style":{"align":"left","spacing":"md","background":"default","width":"normal","anchor":""}}'::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Página: noticias
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('noticias', 'Noticias', true, 'news', 'published', 'Noticias y actualidad', 'Novedades de la residencia.')
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, null::text, null::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Página: eventos
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('eventos', 'Eventos', true, 'events', 'published', 'Eventos y calendario', 'Agenda de actividades de la residencia.')
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, null::text, null::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Página: contacto
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('contacto', 'Contacto', true, 'contact', 'published', 'Contacto', 'Datos de contacto y formulario.')
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, null::text, null::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Página: aviso-legal
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('aviso-legal', 'Aviso legal', true, 'legal', 'published', 'Aviso legal', null)
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, 'rich-text', '{"title":"","html":"<h2>Datos del titular</h2><p>[Razón social, NIF, domicilio, datos registrales y de contacto: <strong>pendiente de completar</strong>.]</p><h2>Condiciones de uso</h2><p>[Texto pendiente de redacción y revisión por un profesional.]</p>","style":{"align":"left","spacing":"md","background":"default","width":"narrow","anchor":""}}'::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Página: privacidad
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('privacidad', 'Política de privacidad', true, 'legal', 'published', 'Política de privacidad', null)
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, 'rich-text', '{"title":"","html":"<h2>Responsable del tratamiento</h2><p>[Pendiente de completar.]</p><h2>Datos que tratamos</h2><p>A través del formulario de contacto se recogen nombre, correo electrónico, teléfono (opcional) y el mensaje, únicamente para responder a la consulta.</p><h2>Base legal, conservación y derechos</h2><p>[Pendiente de completar y revisar por un profesional: base de legitimación, plazos de conservación, destinatarios y ejercicio de derechos ante la AEPD.]</p>","style":{"align":"left","spacing":"md","background":"default","width":"narrow","anchor":""}}'::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Página: cookies
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values ('cookies', 'Política de cookies', true, 'legal', 'published', 'Política de cookies', null)
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values (0, 'rich-text', '{"title":"","html":"<p>Esta web, tal como se entrega, no instala cookies de analítica ni publicidad. Usa cookies técnicas solo en el área de administración (inicio de sesión) y en la vista previa.</p><p>Los vídeos incrustados solo se cargan cuando la persona usuaria pulsa reproducir. <strong>Revisa este texto</strong> si añades herramientas de terceros.</p>","style":{"align":"left","spacing":"md","background":"default","width":"narrow","anchor":""}}'::jsonb)
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;

-- Las sentencias WITH no ven sus propias inserciones: se enlaza la revisión publicada aquí.
update public.pages p set published_revision_id = r.id
from public.page_revisions r where r.page_id = p.id and r.version = 1;
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'header', 'Inicio', '/', id, 0, true from public.pages where slug = 'inicio';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'header', 'Conócenos', '/conocenos', id, 1, true from public.pages where slug = 'conocenos';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'footer', 'Conócenos', '/conocenos', id, 1, true from public.pages where slug = 'conocenos';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'header', 'Servicios', '/servicios', id, 2, true from public.pages where slug = 'servicios';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'footer', 'Servicios', '/servicios', id, 2, true from public.pages where slug = 'servicios';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'header', 'Instalaciones', '/instalaciones', id, 3, true from public.pages where slug = 'instalaciones';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'footer', 'Instalaciones', '/instalaciones', id, 3, true from public.pages where slug = 'instalaciones';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'header', 'Noticias', '/noticias', id, 4, true from public.pages where slug = 'noticias';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'footer', 'Noticias', '/noticias', id, 4, true from public.pages where slug = 'noticias';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'header', 'Eventos', '/eventos', id, 5, true from public.pages where slug = 'eventos';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'footer', 'Eventos', '/eventos', id, 5, true from public.pages where slug = 'eventos';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'header', 'Contacto', '/contacto', id, 6, true from public.pages where slug = 'contacto';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'footer', 'Contacto', '/contacto', id, 6, true from public.pages where slug = 'contacto';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'legal', 'Aviso legal', '/aviso-legal', id, 0, true from public.pages where slug = 'aviso-legal';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'legal', 'Privacidad', '/privacidad', id, 1, true from public.pages where slug = 'privacidad';
insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'legal', 'Cookies', '/cookies', id, 2, true from public.pages where slug = 'cookies';

delete from public.audit_log;
commit;
