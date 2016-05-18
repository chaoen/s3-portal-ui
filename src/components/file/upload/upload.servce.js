import { element } from 'angular';
import FileUploadController from './upload.controller';
import FileUploadTemplate from './upload.html';

export default class FileUploadService {
  /** @ngInject */
  constructor(Config, Upload, $mdDialog, $file, $toast) {
    Object.assign(this, {
      Config, Upload, $mdDialog, $file, $toast,
    });

    this.initState();
  }

  initState() {
    this.state = {
      files: [],
      size: 0,
      uploadingFiles: [],
    };
  }

  select(selectFiles) {
    const filterFiles = selectFiles.filter(selectFile =>
      this.state.files.every(file => file.name !== selectFile.name)
    );
    const files = this.state.files.concat(filterFiles);
    const size = this.size(files);
    this.state = { ...this.state, files, size };
  }

  delete(name) {
    const files = this.state.files.filter(file => file.name !== name);
    const size = this.size(files);

    this.state = { ...this.state, files, size };
  }

  isUploading() {
    return !! this.state.uploadingFiles.length;
  }

  abort() {
    this.state.uploadingFiles.forEach(file => file.abort());
    this.state.uploadingFiles = [];
  }

  upload() {
    const { bucket, folders } = this.$file.paths;
    const prefix = folders.length ? '' : `${folders.join('/')}/`;
    const url = `${this.Config.API_URL}/v1/file/create`;

    this.state.files.forEach(file =>
      this.uploadFile(url, { bucket, prefix, file })
    );

    this.closeDialog();
  }

  size(files) {
    return files.reduce((previous, current) => previous + current.size, 0);
  }

  uploadFile = (url, data) => {
    const { name } = data.file;
    const upload = this.Upload.upload({ url, data });
    this.state.uploadingFiles.push(upload);

    upload.then(
      () => this.handleUploadSuccess(name),
      () => this.handleUploadFailure(name),
      this.handleEvent
    );
  }

  handleEvent = evt => {
    console.log(evt);
  }

  handleUploadSuccess(name) {
    this.removeUploadingFile(name);
    this.$file.getFiles();
    this.$toast.show(`${name} is uploaded successfully!`);
  }

  handleUploadFailure(name) {
    this.removeUploadingFile(name);
    this.$toast.show(`${name} is uploaded failure!`);
  }

  removeUploadingFile(name) {
    this.state.uploadingFiles.filter(uploadingFile =>
      uploadingFile.name !== name
    );
  }

  createDialog($event) {
    this.$mdDialog.show({
      controller: FileUploadController,
      controllerAs: 'upload',
      template: FileUploadTemplate,
      parent: element(document.body),
      targetEvent: $event,
      clickOutsideToClose: true,
    });
  }

  closeDialog() {
    this.$mdDialog.cancel();
    this.state.files = [];
    this.state.size = 0;
  }
}