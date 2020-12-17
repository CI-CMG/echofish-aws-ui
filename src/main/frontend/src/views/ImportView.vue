<template>
  <form enctype="multipart/form-data">

    <div class="upload">
      <h1>Upload Cruise File</h1>
<!--      <file-upload-->
<!--        ref="upload"-->
<!--        v-model="files"-->
<!--        post-action="/zuul/upload-service/api/v1/wcad"-->
<!--        @input-file="inputFile"-->
<!--        chunk-enabled-->
<!--        :chunk="{-->
<!--      action: '/zuul/upload-service/api/v1/wcad',-->
<!--      minSize: 0,-->
<!--      maxActive: 3,-->
<!--      maxRetries: 5,-->

<!--      // Example in the case your backend also needs the user id to operate-->
<!--      // startBody: {-->
<!--      //   user_id: user.id-->
<!--      // }-->
<!--    }"-->
<!--      >-->
<!--        Upload file-->
<!--      </file-upload>-->
<!--      <button v-show="!$refs.upload || !$refs.upload.active" @click.prevent="$refs.upload.active = true" type="button">Start upload</button>-->
<!--      <button v-show="$refs.upload && $refs.upload.active" @click.prevent="$refs.upload.active = false" type="button">Stop upload</button>-->
      <label>File
        <input type="file" ref="file" :disabled="uploading" @change="addFile()"/>
      </label>
      <p v-if="uploading">Uploading...</p>
      <button v-else @click="submitFile()">Submit</button>
    </div>

  </form>
</template>

<script>
// import VueUploadComponent from 'vue-upload-component';

export default {
  // data() {
  //   return {
  //     files: [],
  //   };
  // },
  // components: {
  //   FileUpload: VueUploadComponent,
  // },
  // methods: {
  //   inputFile(newFile, oldFile) {
  //     if (newFile && oldFile && !newFile.active && oldFile.active) {
  //       // Get response data
  //       console.log('response', newFile.response);
  //       if (newFile.xhr) {
  //         //  Get the response status code
  //         console.log('status', newFile.xhr.status);
  //       }
  //     }
  //   },
  //   inputFilter(newFile, oldFile, prevent) {
  //     if (newFile && !oldFile) {
  //       // Filter non-image file
  //       if (!/\.(jpeg|jpe|jpg|gif|png|webp)$/i.test(newFile.name)) {
  //         return prevent();
  //       }
  //     }
  //
  //     // Create a blob field
  //     newFile.blob = '';
  //     const URL = window.URL || window.webkitURL;
  //     if (URL && URL.createObjectURL) {
  //       newFile.blob = URL.createObjectURL(newFile.file);
  //     }
  //     return undefined;
  //   },
  // },
  computed: {
    uploading() {
      return this.$store.state.importView.uploading;
    },
  },
  methods: {
    addFile() {
      this.$store.dispatch('importView/addFile', this.$refs.file.files[0]);
    },
    submitFile() {
      this.$store.dispatch('importView/uploadFile');
    },
  },
};
</script>

<style scoped>

  .upload {
    color: white;
  }

</style>
