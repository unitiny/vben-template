<script lang="ts" setup>
import { computed } from 'vue';

import { useUserStore } from '@vben/stores';

import { ElCard, ElCol, ElRow, ElStatistic } from 'element-plus';

defineOptions({ name: 'Overview' });

const userStore = useUserStore();

const userInfo = computed(() => userStore.userInfo);
</script>

<template>
  <div class="p-4">
    <ElCard class="mb-4">
      <template #header>
        <div class="card-header">
          <span>欢迎回来，{{ userInfo?.realName || '用户' }}</span>
        </div>
      </template>
      <p class="text-gray-500">
        这是系统总览页面，您可以在这里查看系统的整体状态和关键指标。
      </p>
    </ElCard>

    <ElRow :gutter="20">
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="今日访问" :value="1024" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="总用户数" :value="8846" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="消息数量" :value="128" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="待办事项" :value="12" />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard class="mt-4">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      <div class="flex gap-4">
        <ElCard shadow="hover" class="flex-1 cursor-pointer">
          <div class="text-center">
            <div class="i-lucide:file-text mb-2 text-2xl text-blue-500"></div>
            <span>文档管理</span>
          </div>
        </ElCard>
        <ElCard shadow="hover" class="flex-1 cursor-pointer">
          <div class="text-center">
            <div class="i-lucide:users mb-2 text-2xl text-green-500"></div>
            <span>用户管理</span>
          </div>
        </ElCard>
        <ElCard shadow="hover" class="flex-1 cursor-pointer">
          <div class="text-center">
            <div class="i-lucide:settings mb-2 text-2xl text-orange-500"></div>
            <span>系统设置</span>
          </div>
        </ElCard>
        <ElCard shadow="hover" class="flex-1 cursor-pointer">
          <div class="text-center">
            <div
              class="i-lucide:bar-chart-2 mb-2 text-2xl text-purple-500"
            ></div>
            <span>数据统计</span>
          </div>
        </ElCard>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
