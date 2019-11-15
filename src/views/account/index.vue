<template>
  <!--卡片区-->
  <el-card class="box-card">
    <!--命名插槽，头部内容设置-->
    <div slot="header" class="clearfix">
      <span>账户信息</span>
    </div>
    <!--匿名插槽，卡片主体内容-->
    <div class="text item cardbody">
      <div id="lt">
        <el-form
          ref="accountFormRef"
          :model="accountForm"
          label-width="100px"
          :rules="accountFormRules"
        >
          <el-form-item label="用户名：" prop="name">
            <el-input v-model="accountForm.name"></el-input>
          </el-form-item>
          <el-form-item label="手机号码：">
            <el-input v-model="accountForm.mobile" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱：" prop="email">
            <el-input v-model="accountForm.email"></el-input>
          </el-form-item>
          <el-form-item label="简介：">
            <el-input type="textarea" v-model="accountForm.intro"></el-input>
          </el-form-item>
          <el-form-item label="简介：">
            <el-button type="primary" @click="editAccount()">更新账户</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div id="rt">
        <!--<el-upload
         action="https://jsonplaceholder.typicode.com/posts/"  // 接收附件的服务器端地址
         :show-file-list="false" // 上传好的图片不要通过列表形式呈现
         :on-success="handleAvatarSuccess"  // 图片上传成功后的回调处理
         :http-request="httpRequest" // 自定义上传行为，有了此属性，那么 action 和 on-success 都成摆设了>
         <i v-else class="el-icon-plus avatar-uploader-icon"></i>
         <img v-if="imageUrl" :src="imageUrl" class="avatar">
        </el-upload>-->
        <el-upload action :show-file-list="false" :http-request="httpRequest">
          <img
            v-if="accountForm.photo"
            :src="accountForm.photo"
            class="avatar"
            alt
            width="300"
            height="300"
          />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          <!-- 给el-upload声明http-request属性 并设置methods的httpRequest方法，表示自定义上传行为 -->
        </el-upload>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'Account',
  data () {
    return {
      // 表单校验
      accountFormRules: {
        name: [
          { required: true, message: '名字必填' },
          // 后端要求title长度介于1-7个字符
          {
            min: 1,
            max: 7,
            message: '名字长度介于1-7个字符之间'
          }
        ],
        email: [
          { required: true, message: '邮箱必填' },
          { type: 'email', message: '邮箱格式不正确' }
        ]
      },
      accountForm: {
        // 各个成员来自api参考【2.4 编辑用户资料】
        id: '', // id
        name: '', // 名称
        mobile: '', // 手机号码
        email: '', // 邮箱
        intro: '' // 简介
      }
    }
  },
  methods: {
    getAccountInfo () {
      let pro = this.$http.get('/user/profile')
      pro
        .then(result => {
          // 把账户信息赋予给accountForm成员里边
          this.accountForm = result.data.data
        })
        .catch(err => {
          return this.$message.error('获得账号信息失败' + err)
        })
    },
    editAccount () {
      // 表单校验
      this.$refs.accountFormRef.validate(valid => {
        if (valid) {
          // axios行动了
          // get/post/put/delete
          // put: 修改，修改全部表单
          // patch：修改，修改部分项目
          let pro = this.$http.patch('/user/profile', this.accountForm)
          pro
            .then(result => {
              if (result.data.message === 'OK') {
                this.$message.success('账户修改成功')
              }
            })
            .catch(err => {
              this.$message.error('修改失败：' + err)
            })
        }
      })
    },
    httpRequest (resource) {
      // FormData收集图片
      let fd = new FormData()
      fd.append('photo', resource.file)
      // axios传递图片到服务器端存储
      let pro = this.$http.patch('/user/photo', fd)
      pro
        .then(result => {
          if (result.data.message === 'OK') {
            this.accountForm.photo = result.data.data.photo
            // 提示成功
            this.$message.success('更新头像成功')
          }
        })
        .catch(err => {
          return this.$message.error('更新头像失败：' + err)
        })
    }
  },
  created () {
    //   获取账号信息
    this.getAccountInfo()
  }
}
</script>
<style lang="less" scoped>
// 给表单 和 头像区域做布局样式设计
.cardbody {
  display: flex;
  justify-content: space-between;
  #lt {
    width: 40%;
  }
  #rt {
    width: 30%;
  }
}
</style>
