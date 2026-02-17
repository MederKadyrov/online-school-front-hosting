<template>
  <div v-if="group" class="card">
    <div class="head">
      <h3>{{ $t('groupCourses.title', { groupName: group.display_name }) }}</h3>
      <router-link class="btn" to="/admin/groups">← {{ $t('groupCourses.backToGroups') }}</router-link>
    </div>

    <p class="muted" v-if="group.level">
      {{ $t('groupCourses.level') }}: {{ group.level.number }} {{ $t('groupCourses.class') }}
    </p>

    <div class="toolbar">
      <input v-model="search" class="inp" type="search" :placeholder="$t('groupCourses.searchPlaceholder')" />
      <label class="inline">
        <input type="checkbox" v-model="sameLevel" />
        {{ $t('groupCourses.onlyLevel', { level: group.level?.number ?? $t('groupCourses.groupLevel') }) }}
      </label>
      <button class="btn" @click="refresh" :disabled="loading">{{ $t('groupCourses.refresh') }}</button>
    </div>

    <div class="grid">
      <div class="column">
        <h4>{{ $t('groupCourses.availableCourses') }}</h4>
        <p class="muted" v-if="!filteredAvailable.length && !loading">{{ $t('groupCourses.notFound') }}</p>
        <p class="muted" v-if="loading">{{ $t('groupCourses.loading') }}</p>
        <div class="course-list" v-else>
          <label v-for="course in filteredAvailable" :key="course.id" class="course-row">
            <input type="checkbox" :value="course.id" v-model="selectedIds" />
            <div>
              <strong>{{ course.title }}</strong>
              <div class="muted">
                <span v-if="course.subject">{{ course.subject.name }}</span>
                <span v-if="course.teacher"> • {{ course.teacher.name }}</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div class="column">
        <h4>{{ $t('groupCourses.selected', { count: selectedIds.length }) }}</h4>
        <ul v-if="selectedCourses.length" class="selected-list">
          <li v-for="course in selectedCourses" :key="course.id" class="selected-item">
            <div>
              <strong>{{ course.title }}</strong>
              <div class="muted">
                <span v-if="course.subject">{{ course.subject.name }}</span>
                <span v-if="course.teacher"> • {{ course.teacher.name }}</span>
              </div>
            </div>
            <button class="btn xs" @click="unselect(course.id)">{{ $t('groupCourses.remove') }}</button>
          </li>
        </ul>
        <p class="muted" v-else>{{ $t('groupCourses.nothingSelected') }}</p>
      </div>
    </div>

    <div class="actions">
      <button class="btn primary" @click="save" :disabled="saving">
        {{ saving ? $t('groupCourses.saving') : $t('groupCourses.saveBinding') }}
      </button>
      <span class="ok" v-if="msg">{{ msg }}</span>
      <span class="error" v-if="err">{{ err }}</span>
    </div>
  </div>

  <p v-else-if="error" class="error">{{ error }}</p>
  <p v-else class="muted">{{ $t('groupCourses.loading') }}</p>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()
const route = useRoute()

const group = ref<any|null>(null)
const available = ref<any[]>([])
const selectedIds = ref<number[]>([])
const knownCourses = ref<Record<number, any>>({})
const search = ref('')
const sameLevel = ref(true)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const err = ref('')
const msg = ref('')

const groupId = computed(() => Number(route.params.id))

const filteredAvailable = computed(() => {
  const term = search.value.trim().toLowerCase()
  return available.value.filter((course) => {
    if (!term) return true
    const haystack = [
      course.title,
      course.subject?.name,
      course.teacher?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(term)
  })
})

const selectedCourses = computed(() =>
  selectedIds.value
    .map((id) => knownCourses.value[id])
    .filter(Boolean)
)

function remember(list: any[]) {
  const map = { ...knownCourses.value }
  list.forEach((course) => {
    if (course?.id) map[course.id] = course
  })
  knownCourses.value = map
}

async function load() {
  if (!groupId.value) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(`/admin/groups/${groupId.value}/courses`, {
      params: { same_level: sameLevel.value ? 1 : 0 },
    })
    group.value = data.group
    available.value = data.available || []
    selectedIds.value = Array.isArray(data.selected_course_ids)
      ? data.selected_course_ids
      : []
    remember(data.available || [])
    remember(data.assigned || [])
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || t('groupCourses.loadError')
  } finally {
    loading.value = false
  }
}

function refresh() {
  load()
}

function unselect(id: number) {
  selectedIds.value = selectedIds.value.filter((cid) => cid !== id)
}

async function save() {
  if (!groupId.value) return
  err.value = ''
  msg.value = ''
  saving.value = true
  try {
    await api.post(`/admin/groups/${groupId.value}/courses-sync`, {
      course_ids: selectedIds.value,
    })
    msg.value = t('groupCourses.saved')
    await load()
  } catch (e: any) {
    err.value = e?.data?.message || e?.message || t('groupCourses.saveError')
  } finally {
    saving.value = false
  }
}

onMounted(load)
watch(() => route.params.id, load)
watch(sameLevel, load)
</script>

<style scoped>
.card { padding: 16px; border: 1px solid #eee; border-radius: 8px; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.inp { padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; min-width: 260px; }
.btn { padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; text-decoration: none; }
.btn.primary { border-color: #0a4ea6; color: #0a4ea6; }
.btn.xs { padding: 4px 8px; font-size: 12px; color: rgb(59, 59, 59);}
.inline { display: flex; align-items: center; gap: 6px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.column { 
  border: 1px solid #f0f0f0; 
  border-radius: 8px; padding: 12px; 
  /* background: #2c5c38;  */
}
.course-list { display: flex; flex-direction: column; gap: 8px; max-height: 420px; overflow-y: auto; }
.course-row { 
  display: flex; 
  gap: 10px; 
  align-items: flex-start; 
  padding: 8px; 
  border: 1px solid #eee; 
  border-radius: 6px; 
  background: #dfdfde; 
}
.selected-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.selected-item { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 8px; border: 1px solid #eee; border-radius: 6px; background: #e8e8e9; }
.actions { margin-top: 16px; display: flex; gap: 12px; align-items: center; }
.muted { color: #666; }
.error { color: #b00020; }
.ok { color: #0a7f2e; }
</style>
