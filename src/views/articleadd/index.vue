<template>
  <!--卡片区-->
  <el-card class="box-card">
    <!--命名插槽，头部内容设置-->
    <div slot="header" class="clearfix">
      <span>发布文章</span>
    </div>
    <!--匿名插槽，卡片主体内容-->
    <div class="text item">
      <el-form ref="addFormRef" :model="addForm" label-width="120px" :rules="addFormRules">
        <el-form-item label="标题" prop="title">
          <el-input type="text" v-model="addForm.title"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <!--富文本编辑器-->
          <quill-editor v-model="addForm.content"></quill-editor>

        </el-form-item>
        <el-form-item label="封面">
          <el-radio-group v-model="addForm.cover.type">
            <!--注意：label前边需要设置冒号，表示接受整型的信息-->
            <el-radio :label="1">单图</el-radio>
            <el-radio :label="3">三图</el-radio>
            <el-radio :label="0">无图</el-radio>
            <el-radio :label="-1">自动</el-radio>
          </el-radio-group>

          <ul>
            <li class="uploadbox" @click="showDialog(item)" v-for="item in covernum" :key="item">
              <span>点击图标选择图片</span>
              <img v-if="addForm.cover.images[item-1]" :src="addForm.cover.images[item-1]" alt>
              <div v-else class="el-icon-picture-outline"></div>
            </li>
          </ul>
        </el-form-item>
        <el-form-item label="频道" prop="channel_id">
          <!--给当前组件声明事件方法(不是鼠标也不是键盘的)-->
          <!-- <channel-com @事件名称="事件驱动方法"></channel-com> -->
          <!-- 事件方法不要设置() -->
          <!-- 只有channel-com有资格调用该事件方法 -->
          <channel-com @slt="selectHandler"></channel-com>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addarticle(false)">发布</el-button>
          <el-button @click="addarticle(true)">存入草稿</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--对话框设置
      :visible.sync="dialogVisible"
      dialogVisible：true/false[默认]  设置对话框是否显示
      width="30%"  设置宽度
      :before-close="handleClose" 关闭对话框之前的回调处理
      @close="clearImage" 关闭对话框事件，任何方式关闭对话框都会触发调用
    -->
    <el-dialog
      title="提示" :visible.sync="dialogVisible"
      width="60%"
      @close="clearImage"
    >
      <!--匿名插槽，设置对话框主体内容-->
      <ul>
        <li class="image-box" v-for="item in imageList" :key="item.id">
          <img :src="item.url" alt="没有图片" @click="clkImage">
        </li>
      </ul>
      <!--命名插槽，设置对话框底部显示按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="imageOK">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
// 引入富文本编辑器的css样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 引入编辑器主组件模块(按需导入)
import { quillEditor } from 'vue-quill-editor'

// 导入频道公共组件
import ChannelCom from '@/components/channel.vue'

export default {
  name: 'ArticleAdd',
  // 计算属性
  computed: {
    // 计算封面图片个数
    covernum () {
      // 设置选择框 个数 与 type的值 一致
      if (this.addForm.cover.type > 0) {
        return this.addForm.cover.type
      }
      return 0
    }
  },
  components: {
    // 简易成员赋值 quillEditor: quillEditor
    // 组件使用两种方式：<quillEditor></quillEditor> 或 <quill-editor></quill-editor>
    quillEditor,
    // 注册独立的频道组件
    ChannelCom
  },
  data () {
    return {
      materialUrl: '', // 记录选中好的素材图片的url地址
      xu: 0, // 选择框 序号  0/1/2分别代表第1/2/3个"选择框"被单击到了
      imageList: [], // 素材图片列表
      // 获取素材图片的条件参数
      querycdt: {
        collect: false, // 非收藏图片
        page: 1,
        per_page: 9
      },
      dialogVisible: false, // 对话框显示开关
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
      },
      addForm: {
        title: '', // 标题
        content: '', // 文章内容
        // 封面(1-3张之间)
        cover: {
          // 默认设置为0张图片，不然报错
          type: 0, // 告知是几个图片 封面类型 -1:自动，0-无图，1-1张，3-3张
          images: [] // 以数组元素形式存储多个封面图片路径名的
        },
        channel_id: '' // 接受频道信息
      }
    }
  },
  created () {
    this.getImageList() // 获得供选取的素材图片
  },
  methods: {
    // 素材图片选中好，点击"确定"按钮了
    imageOK () {
      if (this.materialUrl) {
        // 把materialUrl选中的图片的地址赋予给 addForm.cover.images里边
        this.addForm.cover.images[this.xu] = this.materialUrl
        // 关闭对话框
        this.dialogVisible = false
      } else {
        this.$message.error('咋地，一个都没有相中！')
      }
    },
    // 恢复出厂设置
    clearImage () {
      // 清除border选中高亮效果
      let lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }
      // 清除选中图片materialUrl地址
      this.materialUrl = ''
    },
    // 对话框选中素材图片
    clkImage (evt) {
      // 把其他项目的边框高亮效果去除
      this.clearImage()

      // console.log(evt) // MouseEvent对象
      // console.log(evt.target) // img的dom对象
      // 获得当前触发事件的img的父节点对象，即li标签
      // evt.target.parentNode
      // 设置当前项目有高亮效果
      evt.target.parentNode.style.border = '2px solid red'
      // 把当前选中图片的url地址赋予给materiaURL
      // console.log(evt.target) // img 的dom对象
      this.materialUrl = evt.target.src
    },
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
    // 显示素材对话框
    // n:代表当前被点击选择框的号码(1/2/3)
    showDialog (n) {
      this.xu = n - 1 // 通过xu成员记录被单击到的选择框
      this.dialogVisible = true // 设置为true
    },
    // 给channel-com声明的事件驱动方法
    // 用以接收channel-com内部传递出来的频道id信息
    // arg:channel-com内部给传递的id信息
    selectHandler (arg) {
      // console.log(arg)
      // 把传递过来的频道id信息赋予给addForm.channel_id
      this.addForm.channel_id = arg
    },
    // 发表文章
    // flag=true  是存入草稿
    // flag=false  正式发布
    addarticle (flag) {
      // 表单校验
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          // 表单校验成功
          let pro = this.$http.post('/articles', this.addForm, {
            params: { draft: flag }
          })
          pro
            .then(result => {
              if (result.data.message === 'OK') {
                this.$message.success('添加文章成功！')
                // 跳转到列表页面
                this.$router.push('/article')
              }
            })
            .catch(err => {
              return this.$message.error('添加文章失败！：' + err)
            })
        }
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
// 对话框素材图片列表相关css样式
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
</style>
