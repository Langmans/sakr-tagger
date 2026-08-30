<script setup>
import { defineProps, useId, computed, watch, inject, ref } from 'vue'

const id = useId()
const model = defineModel()

import keywords from '../keywords.js'
import grouplabels from '../grouplabels.js'
import KeywordGroup from './KeywordGroup.vue'
import {exportSingle, keywordNamesOf} from '../export.js'

/* App provides it. The fallback keeps this component usable on its own -- in a
   test, or dropped into another page -- rather than throwing on inject. */
const version = inject('sakrVersion', ref('redux'))

const keywordGroups = computed(() => {
    const groups = { top: [], bottom: [] }

    Object.entries(keywords).forEach(([group, groupKeywords]) => {
        groups[['armorTop', 'top', 'bra'].includes(group)
            ? 'top'
            : 'bottom'
        ].push({ group, keywords: groupKeywords })
    })
    return groups
})

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

const robcoPatcherLine = computed(() => exportSingle(model.value, version.value))

</script>

<template>
    <details :open="model?.open">
        <summary>
            <template v-if="model?.name">
                {{ model.name }}
            </template>
            <em v-else>Unnamed armor</em>

            <template v-if="model?.mod">
                ({{ model.mod }}{{ model.formid ? `#${model.formid}` : '' }})
            </template>
        </summary>

        <slot name="top"></slot>

        <div class="inline-flex col">
            <div class="inline-flex">
                <div>
                    <div><label :id="`mod-${id}`">Mod</label></div>
                    <input :id="`mod-${id}`" v-model="model.mod" />
                </div>
                <div>
                    <div><label :id="`formid-${id}`">Formid</label></div>
                    <input :id="`formid-${id}`" v-model="model.formid" />
                </div>
                <div>
                    <div><label :id="`name-${id}`">Name</label></div>
                    <input :id="`name-${id}`" v-model="model.name" />
                </div>
            </div>

            <div v-for="topOrBottom in Object.keys(keywordGroups)" :key="topOrBottom">
                <div class="inline-flex">
                    <KeywordGroup v-for="group in keywordGroups[topOrBottom]" :key="group.group"
                        v-model="model.keywords" :group="group.group" :keywords="group.keywords" />
                </div>
            </div>
            <textarea cols="80" rows="3" readonly onclick="this.focus();this.select()">{{ robcoPatcherLine }}</textarea>
        </div>
    </details>
</template>