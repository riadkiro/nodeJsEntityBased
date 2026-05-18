const fs = require('fs');
let content = fs.readFileSync('views/record/record-module.ejs', 'utf8');

const targetUpload = `                        if (this.type === 'gallery') {
                            let addedAny = false;
                            for (const f of res.attachments) {
                                if (!this.selectedFiles.includes(f.filename)) {
                                    this.selectedFiles.push(f.filename);
                                    addedAny = true;
                                }
                            }
                            if (addedAny) {
                                await this._persist();
                                this._updateView();
                            }
                        }`;

const replaceUpload = `                        if (this.type === 'gallery') {
                            let newFiles = [...this.selectedFiles];
                            let addedAny = false;
                            for (const f of res.attachments) {
                                if (!newFiles.includes(f.filename)) {
                                    newFiles.push(f.filename);
                                    addedAny = true;
                                }
                            }
                            if (addedAny) {
                                this.selectedFiles = newFiles;
                                await this._persist();
                                this._updateView();
                            }
                        }`;

function replaceCode(str, search, replace) {
    const normStr = str.replace(/\r\n/g, '\n');
    const normSearch = search.replace(/\r\n/g, '\n');
    const normReplace = replace.replace(/\r\n/g, '\n');
    return normStr.split(normSearch).join(normReplace);
}

content = replaceCode(content, targetUpload, replaceUpload);

fs.writeFileSync('views/record/record-module.ejs', content);
console.log('record-module.ejs updated for uploadFiles');
