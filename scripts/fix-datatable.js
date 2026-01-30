const fs = require('fs');

const filePath = 'c:/Users/pc/Documents/nodeJsProject/views/record/record-demo-datatable.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Find </tbody></table> and add closing divs + pagination after it
content = content.replace(
    /<\/tbody><\/table>/g,
    `</tbody></table>`
);

// Find the first occurrence of </table> followed by content and wrap with proper closing + pagination
// Look for </table></div></div> pattern and add pagination before the last </div>
content = content.replace(
    /<\/table><\/div>(\s*)<div class="dataTable-bottom/g,
    '</table></div>$1<div class="dataTable-bottom'
);

// If no pagination exists, add it after the table container closes
if (!content.includes('dataTable-bottom')) {
    content = content.replace(
        /<\/table><\/div><\/div>/,
        `</table></div>
                        <div class="dataTable-bottom mt-4 pt-4 border-t dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                            <div class="dataTable-info text-sm text-gray-500 dark:text-gray-400">Showing 1 to 10 of 25 entries</div>
                            <nav class="dataTable-pagination">
                                <ul class="inline-flex items-center gap-1">
                                    <li><button class="flex justify-center items-center w-8 h-8 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50" disabled>«</button></li>
                                    <li><button class="flex justify-center items-center w-8 h-8 rounded-full transition bg-primary text-white">1</button></li>
                                    <li><button class="flex justify-center items-center w-8 h-8 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary">2</button></li>
                                    <li><button class="flex justify-center items-center w-8 h-8 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary">3</button></li>
                                    <li><button class="flex justify-center items-center w-8 h-8 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary">»</button></li>
                                </ul>
                            </nav>
                        </div>
                    </div></div>`
    );
}

fs.writeFileSync(filePath, content);
console.log('Pagination added inside panel!');
