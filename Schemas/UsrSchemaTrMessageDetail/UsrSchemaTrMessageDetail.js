define("UsrSchemaTrMessageDetail", [], function() {
	return {
		entitySchemaName: "UsrTransactionMessages",
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "Detail",
				"propertyName": "tools",
				"name": "newEdit",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.EditMenuCaption"},
					"click": {"bindTo": "editRecord"},
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"enabled": {bindTo: "getEditRecordButtonEnabled"},
					"visible": {"bindTo": "IsEnabled"}
				}
			},
			]/**SCHEMA_DIFF*/,
		methods: {
			addToolsButtonMenuItems: function(toolsButtonMenu){
				this.callParent(arguments);
				var tbm = this.get("ToolsButtonMenu");
				tbm.addItem(this.getButtonMenuSeparator());
				tbm.addItem(this.getButtonMenuItem({
					"Caption": {bindTo: "Resources.Strings.CreateXlsxReport"},
					"Click": {"bindTo": "exportToExcel"}
				}));
				
				var delIndex = -1;
				tbm.each(function(item, index){
					if(item.values.Caption.bindTo === "Resources.Strings.EditMenuCaption"){
						delIndex = index;
					}
				}, this);
				if(delIndex > -1){
					tbm.removeByIndex(delIndex);
				}
			}
		}
	};
});
