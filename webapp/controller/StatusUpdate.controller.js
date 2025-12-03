var oThat;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast"
], function(Controller, MessageBox, BusyDialog, JSONModel, Filter, MessageToast) {
	"use strict";

	return Controller.extend("LoadingConfirmation.controller.StatusUpdate", {
		onInit: function() {
			oThat = this;
			oThat.BusyDialog = new BusyDialog();
			oThat.oView = this.getView();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("StatusUpdate").attachMatched(this._onRouteMatched, this);
		},
		//===============================================================
		//-------------------Back Function----------------------
		//===============================================================
		onBackPress: function() {
			this.getOwnerComponent().getRouter().navTo("Dashboard");
		},

		//======================================================================================//
		//========================= Router matched handler function ===========================//
		//====================================================================================//
		_onRouteMatched: function(oEvent) {
			oThat.BusyDialog = new BusyDialog();
			oThat = this;
			var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			oThat.oView = oThat.getView();
			oThat.Core = sap.ui.getCore();
			oThat.oModel = oThat.getOwnerComponent().getModel("odata");
			oThat.oView.byId("id_InReason").setValue("");
			oThat.oView.byId("id_InVehicleNo").setValue("");
			oThat.oView.byId("id_InWbid").setValue("");
			oThat.oView.byId("id_InDate").setValue("");
			oThat.oView.byId("id_BtnSave").setVisible(false);
			// oThat.getView().byId('id_logo').setSrc(vPathImage + "/Images/login-logo@2x.png");
			/*this.getView().byId('id_logo').setSrc(vPathImage + "/Images/olam-colour.png");*/
			oThat.getView().byId('id_homenew').setSrc(vPathImage + "/Images/home.png");

		},
		//====================================================================================//
		//==================== Call Service =================================================//
		//===================================================================================//
		onCallService: function(service, Data) {
			oThat.BusyDialog.open();
			if (oThat.Service === 'GET' || oThat.Service === 'CHECK') {
				oThat.oModel.create("/StatusSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'SAVE') {
				oThat.oModel.create("/StatusSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
		},
		mySuccessHandler: function(oData, oResponse) {
			oThat.BusyDialog.close();
			if (oThat.Service === 'GET') {
				oThat.oView.setModel(new JSONModel(oData), "oStatusModel");
				oThat.oView.getModel("oStatusModel").refresh(true);
				// if(oData.StatusUpdateNav != null){
				if (oData.StatusUpdateNav.results.length != 0) {
					oThat.VehicleNo = sap.ui.xmlfragment("LoadingConfirmation.fragment.VehicleNo", oThat);
					oThat.oView.addDependent(oThat.VehicleNo);
					oThat.VehicleNo.open();
				} else {
					MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMSg16"));
				}
				// }
			} else if (oThat.Service === 'CHECK') {
				// if(oData.GetReturnNav != null){
				if (oData.StatusReturnNav.results.length != 0) {
					var aError = oData.StatusReturnNav.results.filter(function(x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					if (aError != 0) {
						MessageBox.error(aError[0].Message);
					}
					var aSuccess = oData.StatusReturnNav.results.filter(function(x) {
						if (x.Type == 'S') {
							return x;
						}
					});
					if (aSuccess != 0) {
						MessageBox.Success(aSuccess[0].Message);
					}
				}
				// }
				else {
					oThat.oView.byId("id_BtnSave").setVisible(true);
				}
			} else if (oThat.Service === 'SAVE') {
				// if(oData.GetReturnNav != null){
				if (oData.StatusReturnNav.results.length != 0) {
					var aError = oData.StatusReturnNav.results.filter(function(x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					if (aError != 0) {
						MessageBox.error(aError[0].Message);
					}
					var aSuccess = oData.StatusReturnNav.results.filter(function(x) {
						if (x.Type == 'S') {
							return x;
						}
					});
					if (aSuccess != 0) {
						MessageBox.success(aSuccess[0].Message);
						oThat.oView.byId("id_BtnSave").setVisible(false);
						oThat.oView.byId("id_InReason").setValue("");
						oThat.oView.byId("id_InVehicleNo").setValue("");
						oThat.oView.byId("id_InWbid").setValue("");
						oThat.oView.byId("id_InDate").setValue("");
					}
				}
				// }
				else {
					oThat.oView.byId("id_BtnSave").setVisible(false);
					oThat.oView.byId("id_InReason").setValue("");
					oThat.oView.byId("id_InVehicleNo").setValue("");
					oThat.oView.byId("id_InWbid").setValue("");
					oThat.oView.byId("id_InDate").setValue("");
				}
			}
		},
		myErrorHandler: function(oResponse) {
			oThat.BusyDialog.close();
			var that = this;
			var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
			MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vErr);
		},
		onValueHelpPress: function(oEvent) {
			var vDate = oThat.oView.byId("id_InDate").getValue();
			if (vDate !== null && vDate !== "") {
				var vDate = oThat.oView.byId("id_InDate").getDateValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vInDate = vDateFormat.format(vDate);
				oThat.Service = 'GET';
				var oEntity = {
					"d" : {
				    "Werks" 	        : "", 
				    "Gate" 	        	: "", 
				    "Approve"			: "",
				    "Reject"	        : "",
				    "Get"				: "X",
				    "Post"				: "",
				    "Date"				: vInDate,
				    "StatusUpdateNav"	: [],
				    "StatusReturnNav" 	: []
				  }
				};
				oThat.onCallService(oThat.Service, oEntity);
			} else {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg6"));
			}
		},
		onValueHelpSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			oFilter = new sap.ui.model.Filter([
				new Filter("Vehno", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Wbid", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},
		onValueHelpConfirm: function(oEvent) {
			var oSelectedItem	= oEvent.getParameter('selectedItem');
			oThat.oSelectObject = oSelectedItem.getBindingContext("oStatusModel").getObject();
			oThat.oView.byId("id_InVehicleNo").setValue(oSelectedItem.getTitle());
			oThat.oView.byId("id_InWbid").setValue(oSelectedItem.getDescription());
		},
		//============================= Check =============================================//
		onPressCheck: function(oEvent) {
			if (
				oThat.oView.byId("id_InVehicleNo").getValue() === "" ||
				oThat.oView.byId("id_InWbid").getValue() === "" ||
				oThat.oView.byId("id_InDate").getValue() === "" ||
				oThat.oView.byId("id_InDate").getValue() == null) {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg7"));
			} else {
				var vDate = oThat.oView.byId("id_InDate").getDateValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vInDate = vDateFormat.format(vDate);
				oThat.Service = 'CHECK';
				var oEntity = {
					"d" : {
					    "Werks" 	        : "",
					    "Gate" 	        	: "",
					    "Approve"			: "",
					    "Reject"	        : "",
					    "Get"				: "X",
					    "Post"				: "",
					    "Date"				: vInDate,
					    "StatusUpdateNav"	: [	{ 
					    	"Wbid"			: oThat.oSelectObject.Wbid,
							"Werks" 		: oThat.oSelectObject.Werks,
							"Gate"			: oThat.oSelectObject.Gate,
		                    "Date"			: oThat.oSelectObject.vInDate,
		                    "Vehno" 		: oThat.oSelectObject.Vehno,
		                    "Dname" 		: oThat.oSelectObject.Dname,
		                    "DriverMob" 	: oThat.oSelectObject.DriverMob,
		                     "Reason"		: oThat.oView.byId("id_InReason").getValue()
					    	
					    }],
					    "StatusReturnNav" 	: []
					}
				};
				
				oThat.onCallService(oThat.Service, oEntity);
			}
		},
		//====================================== on click Save ============================//
		onStatusSubmit: function(oEvent) {
			if (oThat.oView.byId("id_InReason").getValue() === "" ||
				oThat.oView.byId("id_InVehicleNo").getValue() === "" ||
				oThat.oView.byId("id_InWbid").getValue() === "" ||
				oThat.oView.byId("id_InDate").getValue() === "" ||
				oThat.oView.byId("id_InDate").getValue() == null) {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg11"));
			} else {
				var vDate = oThat.oView.byId("id_InDate").getDateValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vInDate = vDateFormat.format(vDate);
				oThat.Service = 'SAVE';
				var oEntity = {
					"d" : {
					    "Werks" 	        : "",
					    "Gate" 	        	: "",
					    "Approve"			: "X",
					    "Reject"	        : "",
					    "Get"				: "",
					    "Post"				: "X",
					    "Date"				: vInDate,
					    "StatusUpdateNav"	: [	{ 
					    	"Wbid"			: oThat.oSelectObject.Wbid,
							"Werks" 		: oThat.oSelectObject.Werks,
							"Gate"			: oThat.oSelectObject.Gate,
		                    "Date"			: oThat.oSelectObject.vInDate,
		                    "Vehno" 		: oThat.oSelectObject.Vehno,
		                    "Dname" 		: oThat.oSelectObject.Dname,
		                    "DriverMob" 	: oThat.oSelectObject.DriverMob,
		                     "Reason"		: oThat.oView.byId("id_InReason").getValue()
					    	
					    }],
					    "StatusReturnNav" 	: []
				  }
				};
				oThat.onCallService(oThat.Service, oEntity);
			}
		},
		//=================================================================================//
		//====================== Nav back =================================================//
		//=================================================================================//
		onNavBack: function() {
			this.oRouter.navTo("Inbound");
		}

	});

});