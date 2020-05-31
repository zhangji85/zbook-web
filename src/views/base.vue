<template>
  <div class="main">
    <el-container>
      <el-header>
        <div class="logo">
          <img src="/static/images/logo.png" class="logoImg">
          <span style="color: #303133">ZBOOK</span>
          <span style="font-size: 13px;margin-left: 5px;color: #606266">——智能交互阅读平台</span>
        </div>
        <div style="float: right;margin-right: 50px;line-height: 60px;">
          <!-- 未登录时显示 -->
          <template v-if="!showname">
            <el-button type="primary" plain size="small" @click="login">登录</el-button>
            <el-button plain size="small" @click="register">注册</el-button>
          </template>
          <!-- 登录时显示 -->
          <template v-else>
            <!-- 登录成功，显示用户名 -->
            <el-dropdown trigger="click" @command="handleCommand">
              <span class="el-dropdown-link">
                {{username}}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <!-- 退出登录 -->
              <el-dropdown-menu slot="dropdown" size="small">
                <el-dropdown-item command="a">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </div>
      </el-header>
      <el-main style="padding: 0">
        <zreader :username.sync="username"></zreader>
        <el-dialog :visible.sync="dialogshow" width="30%" center>
          <login :loginshow.sync="loginshow" :dialogshow.sync="dialogshow" @state="state" v-if="loginshow"></login>
          <register :loginshow.sync="loginshow" v-else></register>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>
<script>
  import Login from "./Login";
  import Register from "./Register";
  import zreader from "./zreader";
  export default {
    name:'Base',
    components:{
      Login,
      Register,
      zreader
    },
    data(){
      return {
        showname: false, //登录，注册按钮的显示状态
        username:'',  //用户名
        loginshow:true,
        dialogshow:false,
      }
    },
    methods:{
      //检查登录是否过期
      logincheck(){
        this.$axios.post('/api/useract',{
          trantype:'logincheck',
        })
        .then((response)=>{
            let code=response.data.respcode;//返回状态码
            let msg=response.data.respmsg;//返回信息
            if (code === "000000") {
              sessionStorage.setItem('username',response.data.username)
              this.state()  // 调用state方法
            }
            else {
              this.$message.warning(msg);
            }
          })
        .catch((error) => {
              this.$message.error('请求异常');
        });
      },
      //判断session中是否存在数据，存在将showname置为true，否则false
      state(){
        if(sessionStorage.getItem('username')!=null){
          this.username = sessionStorage.getItem('username');
          this.showname=true;
        }
        else {
          this.username = '';
          this.showname = false
        }
      },
      //下拉菜单操作
      handleCommand(command){
        if(command==='a'){
          this.exit();
        }
      },
      //登出
      exit(){
        this.$axios.post('/api/useract',{
            trantype:'exit',  // 操作类型
            username:sessionStorage.getItem('username')  //获取session中的用户名
          })
        .then((response)=>{
            let code=response.data.respcode;//返回状态码
            let msg=response.data.respmsg;//返回信息
            if (code === "000000") {
              sessionStorage.clear()  //登出成功，清空session
              this.state()  // 调用state方法
              this.$message.success(msg);
            }
            else {
              this.$message.error(msg);
            }
          })
        .catch((error) => {
              this.$message.error('请求异常');
        });
      },
      // 打开登录窗口
      login(){
          this.loginshow = true;
          this.dialogshow = true;
      },
      // 打开登录窗口
      register(){
          this.loginshow = false;
          this.dialogshow = true;
      }
    },
    created(){
      this.logincheck()
    },
    // 页面初始化
    mounted(){
      // this.logincheck();
    },
  }
</script>
<style scoped>
  .main{
    position: absolute;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
  }
  .main::-webkit-scrollbar{
    display: none;
  }
  /* logo图片样式 */
  .logoImg{
    width: 30px;
    margin-bottom: 5px;
    vertical-align: middle;
  }
  /* logo框样式 */
  .logo{
    height: 60px;
    display: inline-block;
    line-height: 60px;
    font-size: 20px;
    position: absolute;
    left: 100px;
    color: #303133;
    cursor: pointer;
  }
  .el-header{
    border-bottom: 2px solid #409EFF;
    background-color: white;
  }
   .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .demonstration {
    display: block;
    color: #8492a6;
    font-size: 14px;
    margin-bottom: 20px;
  }
</style>
