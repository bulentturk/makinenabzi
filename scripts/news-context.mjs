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
  'workboat','ground support equipment','aircraft tug','tractor','excavator','loader','haul truck','forklift','reach stacker',
  'diesel engine','off-highway engine','transmission','drivetrain','axle','undercarriage',
  'is makinasi','ekskavator','maden makinasi','maden kamyonu','traktor','liman ekipmani'
];

export function hasMobileContext(text) {
  const haystack = normalized(text);
  return mobileContextTerms.some(term => hasTerm(haystack,term));
}

const gseTerms = [
  'ground support equipment','ground handling equipment','gse','airside vehicle','apron vehicle',
  'aircraft tug','aircraft towing','pushback tractor','baggage tractor','baggage tug',
  'belt loader','cargo loader','de-icing truck','aircraft deicer','ground power unit',
  'passenger stairs','airport fire truck','airport ground vehicle'
];
const marineEquipmentTerms = [
  'marine propulsion','marine engine','boat engine','outboard motor','inboard motor',
  'electric boat','electric yacht','electric ferry','hybrid vessel','workboat','thruster',
  'shore power','deck machinery','marine battery','marine electric','yacht technology',
  'yacht equipment','ship propulsion','vessel propulsion','azimuth drive','boatbuilding equipment'
];

export function hasSectorEquipmentContext(text, sector) {
  const haystack = normalized(text);
  const terms = sector === 'gse' ? gseTerms : sector === 'marine' ? marineEquipmentTerms : [];
  return terms.some(term => hasTerm(haystack,term));
}
