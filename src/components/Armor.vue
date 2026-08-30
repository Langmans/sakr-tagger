<script setup>
import { useId, computed, watch, inject, ref } from 'vue'

const id = useId()
const model = defineModel()

const props = defineProps({ index: Number })

import { setFor, SEXES } from '../keywords.js'
import { EDID_OPS } from '../import.js'
import KeywordGroup from './KeywordGroup.vue'
import { exportSingle, exportComplexSorter, keywordNamesOf } from '../export.js'

/* App provides these. The fallbacks keep this component usable on its own -- in
   a test, or dropped into another page -- rather than throwing on inject. */
const version = inject('sakrVersion', ref('redux'))
const format = inject('sakrFormat', ref('robco'))

/* Which body this armour is for, and so which keyword set it gets. Per armour
   rather than per page, because an outfit is worn by one or the other and a
   plugin may hold both.
 *
   Not a suffix on the same records: the male set has no bra and no skirt, and
   its top steps Full -> Breast -> SmallCoverage where the female one steps
   Full -> Cleavage -> LowCutCleavage. Switching therefore changes which groups
   exist, not just which ids they carry. */
const sex = computed({
    get: () => model.value?.sex ?? 'female',
    set: (value) => { model.value = { ...model.value, sex: value } }
})

/* Same shape, and for the same reason: a fresh armour is {}, so binding the
   <select> straight to model.edidOp leaves it matching no option and rendering
   blank. The default lives here rather than in whoever creates the armour, so
   there is one place it can be wrong. */
const edidOp = computed({
    get: () => model.value?.edidOp ?? 'equals',
    set: (value) => { model.value = { ...model.value, edidOp: value } }
})

const keywordGroups = computed(() => {
    const groups = { top: [], bottom: [] }

    Object.entries(setFor(sex.value)).forEach(([group, groupKeywords]) => {
        groups[['armorTop', 'top', 'bra'].includes(group)
            ? 'top'
            : 'bottom'
        ].push({ group, keywords: groupKeywords })
    })
    return groups
})

/* The male set is REDUX only -- 1.1.2 has no male keyword at all -- so a male
   armour cannot be written as a 1.1.2 RobCo line. Complex Sorter is fine either
   way, since it names keywords rather than numbering them. */
const impossible = computed(() =>
    sex.value === 'male' && version.value === 'legacy' && format.value === 'robco')

watch(
    () => model.value?.keywords,
    (newKeywords) => {
        /* A fresh armour is {} and has no keywords object, so the first tick
           puts one there before anything can be written into it. Without this
           the FIRST click on the page is lost: KeywordGroup writes into its own
           default {}, the update lands on a property of an object the parent
           does not have, and nothing reaches the model. Every later click works,
           which is what makes it look like a stray bug rather than a missing
           initial value. */
        if (!model.value?.keywords) {
            model.value = { ...model.value, keywords: {}, keywordNames: [] }
            return
        }

        const keywordNames = keywordNamesOf({ keywords: newKeywords })

        /* Names only. The ids are looked up at export time, so throwing the
           version switch renumbers every line without touching this model --
           which is what makes converting an imported ini a one-click thing. */
        const current = model.value?.keywordNames ?? []
        if (JSON.stringify(current) !== JSON.stringify(keywordNames)) {
            model.value = {
                ...model.value,
                keywords: newKeywords,
                keywordNames
            }
        }
    },
    { deep: true, immediate: true }
)

const output = computed(() => format.value === 'complexSorter'
    ? exportComplexSorter(model.value?.mod ?? '', [model.value])
    : exportSingle(model.value, version.value))

</script>

