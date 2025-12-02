import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { OperationLogEntity } from '@/api/generated/.ts.schemas'

/**
 * 图表生成工具
 */
export function useCharts() {
  /**
   * 生成时间标签
   */
  const generateTimeLabels = (type: 'hour' | 'day' | 'week'): string[] => {
    const labels: string[] = []
    const now = new Date()

    if (type === 'hour') {
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now)
        hour.setHours(hour.getHours() - i)
        labels.push(`${hour.getHours()}:00`)
      }
    } else if (type === 'day') {
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now)
        day.setDate(day.getDate() - i)
        labels.push(`${day.getMonth() + 1}/${day.getDate()}`)
      }
    } else {
      for (let i = 3; i >= 0; i--) {
        const week = new Date(now)
        week.setDate(week.getDate() - i * 7)
        labels.push(`第${Math.ceil(week.getDate() / 7)}周`)
      }
    }

    return labels
  }

  /**
   * 生成随机数据（用于演示）
   */
  const generateRandomData = (
    type: 'hour' | 'day' | 'week',
    isFailed = false,
  ): number[] => {
    const length = type === 'hour' ? 24 : type === 'day' ? 7 : 4
    return Array.from({ length }, () =>
      Math.floor(Math.random() * (isFailed ? 20 : 100)),
    )
  }

  /**
   * 生成成功率数据（用于演示）
   */
  const generateSuccessRateData = (): number[] => {
    return Array.from({ length: 7 }, () => 85 + Math.random() * 15)
  }

  /**
   * 生成操作趋势图配置 - 渐变柱状图 + 平滑折线图
   */
  const generateTrendChartOption = (
    type: 'hour' | 'day' | 'week',
  ): EChartsOption => {
    const successData = generateRandomData(type)
    const failedData = generateRandomData(type, true)
    const totalData = successData.map(
      (val, idx) => val + (failedData[idx] ?? 0),
    )

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: '#333',
        },
        formatter: (params: any) => {
          let result = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`
          params.forEach((item: any) => {
            const marker = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};margin-right:8px;"></span>`
            result += `<div style="margin: 4px 0;">${marker}${item.seriesName}: <strong>${item.value}</strong></div>`
          })
          return result
        },
      },
      legend: {
        data: ['成功操作', '失败操作', '总操作数'],
        top: 10,
        left: 'center',
        itemGap: 20,
        textStyle: {
          fontSize: 13,
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '50px',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: generateTimeLabels(type),
        axisPointer: {
          type: 'shadow',
        },
        axisLine: {
          lineStyle: {
            color: '#ddd',
          },
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        name: '操作次数',
        nameTextStyle: {
          color: '#666',
          fontSize: 12,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: '成功操作',
          type: 'bar',
          barWidth: '30%',
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(103, 194, 58, 0.5)',
            },
          },
          data: successData,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#85D98A' },
              { offset: 1, color: '#67C23A' },
            ]),
          },
          label: {
            show: false,
          },
        },
        {
          name: '失败操作',
          type: 'bar',
          barWidth: '30%',
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(245, 108, 108, 0.5)',
            },
          },
          data: failedData,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#F89898' },
              { offset: 1, color: '#F56C6C' },
            ]),
          },
          label: {
            show: false,
          },
        },
        {
          name: '总操作数',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: totalData,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#409EFF' },
              { offset: 1, color: '#66B1FF' },
            ]),
          },
          itemStyle: {
            color: '#409EFF',
            borderColor: '#fff',
            borderWidth: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.15)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.02)' },
            ]),
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(64, 158, 255, 0.5)',
            },
          },
        },
      ],
    }
  }

  /**
   * 生成模块分布图配置 - 现代环形图
   */
  const generateModuleChartOption = (
    tableData: OperationLogEntity[],
  ): EChartsOption => {
    const moduleCounts: Record<string, number> = {}
    tableData.forEach((log) => {
      if (log.module) {
        moduleCounts[log.module] = (moduleCounts[log.module] || 0) + 1
      }
    })

    const data = Object.entries(moduleCounts).map(([name, value]) => ({
      name,
      value,
    }))

    // 现代配色方案
    const colors = [
      '#5470C6',
      '#91CC75',
      '#FAC858',
      '#EE6666',
      '#73C0DE',
      '#3BA272',
      '#FC8452',
      '#9A60B4',
      '#EA7CCC',
    ]

    return {
      color: colors,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: '#333',
        },
        formatter: (params: any) => {
          return `
            <div style="font-weight: 600; margin-bottom: 6px;">${params.name}</div>
            <div>操作次数: <strong>${params.value}</strong></div>
            <div>占比: <strong>${params.percent.toFixed(1)}%</strong></div>
          `
        },
      },
      legend: {
        orient: 'vertical',
        left: 10,
        top: 'center',
        itemGap: 12,
        textStyle: {
          fontSize: 12,
          color: '#666',
        },
        formatter: (name: string) => {
          const item = data.find((d) => d.name === name)
          return `${name}  ${item?.value || 0}`
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              formatter: '{d}%',
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    }
  }

  /**
   * 生成操作类型分布图配置 - 玫瑰图
   */
  const generateActionChartOption = (
    tableData: OperationLogEntity[],
  ): EChartsOption => {
    const actionCounts: Record<string, number> = {}
    tableData.forEach((log) => {
      if (log.action) {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
      }
    })

    const data = Object.entries(actionCounts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)

    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
    ]

    return {
      color: colors,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: '#333',
        },
        formatter: (params: any) => {
          return `
            <div style="font-weight: 600; margin-bottom: 6px;">${params.name}</div>
            <div>次数: <strong>${params.value}</strong></div>
            <div>占比: <strong>${params.percent.toFixed(1)}%</strong></div>
          `
        },
      },
      legend: {
        top: 'bottom',
        left: 'center',
        itemGap: 16,
        textStyle: {
          fontSize: 12,
          color: '#666',
        },
      },
      series: [
        {
          type: 'pie',
          radius: [30, 120],
          center: ['50%', '45%'],
          roseType: 'area',
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
          },
          label: {
            fontSize: 12,
            color: '#666',
            formatter: '{b}\n{d}%',
          },
          labelLine: {
            length: 15,
            length2: 10,
            smooth: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
            label: {
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data,
        },
      ],
    }
  }

  /**
   * 生成成功率趋势图配置 - 渐变面积图
   */
  const generateSuccessRateChartOption = (): EChartsOption => {
    const successRateData = generateSuccessRateData()
    const timeLabels = generateTimeLabels('day')

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: '#333',
        },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: (params: any) => {
          const value = params[0].value.toFixed(2)
          return `
            <div style="font-weight: 600; margin-bottom: 6px;">${params[0].axisValue}</div>
            <div>成功率: <strong style="color: #67C23A;">${value}%</strong></div>
          `
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '40px',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timeLabels,
        axisLine: {
          lineStyle: {
            color: '#ddd',
          },
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        name: '成功率 (%)',
        min: 80,
        max: 100,
        nameTextStyle: {
          color: '#666',
          fontSize: 12,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
          formatter: '{value}%',
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed',
          },
        },
      },
      visualMap: {
        show: false,
        pieces: [
          {
            gte: 95,
            color: '#67C23A',
          },
          {
            gte: 90,
            lt: 95,
            color: '#E6A23C',
          },
          {
            lt: 90,
            color: '#F56C6C',
          },
        ],
      },
      series: [
        {
          type: 'line',
          data: successRateData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(103, 194, 58, 0.35)',
              },
              {
                offset: 0.7,
                color: 'rgba(103, 194, 58, 0.15)',
              },
              {
                offset: 1,
                color: 'rgba(103, 194, 58, 0.05)',
              },
            ]),
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(103, 194, 58, 0.5)',
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#E6A23C',
              type: 'dashed',
              width: 2,
            },
            data: [
              {
                yAxis: 95,
                label: {
                  formatter: '优秀线 95%',
                  position: 'end',
                  color: '#E6A23C',
                },
              },
            ],
          },
        },
      ],
    }
  }

  return {
    generateTrendChartOption,
    generateModuleChartOption,
    generateActionChartOption,
    generateSuccessRateChartOption,
  }
}
