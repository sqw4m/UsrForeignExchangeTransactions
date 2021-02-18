namespace Terrasoft.Configuration
{
	using System;
	using System.Collections.Generic;
	using System.Collections.ObjectModel;
	using System.Data;
	using System.Linq;
	using System.Runtime.Serialization;
	using System.Xml;
	using Terrasoft.Common;
	using Terrasoft.Configuration.RightsService;
	using Terrasoft.Core;
	using Terrasoft.Core.DB;
	using Terrasoft.Core.Entities;
	using Terrasoft.Core.Factories;
	using Terrasoft.Core.Scheduler;
	using Terrasoft.Nui.ServiceModel.Extensions;
	using Terrasoft.Web.Common;
	using Terrasoft.Configuration.SearchDuplicatesService;
	using EntityCollection = Terrasoft.Nui.ServiceModel.DataContract.EntityCollection;
	
	#region Class: UsrDeduplicationProcessing
	
	/// <summary>
	/// Implement business logic handling duplicates.
	/// </summary>
	public class UsrDeduplicationProcessing : DeduplicationProcessing
	{
		
		#region Constructors: Public
		
		/// <summary>
		/// Constructor.
		/// </summary>
		/// <param name="userConnection">Instance of <see cref="UserConnection"/>.</param>
		public UsrDeduplicationProcessing(UserConnection userConnection) :base(userConnection) { }
		
		#endregion
		
		
		#region Methods: Private
		
		private XmlDocument UsrGetPreparedXml(UsrSingleRequest request) {
			XmlDocument xml = new XmlDocument();
			XmlElement elementRows = xml.CreateElement("rows");
			List<RequestCommunication> communicationsList = request.Communication ?? new List<RequestCommunication>();
			foreach (RequestCommunication communication in communicationsList) {
				XmlElement elementRow = xml.CreateElement("row");
				XmlElement elementCommunicationTypeId = xml.CreateElement("CommunicationTypeId");
				elementCommunicationTypeId.InnerText = communication.CommunicationTypeId.ToString();
				XmlElement elementNumber = xml.CreateElement("Number");
				elementNumber.InnerText = communication.Number;
				elementRow.AppendChild(elementCommunicationTypeId);
				elementRow.AppendChild(elementNumber);
				UsrAddElementsToRow(xml, elementRow, request);
				elementRows.AppendChild(elementRow);
			}
			if (communicationsList.Count < 1) {
				XmlElement elementRow = xml.CreateElement("row");
				UsrAddElementsToRow(xml, elementRow, request);
				elementRows.AppendChild(elementRow);
			}
			xml.AppendChild(elementRows);
			return xml;
		}

		private void UsrAddElementsToRow(XmlDocument xml, XmlElement elementRow, UsrSingleRequest request) {
			XmlElement elementName = xml.CreateElement("Name");
			elementName.InnerText = request.Name;
			elementRow.AppendChild(elementName);
			XmlElement elementUsrIDCard = xml.CreateElement("UsrIDCard");
			elementUsrIDCard.InnerText = request.UsrIDCard;
			elementRow.AppendChild(elementUsrIDCard);
			if (request.Id != Guid.Empty) {
				XmlElement elementId = xml.CreateElement("Id");
				elementId.InnerText = request.Id.ToString();
				elementRow.AppendChild(elementId);
			}
		}

		#endregion

		#region Methods: Public
		
		public List<Guid> UsrFindDuplicates(string schemaName, UsrSingleRequest data) 
		{
			XmlDocument xml = UsrGetPreparedXml(data);
			return FindDuplicates(schemaName, xml);
		}
		
		#endregion
		
	#endregion
	}
}