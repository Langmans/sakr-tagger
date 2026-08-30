<script setup>
import { ref, computed, provide } from 'vue'
import Armor from './components/Armor.vue';

import { parseIniString } from './import.js';
import { exportMultiple, exportComplexSorterAll, FORMATS } from './export.js';
import { VERSIONS } from './keywords.js';

const armors = ref([{ keywords: {} }])

/* Which SAKR every id on this page belongs to. One setting for the whole app
   rather than per armour: an ini goes into one load order, and a file mixing
   the two versions is not a thing anybody wants to be able to make by accident.

   Provided rather than passed, because Armor renders its own line and asking
   every intermediate component to forward a version is how one of them ends up
   not forwarding it. */
const version = ref('redux')
provide('sakrVersion', version)

/* Which patcher the output is for. Complex Sorter names keywords rather than
   numbering them, so the version above does not apply to it at all -- the
   version control is hidden while it is selected rather than left there
   implying it does something. */
const format = ref('robco')
provide('sakrFormat', format)

const numbered = computed(() => format.value === 'robco')

/* Whether every label carries its FormID. Off by default -- forty numbers under
   forty labels is a lot of page for something most people never need to read,
   since the generated line below already has the ids in it.
 *
   It earns its place when you are checking a patch rather than building one:
   turn it on and the version switch visibly renumbers 35 of the 40, which is
   otherwise a claim you have to take on trust. */
const showIds = ref(false)
provide('sakrShowIds', showIds)

/* What the file said, when it said anything. A 0x26xx id proves 1.1.2; nothing
   proves REDUX, so an unproven RobCo file is read as whatever is selected and
   says so. A Complex Sorter file has no ids and so has no version to get
   wrong. */
const imported = ref(null)

const add = () => { armors.value.push({ keywords: {} }) }
const remove = (i) => armors.value.splice(i, 1)
const move = (from, to) => {
  if (to < 0 || to >= armors.value.length) return;
  [armors.value[from], armors.value[to]] = [armors.value[to], armors.value[from]];
}

