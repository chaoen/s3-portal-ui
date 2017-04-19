import { element } from 'angular';
import totalSize from '../../../utils/totalSize';
import FileUploadController from './upload.controller';
import FileUploadTemplate from './upload.html';
import aws from 'aws-sdk';

export default class FileUploadService {
  /** @ngInject */
  constructor(Config, Upload, $mdDialog, $file, $transfer, $cookies) {
    Object.assign(this, {
      Config, Upload, $mdDialog, $file, $transfer, $cookies
    });
    this.initState();
    aws.config.update({
       "accessKeyId": this.$cookies.get('accessKeyId'), 
       "secretAccessKey": this.$cookies.get('secretAccessKey'),
       "endpoint": "http://10.26.1.3:7480"
    });
    // console.log(aws.S3.upload());
  }

  initState() {
    this.state = {
      files: [],
      size: 0,
    };
  }

  select(selectedFiles) {
    selectedFiles.map((index, elem) => {
      this.state.files.forEach((oldData) => {
        if (oldData.detail.name == index.name) {
          this.delete(oldData.id);
        }
      })
    });

    const additionalFiles = selectedFiles.filter(selectedFile =>
      this.state.files.every(({ detail }) => detail.name !== selectedFile.name)
    ).map(detail => ({
      id: Symbol('unique id'), detail,
    }));
    const files = [...this.state.files, ...additionalFiles];
    const size = totalSize(files);

    this.state = { files, size };
  }

  delete(id) {
    const files = this.state.files.filter(file => file.id !== id);
    const size = totalSize(files);

    this.state = { files, size };
  }

  upload() {
    const { bucket, prefix } = this.$file.state.paths;
    const url = `${this.Config.API_URL}/v1/file/create`;

    this.state.uploading = true;
    this.$transfer.put(this.state.files.map(({
      id, detail,
    }) => ({
      id,
      bucket,
      name: detail.name,
      type: 'UPLOAD',
      status: 'UPLOADING',
      upload: this.uploadFile(id, {
        bucket, prefix, file: detail,
      }, url),
    })));

    this.closeDialog();
  }

  uploadFile(id, data, url) {
    const s3 = new aws.S3();
    const params = {Bucket: data.bucket, Key: data.file.name, Body: data.file};
    const options = {partSize: 10 * 1024 * 1024, queueSize: 1};
    s3.upload(params, options, function(err, data) {
      res => this.$transfer.handleSuccess(id, res),
      err => this.$transfer.handleFailure(id, err),
      evt => this.$transfer.handleEvent(id, evt)
    })
    this.$file.getFiles();
    
    // s3upload.then(
    //   res => this.$transfer.handleSuccess(id, res),
    //   err => this.$transfer.handleFailure(id, err),
    //   evt => this.$transfer.handleEvent(id, evt)
    // );

    return true;
  }

  createDialog($event) {
    this.$mdDialog.show({
      controller: FileUploadController,
      controllerAs: 'upload',
      template: FileUploadTemplate,
      parent: element(document.body),
      targetEvent: $event,
      clickOutsideToClose: true,
      onRemoving: () => {
        this.initState();
      }
    });
  }

  closeDialog() {
    this.$mdDialog.cancel();
    this.initState();
  }
}
