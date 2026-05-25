function aggregateEntities(entities) {
  const map = {};

  for (const e of entities) {
    if (!map[e.entity_type]) {
      map[e.entity_type] = [];
    }
    map[e.entity_type].push(e.entity_value);
  }

  return map;
}

module.exports = { aggregateEntities };
