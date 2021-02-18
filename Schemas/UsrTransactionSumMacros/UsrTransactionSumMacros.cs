namespace Terrasoft.Configuration
{
	using System;
	using System.CodeDom.Compiler;
	using System.Collections.Generic;
	using System.Data;
	using System.Linq;
	using System.Runtime.Serialization;
	using System.ServiceModel;
	using System.ServiceModel.Web;
	using System.ServiceModel.Activation;
	using System.Text;
	using System.Text.RegularExpressions;
	using System.Web;
	using Terrasoft.Common;
	using Terrasoft.Core;
	using Terrasoft.Core.DB;
	using Terrasoft.Core.Entities;
	using Terrasoft.Core.Packages;
	using Terrasoft.Core.Factories;

	[ExpressionConverterAttribute("TransactionSum")]
	class UsrTransactionSumMacros : IExpressionConverter
	{
		private UserConnection _userConnection;
		
		public string Evaluate(object value, string arguments = "")
		{
			try
			{
				_userConnection = (UserConnection)HttpContext.Current.Session["UserConnection"];
				var contactId = new Guid(value.ToString());
				return GetTransactionSum(contactId);
			}
			catch (Exception err)
			{
				return err.Message;
			}
		}
		
		private string GetTransactionSum(Guid contactId)
		{
			try
			{
				EntitySchemaQuery esq = new EntitySchemaQuery(_userConnection.EntitySchemaManager, "UsrTransactions");
				var columnSum = esq.AddColumn("UsrSum");
				
				var contactFilter = esq.CreateFilterWithParameters(
					FilterComparisonType.Equal,
					"UsrContact",
					contactId
				);
				esq.Filters.Add(contactFilter);
				
				EntityCollection entities = esq.GetEntityCollection(_userConnection);
				
				if(entities.Count > 0)
				{
					double sum = 0.0;
					foreach(var entity in entities)
					{
						sum += entity.GetTypedColumnValue<double>(columnSum.Name);
					}
					
					return sum.ToString();
				}
				
				return String.Empty;
			}
			catch (Exception err)
			{
				throw err;
			}
		}
	}
}