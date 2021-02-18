namespace Terrasoft.Configuration
{
	using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.ServiceModel;
	using System.ServiceModel.Activation;
	using System.ServiceModel.Web;
#if !NETSTANDARD2_0
	using System.Web.SessionState;
#endif
	using Newtonsoft.Json;
	using Terrasoft.Configuration.SearchDuplicatesService;
	using Terrasoft.Core;
	using Terrasoft.Core.Factories;
	using Terrasoft.Web.Common;
	
	[ServiceContract]
	[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
#if NETSTANDARD2_0
	public class UsrDeduplicationService : BaseService
#else
	public class UsrDeduplicationService : BaseService, IReadOnlySessionState
#endif
	{
		[OperationContract]
		[WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.Wrapped,
			RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
		public List<Guid> UsrFindDuplicatesOnSave(string schemaName, UsrSingleRequest request) {
			UsrDeduplicationProcessing deduplicationProcessing =
				ClassFactory.Get<UsrDeduplicationProcessing>(new ConstructorArgument("userConnection", UserConnection));
			List<Guid> result = deduplicationProcessing.UsrFindDuplicates(schemaName, request);
			return result;
		}
	}
}