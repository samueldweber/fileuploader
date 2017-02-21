import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

import * as JSZip from 'jszip';

@Component({
    selector: 'filesupload',
    templateUrl: 'fileupload.html',
    styleUrls: ['fileupload.css'],
    inputs: ['activeColor', 'baseColor', 'overlayColor']
})
export class FileUploadComponent implements OnInit {

    @Input() userImg: string;
    @Input() cpntID: string;
    @Input() imageID: string;
    @Input() hiddenID: string;
    @Output() onChanged = new EventEmitter<string>();

    activeColor: string = 'red';
    baseColor: string = '#ccc';
    overlayColor: string = 'rgba(255, 255, 255, 0)';
    height: string = '200px';
    files = new Array<File>();
    jszip = new JSZip();
    failed = new Array<String>();

    dragging: boolean = false;
    loaded: boolean = false;
    imageLoaded: boolean = false;
    imageSrc: string = '';
    hiddenFile: string = '';

    /**
     * Constructor
     */
    constructor(
        private el: ElementRef
    ) { }

    ngOnInit() {
        if (this.userImg) {
            this.imageSrc = this.userImg;
            this.imageLoaded = true;
            this.loaded = true;
        }
    }

    handleDragEnter() {
        this.dragging = true;
    }

    handleDragLeave() {
        this.dragging = false;
    }

    handleDrop(e: any) {
        e.preventDefault();
        this.dragging = false;
        this.handleInputChange(e);
    }

    handleImageLoad() {
        this.onChanged.emit(this.imageSrc);
        this.imageLoaded = true;
    }

    handleHiddenChange() {
        this.imageSrc = this.hiddenFile;
        this.onChanged.emit(this.imageSrc);
        this.imageLoaded = true;
    }

    handleInputChange(e: any) {
        try {
            let file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
            
            let patternJpeg = 'image/jpeg';
            let reader = new FileReader();

            if(file.type.match(patternJpeg)) {
                reader.onload = this._handleReaderLoaded.bind(this);
                reader.readAsDataURL(file);
            } else {

            }

            // if(ext === 'xml') {
            //     // handle xml upload
            // } else  (ext === 'zip') {
            //     // handle zip upload
            // } else if (!(file.type.match(patternJpeg))) {
            //     alert('formato inválido');
            //     return;
            // }


            reader.onload = this._handleReaderLoaded.bind(this);
            reader.readAsDataURL(file);
        }
        catch(err) {
            let img = e.dataTransfer.getData('URL');
            if(!img.endsWith('jpeg') && !img.endsWith('jpg')) {
                alert('formato inválido');
                return;
            }
            this.imageSrc = img;
            this.onChanged.emit(this.imageSrc);
            this.loaded = true;
        } 
    }

    _handleReaderLoaded(e: any) {
        let reader = e.target;
        let img = document.createElement("img");
        img.src = reader.result;
        this.imageSrc = this.resize(img);
        this.onChanged.emit(this.imageSrc);
        this.loaded = true;
    }

    resize(img: any) {
        let canvas = document.createElement("canvas");

        let width = img.width;
        let height = img.height;

        width = 50;
        height = 50;

        // width = 100;
        // height = 100;

        canvas.width = width;
        canvas.height = height;

        let ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/jpeg');

        console.log(dataUrl);

        return dataUrl;
    }

    upload(e: any) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = (e: Event) => {
            this.onLoadCallback(e);
        }
        reader.readAsDataURL(file);
    }

    onLoadCallback(e: any) {
        let reader = e.target;
        this.imageSrc = reader.result;
    }

    handleXmlZipLoad(event: any) {
        let fileList: FileList = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        if (fileList.length > 0) {
            for (let i = 0; i < fileList.length; i++) { 
                let file: File = fileList[i];
                
                let c = this.handleExtension(file);

                if (c == 1) {
                    this.files.push(file);
                } else if (c == 2) {
                    this.jszip.loadAsync(file)
                        .then(configZip => {
                            configZip.forEach((filePath: string, file: JSZipObject) => {
                                if (!file.dir) {
                                    let filename = file.name.split('/').pop();
                                    if (!filename.startsWith('.')) {
                                        file.async("blob").then((content: Blob) => {
                                            let f = new File([content], filename);
                                            this.files.push(f);
                                        })
                                    }
                                }
                            })
                        })
                }
                else {
                    this.failed.push(file.name);
                }
                
            }
        }
    }

    handleExtension(file: File): number {
        let name = file.name.toLocaleLowerCase();
        let ext = name.split('.').pop();
        if (ext === 'zip') {
            return 2;
        }

        return 0;
    }

    setStyles() {

    }
}