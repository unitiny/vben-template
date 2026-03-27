<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { HeadcountData } from '#/api/dashboard';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

interface Props {
  data: HeadcountData[];
}

const props = defineProps<Props>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartData = computed(() => {
  return props.data.map((d) => ({
    name: d.month,
    value: d.count,
  }));
});

function renderChart() {
  renderEcharts({
    color: ['#3b82f6', '#10b981', '#f59e0b'],
    legend: {
      bottom: 0,
      left: 'center',
    },
    series: [
      {
        name: '在职人数',
        type: 'pie',
        radius: ['35%', '55%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}人',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: true,
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
  <EchartsUI ref="chartRef" height="280px" />
</template>
