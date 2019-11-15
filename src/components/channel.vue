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
    getChannelList () {
      let pro = this.$http.get('/channels')
      pro
        .then(result => {
          if (result.data.message === 'OK') {
            // 把获得的频道信息赋予给channelList成员
            this.channelList = result.data.data.channels
          }
        })
        .catch(err => {
          return this.$message.error('获得频道错误：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
