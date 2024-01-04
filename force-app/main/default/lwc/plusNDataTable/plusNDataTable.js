import { LightningElement, api, track } from 'lwc';
import { OmniscriptBaseMixin } from 'vlocity_cmt/omniscriptBaseMixin';

export default class plusNDataTable extends OmniscriptBaseMixin(LightningElement) {

    @api namespace = "vlocity" + "_cmt";

    @api keyField;
    @api showRowNumberColumn = false;
    @api sortedBy;
    @api sortedDirection = "desc";
    @api hideCheckboxColumn = false;
    @api suppressBottomBar = false;
    @api hidePagination = false;
    @api tableHeader;

    // DataRaptor to handle inline editing
    @api updateDataraptor;
    @api _rows =[];
    changefunction(event){
        this._rows = event.target.value;
    }

    @api _columns =[];

    //pagination changes
    @track error;

    @track showTable = false; //Used to render table after we get the data from apex controller
    @track recordsToDisplay = []; //Records to be displayed on the page
    @track rowNumberOffset; //Row number\
    @track callPaginator = false;

    //Capture the event fired from the paginator component
    handlePaginatorChange(event){
        this.recordsToDisplay = event.detail;
        //this.rowNumberOffset = this.recordsToDisplay[0].rowNumber-1;
        // es change
        //if(this.recordsToDisplay.length > 0) {
            this.rowNumberOffset = this.recordsToDisplay[0].rowNumber-1;
        //}
        console.log('rowNumberOffset+ ....' +this.rowNumberOffset);
    }

    //SobjectType
    @api _sobjectType;
    @api
    get sobjectType() { return this._sobjectType; }
    set sobjectType(data) {

        if(typeof data != 'string'){
            data = JSON.stringify(data);
        }
        if (data) {
            try {
                this._sobjectType = data;
            } catch (err) {
                this.error = err;
                console.error("Error in demo_datatable.sobjectType() -> " + err);
            }
        }
    }


    //Rows
    @api
    get rows() { return this._rows; }
    set rows(data) {
        try {

            if(typeof data != 'string'){
                data = JSON.stringify(data);
            }
            console.log('data ####+ ....==' + data);
            if(data!='{'+this._sobjectType+'}' && data!=null  && data!='null'){

                if(data) {
                    let checkArray = JSON.parse(data);
                    console.log('checkArray..+=' + checkArray);
                    var parsedData =[];
                    if(Array.isArray(checkArray)){
                        parsedData = checkArray;
                    }else{
                        parsedData[0] = checkArray;
                    }
                    if (parsedData) {
                        
                        if(!this.keyField || (this.keyField && parsedData.length>0 && parsedData[0][this.keyField])){
                            
                            let recs = [];
                            let varStr = "";

                            for(let i=0; i<parsedData.length; i++){
                                if(varStr.includes("##"+parsedData[i][this.keyField]+"##")==false){
                                    varStr=varStr+"##"+parsedData[i][this.keyField]+"##";
                                    parsedData[i].rowNumber = ''+(i+1);
                                    if(parsedData[i].RecordId != undefined && parsedData[i].RecordId!=null){
                                        parsedData[i].RecordId = '/'+ parsedData[i].RecordId;
                                    }
                                    recs.push(parsedData[i]);
                                }
                            }
                            //alert('ABC');
                            console.log('data+ ....' + recs);
                            console.log('data length+ ....' + recs.length);
                            if(this.hidePagination){
                                this.recordsToDisplay = Array.from(recs);
                                this.callPaginator=false;
                            }else{
                                this._rows = Array.from(recs); 
                                this.callPaginator=true;
                            }
                            this.showTable = true;
                            this.error='';

                        }else{
                            this.error = 'Keine Datensätze zum Anzeigen.';
                            this.showTable = true;
                            // es change
                            //this._rows = [];
                            this.recordsToDisplay = undefined;
                        }
                        
                    }


                }else{
                    this.error = 'Keine Datensätze zum Anzeigen.';
                    this.showTable = true;
                    this.recordsToDisplay = undefined;
                    // es change
                    //this._rows = [];
                }
            }else{
                console.log('error empty data==',data);
                this.error = 'Keine Datensätze zum Anzeigen.';
                this.showTable = true;
                this.recordsToDisplay = undefined;
                // es change
                //this._rows = [];
            }
        } catch (err) {
            this.error = err;
            this._rows =[];
            this.recordsToDisplay = undefined;
            this.showTable = true;
            console.error("Error in demo_datatable.handleSort() -> " + err);
        }
    }

