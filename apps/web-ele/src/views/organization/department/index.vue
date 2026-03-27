<script lang="ts" setup>
import { onMounted, reactive, ref, computed } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElSelect,
  ElOption,
} from 'element-plus';

import {
  createDepartment,
  deleteDepartment,
  getDepartmentList,
  getOrganizationList,
  updateDepartment,
} from '#/api/organization';
import type { Department, DepartmentFormData, Organization } from '#/api/organization/model';

defineOptions({ name: 'DepartmentList' });

const loading = ref(false);
const tableData = ref<Department[]>([]);
const total = ref(0);
const organizationOptions = ref<Organization[]>([]);

const queryParams = reactive({
  page: 1,
  page_size: 20,
  search: '',
  organization: '',
});

const dialogVisible = ref(false);
const dialogTitle = ref('新增部门');
const formData = ref<DepartmentFormData>({
  name: '',
  code: '',
  organization: 0,
  parent: null,
  headcount_quota: 0,
  description: '',
});
const isEdit = ref(false);
const editId = ref<number | null>(null);

const statistics = computed(() => ({
  total: tableData.value.length,
  quota: tableData.value.reduce((sum, item) => sum + (item.headcount_quota || 0), 0),
  active: tableData.value.filter((item) => item.is_active).length,
}));

async function loadOrganizations() {
  try {
    const res = await getOrganizationList({ page_size: 100 });
    organizationOptions.value = res.results || [];
  } catch (error: any) {
    console.error('加载组织列表失败', error);
  }
}

