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
  <section class="text-[rgba(var(--color-foreground,18,18,18),0.88)]" aria-live="polite">
    <p class="mb-1 mt-0 text-[1.2rem] uppercase leading-snug text-[rgba(var(--color-foreground,18,18,18),0.65)]">
      Vue 3 + NestJS POC
    </p>
    <h2 class="mb-5 mt-0 text-[2rem] font-semibold leading-snug">{{ heading }}</h2>

    <div
      v-if="sourceData"
      class="mb-6 grid gap-3 rounded-[0.5rem] border border-[rgba(var(--color-foreground,18,18,18),0.08)] bg-[rgba(var(--color-foreground,18,18,18),0.035)] p-5"
    >
      <p class="m-0 text-[1.3rem] font-semibold leading-snug">当前页面源对象</p>
      <dl class="m-0 grid gap-2">
        <div class="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
          <dt class="m-0 text-[1.3rem] leading-snug text-[rgba(var(--color-foreground,18,18,18),0.62)]">
            标题
          </dt>
          <dd class="m-0 [overflow-wrap:anywhere] text-[1.3rem] leading-snug">{{ sourceData.page.title }}</dd>
        </div>
        <div class="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
          <dt class="m-0 text-[1.3rem] leading-snug text-[rgba(var(--color-foreground,18,18,18),0.62)]">
            Handle
          </dt>
          <dd class="m-0 [overflow-wrap:anywhere] text-[1.3rem] leading-snug">{{ sourceData.page.handle }}</dd>
        </div>
        <div class="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
          <dt class="m-0 text-[1.3rem] leading-snug text-[rgba(var(--color-foreground,18,18,18),0.62)]">
            URL
          </dt>
          <dd class="m-0 [overflow-wrap:anywhere] text-[1.3rem] leading-snug">{{ sourceData.page.url }}</dd>
        </div>
        <div class="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
          <dt class="m-0 text-[1.3rem] leading-snug text-[rgba(var(--color-foreground,18,18,18),0.62)]">
            Metafield
          </dt>
          <dd class="m-0 [overflow-wrap:anywhere] text-[1.3rem] leading-snug">
            {{ sourceData.sizeChart.metaobject.namespace }}.{{ sourceData.sizeChart.metaobject.key }}
            <span v-if="sourceData.sizeChart.metaobject.loaded">已读取</span>
            <span v-else>未读取到，使用 section blocks 兜底</span>
          </dd>
        </div>
      </dl>
    </div>

    <p v-if="isLoading" class="m-0 text-[1.4rem] leading-normal">正在请求 Nest 接口...</p>

    <p v-else-if="errorMessage" class="m-0 text-[1.4rem] leading-normal text-[#cf1322]">
      接口请求失败：{{ errorMessage }}
    </p>

    <div v-else-if="data && data.items.length > 0">
      <ul class="mb-6 mt-0 grid list-none gap-4 p-0">
        <li
          v-for="item in data.items"
          :key="item.id"
          class="rounded-[0.5rem] border border-[rgba(var(--color-foreground,18,18,18),0.1)] bg-[rgba(var(--color-background,255,255,255),0.75)] p-5"
        >
          <h3 class="mb-1 mt-0 text-[1.6rem] font-semibold leading-snug">{{ item.title }}</h3>
          <p class="m-0 text-[1.4rem] leading-normal text-[rgba(var(--color-foreground,18,18,18),0.72)]">
            {{ item.description }}
          </p>
        </li>
      </ul>

      <p class="m-0 text-[1.4rem] leading-normal">
        数据来源：{{ data.source }} · {{ new Date(data.generatedAt).toLocaleString() }}
      </p>
    </div>

    <p v-else class="m-0 text-[1.4rem] leading-normal">Nest 接口返回了空列表。</p>

    <section
      v-if="sizeChartRows.length"
      class="mt-8 grid gap-5"
      aria-labelledby="VueNestPocSizeChartHeading"
    >
      <h3 id="VueNestPocSizeChartHeading" class="m-0 text-[1.8rem] leading-snug">
        {{ sizeChart?.heading }}
      </h3>

      <div class="vue-nest-poc-size-chart__wrapper">
        <table class="vue-nest-poc-size-chart__table">
          <thead>
            <tr>
              <th
                v-for="column in sizeChart?.columns"
                :key="column"
                scope="col"
              >
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

      <p v-if="sizeChart?.note" class="m-0 text-[1.3rem] leading-normal text-[rgba(var(--color-foreground,18,18,18),0.72)]">
        {{ sizeChart.note }}
      </p>
    </section>
  </section>
</template>

<style scoped>
.vue-nest-poc-size-chart__wrapper {
  overflow-x: auto;
  border: 0.1rem solid rgba(var(--color-foreground, 18, 18, 18), 0.12);
  border-radius: 0.5rem;
}

.vue-nest-poc-size-chart__table {
  width: 100%;
  min-width: 58rem;
  border-collapse: collapse;
  text-align: center;
}

.vue-nest-poc-size-chart__table th,
.vue-nest-poc-size-chart__table td {
  padding: 1.4rem 1.6rem;
  border-bottom: 0.1rem solid rgba(var(--color-foreground, 18, 18, 18), 0.12);
}

.vue-nest-poc-size-chart__table thead th {
  background: rgba(var(--color-foreground, 18, 18, 18), 0.04);
  font-weight: 600;
}

.vue-nest-poc-size-chart__table tbody tr:last-child th,
.vue-nest-poc-size-chart__table tbody tr:last-child td {
  border-bottom: 0;
}
</style>
