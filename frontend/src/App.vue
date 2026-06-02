<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface PocItem {
  id: number
  title: string
  description: string
}

interface PocResponse {
  source: string
  generatedAt: string
  items: PocItem[]
}

interface SourcePage {
  id: number | null
  title: string
  handle: string
  url: string
}

interface SizeChartRow {
  size: string
  shoulder: string
  chest: string
  length: string
  sleeve: string
}

interface SizeChart {
  heading: string
  note: string
  rowsRaw: string | null
  metaobject: {
    namespace: string
    key: string
    type: string
    handle: string | null
    fallbackType: string
    fallbackHandle: string
    loaded: boolean
  }
  columns: string[]
  rows: SizeChartRow[]
}

interface SourceData {
  page: SourcePage
  sizeChart: SizeChart
}

const props = defineProps<{
  apiUrl: string
  heading: string
  sourceData: SourceData | null
}>()

const data = ref<PocResponse | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')

const sizeChart = computed(() => props.sourceData?.sizeChart || null)

const sizeChartRows = computed(() => {
  const rowsRaw = sizeChart.value?.rowsRaw?.trim()

  if (!rowsRaw) {
    return sizeChart.value?.rows || []
  }

  return rowsRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [size = '', shoulder = '', chest = '', length = '', sleeve = ''] = line
        .split('|')
        .map((cell) => cell.trim())

      return {
        size,
        shoulder,
        chest,
        length,
        sleeve,
      }
    })
    .filter((row) => row.size)
})

async function loadItems() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(props.apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    data.value = (await response.json()) as PocResponse
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '未知错误'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadItems)
</script>

<template>
  <section class="vue-nest-poc" aria-live="polite">
    <p class="vue-nest-poc__eyebrow">Vue 3 + NestJS POC</p>
    <h2 class="vue-nest-poc__heading">{{ heading }}</h2>

    <div v-if="sourceData" class="vue-nest-poc__source">
      <p class="vue-nest-poc__source-label">当前页面源对象</p>
      <dl class="vue-nest-poc__source-list">
        <div>
          <dt>标题</dt>
          <dd>{{ sourceData.page.title }}</dd>
        </div>
        <div>
          <dt>Handle</dt>
          <dd>{{ sourceData.page.handle }}</dd>
        </div>
        <div>
          <dt>URL</dt>
          <dd>{{ sourceData.page.url }}</dd>
        </div>
        <div>
          <dt>Metafield</dt>
          <dd>
            {{ sourceData.sizeChart.metaobject.namespace }}.{{ sourceData.sizeChart.metaobject.key }}
            <span v-if="sourceData.sizeChart.metaobject.loaded">已读取</span>
            <span v-else>未读取到，使用 section blocks 兜底</span>
          </dd>
        </div>
      </dl>
    </div>

    <p v-if="isLoading" class="vue-nest-poc__status">正在请求 Nest 接口...</p>

    <p v-else-if="errorMessage" class="vue-nest-poc__status vue-nest-poc__status--error">
      接口请求失败：{{ errorMessage }}
    </p>

    <div v-else-if="data && data.items.length > 0">
      <ul class="vue-nest-poc__list">
        <li v-for="item in data.items" :key="item.id" class="vue-nest-poc__item">
          <h3 class="vue-nest-poc__item-title">{{ item.title }}</h3>
          <p class="vue-nest-poc__item-description">{{ item.description }}</p>
        </li>
      </ul>

      <p class="vue-nest-poc__meta">
        数据来源：{{ data.source }} · {{ new Date(data.generatedAt).toLocaleString() }}
      </p>
    </div>

    <p v-else class="vue-nest-poc__status">Nest 接口返回了空列表。</p>

    <section
      v-if="sizeChartRows.length"
      class="vue-nest-poc__size-chart"
      aria-labelledby="VueNestPocSizeChartHeading"
    >
      <h3 id="VueNestPocSizeChartHeading" class="vue-nest-poc__size-heading">
        {{ sizeChart?.heading }}
      </h3>

      <div class="vue-nest-poc__table-wrap">
        <table class="vue-nest-poc__table">
          <thead>
            <tr>
              <th v-for="column in sizeChart?.columns" :key="column" scope="col">
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sizeChartRows" :key="row.size">
              <th scope="row">{{ row.size }}</th>
              <td>{{ row.shoulder }}</td>
              <td>{{ row.chest }}</td>
              <td>{{ row.length }}</td>
              <td>{{ row.sleeve }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="sizeChart?.note" class="vue-nest-poc__size-note">
        {{ sizeChart.note }}
      </p>
    </section>
  </section>
</template>