<template>
    <details :open="model?.open" :id="`armor-${props.index}`">
        <summary>
            <template v-if="model?.name">
                {{ model.name }}
            </template>
            <em v-else>Unnamed armor</em>

            <template v-if="model?.mod">
                ({{ model.mod }}{{ model.formid ? `#${model.formid}` : '' }})
            </template>
            <span v-if="sex === 'male'" class="tag">male</span>
        </summary>

        <slot name="top"></slot>

        <div class="inline-flex col">
            <div class="inline-flex">
                <div>
                    <div><label :for="`mod-${id}`">Mod</label></div>
                    <input :id="`mod-${id}`" v-model="model.mod" placeholder="Outfit.esp" />
                </div>
                <div>
                    <div><label :for="`formid-${id}`">Formid</label></div>
                    <input :id="`formid-${id}`" v-model="model.formid" placeholder="013C1B" />
                </div>
                <div>
                    <div><label :for="`edid-${id}`">EditorID</label></div>
                    <div class="edid">
                        <select :id="`edidop-${id}`" v-model="edidOp"
                            :disabled="!!model.rawMatch" aria-label="EditorID match">
                            <option v-for="(text, key) in EDID_OPS" :key="key" :value="key">
                                {{ text }}
                            </option>
                        </select>
                        <input :id="`edid-${id}`" v-model="model.editorId"
                            :disabled="!!model.rawMatch" placeholder="MyArmor_Dress" />
                    </div>
                </div>
                <div>
                    <div><label :for="`name-${id}`">Name</label></div>
                    <input :id="`name-${id}`" v-model="model.name" />
                </div>
            </div>

            <p v-if="model?.conflicts?.length" class="warn">
                The rule this came from set more than one
                {{ model.conflicts.map(c => c.group).join(' and ') }} keyword,
                which cannot both be true — they are steps on one axis. Kept
                <template v-for="(c, n) in model.conflicts" :key="n">
                    <code>{{ c.kept.replace('sakr_kwd_', '') }}</code>
                    and dropped <code>{{ c.dropped.replace('sakr_kwd_', '') }}</code
                    ><span v-if="n < model.conflicts.length - 1">, </span>
                </template>. Check which one you meant before saving.
            </p>

            <p v-if="model?.rawMatch" class="raw">
                This rule matches on more than one EditorID test, so it is kept
                exactly as it came in rather than rewritten:
                <code>{{ model.rawMatch }}</code>
                <button type="button" @click.prevent="model.rawMatch = ''">
                    Replace with a plain EditorID
                </button>
            </p>

            <fieldset>
                <legend>Body</legend>
                <div class="inline-flex radio">
                    <label v-for="(label, key) in SEXES" :key="key">
                        <input type="radio" :name="`sex-${id}`" :value="key" v-model="sex" />
                        {{ label }}
                    </label>
                </div>
            </fieldset>

            <p v-if="impossible" class="warn">
                The male keywords exist in REDUX only — SAKR 1.1.2 has no male set
                at all — so this armour cannot be written as a 1.1.2 RobCo line.
                Use REDUX, or the Complex Sorter format, which names keywords
                instead of numbering them.
            </p>

            <div v-for="topOrBottom in Object.keys(keywordGroups)" :key="topOrBottom">
                <div class="inline-flex">
                    <KeywordGroup v-for="group in keywordGroups[topOrBottom]" :key="group.group"
                        v-model="model.keywords" :group="group.group" :keywords="group.keywords" />
                </div>
            </div>
            <textarea cols="80" rows="4" readonly onclick="this.focus();this.select()">{{ output }}</textarea>
        </div>
    </details>
</template>

<style scoped>
.tag {
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border: 1px solid;
    border-radius: 0.25em;
    padding: 0 0.4em;
    margin-left: 0.5em;
    opacity: 0.7;
}

.warn {
    max-width: 70ch;
    margin: 0;
    padding: 0.5em 0.75em;
    border-left: 3px solid;
}

.raw {
    max-width: 80ch;
    margin: 0;
    font-size: 0.9em;
    opacity: 0.85;
}

.raw code {
    display: block;
    margin: 0.35em 0;
    font-size: 0.95em;
    word-break: break-all;
}

.edid {
    display: flex;
    gap: 0.25em;
}

.edid select {
    font: inherit;
    color: inherit;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 0.25em;
    padding: 0.3em;
}
</style>
