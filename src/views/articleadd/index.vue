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
            <ul>
              <li class="uploadbox" v-for="item in covernum" :key="item" @click="showDialog()">
                <span>点击图标选择图片</span>
                <img v-if="addForm.cover.images[item-1]" :src="addForm.cover.images[item-1]" alt />
                <div v-else class="el-icon-picture-outline"></div>
              </li>
            </ul>
          </el-form-item>
          <el-form-item label="频道:" prop="channel_id">
            <!-- @slt是给channel-com组件声明的事件，名称为slt，
            selectHandler是事件响应方法，
            需要在当前组件(父组件)methods中声明好-->
            <channel-com @slt="selectHandler"></channel-com>
          </el-form-item>
          <el-form-item>
            <!-- 按钮click事件要去传入 true/false参数，表示 存入草稿 或 正式发布 -->
            <el-button type="primary" @click="addarticle(false)">发布</el-button>
            <el-button @click="addarticle(true)">存入草稿</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-dialog title="素材图片" :visible.sync="dialogVisible" width="60%" >
        <ul>
          <li class="image-box" v-for="item in imageList" :key="item.id">
            <img :src="item.url" alt="木有图片" @click="clkImage">
          </li>
        </ul>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="imageOK = false">确定</el-button>
        </span>
      </el-dialog>
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
  computed: {
    covernum () {
      // 设计当前图片“选择框的个数”
      if (this.addForm.cover.type >= 0) {
        return this.addForm.cover.type
      }
      return 0
    }
  },
  data () {
    return {
      imageList: [],
      querycdt: {
        collect: false, // 非收藏图片
        page: 1,
        per_page: 12
      },
      dialogVisible: false,
      channelList: [], // 接收频道列表数据
      addForm: {
        title: '', // 文章标题
        content: '', // 文章内容
        cover: {
          type: 3, // 封面类型 -1:自动，0-无图，1-1张，3-3张
          //   整型的0  切记
          images: []
        },
        channel_id: ''// 频道
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
  created () {
    // 获得供选取的素材图片
    this.getImageList()
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
    },
    showDialog () {
      this.dialogVisible = true
      // 打开dialog对话框
    },
    // 获取素材图片
    // 获取素材图片列表
    getImageList () {
      let pro = this.$http.get('/user/images', { params: this.querycdt })
      pro
        .then(result => {
          if (result.data.message === 'OK') {
            this.imageList = result.data.data.results
          }
        })
        .catch(err => {
          return this.$message.error('获得素材图片列表错误:' + err)
        })
    },
    clkImage (evt) {
      // 把全部项目的选中标志都去除
      var lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }
      // evt：当前事件对象，设置事件不加括号;
      // evt.target：触发当前事件的dom节点对象（img）
      evt.target.parentNode.style.border = '3px solid blue'
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
// 对话框素材图片列表相关css样式
.image-box {
  list-style: none;
  width: 200px;
  height: 140px;
  background-color: #fff;
  margin: 10px;
  float: left;
  border: 1px solid #eee;
  cursor:pointer;
  box-sizing:border-box;
  img {
    width: 100%;
    height: 100%;
  }
}
// 文章封面选择框样式
.uploadbox {
  list-style: none;
  width: 200px;
  height: 200px;
  margin: 10px;
  float: left;
  cursor: pointer;
  border: 1px solid #eee;
  span {
    width: 200px;
    height: 50px;
    line-height: 50px;
    display: block;
    text-align: center;
  }
  div {
    width: 200px;
    height: 150px;
    font-size: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
  }
  img {
    width: 200px;
    height: 150px;
  }
}
</style>
