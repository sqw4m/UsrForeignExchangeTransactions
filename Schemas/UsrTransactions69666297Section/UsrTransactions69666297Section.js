define("UsrTransactions69666297Section", ["RightUtilities", "ProcessModuleUtilities", "ServiceHelper",
	"MaskHelper", "UsrTransactionConstants", "ConfigurationConstants"],
	function(RightUtilities, ProcessModuleUtilities, ServiceHelper, MaskHelper,
	UsrTransactionConstants, ConfigurationConstants) {
	return {
		entitySchemaName: "UsrTransactions",
		attributes: {
			"CanDeleteTrs": {
				"value": true
			},
			"IsTrStateNew":{
				"dataValueType": Terrasoft.DataValueType.BOOLEAN,
				"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"value": false
			}
		},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		methods: {
			init: function(){
				this.callParent(arguments);
				this.canDeleteRecords();
			},
			onClosingTransactionsClick: function() {
				var arguments = {
					sysProcessName: "UsrClosingTransactions"
				};
				
				ProcessModuleUtilities.executeProcess(arguments);
			},
			isAfterTrheeOclock: function(){
				var date = new Date();
				
				return date.getHours() > 15;
			},
			btcTransactionFilterReport: function() {
				var serializationFilters = this.serializeFilterGroup(this.getFilters());
				this.saveXlsxReport(serializationFilters);
			},
			btcTransactionDataFilterReport: function(){
				Terrasoft.showInputBox("Выберите дату: ", function(buttonCode, arg){
					if(buttonCode === "ok"){
						var date = arg.name.value;
						var esq = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "UsrTransactions"});
						var filterGroup = Terrasoft.createFilterGroup();
						filterGroup.addItem(esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.GREATER, "UsrDate", date));
						var serializationFilters = this.serializeFilterGroup(filterGroup);
						this.saveXlsxReport(serializationFilters);
					}
				}, ["ok", "cancel"], this, {
					name: {
						dataValueType: Terrasoft.DataValueType.DATE,
						
					}
				});
			},
			serializeFilterGroup: function(filterGroup){
				var sectionFilters = filterGroup;
				var serializationInfo = sectionFilters.getDefSerializationInfo();
				serializationInfo.serializeFilterManagerInfo = true;
				return sectionFilters.serialize(serializationInfo);
			},
			saveXlsxReport: function(serializationFilters){
				var serviceData = {
					filter: serializationFilters
				};
				var serviceName = "UsrTrReportPrint";
				ServiceHelper.callService(serviceName, "PrintExcelReport",
					function(response) {
						MaskHelper.HideBodyMask();
						var result = response.PrintExcelReportResult;
						var link = document.createElement("a");
						link.setAttribute("download", "ImpactReport");
						link.style.display = "none";
						document.body.appendChild(link);
						link.setAttribute("href", "../rest/ReportService/GetReportFile/" + result);
						link.click();
						document.body.removeChild(link);
						MaskHelper.HideBodyMask();
					}, serviceData, this);
			},
			getSectionActions: function(){
				var actionMenuItems = this.callParent(arguments);
				actionMenuItems.addItem(this.getButtonMenuItem({
					Type: "Terrasoft.MenuSeparator",
					Caption: ""
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Caption": {bindTo: "Resources.Strings.TransactionsReportFilterPrint"},
					"Click": {bindTo: "btcTransactionFilterReport"},
					"Enabled": true
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Caption": {bindTo: "Resources.Strings.TransactionsReportDataFilterPrint"},
					"Click": {bindTo: "btcTransactionDataFilterReport"},
					"Enabled": true
				}));
				return actionMenuItems;
			},
			isNewTr: function(activeRowId) {
				activeRowId = this.get("ActiveRow");
				var gridData = this.get("GridData");
				var selectedTransaction = gridData.get(activeRowId);
				var selectedTrStatus = selectedTransaction.get("UsrState");
				return selectedTrStatus.value === UsrTransactionConstants.Transaction.TransactionStatus.New;
			},
			canDeleteRecords: function(){
				RightUtilities.checkCanExecuteOperation({
					operation: "CanDeleteTransactions"
				}, function(result) {
					this.set("CanDeleteTrs", result);
				}, this);
			},
			
			onGetActivateTransactionClick: function(){
				this.sandbox.publish("OnCardAction", "onGetActivateTransactionClick", [this.getCardModuleSandboxId()]);
			},
			getGridDataColumns: function(){
				var baseGridDataColumns = this.callParent(arguments);
				var gridDataColumns = {
					"UsrState": {path: "UsrState"}
				};
				return Ext.apply(baseGridDataColumns, gridDataColumns);
			},
			onCardRendered: function(){
				this.callParent();
				var gridData = this.get("GridData");
				var activeRow = this.get("ActiveRow");
				if(activeRow){
					this.checkTrState(activeRow, this);
				}
				else {
					var historyState = this.sandbox.publish("GetHistoryState");
					var hash = historyState.hash;
					if(hash && hash.valuePairs)
					{
						activeRow = hash.valuePairs[0].name;
						this.set("ActiveRow", activeRow);
						var self = this;
						gridData.on("dataloaded", function() {
							self.checkTrState(activeRow, self);
						});
					}
				}
				gridData.on("itemchanged", function(){
					this.checkTrState(activeRow, this);
				}, this);
			},
			checkTrState: function(activeRow, context){
				if(context.isTrStateNew(activeRow)){
					context.set("IsTrStateNew", true);
				}
				else{
					context.set("IsTrStateNew", false);
				}
			},
			isTrStateNew: function(id){
				var activeRow = this.get("GridData").get(id);
				var trState = activeRow.get("UsrState");
				return trState.value === UsrTransactionConstants.Transaction.TransactionStatus.New;
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "ActionButtonsContainer",
				"propertyName": "items",
				"name": "ClosingTransactionsSectionButton",
				"values": {
					itemType: Terrasoft.ViewItemType.BUTTON,
					caption: { bindTo: "Resources.Strings.ClosingTransactionsButtonCaption" },
					click: { bindTo: "onClosingTransactionsClick" },
					enabled: { bindTo: "isAfterTrheeOclock" },
					"style": "green",
					"layout": {
						"column": 1,
						"row": 6,
						"colSpan": 1
					}
				}
			},
			{
				"operation": "merge",
				"name": "DataGridActiveRowDeleteAction",
				"parentName": "DataGrid",
				"propertyName": "activeRowActions",
				"values": {
					"className": "Terrasoft.Button",
					"style": Terrasoft.controls.ButtonEnums.style.GREY,
					"caption": {"bindTo": "Resources.Strings.DeleteRecordGridRowButtonCaption"},
					"tag": "delete",
					"visible": { "bindTo": "canDeleteRecords" }
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
