begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

-- Shape validation
select ok(private.is_localized_text('{"en": "Sunrise mat", "fr": "Mat du matin"}'), 'valid localized text');
select ok(private.is_localized_text('{"fr": "Cours en français"}'), 'source-language-only content is valid');
select ok(not private.is_localized_text('{}'), 'empty object is invalid');
select ok(not private.is_localized_text('"just a string"'), 'plain string is invalid');
select ok(not private.is_localized_text('{"en": "  "}'), 'blank value is invalid');
select ok(not private.is_localized_text('{"english": "Hello"}'), 'malformed language key is invalid');
select ok(not private.is_localized_text('{"en": 42}'), 'non-string value is invalid');
select ok(not private.is_localized_text('{"en": "abcdef"}', 5), 'over-length value is invalid');

-- Publication requirements (A-03)
select is(
  private.missing_translations('{"en": "Studio", "fr": "Studio"}', 'organization'),
  array['ru'],
  'organization without Russian cannot be published'
);
select is(
  private.missing_translations('{"fr": "Cours"}', 'workout'),
  '{}'::text[],
  'workouts can be published in their source language'
);

-- Fallback resolution
select is(private.localized('{"en": "Hello", "fr": "Bonjour"}', 'ru'), 'Hello', 'falls back to English');
select is(private.localized('{"fr": "Bonjour"}', 'ru', 'fr'), 'Bonjour', 'then to the source language');

select * from finish();
rollback;
