<script setup>
import { defineProps, computed } from 'vue'
import grouplabels from '../grouplabels.js'
import RadioGroup from './RadioGroup.vue'
import CheckboxGroup from './CheckboxGroup.vue'
const model = defineModel({
    type: Object,
    default: () => ({})
})
defineEmits(['update:model-value'])

const props = defineProps({
    group: String,
    keywords: Array
})

const radioKeywords = computed(() => props.keywords.filter(({type})=>type==='radio'))
const checkboxKeywords = computed(() => props.keywords.filter(({type})=>type==='checkbox'))

// Helper to fix vue reactivity for unset objects
const updateRadio = (value) => {
    model.value = {
        ...model.value,
        [props.group]: value
    }
}

</script>
<template>
    <fieldset>
        <legend>{{ grouplabels[props.group] }}</legend>
        <div class="inline-flex">
            <RadioGroup v-if="radioKeywords.length" v-model="model[props.group]" :keywords="radioKeywords" @update:model-value="updateRadio" />
            <CheckboxGroup v-if="checkboxKeywords.length" v-model="model" :keywords="checkboxKeywords" />
        </div>
        
        <!-- <pre>{{ model }}</pre> -->
    </fieldset>
</template>
