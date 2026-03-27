<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import type { GenderData } from '#/api/dashboard';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

interface Props {
  data: GenderData[];
}

const props = defineProps<Props>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartData = computed(() => {
  return props.data.map((d) => ({
    name: d.gender,
    value: d.count,
  }));
});

// 计算总数
const total = computed(() => {
  return props.data.reduce((sum, d) => sum + d.count, 0);
});

function renderChart() {
  renderEcharts({
    color: ['#3b82f6', '#ec4899'],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '38%',
        style: {
          text: '总人数',
          textAlign: 'center',
          fill: '#6b7280',
          fontSize: 12,
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '48%',
        style: {
          text: String(total.value),
          textAlign: 'center',
          fill: '#111827',
          fontSize: 24,
          fontWeight: 'bold',
        },
      },
    ],
    legend: {
      bottom: 0,
      left: 'center',
      formatter: (name: string) => {
        const item = props.data.find((d) => d.gender === name);
        return `${name}  ${item?.percentage || 0}%`;
      },
    },
    series: [
      {
        name: '性别分布',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: '{b}\n{c}人',
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData.value,
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)',
    },
  });
}

onMounted(() => {
  renderChart();
});

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true },
);
</script>

<template>
  <EchartsUI ref="chartRef" height="250px" />
</template>
