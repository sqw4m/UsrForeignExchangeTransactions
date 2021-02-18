namespace Terrasoft.Configuration.SearchDuplicatesService {
	using System.ServiceModel;
	using System.ServiceModel.Web;
	using System.ServiceModel.Activation;
	using System.Web;
	using Terrasoft.Common;
	using Terrasoft.Core;
	using Terrasoft.Core.DB;
	using Terrasoft.Core.Entities;
	using Terrasoft.Core.Scheduler;
	using System;
	using System.Data;
	using System.Collections.Generic;
	using System.Linq;
	using System.Runtime.Serialization;
	using System.Xml;
	using Quartz;
	using Quartz.Impl.Triggers;
	using Column = Terrasoft.Core.DB.Column;

	[DataContract]
	public class UsrSingleRequest: SingleRequest {
		[DataMember]
		public string UsrIDCard { get; set; }
	}
}