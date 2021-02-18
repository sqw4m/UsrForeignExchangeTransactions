namespace Terrasoft.Configuration.UsrTrReportPrint
{
	using System;
	using System.ServiceModel;
	using System.ServiceModel.Web;
	using System.ServiceModel.Activation;
	using System.Collections.Generic;
	using System.Collections.ObjectModel;
	using System.Data;
	using Terrasoft.Common;
	using Terrasoft.Core;
	using Terrasoft.Core.Entities;
	using Newtonsoft.Json;
	using Terrasoft.Sync;
	using System.Web;
	using Terrasoft.Configuration.ReportService;
	using System.Linq;
	using System.IO;
	using Terrasoft.Core.Factories;
	using System.CodeDom.Compiler;
	using Terrasoft;
	using Terrasoft.Core.Store;
	using System.Linq;
	using Newtonsoft.Json.Linq;
	using Terrasoft.Nui.ServiceModel.Extensions;
	using OfficeOpenXml;
	using OfficeOpenXml.Style;
	using System.Drawing;

	[ServiceContract]
	[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
	public class UsrTrReportPrint
	{
		private static UserConnection userConnection = (UserConnection)HttpContext.Current.Session["UserConnection"];

		[OperationContract]
		[WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped,
		ResponseFormat = WebMessageFormat.Json)]
		public string PrintExcelReport(string filter)
		{
			string key = string.Format("ReportCacheKey_{0}", Guid.NewGuid());
			ReportData data = new ReportData();
			data = CreatingReport(filter);
			userConnection.SessionData[key] = data;
			return key;
		}

		public ReportData CreatingReport(string filter)
		{
			ReportData result = new ReportData()
			{
				Caption = GenerateReportName(),
				Format = "xlsx",
				Data = GetFile(filter)
			};
			return result;
		}
		
		private string GenerateReportName()
		{
			return "Транзакции_" + DateTime.Now.ToString("d");
		}
		
		private byte[] GetFile(string filter)
		{
			using(ExcelPackage excelPackage = new ExcelPackage())
			{
				var transactions = GetTransaction(filter);
				ExcelWorksheet worksheet = excelPackage.Workbook.Worksheets.Add("Страница 1");
				
				worksheet.Row(1).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
				
				worksheet.Column(1).Width = 25;
				worksheet.Column(2).Width = 25;
				worksheet.Column(3).Width = 35;
				worksheet.Column(4).Width = 25;
				worksheet.Column(5).Width = 25;
				worksheet.Column(6).Width = 25;
				worksheet.Column(7).Width = 25;
				worksheet.Column(7).Style.Numberformat.Format = "#,##0.00";
				
				worksheet.Cells["A1"].Value = "Название";
				worksheet.Cells["A1"].Style.Fill.PatternType = ExcelFillStyle.Solid;
				worksheet.Cells["A1"].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
				worksheet.Cells["A1"].Style.Font.Bold = true;
				worksheet.Cells["A1"].Style.Font.Color.SetColor(Color.White);
				worksheet.Cells["B1"].Value = "Номер";
				worksheet.Cells["B1"].Style.Fill.PatternType = ExcelFillStyle.Solid;
				worksheet.Cells["B1"].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
				worksheet.Cells["B1"].Style.Font.Bold = true;
				worksheet.Cells["B1"].Style.Font.Color.SetColor(Color.White);
				worksheet.Cells["C1"].Value = "Контакт";
				worksheet.Cells["C1"].Style.Fill.PatternType = ExcelFillStyle.Solid;
				worksheet.Cells["C1"].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
				worksheet.Cells["C1"].Style.Font.Bold = true;
				worksheet.Cells["C1"].Style.Font.Color.SetColor(Color.White);
				worksheet.Cells["D1"].Value = "Контрагент";
				worksheet.Cells["D1"].Style.Fill.PatternType = ExcelFillStyle.Solid;
				worksheet.Cells["D1"].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
				worksheet.Cells["D1"].Style.Font.Bold = true;
				worksheet.Cells["D1"].Style.Font.Color.SetColor(Color.White);
				worksheet.Cells["E1"].Value = "Дата";
				worksheet.Cells["E1"].Style.Fill.PatternType = ExcelFillStyle.Solid;
				worksheet.Cells["E1"].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
				worksheet.Cells["E1"].Style.Font.Bold = true;
				worksheet.Cells["E1"].Style.Font.Color.SetColor(Color.White);
				worksheet.Cells["F1"].Value = "Сумма";
				worksheet.Cells["F1"].Style.Fill.PatternType = ExcelFillStyle.Solid;
				worksheet.Cells["F1"].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
				worksheet.Cells["F1"].Style.Font.Bold = true;
				worksheet.Cells["F1"].Style.Font.Color.SetColor(Color.White);
				
				for(int i = 2; i < transactions.Count + 2; i++)
				{
					worksheet.Cells["A" + i].Value = transactions[i - 2].GetTypedColumnValue<string>("UsrName");
					worksheet.Cells["B" + i].Value = transactions[i - 2].GetTypedColumnValue<string>("UsrNumber");
					worksheet.Cells["C" + i].Value = transactions[i - 2].GetTypedColumnValue<string>("UsrContactName");
					worksheet.Cells["D" + i].Value = transactions[i - 2].GetTypedColumnValue<string>("UsrAccountName");
					worksheet.Cells["E" + i].Value = transactions[i - 2].GetTypedColumnValue<DateTime>("UsrDate").ToString("d");
					worksheet.Cells["F" + i].Value = transactions[i - 2].GetTypedColumnValue<double>("UsrSum");
				}
				
				return excelPackage.GetAsByteArray();
			}
		}
		
		private EntityCollection GetTransaction(string filter)
		{
			var esq = new EntitySchemaQuery (userConnection.EntitySchemaManager, "UsrTransactions");
			esq.PrimaryQueryColumn.IsAlwaysSelect = true;
			esq.AddAllSchemaColumns ();
		
			var filters =
				Terrasoft.Common.Json.Json.Deserialize<Terrasoft.Nui.ServiceModel.DataContract.Filters> (filter);
			var esqFilters = filters.BuildEsqFilter (esq.RootSchema.UId, userConnection);
			var queryFilterCollection = esqFilters as EntitySchemaQueryFilterCollection;
			
			esq.Filters.Add (queryFilterCollection);
			return esq.GetEntityCollection (userConnection);
		}
	}
}