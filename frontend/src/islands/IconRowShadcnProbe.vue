<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'

interface ProbeConfig {
  sectionId: string
  label: string
  placeholder: string
  defaultValue: string
  disabled: boolean
  helpText: string
}

const props = defineProps<{
  config: ProbeConfig
}>()

const value = ref(props.config.defaultValue)
const inputId = `IconRowShadcnProbe-${props.config.sectionId}`
</script>

<template>
  <div class="icon-row-shadcn-probe__panel">
    <label class="icon-row-shadcn-probe__label" :for="inputId">
      {{ config.label }}
    </label>
    <Input
      :id="inputId"
      v-model="value"
      :placeholder="config.placeholder"
      :disabled="config.disabled"
      class="icon-row-shadcn-probe__input"
    />
    <p v-if="config.helpText" class="icon-row-shadcn-probe__help">
      {{ config.helpText }}
    </p>
  </div>
</template>
