<script setup>
import { computed, useId, inject, ref } from 'vue'
import LabelInput from './LabelInput.vue'

import tooltips from '../tooltips.js'
import { formidFor } from '../keywords.js'

const id = useId()

const version = inject('sakrVersion', ref('redux'))
const showIds = inject('sakrShowIds', ref(false))

// Het model bevat simpelweg de geselecteerde formid (String) of null/undefined
const model = defineModel({
    type: [String, Number, null],
    default: null
})

const props = defineProps({
    keywords: {
        type: Array,
        default: () => []
    }
})

</script>

<template>
    <div class="inline-flex radio">

        <LabelInput label="None" :name="id" type="radio"
             :value="null" v-model="model" class="deselect"/>

        <LabelInput v-for="keyword in props.keywords" :key="keyword.name" :label="keyword.label" :name="id" type="radio"
             :value="keyword.name" v-model="model" :title="tooltips[keyword.name]"
             :hint="showIds ? formidFor(keyword, version) : null" />
    </div>
</template>