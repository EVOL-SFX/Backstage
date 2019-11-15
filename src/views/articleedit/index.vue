<template>
  <div>
    <!-- 卡品区 -->
    <el-card class="box-card">
      <!--命名插槽，头部内容设置-->
      <div slot="header" class="clearfix">
        <span>修改文章</span>
      </div>
      <div class="text item">
        <el-form ref="editFormRef" :model="editForm" label-width="120px" :rules="editFormRules">
          <el-form-item label="标题：" prop="title">
            <el-input v-model="editForm.title" :style="'width:500px'"></el-input>
          </el-form-item>
          <el-form-item label="内容：" prop="content">
            <quill-editor v-model="editForm.content"></quill-editor>
          </el-form-item>
          <el-form-item label="封面：">
            <el-radio-group v-model="editForm.cover.type">
              <el-radio :label="1">单图</el-radio>
              <el-radio :label="3">三图</el-radio>
              <el-radio :label="0">无图</el-radio>
              <el-radio :label="-1">自动</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="频道" prop="channel_id">
            <channel-com @slt="selectHandler" :cid="editForm.channel_id"></channel-com>
          </el-form-item>
          <!-- <el-form-item label="频道：" prop="channel_id">
            <el-select v-model="editForm.channel_id" placeholder="请选择" clearable>
          <channel-com @slt="selectHandler"></channel-com>-->
          <!-- <el-option
                v-for="item in channelList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
          </el-select>-->
          <!-- </el-form-item> -->
          <el-form-item>
            <!-- 按钮click事件要去传入 true/false参数，表示 存入草稿 或 正式发布 -->
            <el-button type="primary" @click="editarticle(false)">修改</el-button>
            <el-button @click="editarticle(true)">存入草稿</el-button>
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
  name: 'ArticleEdit',
  components: {
    quillEditor,
    ChannelCom
  },
  data () {
    return {
      channelList: [], // 接收频道列表数据
      editForm: {
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
      editFormRules: {
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
  computed: {
    // 修改文章id
    aid () {
      return this.$route.params.aid
    }
  },
  created () {
    // this.getChannelList() // 获得频道
    this.getArticleByAid() // 获得指定文章
  },
  methods: {
    // 修改文章
    // flag=true  是存入草稿
    // flag=false  正式发布
    editarticle (flag) {
      console.log(this)
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          // 表单校验成功
          // 把被添加的文章信息通过axios传递给服务器端存储
          // axios发起post请求的时候，不仅可以传递post数据还可以传递get请求字符串信息
          // this.$http.post(地址,post数据,get请求字符串信息)
          var pro = this.$http.put(`/articles/${this.aid}`, this.editForm, {
            params: { draft: flag }
          })
          pro
            .then(result => {
              this.$message.success('文章发布成功')
              this.$router.push({ name: 'article' }) // 或'/article'
            })
            .catch(err => {
              return this.$message.error('发布文章失败：' + err)
            })
        }
      })
    },
    // getChannelList () {
    //   var pro = this.$http.get('/channels')
    //   pro
    //     .then(result => {
    //       if (result.data.message === 'OK') {
    //         this.channelList = result.data.data.channels
    //       }
    //     })
    //     .catch(err => {
    //       return this.$message.error('获得文章频道错误：' + err)
    //     })
    // },
    getArticleByAid () {
      let pro = this.$http.get(`/articles/${this.aid}`)
      pro
        .then(result => {
          if (result.data.message === 'OK') {
            // 把文章赋予给editForm里面
            this.editForm = result.data.data
          }
        })
        .catch(err => {
          return this.$message.error('获得文章失败！：' + err)
        })
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
