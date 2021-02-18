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

	[ExpressionConverterAttribute("CurrentDate")]
	class UsrCurrentDate : IExpressionConverter
	{
		private UserConnection _userConnection;

		public string Evaluate(object value, string arguments = "")
		{
			try
			{
				_userConnection = (UserConnection)HttpContext.Current.Session["UserConnection"];
				return _userConnection.CurrentUser.GetCurrentDateTime().Date.ToString("d MMM yyyy");
			}
			catch (Exception err)
			{
				return err.Message;
			}
		}
	}
}