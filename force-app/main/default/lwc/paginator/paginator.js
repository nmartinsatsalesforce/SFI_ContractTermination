import { LightningElement, api, track} from 'lwc';

const DELAY = 300;
const recordsPerPage = [5,10,25,50,100];
const pageNumber = 1;
const showIt = 'visibility:visible';
const hideIt = 'visibility:hidden'; //visibility keeps the component space, but display:none doesn't

export default class Paginator extends LightningElement {

    @api namespace = "vlocity" + "_cmt";
    @api showSearchBox = false; //Show/hide search box; valid values are true/false
    @api showPagination; //Show/hide pagination; valid values are true/false
    @api pageSizeOptions = recordsPerPage; //Page size options; valid values are array of integers
    @api totalRecords; //Total no.of records; valid type is Integer 

    @track pageSize; //No.of records to be displayed per page
    @track totalPages; //Total no.of pages
    @track pageNumber = pageNumber; //Page number
    @track searchKey; //Search Input
    @track controlPagination = showIt;
    @track controlPrevious = hideIt; //Controls the visibility of Previous page button
    @track controlNext = showIt; //Controls the visibility of Next page button
    @track recordsToDisplay = []; //Records to be displayed on the page
    @track _records;

    @api
    set records(data) {
        if(data) {
            this._records = data;
            this.reloadComponent();
        }
    }

    get records() {
        return this._records;
    }

    @api
    reloadComponent() {
        this.connectedCallback();
    }

    //Called after the component finishes inserting to DOM
    connectedCallback() {
        console.log('paginator');
        if(this.pageSizeOptions && this.pageSizeOptions.length > 0){
            console.log('paginatorIF');
            this.pageSize = this.pageSizeOptions[0];
        }
        else{
            console.log('paginatorELSe');
            this.pageSize = this.totalRecords;
            this.showPagination = false;
        }
        this.controlPagination = this.showPagination === false ? hideIt : showIt;
        this.setRecordsToDisplay();
    }

    handleRecordsPerPage(event){
        this.pageSize = event.target.value;
        this.setRecordsToDisplay();
    }

    handlePageNumberChange(event){
        if(event.keyCode === 13){
            this.pageNumber = event.target.value;
            this.setRecordsToDisplay();
        }
    }

    previousPage(){
        this.pageNumber = this.pageNumber-1;
        this.setRecordsToDisplay();
    }

    nextPage(){
        this.pageNumber = this.pageNumber+1;
        this.setRecordsToDisplay();
    }

    @api
    setRecordsToDisplay() {
        console.log('recordsToDisplaystart');
        this.recordsToDisplay = [];
        if(!this.pageSize)
            this.pageSize = this.totalRecords;

        this.totalPages = Math.ceil(this.totalRecords/this.pageSize);

        this.setPaginationControls();
        console.log('this.records '+JSON.stringify(this.records));

        if(this.records && this.records.length>0){
            for(let i=(this.pageNumber-1)*this.pageSize; i < this.pageNumber*this.pageSize; i++){
                if(i === this.totalRecords) break;
                console.log('Total-records==> ', this.totalRecords);
                this.recordsToDisplay.push(this.records[i]);
            }
        }
        console.log('recordsToDisplay ', JSON.stringify(this.recordsToDisplay));

        this.dispatchEvent(new CustomEvent('paginatorchange', {detail: this.recordsToDisplay})); //Send records to display on table to the parent component
    }

    setPaginationControls() {
        //Control Pre/Next buttons visibility by Total pages
        if(this.totalPages === 1){
            this.controlPrevious = hideIt;
            this.controlNext = hideIt;
        }else if(this.totalPages > 1){
            this.controlPrevious = showIt;
            this.controlNext = showIt;
        }
        //Control Pre/Next buttons visibility by Page number
        if(this.pageNumber <= 1){
            this.pageNumber = 1;
            this.controlPrevious = hideIt;
        }else if(this.pageNumber >= this.totalPages){
            this.pageNumber = this.totalPages;
            this.controlNext = hideIt;
        }
        //Control Pre/Next buttons visibility by Pagination visibility
        if(this.controlPagination === hideIt){
            this.controlPrevious = hideIt;
            this.controlNext = hideIt;
        }
    }
    handleKeyChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        if(searchKey){
            this.delayTimeout = setTimeout(() => {
                this.controlPagination = hideIt;
                this.setPaginationControls();

                this.searchKey = searchKey;
                //Use other field name here in place of 'Name' field if you want to search by other field
                //this.recordsToDisplay = this.records.filter(rec => rec.includes(searchKey));
                //Search with any column value (Updated as per the feedback)
                this.recordsToDisplay = this.records.filter(rec => JSON.stringify(rec).includes(searchKey));
                if(Array.isArray(this.recordsToDisplay) && this.recordsToDisplay.length > 0)
                    this.dispatchEvent(new CustomEvent('paginatorchange', {detail: this.recordsToDisplay})); //Send records to display on table to the parent component
            }, DELAY);
        }else{
            this.controlPagination = showIt;
            this.setRecordsToDisplay();
        }
    }
}