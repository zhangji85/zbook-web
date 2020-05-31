<template>
  <div class="main">
    <div class="body">
      <el-row :gutter="20" class="row1">
        <el-col :span="24" style="text-align: left">
          <el-cascader size="small" :show-all-levels="false" clearable placeholder="我的文档"
                       v-model="file"
                       :options="options">
            <template slot-scope="{ node, data }">
              <span>{{ data.label }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
          <el-button type="primary" size="small" @click="getanswer" :disabled="handflag" :loading="loading" style="margin-left: 1rem">提交问题</el-button>
          <el-button size="small" @click="clearall" :disabled="loading">清空</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="row2">
        <el-col :span="12">
          <el-input
            type="textarea"
            :rows="rownum"
            clearable
            class="textarea-left"
            maxlength="200"
            placeholder="请输入问题"
            show-word-limit
            v-model="question">111
          </el-input>
        </el-col>
        <el-col :span="12" v-loading="loading"
            element-loading-text="拼命寻找答案中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(235, 238, 245, 0.2)">
          <el-input
            type="textarea"
            :rows="rownum"
            readonly
            class="textarea-right"
            maxlength="200"
            v-model="answer">
          </el-input>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="row3">
        <el-col :span="leftnum" style="text-align: left">
          <el-tooltip content="目前仅支持word、txt格式,且大小不超过20M" placement="bottom" effect="light">
            <upload :filelist.sync="filelist" @getfilelist="getfilelist" :username="username"></upload>
          </el-tooltip>
        </el-col>
        <el-col :span="24-leftnum" style="text-align: right">
          <el-button type="text" v-show="answer!=='' && this.ansindex>0" @click="lastanswer">查看上一个</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" v-show="answer!=='' && this.ansindex<this.answerlist.length-1" @click="nextanswer">不满意?下一个</el-button>
        </el-col>
      </el-row>
      <el-divider></el-divider>
      <div class="hisbox">
        <el-row :gutter="20">
          <el-col :span="18" class="histext"><i class="el-icon-time"></i>
            <span>历史记录</span>
          </el-col>
          <el-col :span="4" style="text-align: right;">
            <el-button type="text" @click="clearhistags">清空</el-button>
          </el-col>
        </el-row>
        <div class="tag-box">
          <el-tag
            class="tag-item"
            v-for="(tag,index) in histags"
            :key="index"
            closable
            @close="handleClose(tag)"
            @click="getanswerlist(tag.name)"
            :type="tag.type"
            v-show="histags.length!==0">
            {{tag.name}}
          </el-tag>
          <span v-show="histags.length===0" style="color: #C0C4CC;font-size: 14px;width: 100%;">暂无历史记录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import upload from "./upload";
    export default {
        name: "zreader",
        props:['username'],
        components:{
          upload
        },
        data(){
            return{
              filelist:[],
              rownum:6,
              leftnum:12,
              handflag:true,
              loading:false,
              options: [],
              file:[],
              question:'',
              answer:'',
              ansindex:0,
              answerlist:[],
              storagekeys:[],
              histags: [],
            }
        },
        mounted(){
        },
        methods:{
          clearall(){
            this.question = '';
            this.answer = '';
          },
          // 获取文档列表
          getfilelist(){
            this.file = [];
            this.options = [];
            this.$axios.post('/api/readact',{
              trantype:'getfilelist',  //操作类型
              username:this.username,  //用户名
            })
            .then((response)=>{
              let code=response.data.respcode;//返回状态码
              let msg=response.data.respmsg;//返回信息
              if (code === "000000") {  //登录成功，并提示
                var data = response.data['fileoptions'];
                this.options = data;
                // this.options = this.clearchildren(data)
              }
              else {
                this.$message.error(msg);
              }
            })
            .catch((error) => {
                this.$message.error('请求异常');
            });
          },
          clearchildren(data){
            for(var i=0;i<data.length;i++){
                  if(data[i]['children']!==undefined){
                      if(!data[i]['children'].length){
                          data[i]['children']= null;
                          data.splice(i,1)
                      }
                      else{
                          this.clearchildren(data[i]['children'])
                      }
                  }
              }
            return data;
          },
          // 获取问题答案
          getanswer(){
            this.answer = '';
            this.loading = true;
            this.handflag = true;
            this.ansindex = 0;
            this.$axios.post('/api/readact',{
              trantype:'create_answer',  //操作类型
              question:this.question,  //问题
              filelist:this.file,
            },{timeout:300000})
            .then((response)=>{
              let code=response.data.respcode;//返回状态码
              let msg=response.data.respmsg;//返回信息
              if (code === "000000") {
                  this.answerlist = response.data['answerlist'];
                  this.answer = this.answerlist[this.ansindex]['answer'];
                  this.storagekeys.push(this.question);
                  this.$removeLocalStorage((this.username+'keys').toString());
                  this.$setObjectLocalStorage((this.username+'keys').toString(),this.storagekeys);
                  this.$setObjectLocalStorage(this.question,this.answerlist);
                  this.getstorage();
                  this.loading = false;
                  this.handflag = false;
              }
              else {
                this.$message.error(msg);
                this.loading = false;
                this.handflag = false;
              }
            })
            .catch((error) => {
                this.$message.error('请求异常');
                this.loading = false;
                this.handflag = false;
            });
          },
          // 下一个答案
          nextanswer(){
            if(this.ansindex<this.answerlist.length-1){
                this.ansindex = this.ansindex + 1;
                this.answer = this.answerlist[this.ansindex]['answer']
            }else {
                this.ansindex = this.answerlist.length-1;
                this.answer = this.answerlist[this.ansindex]['answer']
            }
          },
          // 上一个答案
          lastanswer(){
            if(this.ansindex>0){
                this.ansindex = this.ansindex - 1;
                this.answer = this.answerlist[this.ansindex]['answer']
            }else {
                this.ansindex = 0;
                this.answer = this.answerlist[this.ansindex]['answer']
            }
          },
          // 获取用户缓存的问题
          getstorage(){
            if(this.$getObjectLocalStorage((this.username+'keys').toString())){
                var keys = this.$getObjectLocalStorage((this.username+'keys').toString());
                this.histags = [];
                this.storagekeys = [];
                for(var i=0;i<keys.length;i++){
                    this.histags.push({'name': keys[i], 'type': 'info' })
                    this.storagekeys.push(keys[i]);
                }
            }
          },
          // 点击标签获取答案列表
          getanswerlist(key){
              if(this.$getObjectLocalStorage(key)){
                  var list = this.$getObjectLocalStorage(key)
                  this.answerlist = [];
                  this.answer = '';
                  this.ansindex = 0;
                  this.question = key;
                  this.answerlist = list;
                  this.lastanswer();
              }
          },
          // 删除标签，清除对应缓存
          handleClose(tag) {
            var index = this.histags.indexOf(tag);
            this.histags.splice(index, 1);
            var count = 0;
            for(var i=0;i<this.storagekeys.length;i++){
                if(this.storagekeys[i]===tag.name){
                    count = count + 1;
                }
            }
            this.storagekeys.splice(index,1);
            if(this.storagekeys.length===0){
                this.$removeLocalStorage((this.username+'keys').toString());
            }else {
                this.$setObjectLocalStorage((this.username+'keys').toString(),this.storagekeys);
            }
            if(count<=1){
                this.$removeLocalStorage(tag.name)
            }
          },
          // 清空历史记录
          clearhistags(){
            for(var i=0;i<this.storagekeys.length;i++){
              this.$removeLocalStorage(this.storagekeys[i])
            }
            this.$removeLocalStorage((this.username+'keys').toString());
          }
        },
        watch:{
            question:{
              handler(val){
                  if(this.question==='' || this.question===undefined || this.file.length===0){
                      this.leftnum = 12;
                      this.handflag = true;
                  } else {
                      this.handflag = false;
                      this.leftnum = 0;
                  }

              },
              deep:true
            },
            file:{
              handler(val){
                  if(this.question==='' || this.question===undefined || this.file.length===0){
                      this.handflag = true;
                  } else {
                      this.handflag = false;
                      this.leftnum = 0;
                  }

              },
              deep:true
            },
            username:{
              handler(val){
                if(this.username==='' || this.username===undefined){
                    this.file = [];
                    this.options = [];
                }
                else {
                    this.getfilelist();
                    this.getstorage();
                }
              },
              deep:true,
              immediate:true,
            },
        }
    }
</script>

<style scoped>
  .main{
    width: 100%;
    height: 100%;
    padding-top: 1rem;
  }
  .body{
    width: 80%;
    margin-left: 10%;
    min-height: 100%;
    /*margin-top: 1%;*/
    /*background-color: #DCDFE6;*/
  }
  .row1{
    position: static;
    /*background-color: red;*/
    padding-top: 10px;
  }
  .row2{
    margin-top: 1rem;
  }
  .row3{
    margin-top: 0.1rem;
  }
  .hisbox{
    width: 100%;
    min-height: 150px;
    background-color: #EBEEF5;
  }
  .histext{
    margin-top: 1rem;
    margin-left:1rem;
    text-align: left;
    font-size: 0.9rem;
  }
  .tag-box{
    overflow: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .tag-item{
    margin-left: 1rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
</style>
<style>
  .textarea-left .el-textarea__inner{
    resize: none;
  }
  .textarea-right .el-textarea__inner{
    resize: none;
    background-color: #EBEEF5;
  }
</style>
