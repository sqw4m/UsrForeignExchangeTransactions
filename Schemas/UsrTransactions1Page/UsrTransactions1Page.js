define("UsrTransactions1Page", ["ProcessModuleUtilities", "ServiceHelper", "MoneyModule", 
	"MultiCurrencyEdit", "MultiCurrencyEditUtilities", "UsrTransactionConstants", "ConfigurationConstants"],
function(ProcessModuleUtilities, ServiceHelper, MoneyModule, MultiCurrencyEdit, 
	MultiCurrencyEditUtilities, UsrTransactionConstants, ConfigurationConstants) {
	return {
		entitySchemaName: "UsrTransactions",
		attributes: {
			"InputEnabled": {
				"value": false
			},
			"IsTrStateNew":{
				"dataValueType": Terrasoft.DataValueType.BOOLEAN,
				"dependencies": [
					{
						"columns": ["UsrState"],
						"methodName": "isTrStateNew"
					}
				]
			},
			"UsrCurrency": {
				"dataValueType": this.Terrasoft.DataValueType.LOOKUP,
				"lookupListConfig": {
					"columns": ["Division", "Symbol"]
				}
			},
			"UsrCurrencyRate": {
				"dataValueType": this.Terrasoft.DataValueType.FLOAT,
				"dependencies": [
					{
						"columns": ["UsrCurrency"],
						"methodName": "setCurrencyRate"
					}
				]
			},
			"UsrSum": {
				"dataValueType": this.Terrasoft.DataValueType.FLOAT,
				"dependencies": [
					{
						"columns": ["UsrCurrencyRate", "UsrCurrency"],
						"methodName": "recalculateAmount"
					}
				]
			},
			"UsrPrimaryAmount": {
				"dependencies": [
					{
						"columns": ["UsrSum"],
						"methodName": "recalculatePrimaryAmount"
					}
				]
			},
			"Currency": {
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"dataValueType": this.Terrasoft.DataValueType.LOOKUP,
				"lookupListConfig": {
					"columns": ["Division"]
				},
				"dependencies": [
					{
						"columns": ["Currency"],
						"methodName": "onVirtualCurrencyChange"
					}
				]
			},
			"UsrOwner":{
				"dataValueType": this.Terrasoft.DataValueType.LOOKUP,
				"lookupListConfig": {
					filter: function(){
						var idList = [UsrTransactionConstants.User.UserStatus.SysAdmin,
									UsrTransactionConstants.User.UserStatus.Manager];
						var filterGroup = new Terrasoft.createFilterGroup();
						var filterById = Terrasoft.createColumnInFilterWithParameters(
							"[SysAdminUnit:Contact].[SysUserInRole:SysUser].SysRole.Id", idList);
						filterById.comparisonType = Terrasoft.ComparisonType.EQUAL;
						filterGroup.add("filterById", filterById);
						return filterGroup;
					}
				}
			},
			"IsModelItemsEnabled": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				value: true,
				dependencies: [{
					columns: ["UsrOwner"],
					methodName: "definingEditingRights"
				}]
			}
		},
		modules: /**SCHEMA_MODULES*/{}/**SCHEMA_MODULES*/,
		details: /**SCHEMA_DETAILS*/{
			"VisaDetailV2d79d0eea": {
				"schemaName": "VisaDetailV2",
				"entitySchemaName": "UsrTransactionsVisa",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "UsrTransactions"
				}
			},
			"UsrSchemaTrMessageDetail2": {
				"schemaName": "UsrSchemaTrMessageDetail",
				"entitySchemaName": "UsrTransactionMessages",
				"filter": {
					"detailColumn": "UsrTransaction",
					"masterColumn": "Id"
				}
			},
			"UsrSchemaTrFileDetail2": {
				"schemaName": "UsrSchemaTrFileDetail",
				"entitySchemaName": "UsrTransactionsFile",
				"filter": {
					"detailColumn": "UsrTransactions",
					"masterColumn": "Id"
				}
			}
		}/**SCHEMA_DETAILS*/,
		businessRules: /**SCHEMA_BUSINESS_RULES*/{
			"UsrContact": {
				"425fbc5c-3cb2-4a1c-99d2-75d419d5b743": {
					"uId": "425fbc5c-3cb2-4a1c-99d2-75d419d5b743",
					"enabled": true,
					"removed": false,
					"ruleType": 1,
					"baseAttributePatch": "Account",
					"comparisonType": 3,
					"autoClean": true,
					"autocomplete": true,
					"type": 1,
					"attribute": "UsrAccount"
				}
			},
			"UsrComment": {
				"da62653b-5d38-4b99-9cfe-a0fae76e4c44": {
					"uId": "da62653b-5d38-4b99-9cfe-a0fae76e4c44",
					"enabled": true,
					"removed": false,
					"ruleType": 0,
					"property": 0,
					"logical": 0,
					"conditions": [
						{
							"comparisonType": 4,
							"leftExpression": {
								"type": 1,
								"attribute": "UsrTransactionDirection"
							},
							"rightExpression": {
								"type": 0,
								"value": "72abc736-0f06-4c3f-8f1b-84a96d3764ae",
								"dataValueType": 10
							}
						}
					]
				}
			}
		}/**SCHEMA_BUSINESS_RULES*/,
		mixins: {
			MultiCurrencyEditUtilities: "Terrasoft.MultiCurrencyEditUtilities"
		},
		methods: {
			init: function(){
				this.callParent(arguments);
				this.mixins.MultiCurrencyEditUtilities.init.call(this);
			},
			onEntityInitialized: function(){
				if(this.isAddMode()){
					this.set("InputEnabled", true);
				}
				
				this.callParent(arguments);
				var ownerId = this.get("UsrOwner").value;
				this.definingEditingRights(ownerId);
				this.isTrStateNew();
			},
			setCurrencyRate: function(){
				let isCurrentDateForRate;
				let date = new Date();
				this.Terrasoft.SysSettings.querySysSettingsItem("UsrCurrentDateForTransactionsRate",
					function(value) {
						isCurrentDateForRate = value;
					}, this);
					
				if(!isCurrentDateForRate)
				{
					date = new Date(this.get("UsrDate"));
				}
				
				MoneyModule.LoadCurrencyRate.call(this, "UsrCurrency", "UsrCurrencyRate", date);
			},
			recalculateAmount: function(){
				var currency = this.get("UsrCurrency");
				var division = currency ? currency.Division : null;
				MoneyModule.RecalcCurrencyValue.call(this, "UsrCurrencyRate", "UsrSum", "UsrPrimaryAmount", division);
			},
			recalculatePrimaryAmount: function() {
				var currency = this.get("UsrCurrency");
				var division = currency ? currency.Division : null;
				MoneyModule.RecalcBaseValue.call(this, "UsrCurrencyRate", "UsrSum", "UsrPrimaryAmount", division);
			},
			onVirtualCurrencyChange: function(){
				var currency = this.get("Currency");
				this.set("UsrCurrency", currency);
			},
			getActions: function(){
				var actionMenuItems = this.callParent(arguments);
				actionMenuItems.addItem(this.getButtonMenuItem({
					Type: "Terrasoft.MenuSeparator",
					Caption: ""
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Caption": {bindTo: "Resources.Strings.CreateTransactionMessage"},
					"Tag": "createTransactionMessage"
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					Type: "Terrasoft.MenuSeparator",
					Caption: ""
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Caption": {bindTo: "Resources.Strings.UpdateExchangeRates"},
					"Tag": "onGetUpdateExchangeRatesClick"
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					Type: "Terrasoft.MenuSeparator",
					Caption: ""
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Caption": {bindTo: "Resources.Strings.ActivateTransaction"},
					"Tag": "onGetActivateTransactionClick",
					"Enabled": { "bindTo": "IsTrStateNew" }
				}));
				return actionMenuItems;
			},
			createTransactionMessage: function(){
				let transactionId = this.get("Id") || this.get("PrimaryColumnValue");
				var contactType;
				let esq = this.Ext.create(Terrasoft.EntitySchemaQuery, {
					rootSchemaName: "UsrTransactions"
				});
				esq.addColumn("UsrContact.Type.Name", "ContactType");
				esq.getEntity(transactionId, function(result){
					if(!result.success){
						this.showInformationDialog("Ошибка запроса данных");
						return;
					}
					contactType = result.entity.get("ContactType");
					if(contactType === "Сотрудник")
					{
						this.showInformationDialog("Контакт данной транзакции является сотрудником нашей компании");
						return;
					}
					else{
						this.createRecordTrMessage(transactionId);
					}
				}, this);
			},
			onGetUpdateExchangeRatesClick: function(){
				ServiceHelper.callService("UsrUpdatingExchangeRatesIntegration", "GetExchangeRates",
					function(response) {
						var status = response && response.status;
						var result = response && response.GetExchangeRatesResult;
						if(!Ext.isEmpty(status)){
							this.showInformationDialog("При актуализации курса валют произошла ошибка");
						}
						else{
							this.showInformationDialog(result);
						}
					}, null, this);
			},
			isTrStateNew: function(){
				var trState = this.get("UsrState").value;
				if(trState === UsrTransactionConstants.Transaction.TransactionStatus.New) {
					this.set("IsTrStateNew", true);
				}
				else{
					this.set("IsTrStateNew", false);
				}
			},
			onGetActivateTransactionClick: function(){
				let transactionId = this.get("Id") || this.get("PrimaryColumnValue");
				this.changeTrStatus(transactionId);
				this.createRecordTrMessage(transactionId);
				this.reloadEntity();
			},
			changeTrStatus: function(trId){
				var update = Ext.create("Terrasoft.UpdateQuery", {
					rootSchemaName: "UsrTransactions"
				});
				update.setParameterValue("UsrState", UsrTransactionConstants.Transaction.TransactionStatus.Active, 
					Terrasoft.DataValueType.LOOKUP);
				var trFilter = update.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "Id", trId);
				update.filters.add("TrFilter", trFilter);
				update.execute(function(result){},
				this);
			},
			createRecordTrMessage: function(trId){
				var arguments = {
					sysProcessName: "UsrCreateTransactionMessage",
					parameters: {
						TransactionId: trId
				},
				scope: this
				};
				ProcessModuleUtilities.executeProcess(arguments);
				this.updateDetails();
			},
			definingEditingRights: function(ownerId){
				var currentUserId = Terrasoft.SysValue.CURRENT_USER.value;
				var sysAdmins = ConfigurationConstants.SysAdminUnit.Id.SysAdministrators;
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SysUserInRole" });
				esq.addColumn("SysUser");
				esq.addColumn("SysRole");
				esq.filters.add("SysUser", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "SysUser", currentUserId));
				esq.filters.add("SysRole", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "SysRole", sysAdmins));
				esq.getEntityCollection(function(response) {
					if(response && response.success) {
						var result = response.collection;
						if(result.collection.length !== 0){
							this.set("IsModelItemsEnabled", true);
						}
						else {
							this.isOwner(ownerId);
						}
					}
				}, this);
			},
			isOwner: function(ownerId){
				var currentUserId = Terrasoft.SysValue.CURRENT_USER.value;
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SysAdminUnit" });
				esq.addColumn("Contact");
				esq.getEntity(currentUserId, function(result) {
					if(result.success) {
						var contactId = result.entity.get("Contact").value;
						this.set("IsModelItemsEnabled", contactId === ownerId);
					}
				}, this);
			},
			/*
			isModelItemEnabled: function(fieldName) {
				var isManager = this.isManager();
				if (fieldName === "UsrOwner") {
					if(isManager){
						return true;
					}
				}
				return this.callParent(arguments);
			},
			isManager: function(){
				var currentUserId = Terrasoft.SysValue.CURRENT_USER.value;
				var manager = UsrTransactionConstants.User.UserStatus.Manager;
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SysUserInRole" });
				esq.addColumn("SysUser");
				esq.addColumn("SysRole");
				esq.filters.add("SysUser", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "SysUser", currentUserId));
				esq.filters.add("SysRole", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "SysRole", manager));
				esq.getEntityCollection(function(response) {
					if(response && response.success) {
						var result = response.collection;
						if(result.collection.length > 0){
							return true;
						}
						else{
							return false;
						}
					}
				}, this);
			},
			*/
			getDisableExclusionsColumnTags: function(){
				return ["UsrOwner", "UsrSum"];
			}
		},
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "CardContentWrapper",
				"values": {
					"generator": "DisableControlsGenerator.generatePartial"
				}
			},
			{
				"operation": "insert",
				"name": "UsrName",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrName",
					"enabled": {
						"bindTo": "InputEnabled"
					}
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrContact",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrContact",
					"enabled": true,
					"contentType": 5
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "UsrAccount",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 2,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrAccount",
					"enabled": true,
					"contentType": 5
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "UsrOwner",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 3,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrOwner",
					"enabled": true
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "UsrNumber",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 4,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrNumber",
					"enabled": false
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "UsrTransactionType",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "Header"
					},
					"bindTo": "UsrTransactionType",
					"enabled": false,
					"contentType": 3
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrClosingDate",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 0,
						"layoutName": "Header"
					},
					"bindTo": "UsrClosingDate",
					"enabled": false
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "UsrSum",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "Header"
					},
					"bindTo": "UsrSum",
					"primaryAmount": "UsrPrimaryAmount",
					"currency": "UsrCurrency",
					"rate": "UsrCurrencyRate",
					"primaryAmountEnabled": false,
					"generator": "MultiCurrencyEditViewGenerator.generate"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "UsrCurrency",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 1,
						"layoutName": "Header"
					},
					"bindTo": "UsrCurrency"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "UsrDate",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 2,
						"layoutName": "Header"
					},
					"bindTo": "UsrDate"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "UsrTransactionDirection",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 2,
						"layoutName": "Header"
					},
					"bindTo": "UsrTransactionDirection"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 5
			},
			{
				"operation": "insert",
				"name": "UsrMailingDate",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 3,
						"layoutName": "Header"
					},
					"bindTo": "UsrMailingDate"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 6
			},
			{
				"operation": "insert",
				"name": "UsrState",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 12,
						"row": 3,
						"layoutName": "Header"
					},
					"bindTo": "UsrState"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 7
			},
			{
				"operation": "insert",
				"name": "UsrComment",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 3,
						"column": 0,
						"row": 4,
						"layoutName": "Header"
					},
					"bindTo": "UsrComment",
					"enabled": true,
					"contentType": 0
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 8
			},
			{
				"operation": "insert",
				"name": "NotesAndFilesTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.NotesAndFilesTabCaption"
					},
					"items": [],
					"order": 0
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrSchemaTrMessageDetail2",
				"values": {
					"itemType": 2,
					"markerValue": "added-detail"
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrSchemaTrFileDetail2",
				"values": {
					"itemType": 2,
					"markerValue": "added-detail"
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "merge",
				"name": "ESNTab",
				"values": {
					"order": 2
				}
			},
			{
				"operation": "insert",
				"name": "Tabc8c157e9TabLabel",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.TabVisaCaption"
					},
					"items": [],
					"order": 1
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "VisaDetailV2d79d0eea",
				"values": {
					"itemType": 2,
					"markerValue": "added-detail"
				},
				"parentName": "Tabc8c157e9TabLabel",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "TrsNotesControlGroup",
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"items": [],
					"caption": {"bindTo": "Resources.Strings.NotesGroupCaption"}
				}
			},
			{
				"operation": "insert",
				"parentName": "TrsNotesControlGroup",
				"propertyName": "items",
				"name": "UsrNotes",
				"values": {
					"contentType": Terrasoft.ContentType.RICH_TEXT,
					"layout": {"column": 0, "row": 0, "colSpan": 24},
					"labelConfig": {
						"visible": false
					},
					"controlConfig": {
						"imageLoaded": {
							"bindTo": "insertImagesToNotes"
						},
						"images": {
							"bindTo": "NotesImagesCollection"
						}
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
