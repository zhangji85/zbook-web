<template>
    <div class="register">
      <div class="main-register">
        <div class="title">注 册</div>
        <!-- 注册表单 -->
        <el-row>
          <el-form  :model="registerForm" status-icon :rules="rules" size="medium" ref="registerForm" label-width="100px" class="demo-registeForm">
            <el-form-item prop="username" label="用户名">
              <el-input @keyup.enter.native="Register('registerForm')" v-model="registerForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="pass">
              <el-input @keyup.enter.native="Register('registerForm')" v-model="registerForm.pass" autocomplete="off" placeholder="请输入密码(不少于6位)" show-password>
              </el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass">
              <el-input  @keyup.enter.native="Register('registerForm')" v-model="registerForm.checkPass" autocomplete="off" placeholder="请再次输入密码" show-password>
              </el-input>
            </el-form-item>
            <!-- 注册，重置按钮 -->
            <el-form-item style="margin-left: -25%">
              <el-button type="primary" :loading="loading" @click="Register('registerForm')" >注册</el-button>
              <el-button @click="resetForm('registerForm')" style="margin-right: -5%">重置</el-button>
            </el-form-item>
          </el-form>
        </el-row>
        <!-- 登录页面链接 -->
        <div class="link">
        <el-button type="text" @click="mylogin = true">已有账号?去登录</el-button>
      </div>
      </div>
    </div>
</template>

<script>
    export default {
    name: "Register",
    props:['loginshow'],
    data() {
      // 检查密码
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.registerForm.checkPass !== '') {
            this.$refs.registerForm.validateField('checkPass');
          }
          callback();
        }
      };
      // 确认密码验证
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.registerForm.pass) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        // 注册完成和跳转登录标志
        mylogin: false,
        loading:false,
        // 表单数据
        registerForm: {
          username: '', // 用户名
          pass: '', // 密码
          checkPass: '',  // 检查密码
        },
        // 验证规则
        rules: {
          // 用户名验证规则
          username: [
          {required: true,message: '账号不能为空', trigger: 'blur'},
          { max: 20, message: '账号长度最长20位', trigger: 'blur' }
        ],
        // 密码验证规则
        pass: [
          { required: true, validator: validatePass, trigger: 'blur' },
          { min: 6, message: '密码长度最少为6位', trigger: 'blur' },
          {max:16,message:'密码长度不能超过16位',trigger:'blur'}
        ],
        // 检查密码验证规则
        checkPass: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ],
        },
      };
    },
    // 页面初始化
     mounted() {
    },
    // 方法定义
    methods: {
      // 注册
      Register(formName) {
        // 表单验证通过，可进行操作
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true;
            this.$axios.post('/api/useract',{
              trantype:'register',  //操作类型
              username:this.registerForm.username,  //用户名
              password:this.$md5(this.registerForm.pass)  //密码md5加密
            })
            .then((response)=>{
              let code=response.data.respcode;//返回状态码
              let msg=response.data.respmsg;//返回信息
              if(code === "000000"){ //注册成功
                  this.$message.success(msg);
                  this.loading = false;
                  this.mylogin = true;
              }
              else{   //注册失败
                this.$message.error(msg);
                this.loading = false;
              }
            })
            .catch((error) => {
                this.$message.error('请求异常');
                this.loading = false;
            });
          } else {   //表单验证失败，返回false
            this.$message.error('注册信息有误！');
            return false;
          }
        });
      },
      // 表单重置
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
    },
    watch:{
      mylogin:{
        handler(val){
          this.$emit('update:loginshow',val);
        },
        deep:true,
      },
      loginshow:{
        handler(val){
          this.mylogin=this.loginshow;
        },
        deep:true,
        immediate:true,
      },
    },
}
</script>

<style scoped>
  /* 注册页面样式 */
  .register{
    position: relative;
  }
  /* 标题样式 */
  .title {
    font-size: large;
    font-weight: bolder;
    text-align: center;
    color:black;
  }
  /* 注册表单区域样式 */
  .main-register {
    text-align: center;
    border-radius: 5px;  /*圆角边框*/
  }
  /* el-form标签样式 */
  .el-form {
    text-align: center;
    padding-top: 5%;
    padding-left: 5%;
    padding-right: 2.5%;
    width:280px;
  }
  /* el-form-item标签样式 */
  .el-form-item{
    margin-left: -10%;
  }
  /* el-row标签样式 */
  .el-row {
    height: 100%;
    width: 100%;
  }
  /* link标签样式 */
  .link{
    text-align: center;
    margin-right: 15px;
  }
  /* el-link标签样式 */
  .el-link{
    margin-left: 8px;
    line-height: 20px;
    font-size: 8px;
  }

</style>
