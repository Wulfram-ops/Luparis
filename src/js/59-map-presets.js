const MAP_PRESETS = {
  ambush: {
    name: ['Forest road', 'Route forestière'],
    description: [
      'A winding road with dense cover. Suitable for ambushes and pursuits.',
      'Un chemin sinueux bordé de couverts. Pour les embuscades et les poursuites.',
    ],
    min: 16,
    size: 'medium',
    seed: 14,
    recipe: { scene: 'forest_road' },
  },
  bridge: {
    name: ['River crossing', 'Passage de rivière'],
    description: [
      'A bridge between two banks, with a narrow crossing to defend.',
      'Un pont relie deux rives. Le passage étroit est facile à défendre.',
    ],
    min: 16,
    size: 'medium',
    seed: 23,
    recipe: { scene: 'bridge' },
  },
  tavern: {
    name: ['Roadside tavern', 'Auberge'],
    description: [
      'A furnished interior with an approach from the road. Useful for meetings or a close-quarters brawl.',
      'Un intérieur meublé et une entrée sur la route. Pour les rencontres ou une rixe au corps à corps.',
    ],
    min: 24,
    size: 'medium',
    seed: 8,
    recipe: { scene: 'tavern' },
  },
  vaults: {
    name: ['Connected vaults', 'Salles souterraines'],
    description: [
      'Two rooms with a connecting corridor, doors and cover. Ready for a room-by-room encounter.',
      'Deux salles, un couloir, des portes et des couverts. Pour progresser de salle en salle.',
    ],
    min: 32,
    size: 'large',
    seed: 17,
    recipe: {
      bio: 'donjon',
      add: [
        { k: 'room', pos: 'north', w: 10, h: 8, entrance: 'south' },
        { k: 'room', pos: 'south', w: 12, h: 9, entrance: 'north' },
      ],
      links: [{ from: 1, to: 2, width: 2 }],
      objs: [
        { k: 'brazier', n: 2, place: 1 },
        { k: 'crate', n: 3, place: 2 },
      ],
    },
  },
  shrine: {
    name: ['Ruined shrine', 'Sanctuaire en ruine'],
    description: [
      'An altar among broken walls and columns. Suitable for defending a ritual or exploring ruins.',
      'Un autel entouré de murs brisés et de colonnes. Pour défendre un rituel ou explorer des ruines.',
    ],
    min: 24,
    size: 'large',
    seed: 62,
    recipe: { bio: 'foret', add: ['temple'], ruin: 0.28 },
  },
  market: {
    name: ['Market square', 'Place du marché'],
    description: [
      'A central square, stalls and several approaches for a crowded encounter or chase.',
      'Une place centrale, des étals et plusieurs accès pour une rencontre ou une poursuite en ville.',
    ],
    min: 24,
    size: 'large',
    seed: 44,
    recipe: { bio: 'prairie', add: ['market'] },
  },
};
let mapPresetKey = 'ambush',
  mapPresetSeed = MAP_PRESETS.ambush.seed,
  mapPresetContext,
  mapPresetCandidate = null;

function mapPresetLabels() {
  const preset = MAP_PRESETS[mapPresetKey];
  $('map_preset_choices').setAttribute('aria-label', L2('Map templates', 'Modèles de cartes'));
  $('map_preset_choices').innerHTML = Object.entries(MAP_PRESETS)
    .map(
      ([key, template]) =>
        `<button type="button" data-map-preset="${key}" aria-pressed="${key === mapPresetKey}">${tr(template.name)}</button>`,
    )
    .join('');
  $('map_preset_name').textContent = tr(preset.name);
  $('map_preset_description').textContent = tr(preset.description);
  $('map_preset_size_label').textContent = L2('Size', 'Taille');
  $('map_preset_variant').textContent = L2('New variant', 'Nouvelle variante');
  $('map_preset_apply').textContent = L2('Replace the map', 'Remplacer la carte');
  $('map_preset_canvas').setAttribute('aria-label', L2('Map preview', 'Aperçu de la carte'));
}

