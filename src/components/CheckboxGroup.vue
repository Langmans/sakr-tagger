<script setup>
import { inject, ref } from 'vue'
import LabelInput from './LabelInput.vue'

import tooltips from '../tooltips.js'
import { formidFor } from '../keywords.js'

const version = inject('sakrVersion', ref('redux'))
const showIds = inject('sakrShowIds', ref(false))

const modal = defineModel({
    type: Object,
    default: () => ({})
})

const props = defineProps({
    keywords: {
        type: Array,
        default: () => []
    }
})
</script>

<template>
    <div class="inline-flex checkbox">
        <LabelInput 
            v-for="keyword in props.keywords" 
            :key="keyword.name" 
            :label="keyword.label" 
            :name="keyword.name"
             :title="tooltips[keyword.name]"
            :hint="showIds ? formidFor(keyword, version) : null"
            type="checkbox"
            :model-value="modal?.[keyword.name] ?? false"
            @update:model-value="(val) => modal = { ...modal, [keyword.name]: val }"
        />
    </div>
    <!-- {{ modal }} -->
</template>