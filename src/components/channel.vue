<template>
  <el-select v-model="chid" placeholder="请选择" clearable>
    <el-option v-for="item in channelList" :key="item.id" :label="item.name" :value="item.id"></el-option>
  </el-select>
</template>

<script>
// 当前组件内部拥有一个名称为slt的事件方法(具体是父组件给定义的)
// 计划，使得chid的新值被slt事件方法给抛到父组件里边去
export default {
  name: 'ChannelCom',
  props: {
    // cid的值有类型 和 默认值 修饰
    cid: {
      // type: Number, // Object Array
      default: 0 // 设置默认值
    }
  },
  watch: {
    // 监听父组件是否有传递cid信息过来，有的话，就接收赋予给chid，使得频道有默认显示项目
    cid: function (newV, oldV) {
      this.chid = newV
    },
    // 监听是否有选择新的频道
    chid: function (newV, oldV) {
      // 调用自己的slt方法
      // this.$emit(事件方法，实参，实参……)
      this.$emit('slt', newV)
    }
  },
  data () {
    return {
      chid: '', // 当前频道id
      channelList: [] // 服务器端真实频道数据(数组对象集)
    }
  },
  created () {
    this.getChannelList() // 获得频道
  },
  methods: {
    // 获得频道列表数据
    // 获得使用的真实频道列表数据
    async getChannelList () {
      try {
        var pro = await this.$http.get('/channels')
        this.channelList = pro.data.data.channels
      } catch (err) {
        return this.$message.error('获得频道列表失败！' + err)
      }
    }
    // 如果axios请求过程中发生错误，可以通过异常机制  try、catch 加以处理，语法为：
    //     try{
    //   // 放置有可能产生错误的代码
    //   aaaa
    //   bbbb
    //   cccc
    // }catch(err){
    //   // 对try内部的错误进行捕捉处理
    //   // err:是具体错误对象
    //   dddd
    // }
    // eeee

    // try、catch使用情形分析：
    // 1. 没有任何错误，那么执行： a   b   c   e
    // 2. try中的b有错误，那么执行：  a   d   e

    // 特点：
    // try内部：  如果有错误，错误后续代码不执行
    //   无论是否有错误，try/catch后续代码都会运行，其可以保证流程是"完整"的
    //   如果try或catch内部有return，就另当别论了

    // async getChannelList () {
    //   let rst = await this.$http.get('/channels')
    //   // 现在的rst就是then里边的result结果
    //   this.channelList = rst.data.data.channels
    // }
    // getChannelList () {
    //   let pro = this.$http.get('/channels')
    //   pro
    //     .then(result => {
    //       if (result.data.message === 'OK') {
    //         // 把获得的频道信息赋予给channelList成员
    //         this.channelList = result.data.data.channels
    //       }
    //     })
    //     .catch(err => {
    //       return this.$message.error('获得频道错误：' + err)
    //     })
    // }
  }
}
</script>

<style lang="less" scoped>
</style>
