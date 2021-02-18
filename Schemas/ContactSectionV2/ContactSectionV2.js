define("ContactSectionV2", [], function(){
	return	{
		entitySchemaName: "Contact",
		methods:{
			onContactInfoClick: function(){
				this.sandbox.publish("OnCardAction", "onContactInfoClick", [this.getCardModuleSandboxId()]);
			},
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "CombinedModeActionButtonsCardLeftContainer",
				"propertyName": "items",
				"name": "ContactInfoButton",
				"values": {
					itemType: Terrasoft.ViewItemType.BUTTON,
					caption: { bindTo: "Resources.Strings.ContactInfoButtonCaption" },
					click: { bindTo: "onContactInfoClick" },
					"style": Terrasoft.controls.ButtonEnums.style.GREEN,
					enabled: true,
					"layout": {
						"column": 1,
						"row": 6,
						"colSpan": 1
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});