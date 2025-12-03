sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter"
], function(Controller, FilterOperator, Filter) {
	"use strict";

	return Controller.extend("LoadingConfirmation.controller.Status", {
		onInit: function() {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.getOwnerComponent().getRouter().getRoute("Status").attachPatternMatched(this._onObjectMatched, this);
			//this.oRouter.attachRoutePatternMatched(this.fnHandleActDet, this);
		},
		//===============================================================
		//-------------------Load Required Data Function----------------------
		//===============================================================
		_onObjectMatched: function() {
			var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			// this.getView().byId('id_logo').setSrc(vPathImage + "/Images/login-logo@2x.png");
			this.getView().byId('id_homenew').setSrc(vPathImage + "/Images/home.png");

			/*var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			this.getView().byId('id_logo').setSrc(vPathImage + "Images/login-logo@2x.png");*/
			//var networkState = navigator.connection.type,
			var	that = this;
			that.oBundle = that.getView().getModel("i18n").getResourceBundle();
			//	that.oCredential = that.getView().getModel("data");
			//	that.username = that.oCredential.getData().Credential.username;
			//	that.password = that.oCredential.getData().Credential.password;

			// if (networkState !== "none") {
				that.getBusyDialog = new sap.m.BusyDialog({
					//			text: that.oBundle.getText('dataLoadingMsg')
				}).open();

				var oPath = "InputSet?$expand=InpHelpNav,InpPendNav";
				var oGetModel = this.getView().getModel('odata');
				//	var oGetModel = this.getView().getModel();
				/*new sap.ui.model.odata.ODataModel(
					url.getServiceUrl("ZGW_GT_SD_DELIVERY_DET_SRV"),
					true,
					that.username,
					that.password);*/
				oGetModel.read(oPath, null, null, true, function(oData, oResponse) {

					var oTile = {
						PendingQr: oData.results[0].PendingQr,
						CompletedQr: oData.results[0].CompletedQr,
						Qrcode5: oData.results[0].Qrcode5,
						Qrcode48: oData.results[0].Qrcode48,
						Qrcode49: oData.results[0].Qrcode49
					};
					var oJson = new sap.ui.model.json.JSONModel(oTile);
					that.getOwnerComponent().setModel(oJson, "Tile");
					that.getBusyDialog.close();
				}, function(oError) {
					sap.m.MessageBox.error(oError.message, {
						onClose: function(oAction) {
							// navigator.app.exitApp();
							that.getOwnerComponent().getRouter().navTo("Dashboard");
						}
					});
					that.getBusyDialog.close();
				});

			// } else {
			// 	sap.m.MessageBox.information(that.oBundle.getText('networkMsg'), {
			// 		onClose: function(oAction) {}
			// 	});
			// }

		},
		//===============================================================
		//-------------------Back Function----------------------
		//===============================================================
		onBackPress: function() {
			this.getOwnerComponent().getRouter().navTo("Dashboard");
		},

		//=================WeighBridgeData==========================================
		onweighbridgeF4: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var plant = sap.ui.getCore().byId("id_ReprintPlant").getValue();
			var gate = sap.ui.getCore().byId("id_ReprintGate").getValue();
			if ((plant) && (gate)) {
				if (!this.Weighfragment) {
					this.Weighfragment = sap.ui.xmlfragment("LoadingConfirmation.fragment.WeighBridge", this);
					this.getView().addDependent(this.Weighfragment);
				}
				this.Weighfragment.open();
				this.fnEntityWeighBridge(plant, gate);
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("PlantGateDetails"));
			}

		},

		fnEntityWeighBridge: function(plant, gate) {
			var oPath = "/GateEntrySet";
			var that = this;
			var oGetModel = that.getView().getModel('odata');
			oGetModel.read(oPath, {
				filters: [
					new Filter("Gate", FilterOperator.EQ, gate),
					new Filter("IvWerks", FilterOperator.EQ, plant),
					new Filter("Wbid", FilterOperator.EQ, "X")
				],
				urlParameters: {
					$expand: "F4WbidNav"
				},
				success: function(oData, Response) {
					var oDataR = oData.results[0].F4WbidNav.results;
					var RPWeighBridgeModel = new sap.ui.model.json.JSONModel();
					RPWeighBridgeModel.setData(oDataR);
					that.getView().setModel(RPWeighBridgeModel, "WeighbridgeData");
					that.getView().getModel("WeighbridgeData").refresh();

					//  that.oGl.setBusy(false);
				},
				error: function(oResponse) {

					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));

				}
			});

		},
		onweighbridgesearch: function(oEvent) {
			var vValue = oEvent.getParameter("value");
			var filter1 = new sap.ui.model.Filter("Gate", sap.ui.model.FilterOperator.Contains, vValue);
			var filter2 = new sap.ui.model.Filter("Wbname", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);

		},
		fnWeighbridgeconfirm: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			if (this.vId.indexOf("weighbridge") != -1) {
				sap.ui.getCore().byId("weighbridge").setValue(oItem.getTitle());
			}
			// } else {
			// 	this.getView().byId("id_Gateno").setValue(oItem.getTitle());
			// }
			oEvent.getSource().getBinding("items").filter([]);
		},

	});

});