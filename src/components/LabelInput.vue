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
    title: String
})
</script>

<template>
    <label :title>
        <input v-model="model" :type="props.type" :name="name" :value="value" />
        {{ props.label }}
    </label>
</template>