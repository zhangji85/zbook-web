<template>
    <div class="File-upload">
      <el-upload
        class="upload-demo"
        ref="upload"
        action=""
        :http-request="uploadFile"
        accept=".docx,.txt"
        :limit="1"
        :on-exceed="handleExceed"
        :before-upload="beforeAvatarUpload"
        :before-remove="beforeRemove"
        :on-remove="handleRemove"
        :file-list="myfilelist"
        :auto-upload="true">
        <el-button slot="trigger" type="text"><i class="el-icon-upload2"></i>上传文档</el-button>
      </el-upload>
    </div>
</template>

<script>
    export default {
        name: "upload",
          props:{
            filelist:{
                type:Array,
                default(){[]},
            },
            username:{
                type: String,
                default:'',
            }
          },
        data(){
            return{
              myfilelist:[], //上传附件列表

              uid: '',
              checksum: '',
            }
        },
        created() {
        },
        methods:{
            handleExceed(files, fileList) {
              this.$message.warning("上传文件格式不正确!");
             },
            //覆盖默认的上传行为，自定义上传
            uploadFile(params){
                var file=params.file,
                    fileName=file.name;
                var reader = new FileReader();//新建一个FileReader
                //读取文件 readAsDataURL(file)	:data:url的字符串形式; readAsText(file,encoding):base64; readAsBinaryString(file):二进制串;readAsArrayBuffer(file):ArrayBuffer对象
                reader.readAsBinaryString(file);
                reader.onload = (evt)=> { //读取完文件之后会回来这里
                  var fileString = evt.target.result;
                  this.doUpload(params,fileString,fileName);
                }
            },
            doUpload(params,file,fileName){
                var trantype='file_upload';
                let data={trantype: trantype,username:this.username,file:file,filename:fileName};
                this.$axios.request({
                  method:'post',
                  url:"/api/filecfg",
                  data:data,
                  onUploadProgress: progressEvent => {
                    let percent=(progressEvent.loaded / progressEvent.total * 100) | 0
                    //调用onProgress方法来显示进度条，需要传递个对象 percent为进度值
                    params.onProgress({percent:percent})
                  }
                })
                .then((response) => {
                  var code = response.data.respcode;//返回状态码
                  var msg = response.data.respmsg;//返回信息
                  //状态码'000000'表示请求成功，正常返回状态
                  if (code == "000000") {
                      params.onSuccess();
                      this.$message.success(msg);
                      this.myfilelist = [];
                      this.$emit('getfilelist')
                      // this.myfilelist.push({'name':params.file.name})
                  } else {
                      params.onError();
                      this.$message.error(msg);
                  }
                })
                .catch((error) => {
                    params.onError();
                    this.$message.error('请求异常');
                });
            },
            beforeAvatarUpload(file) {
                const isLt20M = file.size / 1024 / 1024 < 20;
                if (!isLt20M) {
                    this.$message.error('上传文件大小不能超过 20MB!');
                }
                return isLt20M;
            },
            //移除前的操作
            beforeRemove(file, fileList) {
                console.log('myfilelist1=',typeof this.myfilelist)
                return ;
            },
            //移除后的操作
            handleRemove(file, fileList) {
                this.myfilelist = fileList;
            },
        },
        watch:{
            myfilelist:{
                handler(val){
                    this.$emit('update:filelist',val);
                },
                deep:true,
            },
            filelist:{
                handler(val){
                    this.myfilelist = this.filelist;
                },
                deep:true,
                immediate:true
            }
        },
    }
</script>

<style scoped>
</style>
