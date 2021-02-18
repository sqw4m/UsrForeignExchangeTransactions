define("UsrTransactionConstants", [], function() {
	var transaction = {
		TransactionStatus: {
			New: "09cd572b-6091-4c1f-8f7f-45f6d9d06ffb",
			Active: "ccce637e-b239-4059-b075-06b5750979dc"
		}
	};
	var user = {
		UserStatus: {
			SysAdmin: "83a43ebc-f36b-1410-298d-001e8c82bcad",
		//	Manager: "57eed066-7214-4cfd-b940-15e67131b545"
			Manager: "6425be9a-383d-4343-9876-be549740d428"
		}
	};
	return {
		Transaction: transaction,
		User : user
	};
});
