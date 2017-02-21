import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FileDropDirective } from './filedrop.directive';
import { UploaderWithFileComponent } from './uploaderwithfile.component';
import { UploaderWithoutFileComponent } from './uploaderwithoutfile.component';
import * as JSZip from 'jszip';

@Component({
    selector: 'uploader',
    templateUrl: 'uploader.html',
    styleUrls: ['uploader.css']
})
export class UploaderComponent {

    @Input() type: string;
    @Input() userImg: string;
    @Input() cpntID: string;
    @Input() accepted: string;
    @Input() maxSize: number = 0;
    @Input() looks: any;
    @Input() multiple: boolean = true;
    @Output() results: EventEmitter<any> = new EventEmitter();
    @Output() fail: EventEmitter<any> = new EventEmitter();

    dragging: boolean = false;
    public files: File[] = [];
    public imgSrc: string = '';
    public jszip = new JSZip();
    failed = new Array<String>();
    hasFile: boolean = false;
    protected myElement: ElementRef;

    @ViewChild("input") input: ElementRef;

    /**
     * Constructor
     */
    constructor(element: ElementRef) {
        this.myElement = element;
    }

    handleFileOver(event: any) {
        this.dragging = event;
    }

    handleFileLoad(files: any) {
        console.log(files);
        this.dragging = false;
        if (files.length > 0) {

            

            if (this.type === 'image') {
                let file = files[0];
                this.handleImageLoad(file);
            } else if (this.type === 'invoice') {
                this.handleInvoiceLoad(files);
            } else {
                if(this.multiple) {

                } else {
                    this.loadSingle(files[0]);
                }
            }
        }
    }

    loadFiles(event: any) {

        let fileList: File[] = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        console.log(fileList);
        this.handleFileLoad(fileList);
    }

    onChange(event: any) {
        console.log(event);
        this.loadFiles(event);
        this.input.nativeElement.value = '';
    }

    addFiles(): void {
        this.input.nativeElement.click();
    }

    handleImageLoad(file: any) {
        let reader = new FileReader();
        if (file.type.match('image/jpeg')) {
            reader.onload = this._handleReaderLoaded.bind(this);
            reader.readAsDataURL(file);
            this.files.push(file);
        } else {
            alert('Formato Inválido!');
            return;
        }
    }

    loadSingle(file: any) {
        if(this.maxSize !== null && this.maxSize > 0) {
            if(file.size > this.maxSize) {
                return;
            }
        }
        this.files = [];
        this.files.push(file);
    }

    loadMultiple(files: any) {
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {

                let file: File = files[i];
                
                if(this.maxSize !== null && this.maxSize > 0) {
                    if(file.size > this.maxSize) {
                        this.failed.push(file.name);
                        continue;
                    }
                }
                this.files.push(file);
            }
        }
    }

    cleanFiles() {
        this.input.nativeElement.value = '';
    }

    handleInvoiceLoad(files: any) {
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                
                let file: File = files[i];

                if(this.maxSize !== null && this.maxSize > 0) {
                    if(file.size > this.maxSize) {
                        this.failed.push(file.name);
                        continue;
                    }
                }

                if (this.handleExtension(file) == 0) {
                    this.files.push(file);
                } else if (this.handleExtension(file) == 2) {
                    this.jszip.loadAsync(file)
                        .then((configZip: any) => {
                            configZip.forEach((filePath: string, file: JSZipObject) => {
                                if (!file.dir) {
                                    let filename: string = file.name.split('/').pop();
                                    if ((filename.indexOf('.') !== 0)) {
                                        file.async("blob").then((content: Blob) => {
                                            let f = new File([content], filename);
                                            this.files.push(f);
                                        });
                                    }
                                }
                            });
                        });
                } else {
                    this.failed.push(file.name);
                }
            }
            if (this.files.length > 0) {
                this.results.emit(this.files);
            }
            if (this.failed.length > 0) {
                let str = 'Arquivos inválidos: ';
                while (this.failed.length > 0) {
                    str += this.failed.pop();
                    if (this.failed.length > 0) {
                        str += ', ';
                    }
                }
                alert(str);
            }
        }
    }

    private handleExtension(file: File): number {
        let name = file.name.toLowerCase();
        let ext = name.split('.').pop();
        if (ext === 'zip') {
            return 1;
        }
        return 0;
    }

    _handleReaderLoaded(e: any) {
        let reader = e.target;
        let img = document.createElement("img");
        img.src = reader.result;
        this.imgSrc = this.resize(img);
        this.results.emit(this.imgSrc);
    }

    resize(img: any) {
        let canvas = document.createElement("canvas");

        canvas.width = 100;
        canvas.height = 100;

        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 100, 100);

        let dataUrl = canvas.toDataURL('image/jpeg');

        return dataUrl;
    }

    setStyles() {
        return this.looks;
    }

}