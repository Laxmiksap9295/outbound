var BrazilFlag;
this.DeliveryScanned;
this.MatDocScanned;
jQuery.sap.require("sap.ndc.BarcodeScanner");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel"
], function(Controller, MessageBox, FilterOperator, Filter, JSONModel) {
	"use strict";
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn; //Added by Avinash
	return Controller.extend("LoadingConfirmation.controller.Picklist", {

		/*-----------------------------------------------------------------------------*/
		/*					Author		: Malarpriya N								   */
		/*					Description : Pick List Controller					       */
		/*					Company		: Exalca Technologies Pvt Ltd.				   */
		/*					Created On	: 											   */
		/*					Changed On	: 											   */
		/*-----------------------------------------------------------------------------*/
		//===============================================================
		//-------------------On Init Function----------------------------
		//===============================================================
		onInit: function() {
			var that = this;
			var result = this.GetClock();
			that.oView.setModel(new sap.ui.model.json.JSONModel(), "oViewModel");
			that.getView().setModel(new sap.ui.model.json.JSONModel([]), "MatDocList"); //Added for CFM Requirement
			that.getView().setModel(new sap.ui.model.json.JSONModel([]), "oMDItemModel"); //Added for CFM Requirement
			that.getView().setModel(new sap.ui.model.json.JSONModel([]), "JmRemDel"); //Added for CFM Requirement
			that.getView().getModel("oViewModel").setProperty("/CmsProperty", false);
			that.getView().getModel("oViewModel").setProperty("/PurchaseProperty", false);
			that.getView().getModel("oViewModel").setProperty("/SalesProperty", false);
			that.getView().getModel("oViewModel").setProperty("/EasyProperty", false);
			that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
			// that.getView().byId("id_gatetime").setValue(result);
			setInterval(function() {
				var result = that.GetClock();
				that.getView().byId("id_gatetime").setValue(result);
				// that.getView().byId("id_gatetimewith").setValue(result);
			}, 1000);
			document.addEventListener("backbutton", jQuery.proxy(this.onBackKeyDown, this), false);
			this.getOwnerComponent().getRouter().getRoute("Picklist").attachPatternMatched(this._onObjectMatched, this);
			this.DeliveryScanned = false; //Added by Avinash
			this.MatDocScanned = false; //Added by Avinash
			this.OldDlPop = false;
		},

		fnParameterCheck: function() {
			var oPath = "/F4Set";
			var that = this;
			var oGetModel = that.getView().getModel('odata');
			var plant = that.getOwnerComponent().getModel("localModel").getProperty("/plant");
			oGetModel.read(oPath, {
				filters: [
					new Filter("FieldIp", FilterOperator.EQ, "X"),
					new Filter("IvWerks", FilterOperator.EQ, plant)
				],
				urlParameters: {
					$expand: "F4FieldsNav,F4ReturnNav"
				},
				success: function(oData, Response) {
					var EnableCtrl = new sap.ui.model.json.JSONModel();
					//code added by kirubakaran 22.07.2020 for brazil Plant
					// if (oData.results[0].F4FieldsNav.results[0].Nf_Number === "X") {
					// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
					// } else {
					// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
					// }
					// if (oData.results[0].F4FieldsNav.results[0].Ee_Number === "X") {
					// 	that.getView().getModel("oViewModel").setProperty("/EasyProperty", true);
					// 	BrazilFlag = "X";
					// } else {
					// 	that.getView().getModel("oViewModel").setProperty("/EasyProperty", false);
					// 	BrazilFlag = "";
					// }
					// if (oData.results[0].F4FieldsNav.results[0].So_Number === "X") {
					// 	that.getView().getModel("oViewModel").setProperty("/SalesProperty", true);
					// } else {
					// 	that.getView().getModel("oViewModel").setProperty("/SalesProperty", false);
					// }
					//code ended by kirubakaran 22.07.2020 for brazil Plant
					EnableCtrl.setData(oData.results[0].F4FieldsNav.results);
					that.getView().setModel(EnableCtrl, "oBatchEnable");
					//Added by Avinash on 04/01/2022
					if (oData.results[0].F4FieldsNav.results[0].CfmProcess === "X") {
						that.fnEntityProcessType();
					}
					//End of Added
				},

				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
				}
			});

		},

		//Added by Avi for CFM Changes
		fnEntityProcessType: function(oEvent) {
			var oPath = "/F4Set";
			var that = this;
			var localModel = this.getOwnerComponent().getModel("localModel");
			var oGetModel = that.getView().getModel('odata');
			oGetModel.read(oPath, {
				filters: [
					new Filter("Wtype", FilterOperator.EQ, "X"),
					new Filter("IvWerks", FilterOperator.EQ, localModel.getData().plant)
				],
				urlParameters: {
					$expand: "F4ProcessNav"
				},
				success: function(oData, Response) {
					var oDataR = oData.results[0].F4ProcessNav.results;
					var oProcessDataModel = new sap.ui.model.json.JSONModel();
					oProcessDataModel.setData(oDataR);
					that.getView().setModel(oProcessDataModel, "oProceeModel");
					that.getView().getModel("oProceeModel").refresh();
					if (oDataR.length == 1) {
						// that.getView().byId("processType").setSelectedKey(oDataR[0].Wtype);
						that.getView().byId("processty").setSelectedKey(oDataR[0].Wtype);
					} else {
						that.getView().byId("processty").setEnabled(true);
						that.getView().byId("processty").setSelectedKey();
					}
					//  that.oGl.setBusy(false);
				},
				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));

				}
			});
		},

		//End of Added

		//=================WeighBridgeData==========================================
		onweighbridgeF4: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var plant = this.getView().byId("plant").getValue();

			if (!this.Weighfragment) {
				this.Weighfragment = sap.ui.xmlfragment("LoadingConfirmation.fragment.WeighBridge", this);
				this.getView().addDependent(this.Weighfragment);
			}
			this.Weighfragment.open();
			this.fnEntityWeighBridge(plant);

		},

		fnEntityWeighBridge: function(plant) {
			var oPath = "/F4Set";
			var that = this;
			var vDeliverNo = that.getView().getModel("scannerData").getData().Vbeln; //Added by Avinash
			var oGetModel = that.getView().getModel('odata');
			oGetModel.read(oPath, {
				filters: [
					new Filter("IvWerks", FilterOperator.EQ, that.getOwnerComponent().getModel("localModel").getProperty("/plant")), //Added by Avi on 04th Jan 22
					new Filter("Wbid", FilterOperator.EQ, "X"),
					new Filter("IvVbeln", FilterOperator.EQ, vDeliverNo) //Added by Avinash
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
			var filter1 = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
			var filter2 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);

		},
		fnWeighbridgeconfirm: function(oEvent) {
			var that = this;
			var oItem = oEvent.getParameter("selectedItem");
			this.getView().byId("id_Weighbridge").setValue(oItem.getTitle());
			oEvent.getSource().getBinding("items").filter([]);
			//Added by Avinash
			if (this.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
				this.fetchProcess(oItem.getTitle());
				// if (this.getView().byId("processty").getSelectedKey() === "TRANSFER"){
				this.getView().byId("id_RemarksLabel").setVisible(false);
				this.getView().byId("id_FreeText").setVisible(false);
				this.getView().byId("id_Rbref").setVisible(false);
				this.getView().byId("id_delivery").setVisible(false);
				this.getView().byId("id_deliveryText").setVisible(false);
				this.getView().byId("id_MatDocLabel").setVisible(true);
				this.getView().byId("id_MaDoc").setVisible(true);
				// }
			} else {
				that.onScanBarcode(oItem.getTitle()); //Added on 13/06/22
			}
		},

		//Added by Avinash -- CFM Changes
		fetchProcess: function(vWbId) {
			var that = this;
			var vPlantCode = that.getOwnerComponent().getModel("localModel").getData().plant;
			var oBundle = that.getView().getModel("i18n").getResourceBundle();
			var oPath2 = "GateEntrySet?$filter=Wbid eq '" + vWbId +
				"'and Flag eq 'E'and Werks eq '" + vPlantCode + "'&$expand=NavGateEntry,GateReturnNav";
			var oGetModel = this.getView().getModel('odata');
			oGetModel.read(oPath2, {
				success: function(oData) {
					if (oData.results.length > 0) {
						that.getView().byId("processty").setSelectedKey(oData.results[0].Config6)
						that.getView().byId("plant").setValue(that.getOwnerComponent().getModel("localModel").getData().plant + " - " + that.getOwnerComponent()
							.getModel("localModel").getData().plantDesc)
					}
					if (oData.results[0].Config6 === "TRANSFER" && that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
						var oMultiInput2 = that.getView().byId("id_MaDoc");
						// var aTokens2 = oMultiInput2.getTokens();
						if (that.getView().getModel("MatDocList").getData().length > 0) {
							that.getView().byId("id_MatnrLabel").setVisible(false);
							that.getView().byId("id_Matnr").setVisible(false);
							that.getView().byId("id_LifnrLabel").setVisible(false);
							that.getView().byId("id_Lifnr").setVisible(false);
						} else {
							that.getView().byId("id_MatnrLabel").setVisible(true);
							that.getView().byId("id_Matnr").setVisible(true);
							that.getView().byId("id_LifnrLabel").setVisible(true);
							that.getView().byId("id_Lifnr").setVisible(true);
						}
						that.getView().byId("id_WbType").setVisible(true);
						that.getView().byId("id_RefText").setVisible(true);
						// that.getView().byId("id_TbRef").setVisible(true);
						that.getView().byId("id_Rbref").setVisible(false);
						that.getView().byId("id_WbType").setSelectedKey();

						// that.getView().byId("id_deliveryText").setText(oBundle.getText("DelMatDoc"));
					} else {
						that.getView().byId("id_WbType").setVisible(false);
						// that.getView().byId("id_TbRef").setVisible(false);
						that.getView().byId("id_RefText").setVisible(false);
						that.getView().byId("id_MatnrLabel").setVisible(false);
						that.getView().byId("id_Matnr").setVisible(false);
						that.getView().byId("id_LifnrLabel").setVisible(false);
						that.getView().byId("id_Lifnr").setVisible(false);
						// Added on Feb 2 2022
						// that.getView().byId("id_delivery").setVisible(true);
						// that.getView().byId("id_deliveryText").setVisible(true);
						that.getView().byId("id_MaDoc").setVisible(false);
						that.getView().byId("id_MatDocLabel").setVisible(false);
						// that.getView().byId("id_deliveryText").setText(oBundle.getText("DeliverNo"));

					}
					if (that.getView().byId("processty").getSelectedKey() !== "") {
						if (that.getView().byId("processty").getSelectedKey() === "TRANSFER") {
							that.getView().byId("id_CFMVbeln").setVisible(false);
							that.getView().byId("id_CFMVbelnLabel").setVisible(false);

						} else {
							that.getView().byId("id_CFMVbeln").setVisible(true);
							that.getView().byId("id_CFMVbelnLabel").setVisible(true);
							that.getView().byId("id_delivery").setVisible(false);
							that.getView().byId("id_deliveryText").setVisible(false);
						}
					}
					if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
						var oMultiInput2 = that.getView().byId("id_CFMVbeln");
						oMultiInput2.removeAllTokens();
						oMultiInput2.setTokens([]);
					}
					that.getView().getModel("oBatchEnable").refresh(true);
				},
				error: function() {
					sap.m.MessageBox.error(that.getView().getModel("i18n").getProperty("HTTPFail"));
					sap.ui.core.BusyIndicator.hide();
				}

			});
		},

		fnprocessChange: function(oEvent) {
			var that = this;
			if (oEvent.getSource().getSelectedKey() === "TRANSFER" && that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
				that.getView().byId("id_WbType").setVisible(true);
				that.getView().byId("id_RefText").setVisible(true);
				that.getView().byId("id_MatnrLabel").setVisible(true);
				that.getView().byId("id_Matnr").setVisible(true);
				that.getView().byId("id_deliveryText").setVisible(false);
				that.getView().byId("id_delivery").setVisible(false);
				that.getView().byId("id_LifnrLabel").setVisible(true);
				that.getView().byId("id_Lifnr").setVisible(true);
				that.getView().byId("id_WbType").setSelectedKey();
				// that.getView().byId("id_TbRef").setVisible(true);
				that.getView().byId("id_Rbref").setVisible(false);
				// that.getView().byId("id_deliveryText").setText(oBundle.getText("DelMatDoc"));
				that.getView().byId("id_CFMVbeln").setVisible(false);
				that.getView().byId("id_CFMVbelnLabel").setVisible(false);
				var oMultiInput3 = that.getView().byId("id_CFMVbeln");
				oMultiInput3.setTokens([]);
				that.getView().byId("id_MatDocLabel").setVisible(true);
				that.getView().byId("id_MaDoc").setVisible(true);
			} else {
				that.getView().byId("id_WbType").setVisible(false);
				that.getView().byId("id_RefText").setVisible(false);
				that.getView().byId("id_Rbref").setVisible(false);
				that.getView().byId("id_MatnrLabel").setVisible(false);
				that.getView().byId("id_Matnr").setVisible(false);
				that.getView().byId("id_LifnrLabel").setVisible(false);
				that.getView().byId("id_Lifnr").setVisible(false);
				that.getView().byId("id_MatDocLabel").setVisible(false);
				that.getView().byId("id_MaDoc").setVisible(false);
				// that.getView().byId("id_deliveryText").setVisible(true);
				// that.getView().byId("id_delivery").setVisible(true);
				// that.getView().byId("id_TbRef").setVisible(false);
				// that.getView().byId("id_deliveryText").setText(oBundle.getText("DeliverNo"));
				that.getView().byId("id_CFMVbeln").setVisible(true);
				that.getView().byId("id_CFMVbelnLabel").setVisible(true);
				that.getView().byId("id_delivery").setVisible(false);
				that.getView().byId("id_deliveryText").setVisible(false);
			}
			that.CFMwtype = oEvent.getSource().getSelectedKey();
		},

		fnChangeWbType: function(oEvent) {
			var that = this;
			var oView = that.getView();
			var oBundle = oView.getModel("i18n").getResourceBundle();
			if (that.getView().byId("id_scanid").getState()) {
				if (oEvent.getSource().getSelectedKey() === "With") {
					that.getView().byId("id_Rbref").setVisible(false);
					// that.getView().byId("id_deliveryText").setText(oBundle.getText("DelMatDoc"));
					that.getView().byId("id_deliveryText").setVisible(false);
					that.getView().byId("id_delivery").setVisible(false);
					that.getView().byId("id_MatDocLabel").setVisible(true);
					that.getView().byId("id_MaDoc").setVisible(true);
					that.getView().byId("id_FreeText").setVisible(false);
					that.getView().byId("id_RemarksLabel").setVisible(false);
					that.getView().byId("id_MatnrLabel").setVisible(true);
					that.getView().byId("id_Matnr").setVisible(true);
					that.getView().byId("id_LifnrLabel").setVisible(true);
					that.getView().byId("id_Lifnr").setVisible(true);
					// if (that.getView().byId("id_Matnr").getTokens().length == 0 && that.getView().getModel("MatDocList").getData().length > 0) {
					// 	that.getView().byId("id_MatDocLabel").setVisible(true);
					// 	that.getView().byId("id_MaDoc").setVisible(true);
					// 	that.getView().byId("id_MatnrLabel").setVisible(false);
					// 	that.getView().byId("id_Matnr").setVisible(false);
					// 	that.getView().byId("id_LifnrLabel").setVisible(false);
					// 	that.getView().byId("id_Lifnr").setVisible(false);
					// }
					// if (that.getView().byId("id_Matnr").getTokens().length == 0 && that.getView().getModel("MatDocList").getData().length ==
					// 	0) {
					// 	that.getView().byId("id_MatDocLabel").setVisible(true);
					// 	that.getView().byId("id_MaDoc").setVisible(true);
					// 	that.getView().byId("id_MatnrLabel").setVisible(true);
					// 	that.getView().byId("id_Matnr").setVisible(true);
					// 	that.getView().byId("id_LifnrLabel").setVisible(true);
					// 	that.getView().byId("id_Lifnr").setVisible(true);
					// }
					// if (that.getView().byId("id_Matnr").getTokens().length > 0 && that.getView().getModel("MatDocList").getData().length == 0) {
					// 	that.getView().byId("id_MatDocLabel").setVisible(false);
					// 	that.getView().byId("id_MaDoc").setVisible(false);
					// 	that.getView().byId("id_MatnrLabel").setVisible(true);
					// 	that.getView().byId("id_Matnr").setVisible(true);
					// 	that.getView().byId("id_LifnrLabel").setVisible(true);
					// 	that.getView().byId("id_Lifnr").setVisible(true);
					// }

				} else {
					that.getView().byId("id_Rbref").setVisible(true);
					that.getView().byId("id_Rbref").setSelectedIndex(-1);
					// that.getView().byId("id_deliveryText").setText(oBundle.getText("DeliverNo"));
				}

				//Added on 30th March - Item Datas to be refreshed...
				that.getView().getModel("JmRem").setData([]);
				that.getView().getModel("JmRem").refresh(true);
				that.getView().byId("id_FreeText").setValue("");
				that.getView().byId("id_Matnr").setTokens([]);
				that.getView().getModel("MatDocList").setData([]);
				that.getView().getModel("MatDocList").refresh(true);
				that.getView().byId("id_MaDoc").setValue("");
			}
		},

		fnRefChange: function(oEvent) {
			var that = this;
			var oView = that.getView();
			var oBundle = oView.getModel("i18n").getResourceBundle();
			if (oEvent.getSource().getSelectedIndex() === 0) {
				// that.getView().byId("id_deliveryText").setText(oBundle.getText("DelMatDoc"));
				that.getView().byId("id_deliveryText").setVisible(false);
				that.getView().byId("id_delivery").setVisible(false);
				that.getView().byId("id_MatDocLabel").setVisible(true);
				that.getView().byId("id_MaDoc").setVisible(true);
				that.getView().byId("id_FreeText").setVisible(false);
				that.getView().byId("id_RemarksLabel").setVisible(false);
				that.getView().byId("id_MatnrLabel").setVisible(true);
				that.getView().byId("id_Matnr").setVisible(true);
				that.getView().byId("id_LifnrLabel").setVisible(true);
				that.getView().byId("id_Lifnr").setVisible(true);
				// if (that.getView().byId("id_Matnr").getTokens().length == 0 && that.getView().getModel("MatDocList").getData().length > 0) {
				// 	that.getView().byId("id_MatDocLabel").setVisible(true);
				// 	that.getView().byId("id_MaDoc").setVisible(true);
				// 	that.getView().byId("id_MatnrLabel").setVisible(false);
				// 	that.getView().byId("id_Matnr").setVisible(false);
				// 	that.getView().byId("id_LifnrLabel").setVisible(false);
				// 	that.getView().byId("id_Lifnr").setVisible(false);
				// }
				// if (that.getView().byId("id_Matnr").getTokens().length == 0 && that.getView().getModel("MatDocList").getData().length ==
				// 	0) {
				// 	that.getView().byId("id_MatDocLabel").setVisible(true);
				// 	that.getView().byId("id_MaDoc").setVisible(true);
				// 	that.getView().byId("id_MatnrLabel").setVisible(true);
				// 	that.getView().byId("id_Matnr").setVisible(true);
				// 	that.getView().byId("id_LifnrLabel").setVisible(true);
				// 	that.getView().byId("id_Lifnr").setVisible(true);
				// }
				// if (that.getView().byId("id_Matnr").getTokens().length > 0 && that.getView().getModel("MatDocList").getData().length == 0) {
				// 	that.getView().byId("id_MatDocLabel").setVisible(false);
				// 	that.getView().byId("id_MaDoc").setVisible(false);
				// 	that.getView().byId("id_MatnrLabel").setVisible(true);
				// 	that.getView().byId("id_Matnr").setVisible(true);
				// 	that.getView().byId("id_LifnrLabel").setVisible(true);
				// 	that.getView().byId("id_Lifnr").setVisible(true);
				// }
				that.getView().byId("id_FreeText").setVisible(false);
				that.getView().byId("id_RemarksLabel").setVisible(false);
			} else {
				// that.getView().byId("id_deliveryText").setText(oBundle.getText("DeliverNo"));
				that.getView().byId("id_deliveryText").setVisible(false);
				that.getView().byId("id_delivery").setVisible(false);
				that.getView().byId("id_MatDocLabel").setVisible(false);
				that.getView().byId("id_MaDoc").setVisible(false);
				that.getView().byId("id_MatnrLabel").setVisible(false);
				that.getView().byId("id_Matnr").setVisible(false);
				that.getView().byId("id_LifnrLabel").setVisible(false);
				that.getView().byId("id_Lifnr").setVisible(false);
				that.getView().byId("id_FreeText").setVisible(true);
				that.getView().byId("id_RemarksLabel").setVisible(true);
				var oThat = this;
				this.oRemDialog = sap.ui.xmlfragment("LoadingConfirmation.fragment.RemarksItem", this);
				this.getView().addDependent(this.oRemDialog);
				this.oRemDialog.setEscapeHandler(this.fnCloseRmItem);
				this.oRemDialog.open();
				sap.ui.getCore().byId("id_RemarksEnt").setValue("");
			}
			that.getView().getModel("JmRem").setData([]);
			that.getView().getModel("JmRem").refresh(true);
			that.getView().byId("id_FreeText").setValue("");
			that.getView().byId("id_Matnr").setTokens([]);
			that.getView().getModel("MatDocList").setData([]);
			that.getView().getModel("MatDocList").refresh(true);
			that.getView().byId("id_MaDoc").setValue("");

		},

		fnRemReq: function() {
			this.oRemDialog = sap.ui.xmlfragment("LoadingConfirmation.fragment.RemarksItem", this);
			this.getView().addDependent(this.oRemDialog);
			this.oRemDialog.setEscapeHandler(this.fnCloseRmItem);
			this.oRemDialog.open();
			sap.ui.getCore().byId("id_RemarksEnt").setValue("");
		},

		fnCloseRmItem: function() {
			this.oRemDialog.destroy();
		},

		fnEnterRemarks: function() {
			var vError = false,
				aArr = [],
				aObj = {},
				that = this;
			var vGetRem = sap.ui.getCore().byId("id_RemarksEnt").getValue().trim();
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			if (vGetRem == "") {
				vError = true;
			}
			if (!vError) {
				aArr = that.getView().getModel("JmRem").getData();
				aObj = {
					Text: vGetRem.toUpperCase()
				};
				aArr.push(aObj);
				var oJSONModelEm = new sap.ui.model.json.JSONModel();
				oJSONModelEm.setData(aArr);
				that.getView().setModel(oJSONModelEm, "JmRem");
				sap.ui.getCore().byId("id_RemarksEnt").setValue("");
			} else {
				sap.ui.getCore().byId("id_RemarksEnt").setValue("");
				sap.m.MessageToast.show(oi18n.getProperty("EntValRem"));
			}
		},

		handleDelete: function(oEvent) {
			var self, that = this;
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				sPath = oEvent.getParameter("listItem").getBindingContextPath().split("/")[1];
			var oTabModel = that.getView().getModel("JmRem");
			var oTabData = oTabModel.getData();
			oTabData.splice(sPath, 1);
			oTabModel.refresh(true);
		},

		fnAcceptRem: function() {
			var that = this;
			var aRemdata = this.getView().getModel("JmRem").getData();
			if (aRemdata.length > 0) {
				var vRemValue = "";
				if (aRemdata.length === 1) {
					vRemValue = aRemdata[0].Text;
				}
				if (aRemdata.length > 1) {
					vRemValue = aRemdata[0].Text + " " + " + " + " " + that.getView().getModel("i18n").getProperty("RemMore");
				}
				that.getView().byId("id_FreeText").setValue(vRemValue);
				this.oRemDialog.destroy();
			} else {
				sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("PlEntRem"));
			}
		},

		fnMatnrHelp: function() {
			var oThat = this;
			var vPlant = oThat.getOwnerComponent().getModel("localModel").getData().plant;
			if (!this.oMatnrDialog) {
				this.oMatnrDialog = sap.ui.xmlfragment("LoadingConfirmation.fragment.Material", this);
				this.getView().addDependent(this.oMatnrDialog);
			}
			this.oMatnrDialog.open();
			this.fnLoadMatnr();
		},

		fnLoadMatnr: function() {
			var oPath = "/F4Set";
			var that = this;
			var oGettransModel = that.getView().getModel('odata');
			var localModel = this.getOwnerComponent().getModel("localModel");
			var vPlant = localModel.getData().plant;
			sap.ui.core.BusyIndicator.show();
			oGettransModel.read(oPath, {
				filters: [
					new Filter("IvWerks", FilterOperator.EQ, vPlant),
					new Filter("F4Matnr", FilterOperator.EQ, "X")
				],
				urlParameters: {
					$expand: "F4MatnrNav"
				},
				success: function(oData, Response) {
					var oDataR = oData.results[0].F4MatnrNav.results;
					var RPGateModel = new sap.ui.model.json.JSONModel();
					RPGateModel.setData(oDataR);
					that.getView().setModel(RPGateModel, "JmMatnr");
					that.getView().getModel("JmMatnr").refresh();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));

				}
			});

		},

		onMatnrsearch: function(oEvent) {
			var vValue = oEvent.getParameter("value");
			var filter1 = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, vValue);
			var filter2 = new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);
		},

		fnMatnrconfirm: function(oEvent) {
			var oMultiInput1 = this.getView().byId("id_Matnr");
			var aTokens = oMultiInput1.getTokens();
			var Item = oEvent.getParameter("selectedItems");
			var vLength = Item.length;
			var oItems = [];
			var vItem = 1;
			for (var i = 0; i < vLength; i++) {
				var vTokenv = new sap.m.Token({
					text: Item[i].getTitle(),
					key: Item[i].getTitle()
				});
				aTokens.push(vTokenv);
			}
			oMultiInput1.removeAllTokens();
			oMultiInput1.setTokens(aTokens);
			this.getView().byId("id_deliveryText").setVisible(false);
			this.getView().byId("id_delivery").setVisible(false);
			this.getView().byId("id_MatDocLabel").setVisible(false);
			this.getView().byId("id_MaDoc").setVisible(false);
		},

		fnLifnrHelp: function() {
			var oThat = this;
			var vPlant = oThat.getOwnerComponent().getModel("localModel").getData().plant;
			if (!this.oLifnrDialog) {
				this.oLifnrDialog = sap.ui.xmlfragment("LoadingConfirmation.fragment.Transporter", this);
				this.getView().addDependent(this.oLifnrDialog);
			}
			this.oLifnrDialog.open();
			this.fnLoadLifnr();
		},

		fnLoadLifnr: function() {
			var oPath = "/F4Set";
			var that = this;
			var oGettransModel = that.getView().getModel('odata');
			var localModel = this.getOwnerComponent().getModel("localModel");
			var vPlant = localModel.getData().plant;
			sap.ui.core.BusyIndicator.show();
			oGettransModel.read(oPath, {
				filters: [
					new Filter("IvWerks", FilterOperator.EQ, vPlant),
					new Filter("Lifnr", FilterOperator.EQ, "X")
				],
				urlParameters: {
					$expand: "F4VendorNav"
				},
				success: function(oData, Response) {
					var oDataR = oData.results[0].F4VendorNav.results;
					var RPGateModel = new sap.ui.model.json.JSONModel();
					RPGateModel.setData(oDataR);
					that.getView().setModel(RPGateModel, "Vendor");
					that.getView().getModel("Vendor").refresh();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));

				}
			});

		},

		onValueHelpSearch: function(oEvent) {
			var vValue = oEvent.getParameter("value");
			var filter1 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, vValue);
			var filter2 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);
		},

		onValueHelpConfirm: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			this.getView().byId("id_Lifnr").setValue(oItem.getTitle() + " - " + oItem.getDescription())
		},

		//End of Added

		//===============================================================
		//-------------------Load Required Function----------------------
		//===============================================================
		_onObjectMatched: function() {
			var oSetting = {
				"SwitchFlag": true
			};
			this.getView().setModel(new sap.ui.model.json.JSONModel(oSetting), "setting");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			//Added by Avinash
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "CFMmatnrModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel([]), "JmRem");
			this.getView().setModel(new sap.ui.model.json.JSONModel([]), "MatDocList"); //Added for CFM Requirement
			this.getView().setModel(new sap.ui.model.json.JSONModel([]), "oMDItemModel"); //Added for CFM Requirement
			this.getView().getModel("CFMmatnrModel").refresh();
			this.getView().byId("id_MaDocManual").setVisible(false);
			this.getView().byId("id_MatDocLabManual").setVisible(false);
			this.getView().byId("id_MaDocManual").setValue("");
			//End of Added
			var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			// this.getView().byId('id_logo').setSrc(vPathImage + "/Images/login-logo@2x.png");
			/*this.getView().byId('id_logo').setSrc(vPathImage + "/Images/olam-colour.png");*/
			this.getView().byId("id_brcdscan").setIcon(vPathImage + "/Images/barcode.png");
			this.getView().byId('id_homenew').setSrc(vPathImage + "/Images/home.png");
			this.fnParameterCheck();
			this.getView().byId("id_gatedate").setDateValue(new Date());

			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "PlantPickModel");
			this.getView().getModel("PlantPickModel").refresh();

			// this.getView().byId("id_gatetime").setDateValue(new Date());
			//this.getView().byId("id_ok").setVisible(false);
			//	this.getView().byId("id_gateentry").setVisible(true);
			/*	this.getView().byId("id_vb").setVisible(false);
					this.getView().byId("id_vbscan").setVisible(true);*/
			this.getView().byId('id_scanid').setState(true);
			this.oCaptureTime = '';
			//Added by Avinash
			// this.getView().byId("id_TbRef").setVisible(false);
			this.getView().byId("id_deliveryText").setVisible(true);
			this.getView().byId("id_delivery").setVisible(true);
			this.getView().byId("id_FreeText").setVisible(false);
			this.getView().byId("id_RemarksLabel").setVisible(false);
			this.getView().byId("id_RefText").setVisible(false);
			this.getView().byId("id_WbType").setVisible(false);
			this.getView().byId("id_Rbref").setVisible(false);
			this.getView().byId("id_MatnrLabel").setVisible(false);
			this.getView().byId("id_Matnr").setVisible(false);
			var oMultiInput1 = this.getView().byId("id_Matnr");
			oMultiInput1.setTokens([]);
			var oMultiInput3 = this.getView().byId("id_CFMVbeln");
			oMultiInput3.setTokens([]);
			this.getView().byId("id_LifnrLabel").setVisible(false);
			this.getView().byId("id_Lifnr").setVisible(false);
			this.getView().byId("id_MatDocLabel").setVisible(false);
			this.getView().byId("id_CFMVbeln").setVisible(false);
			this.getView().byId("id_CFMVbelnLabel").setVisible(false);
			this.getView().byId("id_MaDoc").setVisible(false);
			var oMultiInput2 = this.getView().byId("id_MaDoc");
			oMultiInput2.setValue("");
			// oMultiInput2.setTokens([]);
			var that = this;
			var oView = that.getView();
			var oBundle = oView.getModel("i18n").getResourceBundle();
			this.getView().byId("id_deliveryText").setText(oBundle.getText("DeliverNo"));
			//	this.fnUpdateLoadingTim('X');
		},

		//===============================================================
		//-------------------Clear Function----------------------
		//===============================================================
		onScannerCancel: function(oEvent) {
			var that = this;
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			this.getView().getModel("scannerData").refresh();
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "CFMmatnrModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel([]), "JmRem");
			that.getView().setModel(new sap.ui.model.json.JSONModel([]), "MatDocList"); //Added for CFM Requirement
			that.getView().setModel(new sap.ui.model.json.JSONModel([]), "oMDItemModel"); //Added for CFM Requirement
			that.getView().setModel(new sap.ui.model.json.JSONModel([]), "JmRemDel"); //Added for CFM Requirement
			this.getView().getModel("CFMmatnrModel").refresh();
			this.getView().getModel("JmRem").refresh();
			this.getView().byId("id_timepick").setValue("");
			this.getView().byId("id_FreeText").setValue("");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "PlantPickModel");
			this.getView().getModel("PlantPickModel").refresh();
			this.getView().byId("processty").setSelectedKey(); //Added by Avinash
			this.getView().byId("id_Lifnr").setValue("");
			this.getView().byId("id_deliveryText").setVisible(true);
			this.getView().byId("id_delivery").setVisible(true);
			this.getView().byId("id_FreeText").setVisible(false);
			this.getView().byId("id_RemarksLabel").setVisible(false);
			that.getView().byId("id_MatnrLabel").setVisible(false);
			that.getView().byId("id_Matnr").setVisible(false);
			that.getView().byId("id_MatDocLabel").setVisible(false);
			that.getView().byId("id_MaDoc").setVisible(false);
			var oMultiInput1 = this.getView().byId("id_Matnr");
			oMultiInput1.setTokens([]);
			var oMultiInput2 = this.getView().byId("id_MaDoc");
			oMultiInput2.setValue("");
			var oMultiInput3 = this.getView().byId("id_CFMVbeln");
			oMultiInput3.setTokens([]);
			that.getView().byId("id_LifnrLabel").setVisible(false);
			that.getView().byId("id_Lifnr").setVisible(false);
			this.getView().byId("id_RefText").setVisible(false);
			this.getView().byId("id_WbType").setVisible(false);
			this.getView().byId("id_Rbref").setVisible(false);
			this.getView().byId("id_deliveryText").setVisible(true);
			this.getView().byId("id_delivery").setVisible(true);
			that.CFMwtype = "";
			that.OldDlPop = false;
			var oView = that.getView();
			var oBundle = oView.getModel("i18n").getResourceBundle();
			this.getView().byId("id_deliveryText").setText(oBundle.getText("DeliverNo"));
			that.DeliveryScanned = false; //Added by Avinash
			that.MatDocScanned = false; //Added by Avinash
			that.getView().byId("id_CFMVbeln").setVisible(false);
			that.getView().byId("id_CFMVbelnLabel").setVisible(false);
			this.getView().byId("id_MaDocManual").setVisible(false);
			this.getView().byId("id_MatDocLabManual").setVisible(false);
			this.getView().byId("id_MatDocLabManual").setValue("");
		},
		onBackKeyDown: function(oEvent) {
			var that = this;

			MessageBox.confirm(
				that.oBundle.getText('DoyouExit'), {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function(sAction) {
						if (sAction === "OK") {
							that.getOwnerComponent().getRouter().navTo("Dashboard");
							//	navigator.app.exitApp();
						}
					}
				});
		},

		//===============================================================
		//-------------------Switch Function----------------------
		//===============================================================

		onSwitchChange: function(oEvent) {
			var that = this;
			this.state = this.getView().byId('id_scanid').getState();
			this.getView().getModel("setting").getData().SwitchFlag = this.state;
			this.getView().getModel("setting").refresh();
			if (this.getView().getModel("oBatchEnable").getData()[0].CfmProcess !== "X") {
				this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
				this.getView().byId("processty").setSelectedKey();
			}
			// else {
			// 	this.getView().byId("id_delivery").setValue();
			// }
			this.getView().getModel("scannerData").refresh();
			if (this.state == true) {
				this.getView().byId("id_okManual").setVisible(false);
				this.getView().byId("id_ok").setVisible(true);
				this.getView().byId("id_RefDyn").setVisible(true); //Added by Avinash for Design Changes
				this.getView().byId("id_Weighbridge").setVisible(true); //Added by Avinash for Design Changes
				this.getView().byId("labelprocessSales").setVisible(true); //Added by Avinash  
				this.getView().byId("processty").setVisible(true); //Added by Avinash 
				//CFM Changes
				this.getView().byId("id_MaDocManual").setVisible(false);
				this.getView().byId("id_MatDocLabManual").setVisible(false);
				if (this.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
					this.getView().byId("id_MaDocManual").setVisible(false);
					this.getView().byId("id_MatDocLabManual").setVisible(false);
					this.getView().byId("id_CFMVbeln").setVisible(true);
					this.getView().byId("id_CFMVbelnLabel").setVisible(true);
					this.getView().byId("id_delivery").setVisible(false);
					this.getView().byId("id_deliveryText").setVisible(false);
					if (that.getView().byId("processty").getSelectedKey() === "TRANSFER") {
						if (that.getView().byId("id_Matnr").getTokens().length == 0 && that.getView().getModel("MatDocList").getData().length > 0) {
							that.getView().byId("id_MatDocLabel").setVisible(true);
							that.getView().byId("id_MaDoc").setVisible(true);
							that.getView().byId("id_MatnrLabel").setVisible(false);
							that.getView().byId("id_Matnr").setVisible(false);
							that.getView().byId("id_LifnrLabel").setVisible(false);
							that.getView().byId("id_Lifnr").setVisible(false);
						}
						if (that.getView().byId("id_Matnr").getTokens().length == 0 && that.getView().getModel("MatDocList").getData().length ==
							0) {
							that.getView().byId("id_MatDocLabel").setVisible(true);
							that.getView().byId("id_MaDoc").setVisible(true);
							that.getView().byId("id_MatnrLabel").setVisible(true);
							that.getView().byId("id_Matnr").setVisible(true);
							that.getView().byId("id_LifnrLabel").setVisible(true);
							that.getView().byId("id_Lifnr").setVisible(true);
						}
						if (that.getView().byId("id_Matnr").getTokens().length > 0 && that.getView().getModel("MatDocList").getData().length == 0) {
							that.getView().byId("id_MatDocLabel").setVisible(false);
							that.getView().byId("id_MaDoc").setVisible(false);
							that.getView().byId("id_MatnrLabel").setVisible(true);
							that.getView().byId("id_Matnr").setVisible(true);
							that.getView().byId("id_LifnrLabel").setVisible(true);
							that.getView().byId("id_Lifnr").setVisible(true);
						}
						this.getView().byId("id_CFMVbeln").setVisible(false);
						this.getView().byId("id_CFMVbelnLabel").setVisible(false);
					}
				}
			} else {
				this.getView().byId("id_okManual").setVisible(true);
				this.getView().byId("id_ok").setVisible(false);
				this.getView().byId("id_RefDyn").setVisible(false); //Added by Avinash for Design Changes
				this.getView().byId("id_Weighbridge").setVisible(false); //Added by Avinash for Design Changes
				this.getView().byId("labelprocessSales").setVisible(false); //Added by Avinash  
				this.getView().byId("processty").setVisible(false); //Added by Avinash  
				//CFM Changes
				if (this.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
					this.getView().byId("id_CFMVbeln").setVisible(false);
					this.getView().byId("id_CFMVbelnLabel").setVisible(false);
					this.getView().byId("id_delivery").setVisible(true);
					this.getView().byId("id_delivery").setValue();
					this.getView().byId("id_deliveryText").setVisible(true);
					that.getView().byId("id_MatDocLabel").setVisible(false);
					that.getView().byId("id_MaDoc").setVisible(false);
					that.getView().byId("id_MatnrLabel").setVisible(false);
					that.getView().byId("id_Matnr").setVisible(false);
					that.getView().byId("id_LifnrLabel").setVisible(false);
					that.getView().byId("id_Lifnr").setVisible(false);
					if (that.getView().byId("processty").getSelectedKey() === "TRANSFER") {
						this.getView().byId("id_MaDocManual").setVisible(true);
						this.getView().byId("id_MatDocLabManual").setVisible(true);
					} else {
						this.getView().byId("id_MaDocManual").setVisible(false);
						this.getView().byId("id_MatDocLabManual").setVisible(false);
					}
				}
			}
		},

		//===============================================================
		//-------------------Barcode Scanner Function----------------------
		//===============================================================
		//Added by Avinash for Scanning Logic Changes -- Start
		// onPressBarcode: function() {
		// 	var oThat = this;
		// 	var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
		// 	var oVideoDeviceModel = new JSONModel();
		// 	//Initialize the ZXing QR Code Scanner
		// 	codeReader = new ZXing.BrowserMultiFormatReader();
		// 	codeReader.listVideoInputDevices().then((videoInputDevices) => {
		// 		if (videoInputDevices.length > 1) {
		// 			selectedDeviceId = videoInputDevices[1].deviceId; //Mobile Back Camera
		// 		} else if (videoInputDevices.length === 1) {
		// 			selectedDeviceId = videoInputDevices[0].deviceId; //Default Camera
		// 		} else {
		// 			sap.ndc.BarcodeScanner.scan(
		// 				function(mResult) {
		// 					if (!mResult.cancelled) {
		// 						oThat.onScanBarcode(mResult.text.trim());
		// 					}
		// 				},
		// 				function(Error) {
		// 					sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

		// 				},
		// 			);
		// 		}
		// 		if (videoInputDevices.length >= 1) {
		// 			var aDevice = [];
		// 			videoInputDevices.forEach((element) => {
		// 				var sourceOption = {};
		// 				sourceOption.text = element.label;
		// 				sourceOption.value = element.deviceId;
		// 				aDevice.push(sourceOption);
		// 				oVideoDeviceModel.setData(aDevice);
		// 				this.getView().setModel(oVideoDeviceModel, "oVideoDeviceModel");
		// 				oComboBox = new sap.m.ComboBox({
		// 					items: {
		// 						path: "oVideoDeviceModel>/",
		// 						template: new sap.ui.core.Item({
		// 							key: "{oVideoDeviceModel>value}",
		// 							text: "{oVideoDeviceModel>text}"
		// 						})
		// 					},
		// 					selectedKey: selectedDeviceId,
		// 					selectionChange: function(oEvt) {
		// 						selectedDeviceId = oEvt.getSource().getSelectedKey();
		// 						oThat._oScanQRDialog.close();
		// 						codeReader.reset()

		// 					}
		// 				});

		// 				sStartBtn = new sap.m.Button({
		// 					text: oBundle.getText("Start"),
		// 					type: oBundle.getText("Accept"),
		// 					press: function() {
		// 						oThat._oScanQRDialog.close();
		// 						oThat.onPressBarcode();
		// 					}

		// 				})

		// 				oThat.startScanning();
		// 			})
		// 		}
		// 	});
		// },


		onPressBarcode: function() {
            var oThat = this;
            var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
            var oVideoDeviceModel = new JSONModel();
            //Initialize the ZXing QR Code Scanner
            this.loadZXingLibrary().then(() => {
                codeReader = new ZXing.BrowserMultiFormatReader();
                codeReader.listVideoInputDevices().then((videoInputDevices) => {
                if (videoInputDevices.length > 1) {
                    selectedDeviceId = videoInputDevices[1].deviceId; //Mobile Back Camera
                } else if (videoInputDevices.length === 1) {
                    selectedDeviceId = videoInputDevices[0].deviceId; //Default Camera
                } else {
                    sap.ndc.BarcodeScanner.scan(
                        function(mResult) {
                            if (!mResult.cancelled) {
                                oThat.onScanBarcode(mResult.text.trim());
                            }
                        },
                        function(Error) {
                            sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);
 
                        },
                    );
                }
                if (videoInputDevices.length >= 1) {
                    var aDevice = [];
                    videoInputDevices.forEach((element) => {
                        var sourceOption = {};
                        sourceOption.text = element.label;
                        sourceOption.value = element.deviceId;
                        aDevice.push(sourceOption);
                        oVideoDeviceModel.setData(aDevice);
                        this.getView().setModel(oVideoDeviceModel, "oVideoDeviceModel");
                        oComboBox = new sap.m.ComboBox({
                            items: {
                                path: "oVideoDeviceModel>/",
                                template: new sap.ui.core.Item({
                                    key: "{oVideoDeviceModel>value}",
                                    text: "{oVideoDeviceModel>text}"
                                })
                            },
                            selectedKey: selectedDeviceId,
                            selectionChange: function(oEvt) {
                                selectedDeviceId = oEvt.getSource().getSelectedKey();
                                oThat._oScanQRDialog.close();
                                codeReader.reset()
 
                            }
                        });
 
                        sStartBtn = new sap.m.Button({
                            text: oBundle.getText("Start"),
                            type: oBundle.getText("Accept"),
                            press: function() {
                                oThat._oScanQRDialog.close();
                                oThat.onPressBarcode();
                            }
 
                        })
 
                        oThat.startScanning();
                    })
                }
            });
        }).catch((error) => {
            console.error("Error loading ZXing library:", error);
        });
        },
 
        loadZXingLibrary: function() {
            return new Promise((resolve, reject) => {
                var script = document.createElement('script');
                //script.src = "https://unpkg.com/@zxing/library@latest";
                script. src = sap.ui.require.toUrl("LoadingConfirmation/ScannerAppLibrary/index.min.js");
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        },




		startScanning: function() {
			var oThat = this;
			var oView = oThat.getView();
			var oBundle = oView.getModel("i18n").getResourceBundle();
			try { //Checking barcodescanner plugin is available or not
				var s = cordova.plugins.barcodeScanner;
				if (s) {
					sApplicationFlag = true; // Barcode Scanner is avilable; Running in Fiori Client
				} else {
					sApplicationFlag = false; // Barcode Scanner is not-avilable
				}
			} catch (e) {
				sApplicationFlag = false; // Barcode Scanner is not avilable; Running in Browser
			}
			if (sApplicationFlag === false && sap.ui.Device.system.desktop === false) { //No Barcode Scanner Plugin and Mobile/Tablet Browser
				if (!this._oScanQRDialog) {
					this._oScanQRDialog = new sap.m.Dialog({
						title: oBundle.getText("ScanQRcode"),
						contentWidth: "640px",
						contentHeight: "480px",
						horizontalScrolling: false,
						verticalScrolling: false,
						stretchOnPhone: true,
						content: [
							new sap.ui.core.HTML({
								id: this.createId("scanContainer_QR"),
								content: "<video />"
							})
						],
						endButton: new sap.m.Button({
							text: oBundle.getText("Cancel"),
							press: function(oEvent) {
								this._oScanQRDialog.close();
								codeReader.reset();
								sap.ndc.BarcodeScanner.scan(
									function(mResult) {
										if (!mResult.cancelled) {
											// oView.byId("idInOutBond").setValue(mResult.text.trim());
											oThat.onScanBarcode(mResult.text.trim());
										}
									},
									function(Error) {
										sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

									},
								);
							}.bind(this)
						}),
						afterOpen: function() {
							codeReader.decodeFromVideoDevice(selectedDeviceId, oView.byId("scanContainer_QR").getDomRef(), (result, err) => {
								if (result) {
									// oView.byId("idInOutBond").setValue(result.text.trim());
									this._oScanQRDialog.close();
									codeReader.reset()
									oThat.onScanBarcode(result.text.trim());
								}
								if (err && !(err instanceof ZXing.NotFoundException)) {
									// oView.byId("idInOutBond").setValue("");
								}
							})
						}.bind(this),
						afterClose: function() {}
					});
					oView.addDependent(this._oScanQRDialog);
				}
				this._oScanQRDialog.open();
			} else { //QR Scanner is available and on Mobile Fiori Client
				sap.ndc.BarcodeScanner.scan(
					function(mResult) {
						if (!mResult.cancelled) {
							// oView.byId("idInOutBond").setValue(mResult.text.trim());
							oThat.onScanBarcode(mResult.text.trim());
						}
					},
					function(Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

					},
				);
			}

		},
		//Scanning Logic Changes --- END

		fnDocList: function() {
			var that = this;
			if (!that.DocListfragment) {
				that.DocListfragment = sap.ui.xmlfragment("LoadingConfirmation.fragment.MatDocList", that);
				that.getView().addDependent(that.DocListfragment);
			}
			that.DocListfragment.open();
		},

		onCloseMatDoc: function() {
			this.DocListfragment.close();
		},

		onClWbItem: function() {
			this.MDitemsfragment.close();
		},

		onCloseWbItem: function(oEvent) {
			var oThat = this;
			var that = this;
			var vSelectItems = sap.ui.getCore().byId("id_WBItemsList").getSelectedItems();
			if (vSelectItems.length > 0) {
				var vWbItemdata = [];
				for (var i = 0; i < vSelectItems.length; i++) {
					var vObj = {
						"Zeile": vSelectItems[i].getBindingContext("oMDItemModel").getObject().Zeile,
						"Pmblnr": vSelectItems[i].getBindingContext("oMDItemModel").getObject().Pmblnr,
						"Matnr": vSelectItems[i].getBindingContext("oMDItemModel").getObject().Matnr,
						"Makt": vSelectItems[i].getBindingContext("oMDItemModel").getObject().Makt,
						"Item": ""
					};
					vWbItemdata.push(vObj);
				}
				var vListData = oThat.getView().getModel("MatDocList").getData();
				if (vListData.length == 0) {
					var vZeile = 0;
					for (var i = 0; i < vWbItemdata.length; i++) {
						vZeile = Number(vZeile) + 1;
						vWbItemdata[i].Item = vZeile.toString().padStart("5", "0");
					}
				} else {
					vListData.sort(function(a, b) {
						return Number(b.Item) - Number(a.Item);
					});
					var vZeile = Number(vListData[0].Item);
					for (var i = 0; i < vWbItemdata.length; i++) {
						vZeile = Number(vZeile) + 1;
						vWbItemdata[i].Item = vZeile.toString().padStart("5", "0");
					}
				}
				// var vKey = "";
				// if (oThat.oView.byId("id_Param7Key").getState()) {
				// 	vKey = "WBWR";
				// } else {
				// 	if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 0) {
				// 		vKey = "WOWR";
				// 	} else if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 1) {
				// 		vKey = "WOWO";
				// 	}
				// }
				// oThat.oView.getModel("POLIST").setData([]);
				for (var i = 0; i < vWbItemdata.length; i++) {
					var vObj = {
						Config1: 'WPC',
						Config9: "", //Selected Key
						Vbeln: "",
						Config4: "S01",
						Werks: that.getOwnerComponent().getModel("localModel").getData().plant,
						Pmblnr: vWbItemdata[i].Pmblnr,
						Matnr: vWbItemdata[i].Matnr,
						Zeile: (Number(vWbItemdata[i].Zeile)).toString().padStart("4", "0"),
						Item: vWbItemdata[i].Item
					};
					oThat.getView().getModel("MatDocList").getData().push(vObj);
				}
				oThat.getView().getModel("MatDocList").refresh(true);
				var oMultiInput1 = that.getView().byId("id_MaDoc");
				oMultiInput1.setValue(vSelectItems[0].getBindingContext("oMDItemModel").getObject().Pmblnr);
				// var aTokens = oMultiInput1.getTokens();
				// var vTokenv = new sap.m.Token({
				// 	text: vSelectItems[0].getBindingContext("oMDItemModel").getObject().Pmblnr,
				// 	key: vSelectItems[0].getBindingContext("oMDItemModel").getObject().Pmblnr
				// });
				// aTokens.push(vTokenv);
				// oMultiInput1.removeAllTokens();
				// oMultiInput1.setTokens(aTokens);
				that.getView().byId("id_MatnrLabel").setVisible(false);
				that.getView().byId("id_Matnr").setVisible(false);
				that.getView().byId("id_LifnrLabel").setVisible(false);
				that.getView().byId("id_Lifnr").setVisible(false);
				that.getView().byId("id_MatDocLabel").setVisible(true);
				that.getView().byId("id_MaDoc").setVisible(true);
				oThat.MDitemsfragment.close();
			} else {
				var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("MiniOneItem");
				sap.m.MessageBox.error(vError);
			}
		},

		fnGetMatDoclist: function(oPath) {
			var that = this;
			var oGetModel = this.getView().getModel('odata');
			oGetModel.read(oPath, null, null, true, function(oData, oResponse) {

				if (oData.results[0].F4MbItemNav.results.length > 0) {
					that.getView().setModel(new sap.ui.model.json.JSONModel(oData.results[0].F4MbItemNav.results), "oMDItemModel");
					if (!that.MDitemsfragment) {
						that.MDitemsfragment = sap.ui.xmlfragment("LoadingConfirmation.fragment.MatDocItems", that);
						that.getView().addDependent(that.MDitemsfragment);
					}
					that.MDitemsfragment.open();
				} else {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("NoItemsFound"));
				}
			});
		},

		onScanBarcode: function(oData1) {
			var that = this;
			var oGetModel = this.getView().getModel('odata');
			var GateEntrytextDelivery = this.getView().getModel("i18n").getResourceBundle().getText("GateEntrytextDelivery");
			jQuery.sap.require("sap.ndc.BarcodeScanner");
			// sap.ndc.BarcodeScanner.scan(
			// 	function(oResult) {
			try {
				// var oData1 = oResult.text;
				oData1 = oData1.split("#");
				//BOC by Avinash for Adding Validation While Scanning VBELN...
				var vFlag = "X";
				var vProccessFlag = "S";
				var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
				if (this.getView().getModel("oBatchEnable").getData()[0].CfmProcess !== "X") {
					if (oData1[0].length == 12) {
						var oPath = "DeliverySet?$filter=Wbid eq '" + oData1[0] + "'and Werks eq '" + vPlant +
							"' and ProcessFlag eq '" + vProccessFlag + "' and PickFlag eq '" + vFlag + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
					} else {
						var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] + "'and Werks eq '" + vPlant +
							"' and ProcessFlag eq '" + vProccessFlag + "' and PickFlag eq '" + vFlag + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
					}
				}
				if (this.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
					if (!that.getView().byId("processty").getVisible()) {
						if (oData1[0].length == 12) {
							var oPath = "DeliverySet?$filter=Wbid eq '" + oData1[0] + "'and Werks eq '" + vPlant +
								"' and ProcessFlag eq '" + vProccessFlag + "' and PickFlag eq '" + vFlag + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
						} else {
							var oPath = "F4Set?$filter=IvMblnr eq '" + oData1[0] + "'and Werks eq '" + vPlant +
								"' and F4Mblnr eq '" + vFlag + "'&$expand=F4MbItemNav";
							that.fnGetMatDoclist(oPath);
							return;
						}
					} else {
						if (that.getView().byId("processty").getSelectedKey() === "TRANSFER") {
							if (oData1[0].length == 12) {
								var oPath = "DeliverySet?$filter=Wbid eq '" + oData1[0] + "'and Werks eq '" + vPlant +
									"' and ProcessFlag eq '" + vProccessFlag + "' and PickFlag eq '" + vFlag + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
							} else {
								var oPath = "F4Set?$filter=IvMblnr eq '" + oData1[0] + "'and Werks eq '" + vPlant +
									"' and F4Mblnr eq '" + vFlag + "'&$expand=F4MbItemNav";
								that.fnGetMatDoclist(oPath);
								return;
							}
						} else {
							if (oData1[0].length == 12) {
								var oPath = "DeliverySet?$filter=Wbid eq '" + oData1[0] + "'and Werks eq '" + vPlant +
									"' and ProcessFlag eq '" + vProccessFlag + "' and PickFlag eq '" + vFlag + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
							} else {
								var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] + "'and Werks eq '" + vPlant +
									"' and ProcessFlag eq '" + vProccessFlag + "' and PickFlag eq '" + vFlag + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
							}
						}
					}
				}
				//	var oGetModel=this.getView().getModel();
				//	var oGetModel = this.getView().getModel('odata');
				oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
					//code added by kirubkaran on 23.09.2020 for brazil plant 
					// if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
					// 	that.getView().getModel("oViewModel").setProperty("/CmsProperty", true);
					// 	that.getView().getModel("oViewModel").setProperty("/PurchaseProperty", true);
					// 	that.getView().getModel("oViewModel").setProperty("/EasyProperty", false);
					// 	that.getView().getModel("oViewModel").setProperty("/SalesProperty", false);
					// } 
					// if (oData.results[0].DelEsOutNav.results[0].Nf_Number === "") {
					// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
					// } else {
					// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
					// }
					//code ended by kirubkaran on 23.09.2020 for brazil plant 
					if (oData.results[0].DelReturnNav.results["length"] !== 0) {
						// that.getBusyDialog.close();
						sap.m.MessageBox.error(oData.results[0].DelReturnNav.results[0].Message, {
							actions: [MessageBox.Action.CLOSE],
							onClose: function(oAction) {

								if (oAction === "CLOSE") {
									that.getOwnerComponent().getRouter().navTo("Dashboard");
									that._ResetQRCode(that);
								}
							}
						});

					} else {
						var vError = false;
						var vData = oData.results[0].DelOutputNav.results;
						//	if (BrazilFlag !== "X") {
						for (var i = 0; i < vData.length; i++) {
							if (vData[0].Fbatc === "X") {
								if (vData[i].Lgort == "") {
									vError = true;
									//	var posnr=	Number(vData[i].Posnr).toString();
									var Nostoragelocation = that.getView().getModel("i18n").getResourceBundle().getText("Nostoragelocation");
									//	var deliveno = that.getView().getModel("i18n").getResourceBundle().getText("deliveno");
									sap.m.MessageToast.show(Nostoragelocation + " " + oData1[0]);
								}
							}
						}
						//	} 
						//else {
						if (vError === false) {
							// if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess == "X" && that.getView().byId("processty").getSelectedKey() ===
							// 	"TRANSFER") {
							if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess == "X") {
								var oDataR = oData.results[0];
								var val1 = oDataR.DelEsOutNav;
								var oJSONModel = new sap.ui.model.json.JSONModel();
								//Added by Avinash
								var vPmblnr = "";
								if (oDataR.DelEsOutNav.results.length > 0) {
									var vVbeln = oDataR.DelEsOutNav.results[0].Vbeln;
									//Added by Avinash
									if (vVbeln == "" && oDataR.DelEsOutNav.results[0].PMBLNR.length > 0) {
										vPmblnr = oDataR.DelEsOutNav.results[0].PMBLNR;
										that.MatDocScanned = true;
									}
									//End of Added
								} else {
									var vVbeln = oData1[0];
								}
								//End of added..
								var vExists = false;
								var oSet;
								var oMultiInput2 = that.getView().byId("id_CFMVbeln");
								if (oData1[0].length == 12) { //WB Id Scanning
									var vErr = false;
									if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
										if (that.getView().getModel("scannerData").getData()) {
											// if (that.getView().getModel("scannerData").getData().length > 0) {
											if (that.getView().getModel("scannerData").getData().Wbid !==
												undefined) {
												vErr = true;
											}
											// }
										}
									}
									if (!vErr) {
										if (vVbeln && oDataR.DelOutputNav.results.length > 0) {
											var aDups = [];
											var postingarray = [];
											var aItemDatas = oDataR.DelOutputNav.results;
											postingarray = aItemDatas.filter(function(el) {
												// If it is not a duplicate, return true
												if (aDups.indexOf(el.Vbeln) === -1) {
													aDups.push(el.Vbeln);
													return true;
												}
												return false;
											});

											var aTokens = oMultiInput2.getTokens();
											for (var i = 0; i < postingarray.length; i++) {
												var vTokenv = new sap.m.Token({
													text: postingarray[i].Vbeln,
													key: postingarray[i].Vbeln
												});
												aTokens.push(vTokenv);
											}
											oMultiInput2.removeAllTokens();
											oMultiInput2.setTokens(aTokens);
											that.OldDlPop = true;
										} else if (oDataR.DelOutputNav.results.length === 0) {
											oMultiInput2.removeAllTokens();
											oMultiInput2.setTokens([]);
										}
										oSet = {
											// "Vbeln": oData1[0],
											"Vbeln": vVbeln, //Changed by Avinash
											"Pmblnr": vPmblnr,
											"Werks": val1.results[0].Werks,
											"Erdat": val1.results[0].Erdat,
											"Erzet": val1.results[0].Erzet,
											"Truck": val1.results[0].Truck,
											"Nf_Number": val1.results[0].Nf_Number,
											"Ee_Number": val1.results[0].Ee_Number,
											"So_Number": val1.results[0].So_Number,
											"Dname": val1.results[0].Dname,
											"Wbid": val1.results[0].Wbid,
											"Wtype": val1.results[0].Wtype, //Added by Avinash
											"Lifnr": val1.results[0].Transpoter //Added for Transporter Updation
										};
									} else {
										sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("WbIdAlreadyInProgress"));
										return;
									}
									// that.CFMwtype = val1.results[0].Wtype;
								} else { //Delivery Scanning
									var vErr = false;
									if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
										if (that.getView().getModel("scannerData").getData()) {
											// if (that.getView().getModel("scannerData").getData().length > 0) {
											if (that.getView().getModel("scannerData").getData().Wbid !==
												undefined && val1.results[0].Wbid !== "") {
												if (that.getView().getModel("scannerData").getData().Wbid !== val1.results[0].Wbid) {
													vErr = true;
												}
											}
											// }
										}
									}
									if (!vErr) {
										var oMultiInput2 = that.getView().byId("id_CFMVbeln");
										var aTokens2 = oMultiInput2.getTokens();

										if (aTokens2) {
											if (oDataR.DelEsOutNav.results.length > 0) {
												for (var i = 0; i < aTokens2.length; i++) {
													if (aTokens2[i].getKey() == oDataR.DelEsOutNav.results[0].Vbeln) {
														vExists = true;
														break;
													}
												}
											}
										}
										if (vExists) {
											sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("DeliveryAlreadyScaned"));
										} else {
											var aTokens = oMultiInput2.getTokens();
											var vTokenv = new sap.m.Token({
												text: vVbeln,
												key: vVbeln
											});
											aTokens.push(vTokenv);
											oMultiInput2.removeAllTokens();
											oMultiInput2.setTokens(aTokens);
										}
										oSet = {
											"Vbeln": vVbeln, //Changed by Avinash
											"Pmblnr": vPmblnr,
											"Werks": val1.results[0].Werks,
											"Erdat": val1.results[0].Erdat,
											"Erzet": val1.results[0].Erzet,
											"Truck": val1.results[0].Truck,
											"Nf_Number": val1.results[0].Nf_Number,
											"Ee_Number": val1.results[0].Ee_Number,
											"So_Number": val1.results[0].So_Number,
											"Dname": val1.results[0].Dname,
											"Wbid": val1.results[0].Wbid !== "" ? val1.results[0].Wbid : that.getView().byId("id_Weighbridge").getValue(),
											"Wtype": val1.results[0].Wtype !== "" ? val1.results[0].Wtype : that.getView().byId("processty").getSelectedKey(),
											"Lifnr": val1.results[0].Transpoter //Added for Transporter Updation
												// "Wtype": that.getView().byId("processty").getSelectedKey()
										};
									} else {
										sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("DlAssignedAlready"));
										return;
									}
								}
								var oScanDataModel = new sap.ui.model.json.JSONModel();
								oScanDataModel.setData(oSet);
								that.getView().setModel(oScanDataModel, "scannerData");
								// that.getView().byId("processty").setSelectedKey(that.CFMwtype);

								var oDataModel = new sap.ui.model.json.JSONModel();
								oDataModel.setData(val1);
								that.getView().setModel(oDataModel, "PlantPickModel");

								//Added by Avinash for CFM Changes
								var ocfmModel = new sap.ui.model.json.JSONModel();
								ocfmModel.setData(vData);
								that.getView().setModel(ocfmModel, "CFMmatnrModel");
								//End of Added

								//this.getView().setModel(oScanDataModel, "scannerData");
								that.getView().getModel("scannerData").refresh();
								that.getView().getModel("oBatchEnable").refresh();
								that.getView().getModel("PlantPickModel").refresh();
								if (!vExists) {
									that.fnUpdateLoadingTim('X');
								}
								//Added by Avinash for CFM Changes
								if (oData1[0].length == 12) {
									if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X" && val1.results.length) {
										that.getView().byId("processty").setSelectedKey(val1.results[0].Wtype);
									}
								} else {
									if (val1.results.length > 0) {
										if (val1.results[0].Wtype !== "") {
											that.getView().byId("processty").setSelectedKey(val1.results[0].Wtype);
										}
									}
								}

								if (val1.results[0].Wtype === "TRANSFER" && that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
									that.getView().byId("id_WbType").setVisible(true);
									that.getView().byId("id_RefText").setVisible(true);
									// that.getView().byId("id_TbRef").setVisible(true);
									that.getView().byId("id_Rbref").setVisible(false);
									that.getView().byId("id_WbType").setSelectedKey();
								} else {
									that.getView().byId("id_WbType").setVisible(false);
									// that.getView().byId("id_TbRef").setVisible(false);
									that.getView().byId("id_RefText").setVisible(false);
								}

								if (val1.results[0].Wbid.length === 12 && val1.results[0].Vbeln) {
									that.DeliveryScanned = true;
								}
								if (that.getView().byId("processty").getSelectedKey() !== "") {
									if (that.getView().byId("processty").getSelectedKey() === "TRANSFER") {
										that.getView().byId("id_CFMVbeln").setVisible(false);
										that.getView().byId("id_CFMVbelnLabel").setVisible(false);
									} else {
										that.getView().byId("id_CFMVbeln").setVisible(true);
										that.getView().byId("id_CFMVbelnLabel").setVisible(true);
										that.getView().byId("id_delivery").setVisible(false);
										that.getView().byId("id_deliveryText").setVisible(false);
									}
								}
								// var oDataR = oData.results[0];
								// var val1 = oDataR.DelEsOutNav;
								// // var oMultiInput2 = that.getView().byId("id_MaDoc");
								// // var aTokens2 = oMultiInput2.getTokens();
								// var vExists = false;
								// // if (aTokens2) {
								// // 	if (oDataR.DelEsOutNav.results.length > 0) {
								// // 		for (var i = 0; i < aTokens2.length; i++) {
								// // 			if (aTokens2[i].getKey() == oDataR.DelEsOutNav.results[0].PMBLNR) {
								// // 				vExists = true;
								// // 				break;
								// // 			}
								// // 		}
								// // 	}
								// // }
								// if (vExists == false) {
								// 	var oJSONModel = new sap.ui.model.json.JSONModel();
								// 	//Added by Avinash
								// 	var vPmblnr = "";
								// 	if (oDataR.DelEsOutNav.results.length > 0) {
								// 		var vVbeln = oDataR.DelEsOutNav.results[0].Vbeln;
								// 		//Added by Avinash
								// 		if (vVbeln == "" && oDataR.DelEsOutNav.results[0].PMBLNR.length > 0) {

								// 			vPmblnr = oDataR.DelEsOutNav.results[0].PMBLNR;
								// 			that.MatDocScanned = true;
								// 		}
								// 		//End of Added
								// 	} else {
								// 		var vVbeln = oData1[0];
								// 	}
								// 	//End of added..
								// 	if (vPmblnr !== "") {
								// 		// var oMultiInput1 = that.getView().byId("id_MaDoc");
								// 		// var aTokens = oMultiInput1.getTokens();
								// 		// var vTokenv = new sap.m.Token({
								// 		// 	text: vPmblnr,
								// 		// 	key: vPmblnr
								// 		// });
								// 		// aTokens.push(vTokenv);
								// 		// oMultiInput1.removeAllTokens();
								// 		// oMultiInput1.setTokens(aTokens);
								// 		that.getView().byId("id_MatnrLabel").setVisible(false);
								// 		that.getView().byId("id_Matnr").setVisible(false);
								// 		that.getView().byId("id_LifnrLabel").setVisible(false);
								// 		that.getView().byId("id_Lifnr").setVisible(false);
								// 		that.getView().byId("id_MatDocLabel").setVisible(true);
								// 		that.getView().byId("id_MaDoc").setVisible(true);
								// 	}
								// 	var oSet;
								// 	val1.results[0].Wtype = that.getView().byId("processty").getSelectedKey();
								// 	oSet = {
								// 		// "Vbeln": oData1[0],
								// 		"Vbeln": "", //Changed by Avinash
								// 		"Pmblnr": vPmblnr,
								// 		"Werks": val1.results[0].Werks,
								// 		"Erdat": val1.results[0].Erdat,
								// 		"Erzet": val1.results[0].Erzet,
								// 		"Truck": val1.results[0].Truck,
								// 		"Nf_Number": val1.results[0].Nf_Number,
								// 		"Ee_Number": val1.results[0].Ee_Number,
								// 		"So_Number": val1.results[0].So_Number,
								// 		"Dname": val1.results[0].Dname,
								// 		"Wbid": that.getView().byId("id_Weighbridge").getValue(),
								// 		"Wtype": val1.results[0].Wtype //Added by Avinash
								// 	};
								// 	var oScanDataModel = new sap.ui.model.json.JSONModel();
								// 	oScanDataModel.setData(oSet);
								// 	that.getView().setModel(oScanDataModel, "scannerData");

								// 	var oDataModel = new sap.ui.model.json.JSONModel();
								// 	oDataModel.setData(val1);
								// 	that.getView().setModel(oDataModel, "PlantPickModel");

								// 	//Added by Avinash for CFM Changes
								// 	if (that.getView().getModel("CFMmatnrModel")) {
								// 		var vCFMmatnrData = that.getView().getModel("CFMmatnrModel").getData();
								// 		if (vCFMmatnrData.length > 0) {
								// 			vCFMmatnrData.push(vData[0]);
								// 			var ocfmModel = new sap.ui.model.json.JSONModel();
								// 			ocfmModel.setData(vCFMmatnrData);
								// 			that.getView().setModel(ocfmModel, "CFMmatnrModel");
								// 		} else {
								// 			var ocfmModel = new sap.ui.model.json.JSONModel();
								// 			ocfmModel.setData(vData);
								// 			that.getView().setModel(ocfmModel, "CFMmatnrModel");
								// 		}
								// 	} else {
								// 		var ocfmModel = new sap.ui.model.json.JSONModel();
								// 		ocfmModel.setData(vData);
								// 		that.getView().setModel(ocfmModel, "CFMmatnrModel");
								// 	}
								// 	//End of Added

								// 	//this.getView().setModel(oScanDataModel, "scannerData");
								// 	that.getView().getModel("scannerData").refresh();
								// 	that.getView().getModel("PlantPickModel").refresh();
								// 	that.fnUpdateLoadingTim('X');
								// 	//Added by Avinash for CFM Changes
								// 	if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X" && val1.results.length) {
								// 		that.getView().byId("processty").setSelectedKey(val1.results[0].Wtype);
								// 	}

								// 	if (val1.results[0].Wtype === "TRANSFER" && that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
								// 		that.getView().byId("id_WbType").setVisible(true);
								// 		that.getView().byId("id_RefText").setVisible(true);
								// 		// that.getView().byId("id_TbRef").setVisible(true);
								// 		that.getView().byId("id_Rbref").setVisible(false);
								// 		that.getView().byId("id_WbType").setSelectedKey();
								// 	} else {
								// 		that.getView().byId("id_WbType").setVisible(false);
								// 		// that.getView().byId("id_TbRef").setVisible(false);
								// 		that.getView().byId("id_RefText").setVisible(false);
								// 	}

								// 	if (val1.results[0].Wbid.length === 12 && val1.results[0].Vbeln) {
								// 		that.DeliveryScanned = true;
								// 	}
								// 	//End of Added
								// } else {
								// 	var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("DocAlreadyScaned");
								// 	sap.m.MessageToast.show(Errordeliverytext);
								// }
								// //End of Added
							} else {

								var oDataR = oData.results[0];
								var val1 = oDataR.DelEsOutNav;
								var oJSONModel = new sap.ui.model.json.JSONModel();
								//Added by Avinash
								var vPmblnr = "";
								if (oDataR.DelEsOutNav.results.length > 0) {
									var vVbeln = oDataR.DelEsOutNav.results[0].Vbeln;
									//Added by Avinash
									if (vVbeln == "" && oDataR.DelEsOutNav.results[0].PMBLNR.length > 0) {
										vPmblnr = oDataR.DelEsOutNav.results[0].PMBLNR;
										that.MatDocScanned = true;
									}
									//End of Added
								} else {
									var vVbeln = oData1[0];
								}
								//End of added..
								var oSet;
								oSet = {
									// "Vbeln": oData1[0],
									"Vbeln": vVbeln, //Changed by Avinash
									"Pmblnr": vPmblnr,
									"Werks": val1.results[0].Werks,
									"Erdat": val1.results[0].Erdat,
									"Erzet": val1.results[0].Erzet,
									"Truck": val1.results[0].Truck,
									"Nf_Number": val1.results[0].Nf_Number,
									"Ee_Number": val1.results[0].Ee_Number,
									"So_Number": val1.results[0].So_Number,
									"Dname": val1.results[0].Dname,
									"Wbid": val1.results[0].Wbid,
									"Wtype": val1.results[0].Wtype //Added by Avinash
								};
								var oScanDataModel = new sap.ui.model.json.JSONModel();
								oScanDataModel.setData(oSet);
								that.getView().setModel(oScanDataModel, "scannerData");

								var oDataModel = new sap.ui.model.json.JSONModel();
								oDataModel.setData(val1);
								that.getView().setModel(oDataModel, "PlantPickModel");

								//Added by Avinash for CFM Changes
								var ocfmModel = new sap.ui.model.json.JSONModel();
								ocfmModel.setData(vData);
								that.getView().setModel(ocfmModel, "CFMmatnrModel");
								//End of Added

								//this.getView().setModel(oScanDataModel, "scannerData");
								that.getView().getModel("scannerData").refresh();
								that.getView().getModel("PlantPickModel").refresh();
								that.fnUpdateLoadingTim('X');
								//Added by Avinash for CFM Changes
								if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X" && val1.results.length) {
									that.getView().byId("processty").setSelectedKey(val1.results[0].Wtype);
								}

								if (val1.results[0].Wtype === "TRANSFER" && that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
									that.getView().byId("id_WbType").setVisible(true);
									that.getView().byId("id_RefText").setVisible(true);
									// that.getView().byId("id_TbRef").setVisible(true);
									that.getView().byId("id_Rbref").setVisible(false);
									that.getView().byId("id_WbType").setSelectedKey();
								} else {
									that.getView().byId("id_WbType").setVisible(false);
									// that.getView().byId("id_TbRef").setVisible(false);
									that.getView().byId("id_RefText").setVisible(false);
								}

								if (val1.results[0].Wbid.length === 12 && val1.results[0].Vbeln) {
									that.DeliveryScanned = true;
								}

							}

						}
						//	}
					}
				});
			} catch (e) {

			}
			// 	}
			// );

		},

		//Added by Avinash
		fnDeleteDL: function(oEvent) {
			var oThat = this;
			if (this.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X" && oThat.OldDlPop === true) {
				var vRemovedToken = oEvent.getParameters().removedTokens[0].getKey();
				var aRemovedData = this.getView().getModel("JmRemDel").getData();
				var vObj = {
					"Vbeln": vRemovedToken
				};
				aRemovedData.push(vObj);
				oThat.getView().getModel("JmRemDel").refresh(true);
			}
		},

		//===============================================================
		//-------------------Back Function----------------------
		//===============================================================
		onBackPress: function() {
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "PlantPickModel");
			this.getView().getModel("PlantPickModel").refresh();
			this.getOwnerComponent().getRouter().navTo("Dashboard");
		},

		//===============================================================
		//-------------------Delivery validate Function----------------------
		//===============================================================
		onScannerSave: function(oEvent) {
			var that = this;

			if (this.oCaptureTime == 'X') {
				var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');
				//	that.fnUpdateLoadingTim(vbeln);
				that._LoadDeliveryItems(that, vbeln, true);
			} else {
				var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("PleaseCaptureLoadingStartTime");
				sap.m.MessageToast.show(EnterDel);
			}

		},
		fnDeliveryChange: function() {
			// this.fnUpdateLoadingTim('X');
		},
		//--------Update Loading Time----------

		fnexpandok: function() {
			var that = this;
			var msg = "";
			var weighbridge = this.getView().byId("id_Weighbridge").getValue();
			var oGetModel = this.getView().getModel('odata');
			sap.ui.core.BusyIndicator.show();
			//Added by Avinash
			var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
			// End of added..
			if (weighbridge != "") {		//Added by Pavan on 03/03/2023 
				if (weighbridge != "" && weighbridge != undefined) {
					var oPath2 = "GateEntrySet?$filter=Wbid eq '" + weighbridge + "'and Flag eq 'A'and Werks eq '" + vPlant +
						"'&$expand=NavGateEntry,GateReturnNav";
				} else {
					var vbeln = that.getView().byId("id_delivery").getValue();
					var oPath2 = "GateEntrySet?$filter=Config1 eq '" + vbeln + "'and Flag eq 'A'and Werks eq '" + vPlant +
						"'&$expand=NavGateEntry,GateReturnNav";
				}

				oGetModel.read(oPath2, {
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide();
						var ToScanDataModel = new sap.ui.model.json.JSONModel();
						ToScanDataModel.setData(oData.results[0]);
						that.getView().setModel(ToScanDataModel, "TscannerData");
						//	var nfNumber = oData.results[0].Nf_Number;
						var slKey = oData.results[0].Config6;
						// if (slKey.toUpperCase() == "DOMESTIC" || slKey.toUpperCase() == "SCR") {
						// 	that.fnUpdateLoadingTim();
						// }
						// need to propose error  “Complete the tare weight to proceed for loading start", if Dwbtype = 'W' && Trwgt = '0'

						if(oData.results[0].Dwbtype === "W" && (oData.results[0].Trwgt === "" || oData.results[0].Trwgt === "0" || oData.results[0].Trwgt === 0)){
								sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("completeTareWeightProceedForLoading"));
								//that.getOwnerComponent().getRouter().navTo("Dashboard");
						}else{
						if (that.getView().getModel("oViewModel").getProperty("/EasyProperty") === true) {
							that.fnUpdateLoadingTim();
						} else {
							if (slKey.toUpperCase() == "EXPORT") {
								that.onSave();
							} else if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X" && that.getView().byId("processty").getSelectedKey() ===
								"TRANSFER") { //By Avi CFM Changes
								that.onSaveCFMTransfer();
							} else if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X" && that.getView().byId("processty").getSelectedKey() !==
								"TRANSFER") {
								that.onSaveCFMNonTransfer();
							} else {
								that.fnUpdateLoadingTim();
							}
						}
					}

					},
					error: function() {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show("ErrorinGateEntry");
					}
				});
			//Added by Pavan on 03/03/2023 start
			} else {
				sap.ui.core.BusyIndicator.hide();
				var vErr = that.getView().getModel("i18n").getResourceBundle().getText("ErrorWeighBridge");
				sap.m.MessageToast.show(vErr);
			}
			//Added by Pavan on 03/03/2023 end
		},

		onSaveCFMNonTransfer: function() {
			var that = this;
			var vErr = false;
			var vErrMsg = "";
			var vKey = "";
			if (that.getView().byId("id_CFMVbeln").getTokens().length === 0) {
				vErr = true;
				vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("ScanDelivery");
			}
			if (!vErr) {
				var oPostModel = that.getView().getModel('odata');
				var newdata = [];
				var arr = [];
				arr = that.getView().getModel('TscannerData').getData();
				var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');
				var vLifnr = that.getView().getModel("scannerData").getProperty('/Lifnr');
				var data = arr.Vbeln;
				var oEntity = {
					/*	Config1: arr.Vbeln,*/
					Config1: "WPC",
					// Config2: vKey,
					Config4: "S01",
					InOut: "IN",
					Direction: "OUT",
					Gate: arr.Gate,
					Vehno: arr.Truck,
					Dname: arr.Dname,
					Werks: arr.Werks,
					Wbid: arr.Wbid,
					DriverMob: arr.DriverMob,
					Remark: "",
					Config6: arr.Config6,
					Flag: "S",
					Lifnr: vLifnr,
					Wtype: that.getView().byId("processty").getSelectedKey() //Changed by Avinash
				};
				var oItems = [];
				var vItem = 10;
				vItem = vItem + 10;
				if (that.getView().byId("id_CFMVbeln").getTokens().length > 0) {
					var vData = that.getView().byId("id_CFMVbeln").getTokens();
					for (var i = 0; i < vData.length; i++) {
						var vTemp = {
							Config1: 'WPC',
							Config4: "S01",
							Werks: arr.Werks,
							Vbeln: vData[i].getKey(),
						};
						oItems.push(vTemp);
					}
				}
				//Added for Deletion Indicator Changes
				var aDeletedDL = that.getView().getModel("JmRemDel").getData();
				if (aDeletedDL.length > 0) {
					for (var i = 0; i < aDeletedDL.length; i++) {
						var vTemp = {
							Config1: 'WPC',
							Config4: "S01",
							Werks: arr.Werks,
							Vbeln: aDeletedDL[i].Vbeln,
							DeliveryDelete: "X"
						};
						oItems.push(vTemp);
					}
				}
				//End of Added
				var vCFMdata = that.getView().getModel("CFMmatnrModel").getData();
				var vMatnr = "";
				if (vCFMdata && vCFMdata.length > 0) {
					vMatnr = vCFMdata[0].Matnr;
				}
				vItem = vItem + 10;
				oEntity.GateReturnNav = [];
				oEntity.NavGateEntry = oItems;
				var oPath = '/GateEntrySet';
				oPostModel.create(oPath, oEntity, {
					success: function(oData, Response) {
						var aReturn = oData.GateReturnNav.results;
						var aFlag = [];
						aFlag = aReturn.filter(function(a) {
							return a.Type === "E";
						});
						if (aFlag.length) {
							sap.m.MessageBox.error(oData.GateReturnNav.results[0].Message);
						} else {
							var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("LoadingTimeCapturedSuccess");
							sap.m.MessageBox.success(oData.GateReturnNav.results[0].Message);
							that.onScannerCancel();
						}
					},
					error: function(oResponse) {
						var vErrorTxt = that.getView().getModel("i18n").getResourceBundle().getText("ErrorinGateEntry");
						sap.m.MessageToast.show(vErrorTxt);
					}
				});
			} else {
				sap.m.MessageBox.error(vErrMsg);
			}
		},

		//Added by Avinash
		onSaveCFMTransfer: function() {
			var that = this;
			var vErr = false;
			var vErrMsg = "";
			var vKey = "";
			var vData = that.getView().getModel("MatDocList").getData();
			var vData2 = that.getView().byId("id_Matnr").getTokens();
			if (that.getView().byId("processty").getSelectedKey() === "TRANSFER") {
				if (that.getView().byId("id_WbType").getSelectedKey() == "With") {
					var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');
					if (vData.length == 0 && vData2.length == 0) {
						vErr = true;
						vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("DelMatDocisMandat");
						if (vData2.length > 0 && that.getView().byId("id_Lifnr").getValue() == "") {
							vErr = true;
							vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("PlsSelectVendor");
						}
					}
					if (vData2.length > 0 && that.getView().byId("id_Lifnr").getValue() == "") {
						vErr = true;
						vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("PlsSelectVendor");
					}
					vKey = "WBWR";
				} else if (that.getView().byId("id_WbType").getSelectedKey() == "Without") {
					if (that.getView().byId("id_Rbref").getSelectedIndex() == 0) {
						var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');
						if (vData.length == 0 && vData2.length == 0) {
							vErr = true;
							vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("DelMatDocisMandat");
						}
						if (vData2.length > 0 && that.getView().byId("id_Lifnr").getValue() == "") {
							vErr = true;
							vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("PlsSelectVendor");
						}
						vKey = "WOWR";
					} else if (that.getView().byId("id_Rbref").getSelectedIndex() == 1) {
						var vFreeText = that.getView().byId("id_FreeText").getValue();
						if (vFreeText == "") {
							vErr = true;
							vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("RemarksIsMandat");
						}
						vKey = "WOWO";
					} else {
						vErr = true;
						vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("PlSelRefType");
					}
				} else {
					vErr = true;
					vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("PlSelRefType");
				}
			}
			if (!vErr) {
				var oPostModel = that.getView().getModel('odata');
				var newdata = [];
				var arr = [];
				arr = that.getView().getModel('TscannerData').getData();
				var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');
				var data = arr.Vbeln;
				var oEntity = {
					/*	Config1: arr.Vbeln,*/
					Config1: "WPC",
					// Config2: vKey,
					Config4: "S01",
					InOut: "IN",
					Direction: "OUT",
					Gate: arr.Gate,
					Vehno: arr.Truck,
					Dname: arr.Dname,
					Werks: arr.Werks,
					Wbid: arr.Wbid,
					DriverMob: arr.DriverMob,
					Remark: "",
					Config6: arr.Config6,
					Flag: "S",
					Lifnr: that.getView().byId("id_Lifnr").getValue().split(" - ")[0],
					Wtype: this.getView().getModel("oBatchEnable").getData()[0].CfmProcess == "X" ? that.getView().byId("processty").getSelectedKey() : "" //Changed by Avinash
				};
				// var oMultiInput1 = this.getView().byId("id_delivery");
				// var aTokens = oMultiInput1.getTokens();

				//	var vLength = vbeln.length;
				var oItems = [];
				var vItem = 10;
				var vCFMdata = that.getView().getModel("CFMmatnrModel").getData();
				var vMatnr = "";
				if (vCFMdata && vCFMdata.length > 0) {
					vMatnr = vCFMdata[0].Matnr;
				}
				vItem = vItem + 10;
				if (that.getView().getModel("MatDocList").getData().length > 0) {
					var vData = that.getView().getModel("MatDocList").getData();
					for (var i = 0; i < vData.length; i++) {
						var vTemp = {
							Config1: vData[i].Config1,
							Config9: vKey, //Selected Key
							Vbeln: "",
							Config4: vData[i].Config4,
							Werks: that.getOwnerComponent().getModel("localModel").getData().plant,
							Pmblnr: vData[i].Pmblnr,
							Matnr: vData[i].Matnr,
							Zeile: vData[i].Zeile,
							Item: vData[i].Item
						};
						oItems.push(vTemp);
					}
				}
				if (that.getView().byId("id_Matnr").getTokens().length > 0) {
					var vData = that.getView().byId("id_Matnr").getTokens();
					for (var i = 0; i < vData.length; i++) {
						var vTemp = {
							Config1: 'WPC',
							Config9: vKey,
							Vbeln: "",
							Config4: "S01",
							Werks: arr.Werks,
							Pmblnr: "",
							Matnr: vData[i].getKey(),
							Parnr: that.getView().byId("id_Lifnr").getValue().split(" - ")[0]
						};
						oItems.push(vTemp);
					}
					oEntity.Lifnr = "";
				}
				if (that.getView().getModel("MatDocList").getData().length == 0 && that.getView().byId("id_Matnr").getTokens().length == 0 &&
					that
					.getView()
					.getModel("JmRem").getData().length > 0) {
					var vData = that.getView().getModel("JmRem").getData();
					for (var i = 0; i < vData.length; i++) {
						var vTemp = {
							Config1: 'WPC',
							Config9: vKey,
							Vbeln: "",
							Config4: "S01",
							Werks: arr.Werks,
							Pmblnr: "",
							Matnr: "",
							Remarks: vData[i].Text
						};
						oItems.push(vTemp);
					}
				}
				oEntity.GateReturnNav = [];
				oEntity.NavGateEntry = oItems;
				var oPath = '/GateEntrySet';
				oPostModel.create(oPath, oEntity, {
					success: function(oData, Response) {
						var aReturn = oData.GateReturnNav.results;
						var aFlag = [];
						aFlag = aReturn.filter(function(a) {
							return a.Type === "E";
						});
						if (aFlag.length) {
							sap.m.MessageBox.error(oData.GateReturnNav.results[0].Message);
						} else {
							// if (vKey !== "WOWO") {
							// 	that.fnUpdateLoadingTim();
							// }
							// if (vKey === "WOWO") {
							var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("LoadingTimeCapturedSuccess");
							sap.m.MessageBox.success(oData.GateReturnNav.results[0].Message);
							that.onScannerCancel();
							// that.getOwnerComponent().getRouter().navTo("Dashboard");
							// }
						}
					},
					error: function(oResponse) {
						var vErrorTxt = that.getView().getModel("i18n").getResourceBundle().getText("ErrorinGateEntry");
						sap.m.MessageToast.show(vErrorTxt);
					}

				});
			} else {
				sap.m.MessageBox.error(vErrMsg);
			}
		},
		//End of Added

		onSave: function() {
			var that = this;
			var oPostModel = that.getView().getModel('odata');
			var newdata = [];
			var arr = [];
			arr = that.getView().getModel('TscannerData').getData();
			var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');
			var data = arr.Vbeln;
			var oEntity = {
				/*	Config1: arr.Vbeln,*/
				Config1: "WPC",
				Config4: "S01",
				InOut: "IN",
				Direction: "OUT",
				Gate: arr.Gate,
				Vehno: arr.Truck,
				Dname: arr.Dname,
				Werks: arr.Werks,
				Wbid: arr.Wbid,
				DriverMob: arr.DriverMob,
				Remark: arr.remark,
				Config6: arr.Config6,
				Wtype: this.getView().getModel("oBatchEnable").getData()[0].CfmProcess == "X" ? that.getView().byId("processty").getSelectedKey() : "" //Changed by Avinash
			};
			// var oMultiInput1 = this.getView().byId("id_delivery");
			// var aTokens = oMultiInput1.getTokens();

			//	var vLength = vbeln.length;
			var oItems = [];
			var vItem = 10;

			vItem = vItem + 10;
			var vTemp = {
				Config1: 'WPC',
				Vbeln: vbeln,
				Config4: "S01",
				Werks: arr.Werks
					//	Item: vItem.toString()
					//	Item:""
			};
			oItems.push(vTemp);

			oEntity.GateReturnNav = [];
			oEntity.NavGateEntry = oItems;
			var oPath = '/GateEntrySet';
			oPostModel.create(oPath, oEntity, {
				success: function(oData, Response) {
					var aReturn = oData.GateReturnNav.results;
					var aFlag = [];
					aFlag = aReturn.filter(function(a) {
						return a.Type === "E";
					});
					if (aFlag.length) {
						sap.m.MessageBox.error(oData.GateReturnNav.results[0].Message);
					} else {
						that.fnUpdateLoadingTim();
					}
				},
				error: function(oResponse) {
					var vErrorTxt = that.getView().getModel("i18n").getResourceBundle().getText("ErrorinGateEntry");
					sap.m.MessageToast.show(vErrorTxt);
				}

			});
		},
		fnUpdateLoadingTim: function(vActn) {
			var that = this;
			var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');
			if (vbeln) {
				vbeln = vbeln.trim();
			} else {
				vbeln = "";
			}
			if (vActn !== 'X') {
				var vActn = '';
			}
			// that.getBusyDialog = new sap.m.BusyDialog({}).open();
			var readUrl = "/LoadTimeUpdateSet";
			this.getView().getModel('odata').read(readUrl, {
				filters: [
					new Filter("Vbeln", FilterOperator.EQ, vbeln),
					new Filter("Flag", FilterOperator.EQ, vActn),
					new Filter("Wtype", FilterOperator.EQ, that.getView().getModel("oBatchEnable").getData()[0].CfmProcess == "X" ? that.getView()
						.byId(
							"processty").getSelectedKey() : "") //Added by Avinash - CFM Changes
				],
				success: function(odata, Response) {
					// that.getBusyDialog.close();
					//Added by Avinash on 26/07/2021...
					if (odata.results[0].ExMessage !== "") {
						//Added by Avinash....
						sap.m.MessageBox.error(odata.results[0].ExMessage, {
							actions: [MessageBox.Action.CLOSE],
							onClose: function(oAction) {
								// that.getBusyDialog.close();
								if (oAction === "CLOSE") {
									that.getOwnerComponent().getRouter().navTo("Dashboard");
									// that._ResetQRCode(that);
								}
							}
						});
						//End of added
					} else {
						if (odata.results[0].Flag == 'X') {
							// var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("LoadingTimeCapturedSuccess");
							var ErrorMsg = that.getView().getModel("i18n").getResourceBundle().getText("ErrorMsg");

							//Added by Avinash....
							MessageBox.show(ErrorMsg, {
								icon: MessageBox.Icon.WARNING,
								title: that.getView().getModel("i18n").getResourceBundle().getText("Warning"),
								actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								onClose: function(oAction) {
									if (oAction == 'YES') {
										that.getView().getModel("scannerData").refresh();
									} else {
										that.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
										that.getView().getModel("scannerData").refresh();
										that.getView().setModel(new sap.ui.model.json.JSONModel({}), "PlantPickModel");
										that.getView().getModel("PlantPickModel").refresh();
										that.getView().byId("id_timepick").setValue("");
										sap.m.MessageToast.show((that.getView().getModel("i18n").getResourceBundle().getText("ActionCancelled")));
										that.onScannerCancel();
									}
								}
							});
							//End of added

							// that.getView().byId('id_ok').setEnabled(false);
							// sap.m.MessageToast.show(ErrorMsg); //Commented by Avinash on 06.05.2021
							// that.onScannerCancel();
							//Added By Guruprasad On 14.01.2020.
						} else if (odata.results[0].Flag == 'E') {
							var ErrorMsg1 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorMsg1");
							sap.m.MessageToast.show(ErrorMsg1);
							//Added By Guruprasad On 14.01.2020.
							// that.onScannerCancel();
						} //Added By Guruprasad On 14.01.2020.
						else if (odata.results[0].Flag == 'Y') {
							var ErrorMsg2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorMsg2");
							sap.m.MessageToast.show(ErrorMsg2);
							// that.onScannerCancel();
						} else if (odata.results[0].Flag == 'B') {
							var ErrorMsg3 = that.getView().getModel("i18n").getResourceBundle().getText("ScanBapiError");
							sap.m.MessageToast.show(ErrorMsg3);
							// that.onScannerCancel();
						} else {
							// var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("ErrorincapturingLoadingsatrtDate");
							// if (vActn !== 'X') {
							// 	sap.m.MessageToast.show(EnterDel);
							// }
							if (vActn !== 'X') {
								that.oCaptureTime = 'X';
								var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("LoadingTimeCapturedSuccess");
								that.onScannerSave(); //Added By Guruprasad On 13.01.2020.
								sap.m.MessageBox.success(EnterDel);
								//Added By Guruprasad On 15.01.2020.
								that.onScannerCancel();
								// location.reload();

							}
							// that.getView().byId('id_ok').setEnabled(true);
						}
					}
				},
				error: function(oResponse) {
					var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("ErrorincapturingLoadingsatrtDate");
					if (vActn !== 'X') {
						sap.m.MessageToast.show(EnterDel);
					}
					// that.getView().byId('id_ok').setEnabled(true);
				}
			});
		},

		//===============================================================
		//-------------------Load Delivery Function----------------------
		//===============================================================
		_LoadDeliveryItems: function(that, vbeln, fSaved) {
			//	this.getOwnerComponent().getRouter().navTo("Deliverycheck");
			//	var networkState = navigator.connection.type;
			// if (networkState !== "none") {
			that.getBusyDialog = new sap.m.BusyDialog({
				//text: that.oBundle.getText('dataLoadingMsg')
			}).open();

			//var oPath = "DeliverySet?$filter=Vbeln eq '8130002478'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
			var oPath = "DeliverySet?$filter=Vbeln eq '" + vbeln + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";

			var oGetModel = this.getView().getModel('odata');

			oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
				var oDataR = oData.results[0];
				if (oDataR.DelReturnNav.results["length"] !== 0) {
					if (fSaved) {
						sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
							actions: [MessageBox.Action.CLOSE],
							onClose: function(oAction) {
								that.getBusyDialog.close();
								if (oAction === "CLOSE") {
									that.getOwnerComponent().getRouter().navTo("Dashboard");
									that._ResetQRCode(that);
								}
							}
						});
					} else {
						that.getBusyDialog.close();
						that._ResetQRCode(that);

					}
				} else {
					that.getBusyDialog.close();
					sap.ui.getCore().byId("id_delivery").setValue("");
				}
			}, function(oError) {
				sap.m.MessageBox.error(oError.message, {
					onClose: function(oAction) {
						that.getOwnerComponent().getRouter().navTo("Dashboard");
						//	navigator.app.exitApp();
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
		GetClock: function() {

			//   var tday = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
			//  var tmonth = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
			var d = new Date();
			var nday = d.getDay(),
				nmonth = d.getMonth(),
				ndate = d.getDate(),
				nyear = d.getYear(),
				nhour = d.getHours(),
				nmin = d.getMinutes(),
				nsec = d.getSeconds(),
				ap;
			if (nhour === 0) {
				ap = " AM";
				nhour = 12;
			} else if (nhour < 12) {
				ap = " AM";
			} else if (nhour == 12) {
				ap = " PM";
			} else if (nhour > 12) {
				ap = " PM";
				nhour -= 12;
			}
			if (nyear < 1000) nyear += 1900;
			if (nmin <= 9) nmin = "0" + nmin;
			if (nsec <= 9) nsec = "0" + nsec;
			var result = "" + nhour + ":" + nmin + ":" + nsec + ap + "";
			return result;
		},
		//=============================== Added by chaithra on 30/6/2020 ===================//
		fnPressok: function() {
			var that = this;
			this.getView().byId('id_scanid').setState(true);
			this.state = this.getView().byId('id_scanid').getState();
			this.getView().getModel("setting").getData().SwitchFlag = this.state;
			this.getView().getModel("setting").refresh();
			this.getView().byId("id_okManual").setVisible(false);
			// this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			// this.getView().getModel("scannerData").refresh();
			var vFlag = "X";
			var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
			//Added by Avinash
			if (this.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
				this.getView().byId("id_RefDyn").setVisible(true);
				this.getView().byId("id_Weighbridge").setVisible(true);
				this.getView().byId("labelprocessSales").setVisible(true); //Added by Avinash  
				this.getView().byId("processty").setVisible(true); //Added by Avinash  
				if (this.getView().byId("id_MaDocManual").getValue() !== "") {
					var oPath = "F4Set?$filter=IvMblnr eq '" + this.getView().byId("id_MaDocManual").getValue().trim() + "'and Werks eq '" + vPlant +
						"' and F4Mblnr eq '" + vFlag + "'&$expand=F4MbItemNav";
					this.getView().byId("id_MaDocManual").setVisible(false);
					this.getView().byId("id_MatDocLabManual").setVisible(false);
					this.getView().byId("id_delivery").setVisible(false);
					this.getView().byId("id_deliveryText").setVisible(false);
					that.fnGetMatDoclist(oPath);
					this.getView().byId("id_MaDocManual").getValue().setValue("");
					return;
				}
			}
			//End of Added
			var vProccessFlag = "S";
			var oGetModel = this.getView().getModel('odata');
			var oData1 = this.getView().byId("id_delivery").getValue();
			var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1 + "'and Werks eq '" + vPlant +
				"' and ProcessFlag eq '" + vProccessFlag + "' and PickFlag eq '" + vFlag + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
			// var oPath2 = "GateEntrySet?$filter=Wbid eq '" + weighbridgeid + "'and Werks eq '" + vPlant +
			// "'and Flag eq 'E' &$expand=NavGateEntry,GateReturnNav";
			var vResErrMsg = "";
			oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
				if (oData.results[0].DelReturnNav.results["length"] !== 0) {
					// that.getBusyDialog.close();
					for (var i = 0; i < oData.results[0].DelReturnNav.results.length; i++) {
						if (oData.results[0].DelReturnNav.results[i].Type == "E") {
							vResErrMsg = vResErrMsg + oData.results[0].DelReturnNav.results[i].Message + "\n";
						}
					}
					sap.m.MessageBox.error(vResErrMsg, {
						actions: [MessageBox.Action.CLOSE],
						onClose: function(oAction) {

							if (oAction === "CLOSE") {
								that.getOwnerComponent().getRouter().navTo("Dashboard");
								that._ResetQRCode(that);
							}
						}
					});

				} else {
					var vError = false;
					var vData = oData.results[0].DelOutputNav.results;
					for (var i = 0; i < vData.length; i++) {
						if (vData[0].Fbatc === "X") { //Added by Avinash...
							if (vData[i].Lgort == "") {
								vError = true;
								//	var posnr=	Number(vData[i].Posnr).toString();
								var Nostoragelocation = that.getView().getModel("i18n").getResourceBundle().getText("Nostoragelocation");
								//	var deliveno = that.getView().getModel("i18n").getResourceBundle().getText("deliveno");
								sap.m.MessageToast.show(Nostoragelocation + " " + oData1[0]);
							}
						}
					}
					if (vError === false) {
						if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess !== "X") {
							that.getView().byId("id_CFMVbeln").setVisible(false);
							that.getView().byId("id_CFMVbelnLabel").setVisible(false);
							that.getView().byId("id_delivery").setVisible(true);
							that.getView().byId("id_deliveryText").setVisible(true);
						}
						var oDataR = oData.results[0];
						var val1 = oDataR.DelEsOutNav;
						var oJSONModel = new sap.ui.model.json.JSONModel();
						var vDiffWb = false;
						var vWbId = val1.results[0].Wbid;
						var vsWbType = val1.results[0].Wtype;
						if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
							var vScannedData = that.getView().getModel("scannerData").getData();
							if (vScannedData.Vbeln !== undefined && val1.results[0].Wbid) {
								if (vScannedData.Wbid !== val1.results[0].Wbid) {
									vDiffWb = true;
								}
							}
							if (vWbId === "") {
								vWbId = that.getView().byId("id_Weighbridge").getValue();
							}
							if (vsWbType === "") {
								vsWbType = that.getView().byId("processty").getSelectedKey();
							}
						}

						var oSet;
						oSet = {
							"Vbeln": oData1,
							"Werks": val1.results[0].Werks,
							"Erdat": val1.results[0].Erdat,
							"Erzet": val1.results[0].Erzet,
							"Truck": val1.results[0].Truck,
							//	"Nf_Number": val1.results[0].Nf_Number,
							//	"Ee_Number": val1.results[0].Ee_Number,
							//	"So_Number": val1.results[0].So_Number,
							"Dname": val1.results[0].Dname,
							// "Wbid": val1.results[0].Wbid,
							// "Wtype": val1.results[0].Wtype //Added by Avinash
							"Wbid": vWbId,
							"Wtype": vsWbType,
							// "Lifnr": val1.results[0].Transpoter //Added for Transporter Updation
						};
						var oScanDataModel = new sap.ui.model.json.JSONModel();
						oScanDataModel.setData(oSet);
						that.getView().setModel(oScanDataModel, "scannerData");
						//this.getView().setModel(oScanDataModel, "scannerData");
						that.getView().getModel("scannerData").refresh();
						if (that.getView().getModel("oBatchEnable").getData()[0].CfmProcess === "X") {
							that.getView().byId("processty").setSelectedKey(vsWbType);
							var oMultiInput2 = that.getView().byId("id_CFMVbeln");
							if (vDiffWb) {
								oMultiInput2.setTokens([]);
								var InfoMsg = that.getView().getModel("i18n").getResourceBundle().getText("DiffWbIdScanned");
								sap.m.MessageToast.show(InfoMsg);
							}
							var aTokens = oMultiInput2.getTokens();
							var vTokenv = new sap.m.Token({
								text: oData1,
								key: oData1
							});
							aTokens.push(vTokenv);
							var aDups = [];
							var postingarray = [];
							var aItemDatas = aTokens;
							postingarray = aItemDatas.filter(function(el) {
								// If it is not a duplicate, return true
								if (aDups.indexOf(el.getKey()) === -1) {
									aDups.push(el.getKey());
									return true;
								}
								return false;
							});
							oMultiInput2.removeAllTokens();
							oMultiInput2.setTokens(postingarray);
							that.getView().byId("id_CFMVbeln").setVisible(true);
							that.getView().byId("id_CFMVbelnLabel").setVisible(true);
							that.getView().byId("id_delivery").setVisible(false);
							that.getView().byId("id_deliveryText").setVisible(false);
						}
						var oDataModel = new sap.ui.model.json.JSONModel();
						oDataModel.setData(val1);
						that.getView().setModel(oDataModel, "PlantPickModel");
						that.getView().getModel("PlantPickModel").refresh();
						that.fnUpdateLoadingTim1('X');
					}
				}
			});
		},
		fnUpdateLoadingTim1: function(vActn) {
			var that = this;
			var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');
			vbeln = vbeln.trim();
			if (vActn !== 'X') {
				var vActn = '';
			}
			// that.getBusyDialog = new sap.m.BusyDialog({}).open();
			var readUrl = "/LoadTimeUpdateSet";
			this.getView().getModel('odata').read(readUrl, {
				filters: [
					new Filter("Vbeln", FilterOperator.EQ, vbeln),
					new Filter("Flag", FilterOperator.EQ, vActn)
				],
				success: function(odata, Response) {
					// that.getBusyDialog.close();
					if (odata.results[0].Flag == 'X') {

						// var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("LoadingTimeCapturedSuccess");
						var ErrorMsg = that.getView().getModel("i18n").getResourceBundle().getText("ErrorMsg");
						sap.m.MessageToast.show(ErrorMsg);
						// that.onScannerCancel();
						// that.getView().byId('id_ok').setEnabled(false);
						//Added By Guruprasad On 14.01.2020.
					} else if (odata.results[0].Flag == 'E') {
						var ErrorMsg1 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorMsg1");
						sap.m.MessageToast.show(ErrorMsg1);
						//Added By Guruprasad On 14.01.2020.
						// that.onScannerCancel();
					} //Added By Guruprasad On 14.01.2020.
					else if (odata.results[0].Flag == 'Y') {
						var ErrorMsg2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorMsg2");
						sap.m.MessageToast.show(ErrorMsg2);
						// that.onScannerCancel();
					} else {
						// var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("ErrorincapturingLoadingsatrtDate");
						var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("LoadingTimeCapturedSuccess");
						// var ErrorMsg = that.getView().getModel("i18n").getResourceBundle().getText("ErrorMsg");
						if (vActn !== 'X') {
							that.oCaptureTime = 'X';
							that.onScannerSave(); //Added By Guruprasad On 13.01.2020.
							sap.m.MessageBox.success(EnterDel);
							that.onScannerCancel();
							//Added By Guruprasad On 15.01.2020.
							// that.onScannerCancel();
							// location.reload();

						}
						// that.getView().byId('id_ok').setEnabled(true);
					}
				},
				error: function(oResponse) {
					var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("ErrorincapturingLoadingsatrtDate");
					if (vActn !== 'X') {
						sap.m.MessageToast.show(EnterDel);
					}
					// that.getView().byId('id_ok').setEnabled(true);
				}
			});
		},

		fnLiveChangeTextNum: function(oEvent) {
			var inputtxt = oEvent.getSource().getValue();
			var letters = /^[0-9a-zA-Z ]*$/;
			var vFlag = true;
			if (inputtxt.match(letters)) {
				vFlag = true;
			} else {
				vFlag = false;
			}
			if (!vFlag) {
				var vSlice = inputtxt.slice(inputtxt.length - 1, inputtxt.length);
				var vReplace = inputtxt.replace(vSlice, "");
				oEvent.getSource().setValue(vReplace.toUpperCase());
			} else {
				oEvent.getSource().setValue(inputtxt.toUpperCase());
			}
		}

	});

});