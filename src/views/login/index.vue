<template>
  <div class="login-container">
    <div class="login-box">
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
        <!-- ref: 使得可以获取当前的组件对象  this.$refs.form，后期表单校验会使用 -->
        <!-- :model="form"  属性绑定model，与v-model没有关系，作用是要收集表单的全部数据，后期表单校验会使用 -->
        <!-- label-width：设置表单域项目名字区域宽度 -->
        <img src="./logo_index.png" alt />
        <el-form-item prop="mobile">
          <el-input v-model="loginForm.mobile" placeholder="请输入手机号">
            <i slot="prefix" class="iconfont icon-shouji"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input v-model="loginForm.code" placeholder="验证码">
            <i slot="prefix" class="iconfont icon-yanzhengma"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="xieyi" id="checkbox">
          <el-checkbox v-model="loginForm.xieyi"></el-checkbox>
          <span>我已阅读并同意用户协议和隐私条款</span>
        </el-form-item>
        <el-form-item>
          <el-button
            style="width:100%;"
            type="primary"
            @click="login()"
            :loading="isActive"
            :disabled="isActive"
            @keyup.enter="login()"
          >登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import '@/assets/js/gt'
import '@/assets/iconfont1/iconfont.css'
export default {
  data () {
    var xieyiTest = function (rule, value, callback) {
      // rule:校验规则，一般不用
      // value:当前被校验的信息
      // callback：回调函数，校验成功或失败都需要执行
      if (value) {
        callback()
      } else {
        return callback(new Error('请无条件遵守规矩'))
      }
    }
    return {
      ctaObj: null,
      // 处理重复创建问题
      // 创建一个data成员ctaObj
      // 在第一次生成的人机窗口队想，赋予给ctaObj（存一下）this.ctaObj=captchaObj
      isActive: false,
      loginForm: {
        mobile: '13561647153', // 手机号码
        code: '246810', // 校验码
        xieyi: true
      },
      loginFormRules: {
        mobile: [
          { required: true, message: '手机号码必填' },
          { pattern: /^1[35789]\d{9}$/, message: '手机号码格式不对' }
        ],
        code: [
          {
            required: true,
            message: '验证码必填'
          }
        ],
        xieyi: [{ validator: xieyiTest }]
      }
    }
  },
  methods: {
    login () {
      this.$refs.loginFormRef.validate(valid => {
        // 表单域校验成功
        if (valid) {
          // 表单域校验成功
          this.isActive = true // 登录按钮处于等待、禁用状态
          // A.axios获得极验初始校验信息
          let pro = this.$http.get(`/captchas/${this.loginForm.mobile}`)
          pro
            .then(result => {
              console.log(result)
              let { data } = result.data
              // 显示极验应用窗口
              // 请检测data的数据结构，保证data.gt,data.challenge,data.success有值
              window.initGeetest(
                {
                  gt: data.gt,
                  challenge: data.challenge,
                  offline: !data.success,
                  new_captcha: true,
                  product: 'bind' // 没有按钮，通过登录按钮激活验证
                },
                captchaObj => {
                  // 调用验证实例captchaObj的实例方法
                  captchaObj
                    .onReady(() => {
                      // 验证ready之后才能调用verify方法显示验证码
                      captchaObj.verify() // 显示验证码窗口
                      this.isActive = false // 激活按钮
                      this.ctaObj = captchaObj // 用ctaObj，存一下
                    })
                    .onSuccess(() => {
                      // 验证账号的真实性，登录
                      this.loginAct()
                    })
                    .onError(() => {})
                }
              )
            })
            .catch(err => {
              return this.$message.error('获得极验初始校验信息错误' + err)
            })
        }
      })
    },
    loginAct () {
      // 账号真实性校验
      var pro = this.$http.post('/authorizations', this.loginForm)
      pro
        .then(result => {
          if (result.data.message === 'OK') {
            window.sessionStorage.setItem(
              'userinfo',
              JSON.stringify(result.data.data)
            )
            // 进入后台系统
            this.$router.push('/home')
          }
        })
        .catch(err => {
          return this.$message.error('用户名或密码错误' + err)
        })
    }
  }
  // methods: {
  //   login () {
  //     this.$refs.loginFormRef.validate(valid => {
  //       if (valid) {
  //         var pro = this.$http.post('/authorizations', this.loginForm)
  //         pro
  //           .then(result => {
  //             if (result.data.message === 'OK') {
  //               this.$router.push('/home')
  //             }
  //           })
  //           .catch(err => {
  //             return this.$message.error('用户名或密码错误' + err)
  //           })
  //       }
  //     })
  //     console.log(this)
  //     this.$refs.loginFormRef.validate(valid => {
  //       if (valid) {
  //         this.$router.push('/home')
  //       }
  //     })
  //     // this.$router.push({ name: 'home' })
  //   }
  // }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-image: url("./login_bg.jpg");
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-box {
    width: 410px;
    height: 345px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    .el-form {
      width: 75%;
      text-align: center;
      .el-checkbox {
        margin-right: 10px;
      }
      img {
        width: 50%;
        margin: 20px auto;
      }
    }
  }
}
#checkbox {
  text-align: left;
}
</style>
