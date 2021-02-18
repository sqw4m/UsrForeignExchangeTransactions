define("UsrSchemaTrFileDetail", ["css!UsrSchemaTrFileDetailCSS"], function() {
	return {
		entitySchemaName: "UsrTransactionsFile",
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,
		methods: { 
			onFileSelect: function(files){
				for(let i = 0; i < files.length; i++){
					if(!(/(?:.doc|.docx|.xls|.xlsx|.pdf|.jpg|.png)$/.exec(files[i].name))){
						this.showInformationDialog(this.get("Resources.Strings.FileFormatError"));
						return;
					}
					if (files.length <= 0) {
						return;
					}
					const config = this.getUploadConfig(files);
					const isNewRecord = this.getIsNewRecord();
					this.set("FileUploadConfig", config);
					if (isNewRecord) {
						const args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
					} else {
						this.upload(config);
					}
				}
			}
		}
	};
});
