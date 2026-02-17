<template>
  <div class="wrap">
    <div class="col">
      <h3>{{ $t('groupStudents.title', { groupName: groupTitle }) }}</h3>
      <div class="toolbar">
        <input v-model="searchIn" class="inp" :placeholder="$t('groupStudents.searchPlaceholder')" @input="debounced(loadIn)" />
        <button class="btn danger" :disabled="!selectedIn.length" @click="detach">{{ $t('groupStudents.removeFromGroup') }}</button>
      </div>

      <table class="tbl">
        <thead>
        <tr>
          <th><input type="checkbox" @change="toggleAllIn($event)"/></th>
          <th>{{ $t('groupStudents.fullName') }}</th>
          <th>{{ $t('groupStudents.email') }}</th>
          <th>{{ $t('groupStudents.phone') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="s in inGroup" :key="s.id">
          <td><input type="checkbox" v-model="selectedIn" :value="s.id"/></td>
          <td>{{ s.user.name }}</td>
          <td>{{ s.user.email }}</td>
          <td>{{ s.user.phone }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="col">
      <h3>{{ $t('groupStudents.selectionTitle') }}</h3>
      <div class="toolbar">
        <label><input type="checkbox" v-model="onlyUnassigned" @change="loadPool"> {{ $t('groupStudents.onlyUnassigned') }}</label>
        <select v-model.number="filterLevel" class="inp small" @change="loadPool">
          <option :value="0">{{ $t('groupStudents.levelAny') }}</option>
          <option v-for="lv in levels" :key="lv.id" :value="lv.id">{{ lv.number }} {{ $t('groupStudents.class') }}</option>
        </select>
      </div>
      <div class="toolbar">
        <input v-model="searchPool" class="inp" :placeholder="$t('groupStudents.search')" @input="debounced(loadPool)"/>
        <button class="btn primary" :disabled="!selectedPool.length" @click="attach">{{ $t('groupStudents.addToGroup') }}</button>
      </div>

      <table class="tbl">
        <thead>
        <tr>
          <th><input type="checkbox" @change="toggleAllPool($event)"/></th>
          <th>{{ $t('groupStudents.fullName') }}</th>
          <th>{{ $t('groupStudents.email') }}</th>
          <th>{{ $t('groupStudents.phone') }}</th>
          <th>{{ $t('groupStudents.level') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="s in pool" :key="s.id">
          <td><input type="checkbox" v-model="selectedPool" :value="s.id"/></td>
          <td>{{ s.user.name }}</td>
          <td>{{ s.user.email }}</td>
          <td>{{ s.user.phone }}</td>
          <td>{{ s.level }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>

  <p v-if="error" class="error">{{ error }}</p>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

const route = useRoute()
const groupId = Number(route.params.id)

const levels = ref<any[]>([])
const group = ref<any>(null)
const groupTitle = computed(() => group.value?.display_name || '')

const inGroup = ref<any[]>([])
const pool = ref<any[]>([])

const selectedIn = ref<number[]>([])
const selectedPool = ref<number[]>([])
const searchIn = ref(''); const searchPool = ref('')
const filterLevel = ref(0)
const onlyUnassigned = ref(true)
const error = ref('')

function debounce(fn: Function, ms=400) {
  let t:any; return (...a:any[]) => { clearTimeout(t); t = setTimeout(()=>fn(...a), ms) }
}
const debounced = debounce

async function loadLevels() {
  const { data } = await api.get('/admin/levels')
  levels.value = data
}
async function loadGroup() {
  const { data } = await api.get(`/admin/groups/${groupId}`)
  group.value = data
  // по умолчанию фильтруем пул по уровню группы
  if (data.level?.id) filterLevel.value = data.level.id
}
async function loadIn() {
  const { data } = await api.get(`/admin/groups/${groupId}/students`, { params: { search: searchIn.value } })
  inGroup.value = data
  selectedIn.value = []
}
async function loadPool() {
  const params:any = { search: searchPool.value }
  if (onlyUnassigned.value) params.unassigned = 1
  if (filterLevel.value) params.level_id = filterLevel.value
  const { data } = await api.get('/admin/students', { params })
  pool.value = data
  selectedPool.value = []
}
function toggleAllIn(e:any){ selectedIn.value = e.target.checked ? inGroup.value.map(x=>x.id) : [] }
function toggleAllPool(e:any){ selectedPool.value = e.target.checked ? pool.value.map(x=>x.id) : [] }

async function attach() {
  error.value = ''
  try {
    await api.post(`/admin/groups/${groupId}/attach-students`, { student_ids: selectedPool.value })
    await Promise.all([loadIn(), loadPool()])
  } catch (e:any) {
    error.value = e?.data?.message || e?.message || t('groupStudents.attachError')
    if (e?.data?.mismatched_student_ids) {
      console.warn('Несовпадение уровней у id:', e.data.mismatched_student_ids)
    }
  }
}
async function detach() {
  error.value = ''
  try {
    await api.post(`/admin/groups/${groupId}/detach-students`, { student_ids: selectedIn.value })
    await Promise.all([loadIn(), loadPool()])
  } catch (e:any) {
    error.value = e?.data?.message || e?.message || t('groupStudents.detachError')
  }
}

Promise.all([loadLevels(), loadGroup()]).then(()=>Promise.all([loadIn(), loadPool()]))
</script>

<style scoped>
.wrap{display:grid; grid-template-columns: 1fr 1fr; gap:16px}
.col{border:1px solid #eee; border-radius:8px; padding:12px}
.toolbar{display:flex; gap:8px; align-items:center; margin-bottom:8px}
.tbl{width:100%; border-collapse:collapse}
.tbl th,.tbl td{border-bottom:1px solid #eee; padding:8px; text-align:left}
.inp{padding:6px; border:1px solid #ddd; border-radius:6px}
.inp.small{padding:4px 6px}
.btn{padding:6px 10px; border:1px solid #ddd; border-radius:6px; background:#fff; cursor:pointer}
.btn.primary{border-color:#0a4ea6; color:#0a4ea6}
.btn.danger{border-color:#e53935; color:#e53935}
.error{color:#b00020; margin-top:8px}
.tbl input[type="checkbox"] {
width: auto;
height: auto;
}

</style>
