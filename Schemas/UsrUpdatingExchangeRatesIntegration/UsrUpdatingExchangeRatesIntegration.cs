namespace Terrasoft.Configuration
{
	using Newtonsoft.Json;
	using System;
	using System.IO;
	using System.Globalization;
	using System.Net;
	using System.ServiceModel;
	using System.ServiceModel.Web;
	using System.ServiceModel.Activation;
	using System.Threading;
	using System.Threading.Tasks;
	using Terrasoft.Core;
	using Terrasoft.Core.DB;
	using Terrasoft.Web.Common;
	using Terrasoft.Core.Entities;
	
	[ServiceContract]
	[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
	public class UsrUpdatingExchangeRatesIntegration : BaseService
	{
		string token = "47d4721a37e9435281dc7e67c5f47a32";
		ExchangeRatesResult _updatedRates;
		string _result = "Курсы не актуализированы";
		
		#region классы для сериализации валют
		public class ExchangeRatesResult
		{
			public string disclaimer { get; set; }
			public string license { get; set; }
			public int timestamp { get; set; }
			public string baseVal { get; set; }
			public ExchangeRate rates { get; set; }
		}
		
		public class ExchangeRate {
			public string EUR { get; set; }
			public string UAH { get; set; }
			public string RUB { get; set; }
			public string AUD { get; set; }
		}
		#endregion
		
		[OperationContract]
		[WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped,
					ResponseFormat = WebMessageFormat.Json)]
		public string GetExchangeRates()
		{
			_updatedRates = new ExchangeRatesResult();
			
			var task = Result();
			task.Wait();
			
			UpdateExchangeRates();
			
			return _result;
		}
		
		private HttpWebRequest GetResultRequest()
		{
			var requestUrl = $"https://openexchangerates.org/api/latest.json?app_id={token}";
			var request = (HttpWebRequest)WebRequest.Create(requestUrl);
			request.Method = "GET";
			
			return request;
		}
		
		public async Task Result()
		{
			ExchangeRatesResult exchangeRatesResult = new ExchangeRatesResult();
			HttpWebRequest request = GetResultRequest();
			
			using(HttpWebResponse httpWebResponse = (HttpWebResponse)await request.GetResponseAsync())
			{
				using(Stream responseStream = httpWebResponse.GetResponseStream())
				{
					using(StreamReader reader = new StreamReader(responseStream))
					{
						_updatedRates = JsonConvert.DeserializeObject<ExchangeRatesResult>(reader.ReadToEnd());
					}
				}
			}
		}
		
		
		private void UpdateExchangeRates()
		{
			string[] rates = {
				_updatedRates.rates.EUR,
				_updatedRates.rates.UAH,
				_updatedRates.rates.RUB,
				_updatedRates.rates.AUD
			};
			
			Guid[] uids = {
				new Guid("C0057119-53E6-DF11-971B-001D60E938C6"),
				new Guid("C1057119-53E6-DF11-971B-001D60E938C6"),
				new Guid("5FB76920-53E6-DF11-971B-001D60E938C6"),
				new Guid("908F7166-D8DA-49A9-80DD-A2958FC3FABF")
			};
			
			for(int i = 0; i < 4; i++){
				var ins = new Insert(UserConnection)
					.Into("CurrencyRate")
					.Set("StartDate", Column.Parameter(DateTime.Now))
					.Set("CurrencyId", Column.Parameter(uids[i]))
					.Set("Rate", Column.Parameter(rates[i]));
					
					var affectedRows = ins.Execute();
			}
			_result = "Курс валют актуализирован";
		}
	}
}