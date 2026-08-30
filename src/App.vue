<script setup>
import { ref, computed, provide } from 'vue'
import Armor from './components/Armor.vue';

import { parseIniString } from './import.js';
import { exportMultiple } from './export.js';
import { VERSIONS } from './keywords.js';

const armors = ref([{}])

/* Which SAKR every id on this page belongs to. One setting for the whole app
   rather than per armour: an ini goes into one load order, and a file mixing
   the two versions is not a thing anybody wants to be able to make by accident.

   Provided rather than passed, because Armor renders its own line and asking
   every intermediate component to forward a version is how one of them ends up
   not forwarding it. */
const version = ref('redux')
provide('sakrVersion', version)

/* What the file said, when it said anything. A 0x26xx id proves 1.1.2; nothing
   proves REDUX, so an unproven file is read as whatever is selected and says
   so. */
const imported = ref(null)

const add = () => { armors.value.push({}) }
const remove = (i) => armors.value.splice(i, 1)
const move = (from, to) => {
  if (to < 0 || to >= armors.value.length) return;
  [armors.value[from], armors.value[to]] = [armors.value[to], armors.value[from]];
}

const wholeIni = computed(() => exportMultiple(armors.value, version.value))

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const parsed = parseIniString(e.target.result, version.value);

      if (parsed.armors.length === 0) {
        imported.value = { empty: true, name: file.name };
        return;
      }

      armors.value = parsed.armors;

      /* A proven version wins over the switch, because the file is evidence and
         the switch is a preference. Switching afterwards then RE-NUMBERS what
         was imported, which is the conversion this app can do that nothing else
         here can. */
      if (parsed.proven) version.value = parsed.version;

      imported.value = {
        name: file.name,
        count: parsed.armors.length,
        version: parsed.version,
        proven: parsed.proven,
        unknown: parsed.armors.reduce((n, a) => n + a.unknown.length, 0)
      };
    } catch (err) {
      console.error('Could not parse', file.name, err);
      imported.value = { error: String(err), name: file.name };
    }
  };

  reader.readAsText(file);

  // So picking the same file twice in a row fires change again.
  event.target.value = '';
};
</script>

<template>
  <header class="version">
    <fieldset>
      <legend>SAKR version</legend>
      <label v-for="(label, key) in VERSIONS" :key="key">
        <input type="radio" name="sakr-version" :value="key" v-model="version" />
        {{ label }}
      </label>
      <p class="note">
        The two ship the same plugin filename and 35 of their 40 shared keywords
        have different ids, so a line written for one is applied as a different
        keyword by the other. Nothing reports it. Switching here renumbers
        everything on the page.
      </p>
    </fieldset>

    <p v-if="imported?.error" class="report bad">
      {{ imported.name }} could not be read: {{ imported.error }}
    </p>
    <p v-else-if="imported?.empty" class="report bad">
      {{ imported.name }} holds no <code>filterByArmors</code> line.
    </p>
    <p v-else-if="imported" class="report">
      Read {{ imported.count }} armour(s) from {{ imported.name }},
      <template v-if="imported.proven">
        which carries a 1.1.2-only id, so it was read as {{ VERSIONS[imported.version] }}.
      </template>
      <template v-else>
        which proves no version, so it was read as {{ VERSIONS[imported.version] }} --
        switch above if that is wrong.
      </template>
      <template v-if="imported.unknown">
        {{ imported.unknown }} keyword(s) belong to no SAKR record and were left out.
      </template>
    </p>
  </header>

  <div>
    <div v-for="(armor, i) in armors" :key="i">
      <Armor v-model="armors[i]" :open="true">
        <template #top>
          <div class="inline-flex">
            <button @click.prevent="move(i, i - 1)" :disabled="i === 0">▲</button>
            <button @click.prevent="move(i, i + 1)" :disabled="i === armors.length - 1">▼</button>
            <button @click.prevent="remove(i)">Remove</button>
          </div>
        </template>
      </Armor>
    </div>

    <button @click.prevent="add">Add</button>
    <input id="ini-upload" type="file" accept=".ini,.txt" @change="handleFileUpload" />
  </div>

  <details class="whole">
    <summary>The whole ini</summary>
    <textarea cols="100" rows="16" readonly onclick="this.focus();this.select()">{{ wholeIni }}</textarea>
  </details>
</template>

<style scoped>
.version fieldset {
  border: 1px solid;
  padding: 0.5em 1em;
  margin-bottom: 1em;
}

.version label {
  margin-right: 1em;
}

.note {
  margin: 0.5em 0 0;
  max-width: 60ch;
  opacity: 0.75;
  font-size: 0.9em;
}

.report {
  max-width: 80ch;
}

.report.bad {
  font-weight: bold;
}

.whole textarea {
  display: block;
  width: 100%;
}
</style>
