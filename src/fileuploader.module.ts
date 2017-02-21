import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileDropDirective, UploaderComponent, UploaderWithFileComponent, UploaderWithoutFileComponent } from './components/index';

@NgModule({
    imports: [CommonModule],
    declarations: [FileDropDirective, UploaderComponent, UploaderWithFileComponent, UploaderWithoutFileComponent],
    exports: [FileDropDirective, UploaderComponent, UploaderWithFileComponent, UploaderWithoutFileComponent]
})
export class FileUploaderModule {
}