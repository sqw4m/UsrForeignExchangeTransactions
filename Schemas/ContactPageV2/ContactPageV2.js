define("ContactPageV2", ["ConfigurationConstants", "DuplicatesSearchUtilitiesV2", "UsrDeduplicationConstants"], 
	function(ConfigurationConstants, DuplicatesSearchUtilitiesV2, UsrDeduplicationConstants){
	return	{
		entitySchemaName: "Contact",
		mixins: {
			DuplicatesSearchUtilitiesV2: "Terrasoft.DuplicatesSearchUtilitiesV2"
		},
		methods:{
			onEntityInitialized: function(){
				this.callParent(arguments);
				this.getSum();
			},
			setValidationConfig: function(){
				this.callParent(arguments);
				this.addColumnValidator("UsrIDCard", this.idCardValidator);
			},
			idCardValidator: function(value){
				var invalidMessage = "";
				var isValid = true;
				var idCard = value || this.get("UsrIDCard");
				isValid = (Ext.isEmpty(idCard) || 
					new RegExp("^\\A\[0-9]{3}B\[0-9]{4}$").test(idCard));
				if(!isValid){
					invalidMessage = this.get("Resources.Strings.InvalidIDCardFormat");
				}
				return {
					invalidMessage: invalidMessage
				};
			},
			getSum: function(){
				var esq = this.Ext.create(Terrasoft.EntitySchemaQuery, {
					rootSchemaName: "UsrTransactions"
				});
				var contactId = this.get("Id");
				esq.addAggregationSchemaColumn("UsrSum", Terrasoft.AggregationType.SUM, 
					"TransactionsAmount", Terrasoft.AggregationEvalType.ALL);
				var esqFilter = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "UsrContact", contactId);
				esq.filters.add("esqFilter", esqFilter);
				
				esq.getEntityCollection(function(result){
					if(!result.success){
						this.showInformationDialog("Ошибка запроса данных");
						return;
					}
					result.collection.each(function(item){
						this.$UsrTransactionAmount = item.get("TransactionsAmount");
					}, this);
				}, this);
			},
			onContactInfoClick: function(){
				var contactSurname = this.get("Name");
				var contactAge = this.get("Age");
				this.showInformationDialog("ФИО: " + contactSurname + 
					"\r\nВозраст: " + (contactAge > 0 ? contactAge : "не указан"));
			},
			getDataForFindDuplicatesService: function() {
				var communication = this.getCommunications() || [];
				var email = this.get("Email");
				if (!this.Ext.isEmpty(email)) {
					communication.push({
						"Number": email,
						"CommunicationTypeId": ConfigurationConstants.CommunicationTypes.Email
					});
				}
				var data = {
					schemaName: this.entitySchemaName,
					request: {
						Id: this.get("Id"),
						Name: this.get("Name"),
						UsrIDCard: this.get("UsrIDCard"),
						AlternativeName: this.get("AlternativeName"),
						Communication: communication
					}
				};
				return data;
			},
			getDuplicatesServiceName: function() {
				if (this.getIsFindDuplicatesOnSaveEnable()) {
					return UsrDeduplicationConstants.serviceName;
				}
				return "UsrDeduplicationService";
			},
			getFindDuplicatesServiceMethodName: function() {
				if (this.getIsFindDuplicatesOnSaveEnable()) {
					return UsrDeduplicationConstants.findDuplicatesMethodName;
				}
				return this.getFindDuplicatesMethodName();
			}
		},
		modules: /**SCHEMA_MODULES*/{}/**SCHEMA_MODULES*/,
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		businessRules: /**SCHEMA_BUSINESS_RULES*/{}/**SCHEMA_BUSINESS_RULES*/,
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"name": "IdCardNumber",
				"values": {
					"bindTo": "UsrIDCard",
					"layout": {
						"column": 0,
						"row": 6,
						"colSpan": 24
					}
				}
			},
			{
				"operation": "insert",
				"name": "ContactInfoButton",
				"values": {
					"itemType": 5,
					"caption": {
						"bindTo": "Resources.Strings.ContactInfoButtonCaption"
					},
					"click": {
						"bindTo": "onContactInfoClick"
					},
					"style": "green",
					"enabled": true,
					"layout": {
						"column": 1,
						"row": 6,
						"colSpan": 1
					}
				},
				"parentName": "LeftContainer",
				"propertyName": "items",
				"index": 7
			},
			{
				"operation": "insert",
				"name": "UsrTransactionAmount",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 3,
						"layoutName": "ContactGeneralInfoBlock"
					},
					"bindTo": "UsrTransactionAmount"
				},
				"parentName": "ContactGeneralInfoBlock",
				"propertyName": "items",
				"index": 6
			},
			{
				"operation": "insert",
				"name": "UsrSendingTransactions",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 14,
						"row": 3,
						"layoutName": "ContactGeneralInfoBlock"
					},
					"bindTo": "UsrSendingTransactions"
				},
				"parentName": "ContactGeneralInfoBlock",
				"propertyName": "items",
				"index": 7
			}
		]/**SCHEMA_DIFF*/
	};
});