    //Columns
    @api
    get customcolumns() { return this._columns; }
    set customcolumns(data) {

        if(typeof data != 'string'){
            data = JSON.stringify(data);
        }
        if (data) {
            try {
                this._columns = JSON.parse(data);
            } catch (err) {
                this.error = err;
                console.error("Error in demo_datatable.customcolumns() -> " + err);
            }
        }
    }

    // Max Row Selection
    @api
    get maxRowSelection() { return this._maxRowSelection; }
    set maxRowSelection(data) {

        if (data) {

            this._maxRowSelection = data;

            // Hide the checkbox column if row selection is set to 0
            if (this._maxRowSelection < 1) this.hideCheckboxColumn = true;
            else this.hideCheckboxColumn = false;
        }
    }

    connectedCallback(){
        console.log('rows===',this.rows);
        console.log('customcolumns===',this.customcolumns);
        console.log('keyField===',this.keyField);
        console.log('maxRowSelection===',this.maxRowSelection);
        console.log('showRowNumberColumn===',this.showRowNumberColumn);
        console.log('sortedBy===',this.sortedBy);
        console.log('sortedDirection===',this.sortedDirection);

        //Sujith added below lines for WPBCIMSA-1 :- nullifying the selected values
		let SelectOpenCase = {};
        let SelectBillingAccount = {};
        super.omniUpdateDataJson(SelectOpenCase);
        super.omniUpdateDataJson(SelectBillingAccount);
        
    }
    @track _maxRowSelection = 1000;

    /**
     * Sorts the rows by the selected column and sort direction
     *
     * @param fieldName      The field name by which to sort the data
     * @param sortDirection  The sort direction
     *
     * @return The sorted rows
     */
    sortData(fieldName, sortDirection) {

        if (this.debug) console.log("Sorting by " + fieldName + " in " + sortDirection + "ending direction");

        // Create a new array to sort
        let sortedData = JSON.parse(JSON.stringify(this._rows));

        // Sort it
        sortedData.sort(function (a, b) {


            // Sort Ascending
            if (sortDirection === "asc") {

                // undefined values always appear first in an ascending sort
                if (a[fieldName] === undefined && b[fieldName] !== undefined) return -1;
                else if (a[fieldName] !== undefined && b[fieldName] === undefined) return 1;
                else if (a[fieldName] > b[fieldName]) return 1;
                else if (a[fieldName] < b[fieldName]) return -1;
                else return 0;
            }
            // Sort Descending
            else {

                // undefined values always appear last in a decending sort
                if (a[fieldName] === undefined && b[fieldName] !== undefined) return 1;
                else if (a[fieldName] !== undefined && b[fieldName] === undefined) return -1;
                else if (a[fieldName] > b[fieldName]) return -1;
                else if (a[fieldName] < b[fieldName]) return 1;
                else return 0;
            }
        });

        return sortedData;
    }

    /**
     * Handle sorting events
     *
     * @param {*} event
     */
    handleSort(event) {

        try {
            
            var fieldName = event.detail.fieldName;
            var sortDirection = event.detail.sortDirection;

            // sort the rows
            this.sortedBy = fieldName;
            this.sortedDirection = sortDirection;
            this._rows = this.sortData(fieldName, sortDirection);
            this.template.querySelector("c-paginator").setRecordsToDisplay();
        }
        catch (err) {
            console.error("Error in demo_datatable.handleSort() -> " + err);
        }
    }