const goTo = (i) => {
  document.getElementById(`armor-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const label = (armor, i) => armor?.name?.trim() || armor?.editorId?.trim()
  || armor?.formid?.trim() || `Armor ${i + 1}`

/* How many SAKR keywords an armour carries, so the menu can show at a glance
   which rows are still empty. */
const tagCount = (armor) => (armor?.keywordNames ?? []).length

const wholeIni = computed(() => exportMultiple(armors.value, version.value))
const sorterFiles = computed(() => exportComplexSorterAll(armors.value))

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const parsed = parseIniString(e.target.result, version.value);

      if (parsed.armors.length === 0) {
        imported.value = { empty: true, name: file.name, format: parsed.format };
        return;
      }

      armors.value = parsed.armors;

      /* The file decides the format, because it is evidence rather than a
         preference -- reading a Complex Sorter file and leaving the page on
         RobCo would show empty lines for rows that are perfectly fine. */
      if (parsed.format) format.value = parsed.format;

      /* A proven version wins over the switch for the same reason. Switching
         afterwards then RE-NUMBERS what was imported, which is the conversion
         this app can do that nothing else here can. */
      if (parsed.proven) version.value = parsed.version;

      imported.value = {
        name: file.name,
        count: parsed.armors.length,
        format: parsed.format,
        version: parsed.version,
        proven: parsed.proven,
        versionless: parsed.versionless,
        unknown: parsed.armors.reduce((n, a) => n + (a.unknown?.length ?? 0), 0)
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
  <header class="settings">
    <fieldset>
      <legend>Output format</legend>
      <label v-for="(text, key) in FORMATS" :key="key">
        <input type="radio" name="sakr-format" :value="key" v-model="format" />
        {{ text }}
      </label>
      <p class="note">
        <strong>RobCo Patcher</strong> names the armour and the keyword by
        FormID, so it is tied to one SAKR version and to one plugin load.
        <strong>Complex Item Sorter</strong> matches on EditorID and names
        keywords by name, so it works with either version — but it needs the
        EditorID, which a RobCo line does not carry.
      </p>
    </fieldset>

    <fieldset v-if="numbered">
      <legend>SAKR version</legend>
      <label v-for="(text, key) in VERSIONS" :key="key">
        <input type="radio" name="sakr-version" :value="key" v-model="version" />
        {{ text }}
      </label>

      <label class="show-ids">
        <input type="checkbox" v-model="showIds" />
        Show FormIDs
      </label>

      <p class="note">
        The two ship the same plugin filename and 35 of their 40 shared keywords
        have different ids, so a line written for one is applied as a different
        keyword by the other. Nothing reports it. Switching here renumbers
        everything on the page — tick <em>Show FormIDs</em> to watch it happen.
        <strong>Five keywords keep their number</strong> in both versions
        (bra normal, bikini and micro, pants sheer, top halter top), so those
        will not change. That is coincidence, not compatibility.
      </p>
    </fieldset>

    <p v-if="imported?.error" class="report bad">
      {{ imported.name }} could not be read: {{ imported.error }}
    </p>
    <p v-else-if="imported?.empty" class="report bad">
      <template v-if="imported.format === 'complexSorter'">
        {{ imported.name }} is a Complex Sorter file but holds no
        <code>EDID equals</code> rule that adds a SAKR keyword.
      </template>
      <template v-else-if="imported.format === 'robco'">
        {{ imported.name }} holds no usable <code>filterByArmors</code> line.
      </template>
      <template v-else>
        {{ imported.name }} is neither a RobCo Patcher ini nor a Complex Sorter
        one, as far as this can tell.
      </template>
    </p>
    <p v-else-if="imported" class="report">
      Read {{ imported.count }} armour(s) from {{ imported.name }} as
      <strong>{{ FORMATS[imported.format] }}</strong>.
      <template v-if="imported.versionless">
        It names keywords rather than numbering them, so it belongs to no SAKR
        version and needs no conversion.
      </template>
      <template v-else-if="imported.proven">
        It carries a 1.1.2-only id, so it was read as
        {{ VERSIONS[imported.version] }}.
      </template>
      <template v-else>
        It proves no version, so it was read as {{ VERSIONS[imported.version] }} —
        switch above if that is wrong.
      </template>
      <template v-if="imported.unknown">
        {{ imported.unknown }} keyword(s) belong to no SAKR record and were left
        out.
      </template>
    </p>
  </header>

  <div class="layout">
    <nav class="menu" aria-label="Armours on this page">
      <div class="menu-head">{{ armors.length }} armour(s)</div>
      <ol>
        <li v-for="(armor, i) in armors" :key="i">
          <button type="button" @click.prevent="goTo(i)" :title="armor?.mod || ''">
            <span class="menu-name">{{ label(armor, i) }}</span>
            <span class="menu-count" :class="{ empty: tagCount(armor) === 0 }">
              {{ tagCount(armor) }}
            </span>
          </button>
        </li>
      </ol>
      <button type="button" class="menu-add" @click.prevent="add">Add armour</button>
    </nav>

    <main>
      <div v-for="(armor, i) in armors" :key="i">
        <Armor v-model="armors[i]" :index="i" :open="true">
          <template #top>
            <div class="inline-flex">
              <button @click.prevent="move(i, i - 1)" :disabled="i === 0">▲</button>
              <button @click.prevent="move(i, i + 1)" :disabled="i === armors.length - 1">▼</button>
              <button @click.prevent="remove(i)">Remove</button>
            </div>
          </template>
        </Armor>
      </div>

      <p class="actions">
        <button @click.prevent="add">Add</button>
        <input id="ini-upload" type="file" accept=".ini,.txt" @change="handleFileUpload" />
      </p>

      <details v-if="numbered" class="whole">
        <summary>The whole ini</summary>
        <textarea cols="100" rows="16" readonly
          onclick="this.focus();this.select()">{{ wholeIni }}</textarea>
      </details>

      <details v-else class="whole" open>
        <summary>Complex Sorter files ({{ sorterFiles.length }})</summary>
        <p class="note">
          One file per plugin, which is how Complex Sorter reads them. Save each
          under <code>Complex Sorter/Plugins/</code> with the filename shown.
        </p>
        <div v-for="file in sorterFiles" :key="file.filename">
          <h3>{{ file.filename }}</h3>
          <textarea cols="100" rows="14" readonly
            onclick="this.focus();this.select()">{{ file.text }}</textarea>
        </div>
        <p v-if="sorterFiles.length === 0" class="note">
          Nothing yet — an armour needs a Mod before it can go in a file.
        </p>
      </details>
    </main>
  </div>
</template>

<style scoped>
.settings fieldset {
  border: 1px solid var(--line);
  padding: 0.5em 1em;
  margin-bottom: 1em;
}

.settings label {
  margin-right: 1em;
}

/* Set apart from the version radios beside it: those choose what the page
   MEANS, this only chooses what it shows. */
.show-ids {
  border-left: 1px solid var(--line);
  padding-left: 1em;
  opacity: 0.85;
}

.note {
  margin: 0.5em 0 0;
  max-width: 70ch;
  opacity: 0.75;
  font-size: 0.9em;
}

.report {
  max-width: 80ch;
}

.report.bad {
  font-weight: bold;
}

/* The menu sticks and the page scrolls past it, so a long patch stays
   navigable. Below the breakpoint it goes back to being a plain list above the
   armours rather than a column too narrow to read. */
.layout {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 60rem) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .menu {
    position: static;
    max-height: 12rem;
  }
}

.menu {
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  border: 1px solid var(--line);
  border-radius: 0.4em;
  padding: 0.5em;
  background: var(--panel);
}

.menu-head {
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.6;
  padding: 0.25em 0.5em 0.5em;
}

.menu ol {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu li button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5em;
  width: 100%;
  text-align: left;
  background: none;
  border: 0;
  border-radius: 0.25em;
  padding: 0.3em 0.5em;
}

.menu li button:hover {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
}

.menu-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-count {
  font-size: 0.8em;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

.menu-count.empty {
  opacity: 0.3;
}

.menu-add {
  width: 100%;
  margin-top: 0.5em;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.75em;
}

.whole textarea {
  display: block;
  width: 100%;
}

.whole h3 {
  margin: 1em 0 0.25em;
  font-size: 0.95em;
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
}
</style>
