namespace Terrasoft.Configuration
{
	using Terrasoft.Core.Factories;
	using Terrasoft.Web.Common;
	using Terrasoft.Configuration.SearchDuplicatesService;
	
	#region Class: UsrSingleRequestListener
	
	public class UsrSingleRequestListener: IAppEventListener
	{
		#region Methods: Public
		
		public void OnAppStart(AppEventContext context) 
		{
			ClassFactory.Bind<SingleRequest, UsrSingleRequest>();
		}
		public void OnAppEnd(AppEventContext context) { }
		public void OnSessionStart(AppEventContext context) { }
		public void OnSessionEnd(AppEventContext context) { }
		
		#endregion
	}
	
	#endregion
}