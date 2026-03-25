const fs = require('fs');
const filePath = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Find the problematic part
const findText = '<div class="tp-create-option" @click.stop="msCreateOption(columns[<%= ci %>])">';
const startIndex = content.indexOf(findText);

if (startIndex === -1) {
    console.log('Target not found');
    process.exit(1);
}

// Search backwards from startIndex to find where to insert the template start
const searchBack = content.lastIndexOf('</template>', startIndex);
// No, let's just replace from startIndex up to the next </template>... garbage

const endText = '</span>\n                                                                                                 </div>\n                                                                                             </template>\n                                                                                         </div>\n                                                                                     </div>\n                                                                                 </template>';
// Wait, the number of spaces might be wrong. Let's find by unique tags.

const nextSpan = content.indexOf('<span class="tp-create-tag"', startIndex);
const nextClosingDiv = content.indexOf('</div>', nextSpan);
const nextClosingTemplate = content.indexOf('</template>', nextClosingDiv);

// Everything from the start of the marker to the last </template> in that block
const pre = content.substring(0, startIndex);
// We need to count 3 </template> if we are messed up? 
// No, the view_file showed 3 </template> at 2028, 2032, 2036.

const postStart = content.indexOf('<!-- History Toggle -->'); // Something safe after that block
if (postStart === -1) {
    console.log('History Toggle not found');
    // search for something else
}

const newBlock = `
                                                                    <!-- + Créer -->
                                                                    <template x-if="(msDropdown.query || '').trim() && !(columns[<%= ci %>].config?.options || []).some(o => o.label.toLowerCase() === (msDropdown.query || '').trim().toLowerCase())">
                                                                        <div class="tp-create-option" @click.stop="msCreateOption(columns[<%= ci %>])">
                                                                            <iconify-icon icon="tabler:plus" width="14" style="color:#6b7280;"></iconify-icon>
                                                                            <span class="tp-create-label">Créer</span>
                                                                            <span class="tp-create-tag" x-text="msDropdown.query"></span>
                                                                        </div>
                                                                    </template>
                                                                </div>
                                                            </div>
                                                        </template>
                                                    </div>
                                                </template>
                                            </div>
`;

// Find the actual end of that nested mess
// It ends with 3 template closers usually.
// Let's just replace up to 20 lines.
let post = content.substring(content.indexOf('</span>', nextSpan) + '</span>'.length);
// Remove any leading closing div/template garbage
post = post.replace(/^\s*(<\/div>|\s*<\/template>|\s*<\/div>|\s*<\/div>|\s*<\/template>)+/s, '');

fs.writeFileSync(filePath, pre + newBlock + post);
console.log('Successfully fixed create-option template');
