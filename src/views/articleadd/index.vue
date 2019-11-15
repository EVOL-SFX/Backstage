<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>发表文章</span>
      </div>
      <div class="text item">
        <el-form ref="addFormRef" :model="addForm" label-width="120px" :rules="addFormRules">
          <el-form-item label="标题：" prop="title">
            <el-input v-model="addForm.title" :style="'width:500px'"></el-input>
          </el-form-item>
          <el-form-item label="内容：" prop="content">
            <quill-editor v-model="addForm.content"></quill-editor>
          </el-form-item>
          <el-form-item label="封面：">
            <el-radio-group v-model="addForm.cover.type">
              <el-radio :label="1">单图</el-radio>
              <el-radio :label="3">三图</el-radio>
              <el-radio :label="0">无图</el-radio>
              <el-radio :label="-1">自动</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="频道:" prop="channel_id">
            <!-- @slt是给channel-com组件声明的事件，名称为slt，
            selectHandler是事件响应方法，
            需要在当前组件(父组件)methods中声明好 -->
            <channel-com @slt="selectHandler"></channel-com>
          </el-form-item>
          <el-form-item>
            <!-- 按钮click事件要去传入 true/false参数，表示 存入草稿 或 正式发布 -->
            <el-button type="primary" @click="addarticle(false)">发布</el-button>
            <el-button @click="addarticle(true)">存入草稿</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
// 富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 引入编辑器主模块
import { quillEditor } from 'vue-quill-editor'
// 引入频道公共组件
import ChannelCom from '@/components/channel.vue'

export default {
  name: 'ArticleAdd',
  components: {
    quillEditor,
    // 注册频道独立组件
    ChannelCom
  },
  data () {
    return {
      channelList: [], // 接收频道列表数据
      addForm: {
        title: '', // 文章标题
        content: '', // 文章内容
        cover: {
          type: 0, // 封面类型 -1:自动，0-无图，1-1张，3-3张
          //   整型的0  切记
          images: []
        },
        channel_id: '' // 频道
      },
      // 表单校验规则
      addFormRules: {
        title: [
          { required: true, message: '标题必填' },
          // 后端要求title长度介于5-30个字符
          {
            min: 5,
            max: 30,
            message: '标题长度介于5-30个字符'
          }
        ],
        content: [{ required: true, message: '内容必填' }],
        channel_id: [{ required: true, message: '频道必选' }]
      }
    }
  },
  methods: {
    addarticle (flag) {
      console.log(this)
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          // 把被添加的文章信息通过axios传递给服务器端存储
          // axios发起post请求的时候，不仅可以传递post数据还可以传递get请求字符串信息
          // this.$http.post(地址,post数据,get请求字符串信息)
          var pro = this.$http.post('/articles', this.addForm, {
            params: { draft: flag }
          })
          pro
            .then(result => {
              this.$message.success('文章发布成功')
              this.$router.push({ name: 'article' }) // '/article'
            })
            .catch(err => {
              return this.$message.error('发布文章失败：' + err)
            })
        }
      })
    },
    // 频道组件方法，获得子组件传递过来的频道id并赋予给channel_id成员
    // val:子组件给传递过来的频道信息
    selectHandler (val) {
      this.addForm.channel_id = val
    }
  }
}
</script>

<style lang="less" scoped>
/*给富文本编辑器设置内容区域高度*/
/* .ql-editor{   .ql-editor[data-v-xxx]不对了*/
/*deep：深度作用选择器，使得编译后的效果为：.el-form[data-v-xx] .ql-editor{}*/
.el-form /deep/ .ql-editor {
  height: 200px;
}
</style>
