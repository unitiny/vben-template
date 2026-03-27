<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import type { AgeData } from '#/api/dashboard';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

interface Props {
  data: AgeData[];
}

const props = defineProps<Props>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartData = computed(() => {
  return {
    ranges: props.data.map((d) => d.range),
    counts: props.data.map((d) => d.count),
  };
});

function renderChart() {
  renderEcharts({
    color: ['#10b981'],
    grid: {
      bottom: 20,
      containLabel: true,
      left: 20,
      right: 40,
      top: 20,
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
        },
        data: chartData.value.counts,
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
        },
      },
      axisLabel: {
        color: '#6b7280',
      },
    },
    yAxis: {
      type: 'category',
      data: chartData.value.ranges,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
      },
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
  { deep: true }
);
</script>

<template>
  <EchartsUI ref="chartRef" height="250px" />
</template>
