const fs = require('fs');
let content = fs.readFileSync('views/record/record-module.ejs', 'utf8');

const targetSelect = `            async selectDriveFile(df) {
                this._addFile(df.filename);
                // For gallery: keep modal open so user can pick multiple files
                if (this.type !== 'gallery') {
                    this.showDrivePicker = false;
                }
            },`;

const replaceSelect = `            async selectDriveFile(df) {
                if (this.type === 'gallery') {
                    if (this.selectedFiles.includes(df.filename)) {
                        this.selectedFiles = this.selectedFiles.filter(f => f !== df.filename);
                        this._persist();
                        this._updateView();
                    } else {
                        this.selectedFiles = [...this.selectedFiles, df.filename];
                        this._persist();
                        this._updateView();
                    }
                } else {
                    this.selectedFiles = [df.filename];
                    this._persist();
                    this.closeAndSave();
                }
            },`;

const targetRemove = `            async removeFile(idx) {
                this.selectedFiles.splice(idx, 1);
                await this._persist();
                this._updateView(); // sync read-mode immediately
            },`;

const replaceRemove = `            async removeFile(idx) {
                const newFiles = [...this.selectedFiles];
                newFiles.splice(idx, 1);
                this.selectedFiles = newFiles;
                await this._persist();
                this._updateView(); // sync read-mode immediately
            },`;

const targetAddFile = `            _addFile(filename) {
                if (this.type === 'gallery') {
                    if (!this.selectedFiles.includes(filename)) {
                        this.selectedFiles.push(filename);
                        this._persist();
                        this._updateView(); // sync read-mode immediately
                    }
                } else {
                    this.selectedFiles = [filename];
                    this._persist();
                    this.closeAndSave();
                }
            },`;

const replaceAddFile = `            _addFile(filename) {
                if (this.type === 'gallery') {
                    if (!this.selectedFiles.includes(filename)) {
                        this.selectedFiles = [...this.selectedFiles, filename];
                        this._persist();
                        this._updateView(); // sync read-mode immediately
                    }
                } else {
                    this.selectedFiles = [filename];
                    this._persist();
                    this.closeAndSave();
                }
            },`;

// Normalize line endings to avoid mismatch
function replaceCode(str, search, replace) {
    const normStr = str.replace(/\r\n/g, '\n');
    const normSearch = search.replace(/\r\n/g, '\n');
    const normReplace = replace.replace(/\r\n/g, '\n');
    return normStr.split(normSearch).join(normReplace);
}

content = replaceCode(content, targetSelect, replaceSelect);
content = replaceCode(content, targetRemove, replaceRemove);
content = replaceCode(content, targetAddFile, replaceAddFile);

fs.writeFileSync('views/record/record-module.ejs', content);
console.log('record-module.ejs updated');
