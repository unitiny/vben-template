<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { TurnoverData } from '#/api/dashboard';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

interface Props {
  data: TurnoverData[];
}

const props = defineProps<Props>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartData = computed(() => {
  const months = props.data.map((d) => d.month);
  const hires = props.data.map((d) => d.hires);
  const departures = props.data.map((d) => d.departures);
  return { months, hires, departures };
});

function renderChart() {
  renderEcharts({
    color: ['#3b82f6', '#f97316'],
    grid: {
      bottom: 40,
      containLabel: true,
      left: 20,
      right: 20,
      top: 40,
    },
    legend: {
      bottom: 0,
      data: ['入职人数', '离职人数'],
    },
    series: [
      {
        name: '入职人数',
        type: 'bar',
        barWidth: '35%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
        data: chartData.value.hires,
      },
      {
        name: '离职人数',
        type: 'bar',
        barWidth: '35%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
        data: chartData.value.departures,
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: chartData.value.months,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
      },
    },
    yAxis: {
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
