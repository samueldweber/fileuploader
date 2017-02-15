import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';

@Directive({ selector: '[fileDropDirective]' })
export class FileDropDirective {

    @Input() public drag: boolean;
    @Output() public fileOver: EventEmitter<any> = new EventEmitter();
    @Output() public onFileDrop: EventEmitter<File[]> = new EventEmitter<File[]>();
    @Output() public dropEvent: EventEmitter<any> = new EventEmitter();

    protected myElement: ElementRef;

    /**
     * Constructor
     */
    public constructor(element: ElementRef) {
        this.myElement = element;
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: any): void {
        let files = this._getFiles(event);

        this._preventAndStop(event);
        this.drag = false;
        this.fileOver.emit(false);
        this.onFileDrop.emit(files);
        this.dropEvent.emit(event);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: any): any {
        this._preventAndStop(event);
        this.drag = false;
        this.fileOver.emit(false);
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: any): any {
        this._preventAndStop(event);
        this.drag = true;
        this.fileOver.emit(true);
    }

    protected _getFiles(event: any) {
        return event.dataTransfer ? event.dataTransfer.files : event.target.files;
    }

    protected _preventAndStop(event: any): any {
        event.preventDefault();
        event.stopPropagation();
    }
}