    /**
     * Handles selection/deselection of rows in the table
     *
     * @param {*} event The row selection event
     */
    handleRowSelection(event) {

        try {

            let selections = event.detail.selectedRows;

            if (this.debug) console.log("Row(s) Selected -> " + JSON.stringify(selections));
            super.omniUpdateDataJson(selections);
        }
        catch (err) {
            console.error("Error in demo_datatable.handleRowSelected() -> " + err);
        }
    }

    handlerowchange(event) {

        try {

            let updates = event.detail.draftValues;
            let existingRows = this.hidePagination? this.recordsToDisplay : this._rows;
            
            // Handle multiple updates at once
            for (let i=0; i<updates.length; i++) {

                // Find the row and update accordingly
                for (let x=0; x<existingRows.length; x++) {

                    if (existingRows[x][this.keyField] == updates[i][this.keyField]) {
                        // Found the Row, make the update(s)
                        for (let key in updates[i]) existingRows[x][key] = updates[i][key];
                                                     
                    }
                }
            }

            // Clear the draft values now that we've persisted them
            this.draftValues = [];

            // Make sure any edits are carried over to the OmniScript JSON if the row being edited happens to be selected
            super.omniUpdateDataJson(existingRows);

            if(this.hidePagination){
                
                this.recordsToDisplay = existingRows;
            }else{
                this._rows = existingRows;
            }
            
        }

        catch (err) {
            console.error("Error in demo_datatable.handleSave() -> " + err);
        }
    }


    /**
     * Handles any inline edit.  The event can contain updates for multiple rows,
     * and each row may have multiple updates.
     *
     * @param {*} event The inline edit event
     */
    handleSave(event) {

        try {

            let updates = event.detail.draftValues;

            // Track updates for a call to a DataRaptor
            let drUpdates = [];

            // Handle multiple updates at once
            for (let i=0; i<updates.length; i++) {

                if (this.debug) console.log("Handling Save! -> " + JSON.stringify(updates[i]));

                // Find the row and update accordingly
                for (let x=0; x<this._rows.length; x++) {
                    if (this._rows[x][this.keyField] == updates[i][this.keyField]) {

                        // Found the Row, make the update(s)
                        for (let key in updates[i]) this._rows[x][key] = updates[i][key];

                        // Call the DataRaptor
                        if (this.updateDataraptor) drUpdates.push(this._rows[x]);
                    }
                }
            }

            // Clear the draft values now that we've persisted them
            this.draftValues = [];

            // Call the Update DataRaptor
            this.dataRaptorUpdates(drUpdates);

            // Make sure any edits are carried over to the OmniScript JSON if the row being edited happens to be selected
            super.omniUpdateDataJson(this.template.querySelector('lightning-datatable').getSelectedRows());
        }
        catch (err) {
            console.error("Error in demo_datatable.handleSave() -> " + err);
        }
    }

    /**
     * Calls a DataRaptor to update one or more records
     *
     * @param updates  List of records to update
     */
    dataRaptorUpdates(updates) {

        if (this.updateDataraptor && updates !== undefined && updates.length > 0) {

            // Setup the call
            let inputData  = {
                bundleName: this.updateDataraptor,
                bulkUpload: false,
                ignoreCache: true,
                inputType: "JSON",
                objectList: updates
            };
            let optionData = {
                useQueuableApexRemoting: false
            };

            let request = {
                sClassName: this.namespace + ".DefaultDROmniScriptIntegration",
                sMethodName: "invokeInboundDR",
                input: JSON.stringify(inputData),
                options: JSON.stringify(optionData)
            };
            if (this.debug) {
                console.log("Calling DataRaptor '" + this.updateDataraptor + "' with payload -> " + JSON.stringify(updates));
                //console.log("Raw DataRaptor Request -> " + JSON.stringify(request));
            }

            // Call the DataRaptor
            super.omniRemoteCall(request, true).then(response => {

                if (response.result && response.result.IBDRresp && response.result.IBDRresp.hasErrors) console.error("DataRaptor Error -> " + JSON.stringify(response));
                else if (this.debug) console.log("DataRaptor Response -> " + JSON.stringify(response));

            }).catch(error => {
                console.error("DataRaptor Error -> " + JSON.stringify(error));
            });
        }
    }
}