function previewMapPreset() {
  if (MP.role === 'player' || TABLE_DISPLAY) return;
  const preset = MAP_PRESETS[mapPresetKey],
    status = $('map_preset_status'),
    apply = $('map_preset_apply'),
    canvas = $('map_preset_canvas');
  const { span, taken, warnings, missing, access } = MG;
  try {
    mapPresetCandidate = mgBuild({ ...preset.recipe, size: $('map_preset_size').value }, mapPresetSeed, true);
    mapPresetContext = CTX;
    paintMapPreview(JSON.parse(mapPresetCandidate.state), canvas);
    canvas.hidden = false;
    apply.disabled = false;
    const issues = mapPresetCandidate.issues;
    status.textContent = issues.length
      ? L2('Could not place: ', 'Éléments non placés : ') + issues.join(', ')
      : L2('Replaces the active map. You can undo it.', 'Remplace la carte active. Tu peux annuler ensuite.');
  } catch (error) {
    mapPresetCandidate = null;
    canvas.hidden = true;
    apply.disabled = true;
    status.textContent = error.message;
  } finally {
    Object.assign(MG, { span, taken, warnings, missing, access });
  }
  $('map_preset_preview').hidden = false;
}

function selectMapPreset(key) {
  if (MP.role === 'player' || !Object.hasOwn(MAP_PRESETS, key)) return;
  const preset = MAP_PRESETS[key];
  mapPresetKey = key;
  mapPresetSeed = preset.seed;
  const sizes = Object.entries(MG_SIZE).filter(([, size]) => size >= preset.min);
  $('map_preset_size').replaceChildren(...sizes.map(([value, size]) => new Option(`${size}×${size}`, value)));
  $('map_preset_size').value = preset.size;
  mapPresetLabels();
  previewMapPreset();
}

$('map_preset_choices').addEventListener('click', event => {
  const button = event.target.closest('[data-map-preset]');
  if (!button) return;
  const { mapPreset } = button.dataset;
  if (mapPreset === mapPresetKey && mapPresetCandidate) return;
  selectMapPreset(mapPreset);
  $('map_preset_choices').querySelector(`[data-map-preset="${mapPreset}"]`)?.focus({ preventScroll: true });
});
$('map_preset_size').onchange = previewMapPreset;
$('map_preset_variant').onclick = () => {
  mapPresetSeed = (Math.random() * 4294967296) >>> 0;
  previewMapPreset();
};
$('map_preset_apply').onclick = () => {
  if (MP.role === 'player' || !mapPresetCandidate) return;
  if (mapPresetContext !== CTX || mapPresetCandidate.before !== mgSnapshot()) {
    previewMapPreset();
    if (mapPresetCandidate)
      $('map_preset_status').textContent = L2(
        'The map changed. Review the new preview before replacing it.',
        'La carte a changé. Vérifie le nouvel aperçu avant de la remplacer.',
      );
    return;
  }
  if (mgCommit(mapPresetCandidate)) {
    mapPresetCandidate = null;
    $('map_preset_apply').disabled = true;
    $('map_templates_dialog').close();
    $('save_msg').textContent = L2('Map applied. Undo is available.', 'Carte appliquée. Annuler est disponible.');
  }
};
$('map_templates_open').onclick = () => {
  if (MP.role === 'player' || TABLE_DISPLAY || !document.body.classList.contains('mode-edit')) return;
  if ($('map_preset_preview').hidden) selectMapPreset(mapPresetKey);
  else if (!mapPresetCandidate || mapPresetContext !== CTX || mapPresetCandidate.before !== mgSnapshot())
    previewMapPreset();
  $('map_templates_dialog').showModal();
};
document.addEventListener('play-labels', mapPresetLabels);
mapPresetLabels();
