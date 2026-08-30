<script setup>
const model = defineModel({
    type: [String, Boolean],
    default: false
})

const props = defineProps({
    label: String,
    name: String,
    type: String,
    value: String,
    title: String,
    /* The keyword's FormID under the selected version. Shown rather than hidden
       in a tooltip, because it is what the version switch changes and a switch
       whose effect you cannot see reads as a broken one. */
    hint: String
})
</script>

<template>
    <label :title>
        <input v-model="model" :type="props.type" :name="name" :value="value" />
        {{ props.label }}<small v-if="hint" class="hint">{{ hint }}</small>
    </label>
</template>
