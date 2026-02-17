<template>
  <div class="card">
    <div class="head">
      <h3>{{ $t('groups.title') }}</h3>
      <router-link class="btn" to="/admin/groups/new">+ {{ $t('groups.create') }}</router-link>
    </div>

    <div class="toolbar">
      <label>{{ $t('groups.level') }}:</label>
      <select v-model.number="filters.level_id" @change="load" class="inp small">
        <option :value="0">{{ $t('groups.allLevels') }}</option>
        <option v-for="lv in levels" :key="lv.id" :value="lv.id">
          {{ lv.number }} {{ $t('groups.class') }}
        </option>
      </select>
      <button class="btn" @click="reset">{{ $t('groups.reset') }}</button>
    </div>

    <table class="tbl">
      <thead>
      <tr>
        <th>{{ $t('groups.name') }}</th>
        <th>{{ $t('groups.level') }}</th>
        <th>{{ $t('groups.letter') }}</th>
        <th>{{ $t('groups.studentsCount') }}</th>
        <th>{{ $t('groups.homeroom') }}</th>
        <th style="width:280px">{{ $t('common.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="g in rows" :key="g.id">
        <td>{{ g.display_name || (g.level?.number + (g.class_letter ? '-' + g.class_letter : '')) }}</td>
        <td>{{ g.level?.number }}</td>
        <td>{{ g.class_letter }}</td>
        <td>{{ g.students_count }}</td>
        <td>
          <span v-if="g.homeroom">{{ g.homeroom.name }}<br><small>{{ g.homeroom.email }}</small></span>
          <span v-else class="muted">{{ $t('groups.notAssigned') }}</span>
        </td>
        <td class="actions">
          <router-link class="btn" :to="`/admin/groups/${g.id}/courses`">{{ $t('groups.viewCourses') }}</router-link>
          <router-link class="btn" :to="`/admin/groups/${g.id}/students`">{{ $t('groups.viewStudents') }}</router-link>
          <router-link class="btn" :to="`/admin/groups/${g.id}/edit`">{{ $t('common.edit') }}</router-link>
          <button class="btn danger" @click="remove(g)">{{ $t('common.delete') }}</button>
        </td>
      </tr>
      </tbody>
    </table>


    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../utils/api'

const { t } = useI18n()

const rows = ref<any[]>([])
const levels = ref<any[]>([])
const error = ref('')
const filters = ref<{level_id:number}>({ level_id: 0 })

async function loadLevels() {
  const { data } = await api.get('/admin/levels') // id, number, title
  levels.value = data
}

async function load() {
  error.value=''
  try {
    const params:any = {}
    if (filters.value.level_id) params.level_id = filters.value.level_id
    const { data } = await api.get('/admin/groups', { params })
    rows.value = data
  } catch (e:any) {
    error.value = e?.data?.message || e?.message || t('groups.loadError')
  }
}

function reset() {
  filters.value.level_id = 0
  load()
}

async function remove(g:any) {
  const groupName = g.display_name || (g.level?.number + '-' + (g.class_letter || ''))
  if (!confirm(t('groups.deleteConfirm', { name: groupName }))) return
  try {
    await api.delete(`/admin/groups/${g.id}`)
    await load()
  } catch (e:any) {
    alert(e?.data?.message || e?.message || t('groups.deleteError'))
  }
}

onMounted(async () => {
  await Promise.all([loadLevels(), load()])
})
</script>

<style scoped>
.card{padding:12px;border:1px solid #eee;border-radius:8px}
.head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.toolbar{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.tbl{width:100%;border-collapse:collapse}
.tbl th,.tbl td{border-bottom:1px solid #eee;padding:8px;text-align:left;vertical-align:top}
.btn{padding:6px 10px;border:1px solid #ddd;border-radius:6px;background:#fff;text-decoration:none;cursor:pointer}
.btn.danger{border-color:#e53935;color:#e53935}
.inp.small{padding:4px 6px}
.error{color:#b00020;margin-top:8px}
.actions{display:flex;gap:6px}
</style>
