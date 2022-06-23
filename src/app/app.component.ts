import { Component } from "@angular/core";
import OdataProvider from "ag-grid-odata";
import { HttpClient } from "@angular/common/http";
// import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";
// import { MenuModule } from "@ag-grid-enterprise/menu";
// import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";

// @Component({
//   selector: "app-root",
//   templateUrl: "./app.component.html",
//   styleUrls: ["./app.component.css"]
// })
// export class AppComponent {
//   title = "CodeSandbox";
// }

@Component({
  selector: "app-root",
  template: `<ag-grid-angular
    #agGrid
    style="width: 100%; height: 100%;"
    id="myGrid"
    class="ag-theme-alpine"
    [autoGroupColumnDef]="autoGroupColumnDef"
    [rowGroupPanelShow]="onlyWhenGrouping"
    [pivotPanelShow]="always"
    [suppressDragLeaveHidesColumns]="true"
    [suppressMakeColumnVisibleAfterUnGroup]="true"
    [serverSideStoreType]="serverSideStoreType"
    [getChildCount]="getChildCount"
    [sideBar]="true"
    [columnDefs]="columnDefs"
    [defaultColDef]="defaultColDef"
    [rowModelType]="rowModelType"
    [rowData]="rowData"
    (gridReady)="onGridReady($event)"
  ></ag-grid-angular>`
})
export class AppComponent {
  private gridApi;
  private gridColumnApi;

  private columnDefs;
  private defaultColDef;
  private autoGroupColumnDef;
  private serverSideStoreType;
  private getChildCount;
  private rowModelType;
  private rowData: [];

  constructor(private http: HttpClient) {
    this.columnDefs = [
      {
        field: "Id",
        enableRowGroup: true,
        headerName: "Order ID"
      },
      {
        field: "Customer.Name",
        enableRowGroup: true,
        headerName: "Customer"
      },
      {
        field: "Price",
        headerName: "Price",
        enableValue: true,
        filter: "agNumberColumnFilter"
      },
      {
        field: "Amount",
        enableValue: true,
        headerName: "Amount"
      },
      {
        field: "Created",
        headerName: "Created",
        valueGetter: (param) =>
          param.data && param.data.Created
            ? new Date(param.data.Created).toISOString().substring(0, 10)
            : ""
      }
    ];
    this.defaultColDef = {
      sortable: true,
      resizable: true,
      enablePivot: true,
      allowedAggFuncs: ["sum", "min", "max", "avg", "count"],
      filterParams: {
        newRowsAction: "keep",
        browserDatePicker: true
      }
    };
    this.getChildCount = (data) => {
      return data && data.childCount;
    };
    this.autoGroupColumnDef = {
      pinned: "left"
    };
    // this.sideBar = true;
    this.serverSideStoreType = "partial";
    this.rowModelType = "serverSide";
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    params.api.setServerSideDatasource(
      new OdataProvider({
        callApi: (options) =>
          fetch(`https://odatav4sample.herokuapp.com/odata/Orders${options}`, {
            headers: {
              "Content-type": "application/json",
              Accept: "application/json"
            }
          }).then((resp) => resp.json()),
        beforeRequest: (query, provider) => {
          query.expand = ["customer"];
        },
        afterLoadData: (options, rowData, totalCount) => {
          if (options.skip === 0 && rowData.length > 0) {
            params.api.columnController.autoSizeAllColumns();
          }
        }
      })
    );
  }
}
