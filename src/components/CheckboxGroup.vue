<script setup>
import LabelInput from './LabelInput.vue'

import tooltips from '../tooltips.js'

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
            type="checkbox" 
            :model-value="modal?.[keyword.name] ?? false"
            @update:model-value="(val) => modal = { ...modal, [keyword.name]: val }"
        />
    </div>
    <!-- {{ modal }} -->
</template>