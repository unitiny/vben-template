<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';

import { Page } from '@vben/common-ui';

import { getDepartmentTree, getOrganizationList } from '#/api/organization';
import type { DepartmentTreeNode, Organization } from '#/api/organization/model';

defineOptions({ name: 'OrganizationTree' });

const organizationList = ref<Organization[]>([]);
const selectedOrg = ref<number | null>(null);
const treeData = ref<DepartmentTreeNode[]>([]);
const loading = ref(false);
const expandedNodes = ref<Set<number>>(new Set());
const selectedNode = ref<DepartmentTreeNode | null>(null);

const statistics = computed(() => {
  const countNodes = (nodes: DepartmentTreeNode[]): number =>
    nodes.reduce((sum, node) => sum + 1 + (node.children ? countNodes(node.children) : 0), 0);
  const totalQuota = (nodes: DepartmentTreeNode[]): number =>
    nodes.reduce((sum, node) => sum + (node.headcount_quota || 0) + (node.children ? totalQuota(node.children) : 0), 0);
  return { depts: countNodes(treeData.value), quota: totalQuota(treeData.value) };
});

async function loadOrganizations() {
  try {
    const res = await getOrganizationList({ page_size: 100 });
    organizationList.value = res.results || [];
    if (organizationList.value.length > 0) {
      selectedOrg.value = organizationList.value[0].id;
      loadTree();
    }
  } catch (error: any) {
    console.error('加载组织列表失败', error);
  }
}

async function loadTree() {
  if (!selectedOrg.value) return;
  loading.value = true;
  try {
    const res = await getDepartmentTree(selectedOrg.value);
    treeData.value = res;
    res.forEach((node) => expandedNodes.value.add(node.id));
  } catch (error: any) {
    console.error('加载部门树失败', error);
    treeData.value = [];
  } finally {
    loading.value = false;
  }
}

function handleOrgChange(orgId: number) {
  selectedOrg.value = orgId;
  expandedNodes.value.clear();
  selectedNode.value = null;
  loadTree();
}

function toggleNode(node: DepartmentTreeNode) {
  if (expandedNodes.value.has(node.id)) {
    expandedNodes.value.delete(node.id);
  } else {
    expandedNodes.value.add(node.id);
  }
}

function hasChildren(node: DepartmentTreeNode) {
  return node.children && node.children.length > 0;
}

function isExpanded(node: DepartmentTreeNode) {
  return expandedNodes.value.has(node.id);
}

function getOrgName() {
  return organizationList.value.find((o) => o.id === selectedOrg.value)?.name || '';
}

onMounted(() => loadOrganizations());
</script>

