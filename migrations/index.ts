import * as migration_20260504_002635_payload_init from './20260504_002635_payload_init';
import * as migration_20260504_040459_pages_hero_tabs from './20260504_040459_pages_hero_tabs';

export const migrations = [
  {
    up: migration_20260504_002635_payload_init.up,
    down: migration_20260504_002635_payload_init.down,
    name: '20260504_002635_payload_init',
  },
  {
    up: migration_20260504_040459_pages_hero_tabs.up,
    down: migration_20260504_040459_pages_hero_tabs.down,
    name: '20260504_040459_pages_hero_tabs'
  },
];
