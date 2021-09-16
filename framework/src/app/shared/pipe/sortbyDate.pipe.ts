import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'sortByDate'
    // providers: [DatePipe]
})

export class SortByDatePipe implements PipeTransform {

    constructor(private datePipe: DatePipe) {}

    transform(items: any[], type: string, fields: any[], dateFormat:string): any[] {
        // if (!items) return [];
        // if (!searchText) return items;

        if (type == 'column') {
            for (let i = 0; i < fields.length; i++) {
                for (let j = 0; j < items.length; j++) {
                    if (fields[i] == items[j].prop) {
                        items[j].sortField = 'sort' + items[j].prop;
                    }
                }
            }
            return items;
        }

        if (type == 'row') {
            for (let i = 0; i < fields.length; i++) {
                let field: string = fields[i];
                for (let j = 0; j < items.length; j++) {
                    if (items[j][field]) {
                        let sortFieldName = 'sort' + field;
                        let dateField:any = this.datePipe.transform(items[j][field], 'MM/dd/yyyy HH:mm:ss');
                        let sortDate: any = new Date(dateField).getTime();
                     
                        items[j][sortFieldName] = sortDate;
                        items[j][field] = this.datePipe.transform(items[j][field], dateFormat);
                    }
                }
            }
          
            return items;
        }

    }
}