<template>
  <Page>
    <div class="page-container">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🌳</div>
          <div class="stat-content">
            <div class="stat-value">{{ getOrgName() }}</div>
            <div class="stat-label">当前组织</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.depts }}</div>
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
      </div>

      <!-- 组织切换 -->
      <div class="org-switcher">
        <div class="org-tabs">
          <button
            v-for="org in organizationList"
            :key="org.id"
            class="org-tab"
            :class="{ active: selectedOrg === org.id }"
            @click="handleOrgChange(org.id)"
          >
            {{ org.name }}
          </button>
        </div>
      </div>

      <!-- 树形图 -->
      <div class="tree-panel" v-loading="loading">
        <template v-if="treeData.length > 0">
          <!-- 一级节点 -->
          <div v-for="node in treeData" :key="node.id" class="tree-section">
            <div class="tree-node tree-node--root" @click="selectedNode = node">
              <button
                v-if="hasChildren(node)"
                class="toggle-btn"
                :class="{ expanded: isExpanded(node) }"
                @click.stop="toggleNode(node)"
              >
                {{ isExpanded(node) ? '−' : '+' }}
              </button>
              <span class="node-icon">{{ hasChildren(node) ? '📁' : '📄' }}</span>
              <span class="node-name">{{ node.name }}</span>
              <span class="node-quota">{{ node.headcount_quota || 0 }} 人</span>
              <span v-if="node.statistics" class="node-count">
                {{ node.statistics.total || 0 }}/{{ node.headcount_quota || 0 }}
              </span>
            </div>

            <!-- 二级节点 -->
            <div v-if="hasChildren(node) && isExpanded(node)" class="tree-children">
              <div v-for="child in node.children" :key="child.id" class="tree-group">
                <div class="tree-node" @click="selectedNode = child">
                  <button
                    v-if="hasChildren(child)"
                    class="toggle-btn"
                    :class="{ expanded: isExpanded(child) }"
                    @click.stop="toggleNode(child)"
                  >
                    {{ isExpanded(child) ? '−' : '+' }}
                  </button>
                  <span v-else class="toggle-placeholder"></span>
                  <span class="node-icon">{{ hasChildren(child) ? '📁' : '📄' }}</span>
                  <span class="node-name">{{ child.name }}</span>
                  <span class="node-quota">{{ child.headcount_quota || 0 }} 人</span>
                  <span v-if="child.statistics" class="node-count">
                    {{ child.statistics.total || 0 }}/{{ child.headcount_quota || 0 }}
                  </span>
                </div>

                <!-- 三级节点 -->
                <div v-if="hasChildren(child) && isExpanded(child)" class="tree-children tree-children--deep">
                  <div
                    v-for="grandChild in child.children"
                    :key="grandChild.id"
                    class="tree-node tree-node--leaf"
                    @click="selectedNode = grandChild"
                  >
                    <span class="toggle-placeholder"></span>
                    <span class="node-icon">📄</span>
                    <span class="node-name">{{ grandChild.name }}</span>
                    <span class="node-quota">{{ grandChild.headcount_quota || 0 }} 人</span>
                    <span v-if="grandChild.statistics" class="node-count">
                      {{ grandChild.statistics.total || 0 }}/{{ grandChild.headcount_quota || 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="empty-state">
          <span class="empty-icon">📂</span>
          <p>暂无部门数据</p>
          <span class="empty-hint">请先在部门管理中创建部门</span>
        </div>
      </div>

      <!-- 详情面板 -->
      <div v-if="selectedNode" class="detail-panel">
        <div class="detail-header">
          <h4>{{ selectedNode.name }}</h4>
          <button class="close-btn" @click="selectedNode = null">×</button>
        </div>
        <div class="detail-body">
          <div class="detail-row">
            <span class="detail-label">编码</span>
            <code class="code">{{ selectedNode.code }}</code>
          </div>
          <div class="detail-row">
            <span class="detail-label">编制数</span>
            <span class="detail-value">{{ selectedNode.headcount_quota || 0 }} 人</span>
          </div>
          <div v-if="selectedNode.statistics" class="detail-row">
            <span class="detail-label">在职人数</span>
            <span class="detail-value">{{ selectedNode.statistics.total || 0 }} 人</span>
          </div>
          <div v-if="selectedNode.children" class="detail-row">
            <span class="detail-label">下级部门</span>
            <span class="detail-value">{{ selectedNode.children.length }} 个</span>
          </div>
          <div v-if="selectedNode.description" class="detail-row detail-row--full">
            <span class="detail-label">描述</span>
            <p class="detail-desc">{{ selectedNode.description }}</p>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="legend">
        <span class="legend-item"><span class="legend-dot legend-dot--branch"></span> 有子部门</span>
        <span class="legend-item"><span class="legend-dot legend-dot--leaf"></span> 叶子节点</span>
      </div>
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
  --accent-light: var(--el-color-primary-light-9, #ecf5ff);
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
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
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* 组织切换 */
.org-switcher {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.org-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.org-tab {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.org-tab:hover {
  border-color: var(--accent);
}

.org-tab.active {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
}

/* 树面板 */
.tree-panel {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  min-height: 400px;
}

.tree-section {
  margin-bottom: 8px;
}

.tree-section:last-child {
  margin-bottom: 0;
}

/* 树节点 */
.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.tree-node:hover {
  background: var(--bg-secondary);
}

.tree-node--root {
  font-weight: 500;
  background: var(--bg-secondary);
  margin-bottom: 4px;
}

.tree-node--root:hover {
  background: var(--accent-light);
}

.toggle-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.toggle-btn.expanded {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.toggle-placeholder {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.node-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.node-name {
  flex: 1;
  color: var(--text-primary);
  font-size: 14px;
}

.node-quota {
  font-size: 13px;
  color: var(--text-muted);
  padding: 2px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.node-count {
  font-size: 12px;
  color: var(--accent);
}

/* 子节点区域 */
.tree-children {
  margin-left: 22px;
  padding-left: 16px;
  border-left: 2px solid var(--border-color);
}

.tree-children--deep {
  margin-left: 0;
}

.tree-group {
  margin-top: 4px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 4px 0;
  font-size: 15px;
}

.empty-hint {
  font-size: 13px;
  color: var(--text-muted);
}

/* 详情面板 */
.detail-panel {
  margin-top: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.detail-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.detail-body {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row--full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  color: var(--text-muted);
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary);
}

.detail-desc {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.code {
  padding: 2px 6px;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: var(--text-secondary);
}

/* 图例 */
.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 20px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot--branch {
  background: var(--accent);
}

.legend-dot--leaf {
  background: var(--border-color);
}

/* 响应式 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
  }

  .org-tabs {
    width: 100%;
  }

  .org-tab {
    flex: 1;
    text-align: center;
  }

  .tree-children {
    margin-left: 12px;
    padding-left: 12px;
  }

  .detail-body {
    grid-template-columns: 1fr;
  }
}
</style>
