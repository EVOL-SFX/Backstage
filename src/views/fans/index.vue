<template>
    <!--卡片区-->
  <el-card class="box-card">
    <!--命名插槽，头部内容设置-->
    <div slot="header" class="clearfix">
      <span>粉丝统计</span>
    </div>
    <!--匿名插槽，卡片主体内容-->
    <div class="text item">
      <div id="main" style="width:600px;height:400px"></div>
      <div id="main1" style="width:600px;height:400px"></div>
    </div>
  </el-card>
</template>
<script>
import echarts from 'echarts'
export default {
  name: 'Fans',
  mounted () {
    this.paintPic()
    this.paintPic1()
  },
  methods: {
    // 我们的服务器端关于粉丝统计数据不能正常返回，故数据信息都是假的，
    // 在真实案例中是这样的，都会返回

    // option选项类型的参数(如果不是，要手动修改为option类型的)，
    // 然后在axios成功回调里边再次调用setOption()方法，参数会覆盖之前旧的参数

    paintPic () {
      // 基于准备好的demo，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main'))
      // 绘制图表
      myChart.setOption({
        title: {
          text: 'Echarts 入门实例'
        },
        tooltip: {},
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [{
          name: '销量',
          type: 'bar',
          data: [5, 20, 30, 16, 20, 10]
        }]
      })
    },
    paintPic1 () {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main1'))
      // 绘制图表
      myChart.setOption({
        title: {
          text: '某站点用户访问来源',
          subtext: '纯属虚构',
          x: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: 335, name: '直接访问' },
              { value: 310, name: '邮件营销' },
              { value: 234, name: '联盟广告' },
              { value: 135, name: '视频广告' },
              { value: 1548, name: '搜索引擎' }
            ],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
