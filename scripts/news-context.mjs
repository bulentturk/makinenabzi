export function normalized(s='') {
  return s.toLowerCase().replace(/ı/g,'i').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}

export function hasTerm(text, term) {
  const specials = "\\.^$*+?()[]{}|";
  const escaped = term.trim().split('').map(ch => specials.includes(ch) ? '\\' + ch : ch).join('').replace(/\s+/g, '\\s+');
  return new RegExp('(^|[^a-z0-9])' + escaped + '([^a-z0-9]|$)', 'i').test(text);
}

const mobileContextTerms = [
  'off-highway','off road','off-road','mobile machinery','mobile equipment','heavy equipment',
  'construction equipment','agricultural machinery','farm equipment','mining equipment','mining truck',
  'industrial vehicle','industrial equipment','material handling','port equipment','marine propulsion',
  'workboat','tractor','excavator','loader','haul truck','forklift','reach stacker',
  'is makinasi','ekskavator','maden makinasi','maden kamyonu','traktor','liman ekipmani'
];

export function hasMobileContext(text) {
  const haystack = normalized(text);
  return mobileContextTerms.some(term => hasTerm(haystack,term));
}