async function loadData() {
  loading.value = true;
  try {
    const res = await getDepartmentList(queryParams);
    tableData.value = res.results || [];
    total.value = res.count || 0;
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  queryParams.page = 1;
  loadData();
}

function handleReset() {
  queryParams.search = '';
  queryParams.organization = '';
  queryParams.page = 1;
  loadData();
}

function handleAdd() {
  dialogTitle.value = '新增部门';
  isEdit.value = false;
  editId.value = null;
  formData.value = {
    name: '', code: '', organization: 0, parent: null, headcount_quota: 0, description: '',
  };
  dialogVisible.value = true;
}

function handleEdit(row: Department) {
  dialogTitle.value = '编辑部门';
  isEdit.value = true;
  editId.value = row.id;
  formData.value = {
    name: row.name,
    code: row.code,
    organization: row.organization,
    parent: row.parent,
    headcount_quota: row.headcount_quota,
    description: row.description,
  };
  dialogVisible.value = true;
}

async function handleDelete(row: Department) {
  try {
    await ElMessageBox.confirm(`确定删除部门「${row.name}」？`, '确认', { type: 'warning' });
    await deleteDepartment(row.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败');
  }
}

async function handleSubmit() {
  try {
    if (!formData.value.organization) {
      ElMessage.warning('请选择所属组织');
      return;
    }
    if (isEdit.value && editId.value) {
      await updateDepartment(editId.value, formData.value);
      ElMessage.success('更新成功');
    } else {
      await createDepartment(formData.value);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
}

function handlePageChange(page: number) {
  queryParams.page = page;
  loadData();
}

onMounted(() => {
  loadOrganizations();
  loadData();
});
</script>

<template>
  <Page>
    <div class="page-container">
      <!-- 统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">部门总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.quota }}</div>
            <div class="stat-label">总编制</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✓</div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.active }}</div>
            <div class="stat-label">启用中</div>
          </div>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <input
            v-model="queryParams.search"
            type="text"
            placeholder="搜索部门..."
            class="input"
            @keyup.enter="handleSearch"
          />
          <select v-model="queryParams.organization" class="select">
            <option value="">全部组织</option>
            <option v-for="item in organizationOptions" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
          <button class="btn btn-primary" @click="handleSearch">搜索</button>
          <button class="btn btn-secondary" @click="handleReset">重置</button>
        </div>
        <button class="btn btn-primary" @click="handleAdd">+ 新增部门</button>
      </div>

      <!-- 表格 -->
      <div class="table-wrapper" v-loading="loading">
        <table class="table">
          <thead>
            <tr>
              <th>编码</th>
              <th>名称</th>
              <th>所属组织</th>
              <th>全称</th>
              <th>编制数</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tableData" :key="item.id">
              <td><code class="code">{{ item.code }}</code></td>
              <td class="font-medium">{{ item.name }}</td>
              <td>{{ item.organization_name }}</td>
              <td class="text-muted">{{ item.full_name || '-' }}</td>
              <td class="text-center">{{ item.headcount_quota || 0 }}</td>
              <td>
                <span class="badge" :class="item.is_active ? 'badge-success' : 'badge-default'">
                  {{ item.is_active ? '启用' : '停用' }}
                </span>
              </td>
              <td>
                <button class="btn-link" @click="handleEdit(item)">编辑</button>
                <button class="btn-link btn-danger" @click="handleDelete(item)">删除</button>
              </td>
            </tr>
            <tr v-if="tableData.length === 0 && !loading">
              <td colspan="7" class="empty-text">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="total > queryParams.page_size" class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          :page-size="queryParams.page_size"
          :total="total"
          layout="total, prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>

      <!-- 弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
        <el-form :model="formData" label-width="80px">
          <el-form-item label="所属组织" required>
            <el-select v-model="formData.organization" style="width: 100%" placeholder="请选择">
              <el-option v-for="item in organizationOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="名称" required>
            <el-input v-model="formData.name" placeholder="请输入部门名称" />
          </el-form-item>
          <el-form-item label="编码" required>
            <el-input v-model="formData.code" placeholder="请输入部门编码" />
          </el-form-item>
          <el-form-item label="编制数">
            <el-input-number v-model="formData.headcount_quota" :min="0" :max="9999" style="width: 100%" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
          </el-form-item>
        </el-form>
        <template #footer>
          <button class="btn btn-secondary" @click="dialogVisible = false">取消</button>
          <button class="btn btn-primary" @click="handleSubmit">确定</button>
        </template>
      </el-dialog>
    </div>
  </Page>
</template>

<style scoped>
/* 变量 - 支持明暗模式 */
.page-container {
  --bg-primary: var(--el-bg-color, #ffffff);
  --bg-secondary: var(--el-bg-color-page, #f5f7fa);
  --text-primary: var(--el-text-color-primary, #303133);
  --text-secondary: var(--el-text-color-secondary, #606266);
  --text-muted: var(--el-text-color-placeholder, #a0a0a0);
  --border-color: var(--el-border-color, #dcdfe6);
  --accent: var(--el-color-primary, #409eff);
  --accent-hover: var(--el-color-primary-light-3, #66b1ff);
  --success: var(--el-color-success, #67c23a);
  --danger: var(--el-color-danger, #f56c6c);
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: border-color 0.15s ease;
}

.stat-card:hover {
  border-color: var(--accent);
}

.stat-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-width: 200px;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}

.select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-width: 140px;
}

/* 按钮 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

.btn-link {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
}

.btn-link:hover {
  text-decoration: underline;
}

.btn-link.btn-danger {
  color: var(--danger);
}

/* 表格 */
.table-wrapper {
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.table th {
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  font-size: 13px;
}

.table td {
  color: var(--text-primary);
  font-size: 14px;
}

.table tr:last-child td {
  border-bottom: none;
}

.table tr:hover td {
  background: var(--bg-secondary);
}

/* 工具类 */
.font-medium { font-weight: 500; }
.text-center { text-align: center; }
.text-muted { color: var(--text-muted); }

.code {
  padding: 2px 6px;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: var(--text-secondary);
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.badge-success {
  background: rgba(103, 194, 58, 0.1);
  color: var(--success);
}

.badge-default {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.empty-text {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 弹窗按钮 */
:deep(.el-dialog__footer) {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .input, .select {
    min-width: 100%;
  }

  .table-wrapper {
    overflow-x: auto;
  }
}
</style>
