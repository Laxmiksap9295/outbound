jQuery.sap.require("sap.ndc.BarcodeScanner");
var a;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/m/MessageBox',
	"sap/ui/model/json/JSONModel",
	"LoadingConfirmation/model/formatter"
], function(Controller, Filter, FilterOperator, MessageBox, JSONModel, formatter) {
	"use strict";
	var Signature, oCont;
	this.ContractChange = false;
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn;
	return Controller.extend("LoadingConfirmation.controller.TOConfirmNew", {

		//===============================================================
		//-------------------On Init Function----------------------
		//===============================================================
		formatter: formatter,
		onInit: function() {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.getOwnerComponent().getRouter().getRoute("TOConfirmNew").attachPatternMatched(this._onObjectMatched, this);

		},
		//===============================================================
		//-------------------Load Required Data Function----------------------
		//===============================================================
		_onObjectMatched: function() {
			oCont = this;
			var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			this.getView().byId('id_homenew').setSrc(vPathImage + "/Images/home.png");

			this.fnParameterCheck();
			var oHeaderLines = {
				HeaderItems: [],
				LineItems: [],
				Header: []
			};

			var oJson = new sap.ui.model.json.JSONModel(oHeaderLines);
			oCont.getView().setModel(oJson, "DeliverySet");
			oCont.getView().getModel("DeliverySet").refresh(true);
			oCont.ContractChange = false; //Added by Avinash
			oCont.Reason = "";

			//   var batchitemnew = [];
			//   var Batchitem = new sap.ui.model.json.JSONModel(batchitemnew);   
			//   oCont.getView().setModel(Batchitem, "BatchItems");
			// oCont.getView().getModel("BatchItems").refresh();
		},
		//===============================================================
		//-------------------Load Delivery item Function----------------------
		//===============================================================
		_LoadDeliveryItems: function(that, vbeln, fSaved) {
			sap.ui.core.BusyIndicator.show(0);

			var oPath = "DeliverySet?$filter=Vbeln eq '" + vbeln + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";

			var oGetModel = this.getView().getModel("odata");
			oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var oDataR = oData.results[0];
					if (oDataR.DelReturnNav.results["length"] !== 0) {
						if (fSaved) {
							sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
								onClose: function(oAction) {

									sap.ui.core.BusyIndicator.hide();

									// that.getOwnerComponent().getRouter().navTo("Dashboard");//Commented for non navigation

									var oScanDataModel = new sap.ui.model.json.JSONModel();
									oScanDataModel.setData({});
									that.getOwnerComponent().setModel(oScanDataModel, "scannerData");

								}
							});
						} else {
							// that.getBusyDialog.close();

							// that._ResetQRCode(that);
							// Added By Guruprasad On 3.12.2019 For Restting The QR Code Scanner
							var oScanDataModel = new sap.ui.model.json.JSONModel();
							oScanDataModel.setData({});
							that.getOwnerComponent().setModel(oScanDataModel, "scannerData");
							// that.fnLoadNonBatchItem();
							that.getOwnerComponent().getRouter().navTo("Dashboard"); //Commented for non navigation
							//	that.getOwnerComponent().setModel(oScanDataModel, "scannerData");
							// Added By Guruprasad On 3.12.2019 For Restting The QR Code Scanner Ends Here
						}
					} else {

						var oHeaderItems = [],
							oLineItems = [];

						$.each(oDataR.DelOutputNav.results, function(index, value, array) {

							// Custom GroupHeader Title
							value.StrLoc = value.Lgort + " - " + value.Lgobe;
							if (value.Pikmg !== null) {
								if ((value.Pikmg.trim().length !== 0) && (Number(value.Pikmg) !== 0)) {
									value.PikmgF = false;
								} else {
									value.PikmgF = true;
								}
							} else {
								value.PikmgF = false;
							}
							if (value.Uecha === "000000") {
								// Header Item
								oHeaderItems.push(value);
								if ((value.Uecha === "000000") &&
									(value.Charg.toString().trim().length !== 0)) {
									// Line Item
									value.Uecha = value.Posnr;
									oLineItems.push(value);
								}
							} else {
								// Line Item
								oLineItems.push(value);
							}
						});

						var oHeaderLines = {
							HeaderItems: oHeaderItems,
							LineItems: oLineItems,
							Header: oDataR.DelEsOutNav.results[0]
						};
						sap.ui.core.BusyIndicator.hide();
						var opn_quancheck = sap.ui.getCore().byId("id_OpQty1").getValue();;
						if (oHeaderItems.length === 0 && opn_quancheck === '0.000') {

							that.getOwnerComponent().getRouter().navTo("Dashboard"); //Commented for non navigation
						} else {
							that.fnLoadNonBatchItem();
						}
						var oJson = new sap.ui.model.json.JSONModel(oHeaderLines);
						that.getOwnerComponent().setModel(oJson, "DeliverySet");
						// that.getBusyDialog.close();
						// that.fnRefresh();
					}
				},
				function(oError) {
					// that.getBusyDialog.close();
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageBox.error(oError.message, {
						onClose: function(oAction) {
							this.oRouter.navTo().exitApp();
						}
					});

				});
		},

		//Added by Avinash
		fnLoadNonBatchItem: function() {
			var that = this;
			var localModel = that.getOwnerComponent().getModel("localModel");
			var vPlant = localModel.getProperty("/plant");
			var vVbeln = localModel.getProperty("/Vbeln");
			// var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
			sap.ui.core.BusyIndicator.show(0);
			var vFlag = "X";
			var oPath = "DeliverySet?$filter=Vbeln eq '" + vVbeln + "'and Werks eq '" + vPlant +
				"'and PickFlag eq '" + vFlag + "' &$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
			// var oPath = "DeliverySet?$filter=Vbeln eq '" + vVbeln + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
			var oGetModel = this.getView().getModel("odata");
			oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
				sap.ui.core.BusyIndicator.hide();
				var oDataR = oData.results[0];
				if (oDataR.DelReturnNav.results["length"] !== 0) {
					// if (fSaved) {
					sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
						onClose: function(oAction) {
							// that.getBusyDialog.close();
							sap.ui.core.BusyIndicator.hide();
							//that.getOwnerComponent().getRouter().navTo("Initial");
							that.getOwnerComponent().getRouter().navTo("Dashboard");
							//	that._ResetQRCode(that); Commented By Guruprasad On 3.12.2019
							// Added By Guruprasad On 3.12.2019 For Restting The QR Code Scanner
							var oScanDataModel = new sap.ui.model.json.JSONModel();
							oScanDataModel.setData({});
							that.getOwnerComponent().setModel(oScanDataModel, "scannerData");
							// Added By Guruprasad On 3.12.2019 For Restting The QR Code Scanner Ends Here

						}
					});
					// } else {
					// 	var oScanDataModel = new sap.ui.model.json.JSONModel();
					// 	oScanDataModel.setData({});
					// 	that.getOwnerComponent().setModel(oScanDataModel, "scannerData");
					// 	that.getOwnerComponent().getRouter().navTo("Dashboard");
					// }
				} else {

					if (that.getView().getModel("oLocEnable").getData().Charg01 == "X") {

						var oHeaderItems = [],
							oLineItems = [];
						var vPosnr = 900000;
						var vbatchSplit = false;
						for (var i = 0; i < oDataR.DelOutputNav.results.length; i++) {
							if (oDataR.DelOutputNav.results[i].Uecha !== "000000") {
								var vPosnrStr = oDataR.DelOutputNav.results[i].Posnr;
								vPosnr = Number(vPosnrStr);
								vbatchSplit = true;
							}
						}
						// for()
						for (var i = 0; i < oDataR.DelOutputNav.results.length; i++) {
							if (oDataR.DelOutputNav.results[i].Uecha === "000000") {
								oHeaderItems.push(oDataR.DelOutputNav.results[i]);
								if ((oDataR.DelOutputNav.results[i].Uecha === "000000") &&
									(oDataR.DelOutputNav.results[i].Charg.toString().trim().length == 0) && vbatchSplit == false) {
									// (oDataR.DelOutputNav.results[i].Charg.toString().trim().length == 0) && oDataR.DelOutputNav.results[0].Posnr.search("900") ==
									// 0) { //Facing problem while without batch...
									vPosnr = vPosnr + 1;
									// var vPosnrStr = vPosnr.toString();
									oLineItems.push({
										Charg: "",
										Customer: oDataR.DelOutputNav.results[i].Customer,
										Bstme: oDataR.DelOutputNav.results[i].Bstme,
										Del_type: oDataR.DelOutputNav.results[i].Del_type,
										Fbatc: oDataR.DelOutputNav.results[i].Fbatc,
										Fpicq: oDataR.DelOutputNav.results[i].Fpicq,
										Kwmeng: oDataR.DelOutputNav.results[i].Kwmeng,
										Lfimg: oDataR.DelOutputNav.results[i].Lfimg, /// As Picking Qty - Need to check
										Lgobe: oDataR.DelOutputNav.results[i].Lgobe,
										Lgort: oDataR.DelOutputNav.results[i].Lgort,
										Maktx: oDataR.DelOutputNav.results[i].Maktx,
										Matnr: oDataR.DelOutputNav.results[i].Matnr,
										Meins: oDataR.DelOutputNav.results[i].Meins,
										Menge: oDataR.DelOutputNav.results[i].Menge,
										Otnum: oDataR.DelOutputNav.results[i].Otnum,
										Pikmg: oDataR.DelOutputNav.results[i].Pikmg,
										PikmgF: true,
										Posnr: vPosnr.toString(),
										Sc_No: oDataR.DelOutputNav.results[i].Sc_No,
										Spart: oDataR.DelOutputNav.results[i].Spart,
										Sto_flg: oDataR.DelOutputNav.results[i].Sto_flg,
										StrLoc: oDataR.DelOutputNav.results[i].StrLoc,
										Uecha: oDataR.DelOutputNav.results[i].Posnr,
										Vbeln: oDataR.DelOutputNav.results[i].Vbeln,
										Vgbel: oDataR.DelOutputNav.results[i].Vgbel,
										Vgpos: oDataR.DelOutputNav.results[i].Vgpos,
										Vkorg: oDataR.DelOutputNav.results[i].Vkorg,
										Vrkme: oDataR.DelOutputNav.results[i].Vrkme,
										Vtweg: oDataR.DelOutputNav.results[i].Vtweg,
										Werks: oDataR.DelOutputNav.results[i].Werks,
										Reason: "",
										Pmat1: oDataR.DelOutputNav.results[i].Pmat1, //Added by malar - 02.02.2023
										Pmat2: oDataR.DelOutputNav.results[i].Pmat2,
										Pmatno1: oDataR.DelOutputNav.results[i].Pmatno1,
										Pmatno2: oDataR.DelOutputNav.results[i].Pmatno2 //Ended
									});
									// oDataR.DelOutputNav.results[i].Uecha = oDataR.DelOutputNav.results[i].Posnr;
									// value.Uecha = value.Posnr;
									// oLineItems.push(oDataR.DelOutputNav.results[i]);
								} else if ((oDataR.DelOutputNav.results[i].Uecha === "000000") &&
									(oDataR.DelOutputNav.results[i].Charg.toString().trim().length !== 0)) {
									// oDataR.DelOutputNav.results[i].Uecha = oDataR.DelOutputNav.results[i].Posnr;
									// oLineItems.push(oDataR.DelOutputNav.results[i]);
									// 0) { //Facing problem while without batch...
									vPosnr = vPosnr + 1;
									// var vPosnrStr = vPosnr.toString();
									oLineItems.push({
										Charg: oDataR.DelOutputNav.results[i].Charg,
										Customer: oDataR.DelOutputNav.results[i].Customer,
										Bstme: oDataR.DelOutputNav.results[i].Bstme,
										Del_type: oDataR.DelOutputNav.results[i].Del_type,
										Fbatc: oDataR.DelOutputNav.results[i].Fbatc,
										Fpicq: oDataR.DelOutputNav.results[i].Fpicq,
										Kwmeng: oDataR.DelOutputNav.results[i].Kwmeng,
										Lfimg: oDataR.DelOutputNav.results[i].Lfimg, /// As Picking Qty - Need to check
										Lgobe: oDataR.DelOutputNav.results[i].Lgobe,
										Lgort: oDataR.DelOutputNav.results[i].Lgort,
										Maktx: oDataR.DelOutputNav.results[i].Maktx,
										Matnr: oDataR.DelOutputNav.results[i].Matnr,
										Meins: oDataR.DelOutputNav.results[i].Meins,
										Menge: oDataR.DelOutputNav.results[i].Menge,
										Otnum: oDataR.DelOutputNav.results[i].Otnum,
										Pikmg: oDataR.DelOutputNav.results[i].Pikmg,
										PikmgF: true,
										Posnr: vPosnr.toString(),
										Sc_No: oDataR.DelOutputNav.results[i].Sc_No,
										Spart: oDataR.DelOutputNav.results[i].Spart,
										Sto_flg: oDataR.DelOutputNav.results[i].Sto_flg,
										StrLoc: oDataR.DelOutputNav.results[i].StrLoc,
										Uecha: oDataR.DelOutputNav.results[i].Posnr,
										Vbeln: oDataR.DelOutputNav.results[i].Vbeln,
										Vgbel: oDataR.DelOutputNav.results[i].Vgbel,
										Vgpos: oDataR.DelOutputNav.results[i].Vgpos,
										Vkorg: oDataR.DelOutputNav.results[i].Vkorg,
										Vrkme: oDataR.DelOutputNav.results[i].Vrkme,
										Vtweg: oDataR.DelOutputNav.results[i].Vtweg,
										Werks: oDataR.DelOutputNav.results[i].Werks,
										Reason: "",
										Pmat1: oDataR.DelOutputNav.results[i].Pmat1, //Added by malar - 02.02.2023
										Pmat2: oDataR.DelOutputNav.results[i].Pmat2,
										Pmatno1: oDataR.DelOutputNav.results[i].Pmatno1,
										Pmatno2: oDataR.DelOutputNav.results[i].Pmatno2 //Ended
									});
								}

							} else {
								oLineItems.push(oDataR.DelOutputNav.results[i]);
							}
						}

					} else {
						var oHeaderItems = [],
							oLineItems = [];

						$.each(oDataR.DelOutputNav.results, function(index, value, array) {

							value.StrLoc = value.Lgort + " - " + value.Lgobe;
							if (value.Pikmg !== null) {
								if ((value.Pikmg.trim().length !== 0) && (Number(value.Pikmg) !== 0)) {
									value.PikmgF = false;
								} else {
									value.PikmgF = true;
								}
							} else {
								value.PikmgF = false;
							}
							if (value.Uecha === "000000") {
								// Header Item
								oHeaderItems.push(value);
								if ((value.Uecha === "000000") &&
									(value.Charg.toString().trim().length !== 0)) {
									// Line Item
									value.Uecha = value.Posnr;
									oLineItems.push(value);
								}
							} else {
								// Line Item
								oLineItems.push(value);
							}
						});

					}
					var oHeaderLines = {
						HeaderItems: oHeaderItems,
						LineItems: oLineItems,
						Header: oDataR.DelEsOutNav.results[0]
					};
					sap.ui.core.BusyIndicator.hide();
					var oJson = new sap.ui.model.json.JSONModel(oHeaderLines);
					that.getView().setModel(oJson, "DeliverySet");
					that.getView().getModel("DeliverySet").refresh(true);

				}
			}, function(oError) {
				// that.getBusyDialog.close();
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageBox.error(oError.message, {
					onClose: function(oAction) {
						this.oRouter.navTo().exitApp();
					}
				});

			});

		},

		// For validating weather all the data is entered or not 
		_checkAllItemEntered: function(oData, Lgort) {
			var bFlag = [];
			$.each(oData, function(index, value, array) {
				if ((Lgort === value.Lgort) && ((parseFloat(value.Pikmg) === 0) || value.Pikmg === "" || isNaN(parseFloat(value.Pikmg)))) {
					bFlag.push(true);
				} else {
					bFlag.push(false);
				}
			});
			return (bFlag.indexOf(true) > -1) ? true : false;
		},
		_ResetQRCode: function(that) {
			// that.getBusyDialog.close();
			sap.ui.core.BusyIndicator.hide();
			var oScanDataModel = new sap.ui.model.json.JSONModel();
			oScanDataModel.setData({});
			that.getOwnerComponent().setModel(oScanDataModel, "scannerData");

		},
		onCancelItemClose: function(oEvent) {
			this._ItemDialog.close();
			sap.ui.getCore().byId(a).removeStyleClass("backgroundCss");
		},

		onItemConfirm: function() {
			var vOpenQty = sap.ui.getCore().byId("id_OpQty1").getValue();
			var that = this;
			var aItemsData = that.getView().getModel("BatchItems").getData().Items;
			var vErr = false;
			if (aItemsData.length > 0) {
				if (!aItemsData[0].Lenum) {
					vErr = true;
				}
			} else {
				vErr = true;
			}
			if (!vErr) {
				if (Number(vOpenQty) > 0) {
					var vResWarMsg = that.getView().getModel("i18n").getResourceBundle().getText("LessPickQtyConfirm");
					MessageBox.show(vResWarMsg, {
						icon: MessageBox.Icon.WARNING,
						title: that.getView().getModel("i18n").getResourceBundle().getText("Warning"),
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: function(oAction) {
							if (oAction == 'YES') {
								that.fnConfirmTO();
								that._ItemDialog.close();
								sap.ui.getCore().byId(a).removeStyleClass("backgroundCss");
							} else {
								sap.m.MessageToast.show((that.getView().getModel("i18n").getResourceBundle().getText("ActionCancel")));
							}
						}
					});
				} else {
					that.fnConfirmTO();
					this._ItemDialog.close();
					sap.ui.getCore().byId(a).removeStyleClass("backgroundCss");
				}
			} else {
				var vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText("PlScanPallet");
				MessageBox.error(vErrMsg);
			}
		},

		fnParameterCheck: function(plant) {
			var oPath = "/F4Set";
			var that = this;
			var localModel = that.getOwnerComponent().getModel("localModel");
			var vWerks = localModel.getProperty("/plant");
			// var vWerks = that.getOwnerComponent().getModel("DeliverySet").getData().HeaderItems[0].Werks;
			var oGetModel = that.getView().getModel('odata');
			var vVbeln = localModel.getProperty("/Vbeln");
			oGetModel.read(oPath, {
				filters: [
					new Filter("FieldIp", FilterOperator.EQ, "X"),
					new Filter("IvWerks", FilterOperator.EQ, vWerks),
					new Filter("IvVbeln", FilterOperator.EQ, vVbeln)
				],
				urlParameters: {
					$expand: "F4FieldsNav,F4ReturnNav"
				},
				success: function(oData, Response) {
					//Added by Avinash..
					that.getView().setModel(new JSONModel(oData.results[0].F4FieldsNav.results[0]), "oLocEnable");
					that.getView().getModel("oLocEnable").refresh();

					var Batch1 = oData.results[0].F4FieldsNav.results.find(function(x) {
						if (x.Signature == "X") {
							Signature = "X";
						}
						if (x.Signature == "") {
							Signature = "";
						}
					});
					//Added by Avinash
					// if (oData.results[0].F4FieldsNav.results[0].Charg01 == "X") {
					that.fnLoadNonBatchItem(); //Need to Check
					// }
					//End of Added
				},

				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
				}
			});

		},

		//Added by Avinash for Manual Batch Split IVC Changes...
		fnAddBatch: function(oEvent) {
			var that = this;
			var oTabModel = this.getView().getModel("BatchItems");
			// var oTabModel = this.getView().getModel("BatchItems").getData().Items;
			var vSubItem = [];
			for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
				if (that.selectedItem.Posnr == that.getView().getModel("BatchItems").getData().Items[i].Posnr) {
					vSubItem.push(that.getView().getModel("BatchItems").getData().Items[i]);
				}
			}
			if (that.getView().getModel("DeliverySet").getData().LineItems.length > 0) {
				var vLargestPosnr = Number(that.getView().getModel("DeliverySet").getData().LineItems[0].Posnr);
			}
			for (var i = 0; i < that.getView().getModel("DeliverySet").getData().LineItems.length; i++) {
				if (vLargestPosnr < that.getView().getModel("DeliverySet").getData().LineItems[i].Posnr) {
					vLargestPosnr = Number(that.getView().getModel("DeliverySet").getData().LineItems[i].Posnr);
				}
				// if(that.getView().getModel("DeliverySet").getData().LineItems)
			}

			var oTabData = oTabModel.getData().Items;
			// var vPosnr = (Number(vSubItem[that.getView().getModel("BatchItems").getData().Items.length - 1].Posnr) + 1);
			var vPosnr = (Number(vLargestPosnr) + 1);
			oTabData.push({
				Charg: "",
				Bstme: vSubItem[0].Bstme,
				Del_type: vSubItem[0].Del_type,
				Fbatc: vSubItem[0].Fbatc,
				Fpicq: vSubItem[0].Fpicq,
				Kwmeng: vSubItem[0].Kwmeng,
				Lfimg: vSubItem[0].Lfimg, /// As Picking Qty - Need to check
				Lgobe: vSubItem[0].Lgobe,
				Lgort: vSubItem[0].Lgort,
				Maktx: vSubItem[0].Maktx,
				Matnr: vSubItem[0].Matnr,
				Meins: vSubItem[0].Meins,
				Menge: vSubItem[0].Menge,
				Otnum: vSubItem[0].Otnum,
				Pikmg: "0.000",
				PikmgF: vSubItem[0].PikmgF,
				Posnr: vPosnr.toString(),
				Sc_No: vSubItem[0].Sc_No,
				Spart: vSubItem[0].Spart,
				Sto_flg: vSubItem[0].Sto_flg,
				StrLoc: vSubItem[0].StrLoc,
				Uecha: vSubItem[0].Uecha,
				Vbeln: vSubItem[0].Vbeln,
				Vgbel: vSubItem[0].Vgbel,
				Vgpos: vSubItem[0].Vgpos,
				Vkorg: vSubItem[0].Vkorg,
				Vrkme: vSubItem[0].Vrkme,
				Vtweg: vSubItem[0].Vtweg,
				Werks: vSubItem[0].Werks,
				Pmat1: vSubItem[0].Pmat1, //Added by malar - 02.02.2023
				Pmat2: vSubItem[0].Pmat2,
				Pmatno1: vSubItem[0].Pmatno1,
				Pmatno2: vSubItem[0].Pmatno2 //Ended
			});
			oTabModel.refresh();
			var odata = that.getView().getModel("DeliverySet").getData().LineItems;
			odata.push({
				Charg: "",
				Bstme: vSubItem[0].Bstme,
				Del_type: vSubItem[0].Del_type,
				Fbatc: vSubItem[0].Fbatc,
				Fpicq: vSubItem[0].Fpicq,
				Kwmeng: vSubItem[0].Kwmeng,
				Lfimg: vSubItem[0].Lfimg, /// As Picking Qty - Need to check
				Lgobe: vSubItem[0].Lgobe,
				Lgort: vSubItem[0].Lgort,
				Maktx: vSubItem[0].Maktx,
				Matnr: vSubItem[0].Matnr,
				Meins: vSubItem[0].Meins,
				Menge: vSubItem[0].Menge,
				Otnum: vSubItem[0].Otnum,
				Pikmg: '0.000',
				PikmgF: vSubItem[0].PikmgF,
				Posnr: vPosnr.toString(),
				Sc_No: vSubItem[0].Sc_No,
				Spart: vSubItem[0].Spart,
				Sto_flg: vSubItem[0].Sto_flg,
				StrLoc: vSubItem[0].StrLoc,
				Uecha: vSubItem[0].Uecha,
				Vbeln: vSubItem[0].Vbeln,
				Vgbel: vSubItem[0].Vgbel,
				Vgpos: vSubItem[0].Vgpos,
				Vkorg: vSubItem[0].Vkorg,
				Vrkme: vSubItem[0].Vrkme,
				Vtweg: vSubItem[0].Vtweg,
				Werks: vSubItem[0].Werks,
				Pmat1: vSubItem[0].Pmat1, //Added by malar - 02.02.2023
				Pmat2: vSubItem[0].Pmat2,
				Pmatno1: vSubItem[0].Pmatno1,
				Pmatno2: vSubItem[0].Pmatno2 //Ended
			})
		},

		fnRemoveBatch: function(oEvent) {
			var that = this;
			var vPath = Number(oEvent.getSource().getBindingContext("BatchItems").getPath().split("/")[2]);
			var oTabModel = this.getView().getModel("BatchItems");
			var oTabData = oTabModel.getData().Items;
			var oTabModel2 = that.getView().getModel("DeliverySet");
			// var oTabData2 = that.getView().getModel("DeliverySet").getData().LineItems;
			var oTabData2 = [];

			if (oTabData.length > 1) {
				for (var i = 0; i < oTabModel2.getData().LineItems.length; i++) {
					if (that.selectedItem.Posnr == oTabModel2.getData().LineItems[i].Uecha) {
						oTabModel2.getData().LineItems.splice(i, 1);
						i--;
					}
				}
				oTabData.splice(vPath, 1);
				// oTabData2.splice(vPath, 1);
				oTabModel.refresh();
				oTabModel2.getData().LineItems = []; //Added by Suvethaa on 22.08.2022
				for (var i = 0; i < oTabData.length; i++) {
					oTabModel2.getData().LineItems.push(oTabData[i]);
				}
				oTabModel2.refresh();
			} else {
				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("AtLeastOneItem"));
			}
			that.fnColorChange();
			// var vPickedQty = 0;
			// for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
			// 	if (that.getView().getModel("BatchItems").getData().Items[i].Uecha == that.selectedItem.Posnr) {
			// 		vPickedQty = vPickedQty + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
			// 	}
			// }
			// var vOpenQty = Number(that.selectedItem.Lfimg) - Number(vPickedQty);
			// if (vPickedQty == Number(that.selectedItem.Lfimg) && vOpenQty == 0) {
			// 	sap.ui.getCore().byId("id_OpQty1").addStyleClass("InputPlaceholder_CPGreen");
			// 	sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPRed");
			// 	sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPYellow");
			// }
			// if (vOpenQty == Number(that.selectedItem.Lfimg) && vPickedQty == 0) {
			// 	sap.ui.getCore().byId("id_OpQty1").addStyleClass("InputPlaceholder_CPRed");
			// 	sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPGreen");
			// 	sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPYellow");
			// }
			// if (vOpenQty > 0 && vPickedQty < Number(that.selectedItem.Lfimg) && vPickedQty !== 0) {
			// 	sap.ui.getCore().byId("id_OpQty1").addStyleClass("InputPlaceholder_CPYellow");
			// 	sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPGreen");
			// 	sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPRed");
			// }

			// sap.ui.getCore().byId("id_OpQty1").setValue(vOpenQty.toFixed(3) + " " + that.selectedItem.Vrkme);

		},

		OpenReasonFrag: function() {
			if (this.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg01 == "X") {
				if (!this.Reason) {
					this.Reason = sap.ui.xmlfragment(
						"LoadingConfirmation.fragment.ReasonLP",
						this
					);
					this.getView().addDependent(this.Reason);
				}
				this.Reason.open();
			} else {

			}
			// that.onCallReasonF4();
		},

		onCloseReason: function() {
			var self = this;
			// sap.ui.getCore().byId('id_Reason').setSelectedKey();
			self.Reason.close();
			// self.getView().byId("process").setSelectedKey(self.getView().byId("process").getSelectedKey());
		},

		fnReasonSubmit: function(oEvent) {
			var vReason = sap.ui.getCore().byId("id_Reason").getSelectedKey();
			vGReason = vReason;
			var self = this;
			if (vReason) {
				this.fnweighbridgeGateEntry(vReason);
				// sap.ui.getCore().byId('id_Reason').setSelectedKey();
				self.Reason.close();
			} else {
				var vErrMsg = self.getView().getModel("i18n").getResourceBundle().getText("PlSelectReason");
				// oi18n.getProperty('PlSelReason');
				MessageBox.error(vErrMsg);
			}
		},

		//===============================================================
		//-------------------Save item Delivey----------------------
		//===============================================================
		onItemSave: function(oEvent) {

			var that = this,
				fPikmg = false;
			// that.oBundle = that.getView().getModel("i18n").getResourceBundle();
			var odata = that.getView().getModel("DeliverySet").getData().LineItems;
			//Added by Avinash for Batch Validation..
			var vError = false; //Need to Check for Other Origins...
			var vErrMsg = "";
			var Pickingless = that.getView().getModel("i18n").getResourceBundle().getText("PlEnterBatch");
			if (that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg01 == "X") {
				for (var i = 0; i < odata.length; i++) {
					if (odata[i].Charg == "" && that.selectedItem.Posnr == odata[i].Uecha) {
						vError = true;
						vErrMsg = vErrMsg + Pickingless + "\n";
					}
				}
				if (that.ContractChange) {
					if (!sap.ui.getCore().byId("id_ReasonLP1")._getSelectedItemText()) {
						vError = true;
						vErrMsg = vErrMsg + that.getView().getModel("i18n").getResourceBundle().getText("ReasonMandat") + "\n";
					} else {
						that.Reason = sap.ui.getCore().byId("id_ReasonLP1")._getSelectedItemText();
					}
				} else {
					that.Reason = sap.ui.getCore().byId("id_ReasonLP1")._getSelectedItemText();
				}
			}

			if (!vError) {
				var vBatchCheck = false; //Added by Avinash
				//Start of adding for warning Message for Less Pick Qty...
				var vPickedQty = 0;
				for (var i = 0; i < that.getView().getModel("DeliverySet").getData().LineItems.length; i++) {
					if (that.selectedItem.Posnr === that.getView().getModel("DeliverySet").getData().LineItems[i].Uecha) {
						vPickedQty = vPickedQty + Number(that.getView().getModel("DeliverySet").getData().LineItems[i].Pikmg);
					}
				}
				var vDelQty = 0;
				for (var i = 0; i < that.getView().getModel("DeliverySet").getData().HeaderItems.length; i++) {
					if (that.selectedItem.Posnr == that.getView().getModel("DeliverySet").getData().HeaderItems[i].Posnr) {
						vDelQty = vDelQty + Number(that.getView().getModel("DeliverySet").getData().HeaderItems[i].Lfimg);
						break;
					}
				}

				$.each(odata, function(index, value, array) {
					if (that.selectedItem.Posnr === value.Uecha) {
						vBatchCheck = true //Added by Avinash...
							// Check Value is greater.
							// } else {
						if (parseFloat(that.selectedItem.Lfimg) >= parseFloat(value.Pikmg)) {
							// a =  oEvent.mParameters.id;
							sap.ui.getCore().byId(a).addStyleClass("backgroundCss");
							that._ItemDialog.close();
							if (!fPikmg) {
								// Check All items for Storage location has Completed	
								var bCheckAllItems = that._checkAllItemEntered(odata, value.Lgort);
								if ((!bCheckAllItems) && (Signature === "X")) {
									that.onSignaturePress();
								}
								if ((!bCheckAllItems) && (Signature === "")) {
									that.PickingSave();
								}
							}
						} else {
							var Pickingless = that.getView().getModel("i18n").getResourceBundle().getText("PickingShouldLesser");
							MessageBox.error(Pickingless);
							that.getBusyDialog.close();
							sap.ui.getCore().byId(a).addStyleClass("whitebackgroundCss");
							//	MessageBox.error(that.oBundle.getText('PickingShouldLesser'));
						}
						// }
					}
					/**
					 * To Check whether all the Items for Storage Location Picking Quanty has been
					 * entered to finailize for Signature.
					 */
					if ((that.selectedItem.Lgort === value.Lgort) && (parseFloat(value.Pikmg) === 0)) {
						fPikmg = true;
					}
				});
				// }

				//Added by Avinash for itemsave..
				if (!vBatchCheck) {
					var odataf = that.getView().getModel("DeliverySet").getData().HeaderItems;
					$.each(odataf, function(index, value, array) {
						if (!value.Charg) {
							// Check Value is greater.
							if (parseFloat(that.selectedItem.Lfimg) >= parseFloat(value.Pikmg)) {
								// a =  oEvent.mParameters.id;
								sap.ui.getCore().byId(a).addStyleClass("backgroundCss");
								that._ItemDialog.close();
								if (!fPikmg) {
									// Check All items for Storage location has Completed	
									var bCheckAllItems = that._checkAllItemEntered(odataf, value.Lgort);
									if ((!bCheckAllItems) && (Signature === "X")) {
										that.onSignaturePress();
									}
									if ((!bCheckAllItems) && (Signature === "")) {
										that.PickingSave();
									}
								}
							} else {
								var Pickingless = that.getView().getModel("i18n").getResourceBundle().getText("PickingShouldLesser");
								MessageBox.error(Pickingless);
								that.getBusyDialog.close();
								sap.ui.getCore().byId(a).addStyleClass("whitebackgroundCss");
								//	MessageBox.error(that.oBundle.getText('PickingShouldLesser'));
							}
						}
					});
				}

				that.getView().getModel("DeliverySet").refresh();
			} else {
				MessageBox.error(vErrMsg);
			}
		},

		//Added by Avinash for IVC Rubber Changes...
		onSearchStorage: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			oFilter = new sap.ui.model.Filter([
				new Filter("Lgort", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Lgobe", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},

		onPressSloc: function(oEvent) {
			this.LocEvent = oEvent.getSource().getBindingContext("DeliverySet").getObject();
			var localModel = this.getOwnerComponent().getModel("localModel");
			if (localModel.getProperty("/plant")) {
				var self = this;
				if (!self.StorageFilter) {
					self.StorageFilter = sap.ui.xmlfragment("LoadingConfirmation.fragment.StorageFilter", self);
					self.getView().addDependent(self.StorageFilter);
				}
				self.SlocCall();
				self.StorageFilter.open();
			} else {
				sap.m.MessageToast.show(oi18n.getProperty("PlSelectPlant"));
			}
		},

		SlocCall: function() {
			var self = this;
			var that = this;
			var localModel = this.getOwnerComponent().getModel("localModel");
			var ivWerks = localModel.getProperty("/plant");
			if (ivWerks) {

				var oGetModel = that.getView().getModel('odata');
				sap.ui.core.BusyIndicator.show();
				oGetModel.read("/F4Set", {
					filters: [
						new sap.ui.model.Filter("F4Lgort", sap.ui.model.FilterOperator.EQ, "X"),
						new sap.ui.model.Filter("IvWerks", sap.ui.model.FilterOperator.EQ, ivWerks)
					],
					urlParameters: {
						$expand: "F4LgortNav"
					},
					async: true,
					success: function(Idata, Iresponse) {
						sap.ui.core.BusyIndicator.hide();
						self.getView().setModel(new JSONModel(Idata.results[0].F4LgortNav.results), "oStorage");
					},
					error: function(Ierror) {
						sap.ui.core.BusyIndicator.hide();
					}
				});
			} else {
				sap.m.MessageToast.show(oi18n.getProperty("PlSelectPlant"));
			}
		},

		onConfirmStorage: function(oEvent) {
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			var vItemDatas = self.getView().getModel("DeliverySet").getData();
			var vBatchDeletion = false;
			for (var i = 0; i < vItemDatas.HeaderItems.length; i++) {
				if (vItemDatas.HeaderItems[i].Posnr === self.LocEvent.Posnr) {
					if (vItemDatas.HeaderItems[i].Lgort == "") {
						vItemDatas.HeaderItems[i].Lgort = oSelectedItem.getTitle();
						vItemDatas.HeaderItems[i].Lgobe = oSelectedItem.getDescription();
					} else if (vItemDatas.HeaderItems[i].Lgort && vItemDatas.HeaderItems[i].Lgort !== oSelectedItem.getTitle()) {
						vBatchDeletion = true;
						vItemDatas.HeaderItems[i].Lgort = oSelectedItem.getTitle();
						vItemDatas.HeaderItems[i].Lgobe = oSelectedItem.getDescription();
					}
				}
			}
			if (vBatchDeletion) {
				var vBatchItems = self.getView().getModel("BatchItems").getData();
				for (var i = 0; i < vItemDatas.LineItems.length; i++) {
					if (vItemDatas.LineItems[i].Uecha === self.LocEvent.Posnr) {
						if (i !== (vItemDatas.LineItems.length - 1)) {
							vItemDatas.LineItems.splice(i, 1);
							i--;
						} else {
							vItemDatas.LineItems[i].Charg = "";
							vItemDatas.LineItems[i].Pikmg = "";
						}
					}
				}
				for (var i = 0; i < vBatchItems.Items.length; i++) {
					if (vBatchItems.Items[i].Uecha === self.LocEvent.Posnr) {
						if (i !== (vBatchItems.Items.length - 1)) {
							vBatchItems.Items.splice(i, 1);
							i--;
						} else {
							vBatchItems.Items[i].Charg = "";
							vBatchItems.Items[i].Pikmg = "";
						}
					}
				}
				self.getView().getModel("BatchItems").refresh();
			}
			var oJSONItem = new sap.ui.model.json.JSONModel();
			oJSONItem.setData(vItemDatas);
			self.getView().setModel(oJSONItem, "DeliverySet");
			self.getView().getModel("DeliverySet").refresh();

		},

		//===============================================================
		//-------------------press list open picking quanity ----------------------
		//===============================================================
		onItemPress: function(oEvent) {
			var that = this;
			//	removed as no use of lines
			that.selectedItem = oEvent.getSource().getBindingContext("DeliverySet").getObject();
			// if (that.selectedItem.Lgort !== "" && that.selectedItem.Tanum !== "0000000000" && !that.selectedItem.ToConfirm) { //Changed by Malar - 24.01.2023.
			a = oEvent.getParameter("id");
			var oGetModel = that.getOwnerComponent().getModel("odata");
			var oPath = "/F4Set";
			var localModel = that.getOwnerComponent().getModel("localModel");
			var vVbeln = localModel.getProperty("/Vbeln");

			oGetModel.read(oPath, {
				filters: [
					new Filter("FieldIp", FilterOperator.EQ, "X"),
					new Filter("IvWerks", FilterOperator.EQ, that.selectedItem.Werks),
					new Filter("IvVbeln", FilterOperator.EQ, vVbeln)
				],
				urlParameters: {
					$expand: "F4FieldsNav"
				},
				success: function(oData, Response) {
					that.getView().setModel(new JSONModel(oData), "oBatchEnable");
					that.getView().getModel("oBatchEnable").refresh();
					// var odata = that.getView().getModel("DeliverySet").getData().HeaderItems;  
					var odata = that.getView().getModel("DeliverySet").getData().LineItems;
					var oBatchItems = [],
						saveF = [];
					/**
					 * Fetch Batch Item based on Respective key field value from
					 * Header Item Model
					 */

					$.each(odata, function(index, value, array) {

						if (that.selectedItem.Posnr === value.Posnr) {
							if (parseFloat(value.Pikmg) === 0) {
								value.Pikmg = "";
								saveF.push(true);
							} else {
								saveF.push(false);
							}

							if (value.PikmgF) {
								saveF.push(true);
							} else {
								saveF.push(false);
							}
							oBatchItems.push(value);
						}

					});

					//Added by Avinash for considering w/o batches also on 07.04.21...
					if (oBatchItems.length == 0) {
						var odataf = that.getView().getModel("DeliverySet").getData().HeaderItems;
						var aDataf = jQuery.extend(true, [], odataf);
						$.each(aDataf, function(index, value, array) {
							if (that.selectedItem.Posnr === value.Posnr) {
								if (!value.Charg) {
									if (parseFloat(value.Pikmg) === 0) {
										value.Pikmg = "";
										saveF.push(true);
									} else {
										saveF.push(false);
									}

									if (value.PikmgF) {
										saveF.push(true);
									} else {
										saveF.push(false);
									}
									oBatchItems.push(value);
								}
							}
						});
					}
					//End of added...

					var oItems = {
						Save: (saveF.indexOf(true) !== -1) ? true : false,
						Items: oBatchItems
					};

					var oJson = new sap.ui.model.json.JSONModel(oItems);
					that.getView().setModel(oJson, "BatchItems");
					that.getView().getModel("BatchItems").refresh(true);
					// console.log(that.selectedItem);
					// console.log(oItems);

					var sStock_Flag = that.getView().getModel("DeliverySet").getData().HeaderItems[0].Sto_flg;
					var sCharg = that.getView().getModel("DeliverySet").getData().HeaderItems[0].Charg;
					if (oData.results.length > 0) {
						if (oData.results[0].F4FieldsNav.results.length > 0) {

							if (!that._ItemDialog) {
								that._ItemDialog = sap.ui.xmlfragment("LoadingConfirmation.fragment.ItemDetailsTONew", that);
								that.getView().addDependent(that._ItemDialog);
							}
							that._ItemDialog.open();

						}
					}

					//========= Bath F4 ============//
					that.fnEntityBatch();
					//Added by Avinash
					sap.ui.getCore().byId("id_LfimgVal1").setValue(that.selectedItem.Lfimg + " " + that.selectedItem.Vrkme);
					that.fnColorChange();
				},
				error: function(oResponse) {
					var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
					sap.m.MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vErr);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			// } else {
			// 	var vErrMsg = "";
			// 	if (that.selectedItem.Lgort === "") {
			// 		vErrMsg = vErrMsg + that.getView().getModel("i18n").getProperty("ErrorTxt") + "\r\n";
			// 	}
			// 	if (that.selectedItem.Tanum === "0000000000") {
			// 		vErrMsg = vErrMsg + that.getView().getModel("i18n").getProperty("plCreatetanum") + "\r\n";
			// 	}
			// 	if (that.selectedItem.ToConfirm === "X") {
			// 		vErrMsg = vErrMsg + that.getView().getModel("i18n").getResourceBundle().getText("ToAlrConf", that.selectedItem.Posnr);
			// 	}
			// 	// var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
			// 	MessageBox.error(vErrMsg);
			// }

		},
		onBackPress: function() {
			// this.fnRefresh();
			var that = this;
			var oHeaderLines = {
				HeaderItems: [],
				LineItems: [],
				Header: []
			};
			var oJson = new sap.ui.model.json.JSONModel(oHeaderLines);
			that.getView().setModel(oJson, "DeliverySet");
			this.getOwnerComponent().getRouter().navTo("Dashboard");
		},

		//===============================================================
		//-------------------change Function----------------------
		//===============================================================
		fnResetChange: function(oEvent) {
			if (oEvent.getSource().getProperty("state")) {
				document.querySelector("#__custom1").style.display = "none";
				document.querySelector("#__custom0").style.display = "block";
			} else {
				document.querySelector("#__custom0").style.display = "none";
				document.querySelector("#__custom1").style.display = "block";
			}
		},

		//==========================without signature===============

		PickingSave: function(oEvent) {
			var that = this;
			var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

			var DeliveryPost = that.getView().getModel("i18n").getResourceBundle().getText("conformPost");
			MessageBox.confirm(

				DeliveryPost, {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(sAction) {
						if (sAction === "OK") {
							//sap.ui.core.BusyIndicator.show(0);  comment on 05.02.2020
							var odata = that.getView().getModel("DeliverySet").getData().LineItems;
							var odata1 = that.getView().getModel("DeliverySet").getData().HeaderItems;
							var oPostData = [];

							var oPostModel = that.getView().getModel('odata');

							$.each(odata, function(index, value, array) {
								if (value.Lgort === that.selectedItem.Lgort) {
									delete value.StrLoc;
									delete value.PikmgF;
									if (value.delete) {
										delete value.delete;
									}
									if (value.Uecha == value.Posnr) {
										value.Uecha = "000000";
									}
									value.Lfimg = (parseFloat(value.Lfimg)).toString();
									value.Pikmg = (parseFloat(value.Pikmg)).toString();
									//value.WhSign = that.signaturepad0.toDataURL("image/bmp").split(",")[1];
									//value.DriverSign = that.signaturepad1.toDataURL("image/bmp").split(",")[1];
									oPostData.push(value);
								}
							});
							for (var j = 0; j < odata1.length; j++) {
								var vFlag = false;
								for (var k = 0; k < odata.length; k++) {
									if (odata[k].Posnr == odata1[j].Posnr && odata[k].Uecha == odata1[j].Uecha) {
										vFlag = true;
										break;
									}
								}
								if (!vFlag) {
									delete odata1[j].StrLoc;
									delete odata1[j].PikmgF;
									oPostData.push(odata1[j]);
								}
							}

							var oEntry = {
								"d": {
									"PickFlag": "X",
									"Vbeln": that.selectedItem.Vbeln,
									"PgiFlag": "",
									"WhSign": "",
									"DriverSign": "",
									"DelOutputNav": oPostData,
									"DelReturnNav": []
								}
							};
							oPostModel.create('/DeliverySet', oEntry, null, function(oData, res) {
								var oReturn = oData.DelReturnNav.results[0];
								var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

								if (oReturn.Type === "S") {
									MessageBox.success(
										oReturn.Message, {
											styleClass: bCompact ? "sapUiSizeCompact" : "",
											onClose: function(oAction) {
												that._LoadDeliveryItems(that, that.selectedItem.Vbeln, false);
											}
										}
									);

								} else {

									MessageBox.error(
										oReturn.Message, {
											styleClass: bCompact ? "sapUiSizeCompact" : "",
											onClose: function(oAction) {
												that._LoadDeliveryItems(that, that.selectedItem.Vbeln, false);
											}
										}
									);
								}
							}, function(res) {
								//	that._SignatureDialog.close();
								sap.ui.core.BusyIndicator.hide(0);
								var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
								MessageBox.show(res.message, {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: vErr,
									actions: [sap.m.MessageBox.Action.CLOSE],
									details: res.body
								});
							});
						}
					}
				}
			);
		},

		// Formattee for date
		formatDate: function(sDate) {
			var d = "";
			if (sDate !== undefined) {
				d = sDate.substring(6) + "/" + sDate.substring(4, 6) + "/" + sDate.substring(0, 4);
			}
			return d;

		},
		// Formatter for time
		formatTimeS: function(s) {
			if (s) { //Added by Avinash
				s = s.ms;

				function pad(n, z) {
					z = z || 2;
					return ('00' + n).slice(-z);
				}

				var ms = s % 1000;
				s = (s - ms) / 1000;
				var secs = s % 60;
				s = (s - secs) / 60;
				var mins = s % 60;
				var hrs = (s - mins) / 60;

				return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
			}
		},
		//Added by srileaka for Batch Details
		//===============================================================
		//-------------------Batch F4 Entityset Function----------------------
		//===============================================================
		fnEntityBatch: function(vMatnr, vLgort, vWerks) {
			var oPath = "/BatchShSet";
			var that = this;
			var oGetModel = that.getView().getModel('odata');

			oGetModel.read(oPath, {
				filters: [
					new Filter("Matnr", FilterOperator.EQ, that.selectedItem.Matnr),
					new Filter("Lgort", FilterOperator.EQ, that.selectedItem.Lgort),
					new Filter("Werks", FilterOperator.EQ, that.selectedItem.Werks)
				],
				success: function(oData, Response) {
					var oTabJson = new sap.ui.model.json.JSONModel();
					oTabJson.setData(oData.results);
					that.getView().setModel(oTabJson, "JMBatch");
					sap.ui.getCore().setModel(oTabJson, "JMBatch");

					//  this.getView().getModel("DeliverySet").getData().LineItems.

				},
				error: function(oResponse) {

				}
			});
		},

		//Added by Avinash on 04/06/2021
		// //===============================================================
		// //-------------------Sale Cont F4 Function--------------------
		// //===============================================================
		fnhandleSaleCont: function(oEvent) {
			if (!this.ScHelp) {
				this.ScHelp = sap.ui.xmlfragment("LoadingConfirmation.fragment.SaleContract", this);
				this.getView().addDependent(this.ScHelp);
			}
			this.ScHelp.open();
			this.onCallScF4();
		},
		onCallScF4: function() {
			var oPath = "/F4Set";
			var that = this;
			var oGetModel = that.getView().getModel('odata');
			var vVbeln = that.getView().getModel("DeliverySet").getData().Header.Vbeln
			oGetModel.read(oPath, {
				filters: [
					new Filter("Scorder", FilterOperator.EQ, "X"),
					new Filter("IvVbeln", FilterOperator.EQ, vVbeln)
					// new Filter("Werks", FilterOperator.EQ, that.selectedItem.Werks)
				],
				urlParameters: {
					$expand: "F4OrderNav"
				},
				success: function(oData, Response) {
					that.getView().setModel(new JSONModel(oData.results[0].F4OrderNav.results), "JMSc");
				},
				error: function(oResponse) {

				}
			});
		},

		onsearchSc: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			if (sValue && sValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter2 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter3 = new sap.ui.model.Filter("Otnum", sap.ui.model.FilterOperator.Contains, sValue);
				var allFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3], false);
			}
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fnconfirmSc: function(oEvent) {
			var self = this;
			self.ContractChange = false;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			self.SCObject = oSelectedItem.getBindingContext("JMSc").getObject();
			for (var i = 0; i < self.getView().getModel("BatchItems").getData().Items.length; i++) {
				if (self.getView().getModel("BatchItems").getData().Items[i].Uecha == this.selectedItem.Posnr) {
					if (oSelectedItem.getTitle() !== self.getView().getModel("BatchItems").getData().Items[i].Sc_No) {
						self.ContractChange = true;
					}
					self.getView().getModel("BatchItems").getData().Items[i].Sc_No = oSelectedItem.getTitle();
					self.getView().getModel("BatchItems").getData().Items[i].Otnum = self.SCObject.Otnum;
				}
				// if(self.getView().getModel("BatchItems").getData().Items[i].Sc_No)
			}
			for (var i = 0; i < self.getView().getModel("DeliverySet").getData().HeaderItems.length; i++) {
				if (self.getView().getModel("DeliverySet").getData().HeaderItems[i].Posnr == this.selectedItem.Posnr) {
					self.getView().getModel("DeliverySet").getData().HeaderItems[i].Customer = self.SCObject.Customer;
					self.getView().getModel("DeliverySet").getData().HeaderItems[i].Sc_No = oSelectedItem.getTitle();
					self.getView().getModel("DeliverySet").getData().HeaderItems[i].Otnum = self.SCObject.Otnum;
				}
			}
			for (var i = 0; i < self.getView().getModel("DeliverySet").getData().LineItems.length; i++) {
				if (self.getView().getModel("DeliverySet").getData().LineItems[i].Uecha == this.selectedItem.Posnr) {
					self.getView().getModel("DeliverySet").getData().LineItems[i].Customer = self.SCObject.Customer;
					self.getView().getModel("DeliverySet").getData().LineItems[i].Sc_No = oSelectedItem.getTitle();
					self.getView().getModel("DeliverySet").getData().LineItems[i].Otnum = self.SCObject.Otnum;
				}
			}
			if (self.ContractChange) {
				sap.ui.getCore().byId("id_ReasonChange1").setVisible(true);
			} else {
				sap.ui.getCore().byId("id_ReasonChange1").setVisible(false);
			}
			// self.getView().getModel("BatchItems").getData().Items[0].Sc_No = oSelectedItem.getTitle();
			self.getView().getModel("BatchItems").refresh(true);
			self.getView().getModel("DeliverySet").refresh(true);
		},

		//End of added by Avinash
		// //===============================================================
		// //-------------------Batch F4 Search Function--------------------
		// //===============================================================
		fnhandleBatch: function(oEvent) {
			this.oBatchObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			if (!this.ofragmentBatch) {
				this.ofragmentBatch = sap.ui.xmlfragment("LoadingConfirmation.fragment.Batch", this);
				this.getView().addDependent(this.ofragmentBatch);
			}
			this.fnEntityBatch();
			this.ofragmentBatch.open();
		},
		// //===============================================================
		// //-------------------Batch F4 filter Function--------------------
		// //===============================================================
		onsearchBatch: function(oEvent) {
			var vValue = oEvent.getParameter("value");
			var filter1 = new sap.ui.model.Filter("Charg", sap.ui.model.FilterOperator.Contains, vValue);
			var filter2 = new sap.ui.model.Filter("Clabs", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);
		},
		// //===============================================================
		// //-------------------Batch F4 confirm Function--------------------
		// //===============================================================
		fnconfirmBatch: function(oEvent) {
			var that = this;
			var oItem = oEvent.getParameter("selectedItem");
			var odata = that.getView().getModel("DeliverySet").getData().LineItems;
			if (parseFloat(oItem.getDescription()) >= parseFloat(this.oBatchObject.Lfimg)) {
				this.oBatchObject.Charg = oItem.getTitle(); // add batch in batch table of perticular line item
				// add batch to the All item batch table

				for (var i = 0; i < odata.length; i++) {
					if (this.oBatchObject.Posnr == odata[i].Posnr && this.oBatchObject.Uecha == odata[i].Uecha) {
						odata[i].Charg = oItem.getTitle();
						break;
					}
				}
			} else {
				this.oBatchObject.Charg = "";
				MessageBox.error(this.getModel("i18n").getResourceBundle().getText("DeliveryQty_Exceed_BatchQty"));
			}
			this.getView().getModel("BatchItems").refresh();
			that.getView().getModel("DeliverySet").refresh();
		},
		//===================================== Change Delivery Qty =========================//
		onChangeDeliveryQty: function(oEvent) {
			var that = this;
			var DelQtyObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			var DelQty = oEvent.getSource().getValue();

			if (DelQty == "") {
				DelQty = "0.000";
			}
			DelQtyObject.Lfimg = DelQty;
			// this.getView().getModel("BatchItems").refresh();
			var oBatchObj = this.getView().getModel("JMBatch").getData().find(function(x) {
				return x.Charg == DelQtyObject.Charg;
			});
			var odata = that.getView().getModel("BatchItems").getData().Items;
			var TotalQty = "0.000";
			$.each(odata, function(index, value, array) {
				TotalQty = parseFloat(TotalQty) + parseFloat(value.Lfimg);
			});

			if (parseFloat(DelQty) > parseFloat(oBatchObj.Clabs)) {
				DelQtyObject.Lfimg = "0.000"; //removed 	DelQtyObject.Lfimg === "0.000";
				// oEvent.getSource().setValue("");
				this.getView().getModel("BatchItems").refresh();
				MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("DeliveryQty_Exceed_BatchQty"));
			} else if (parseFloat(TotalQty) > parseFloat(that.selectedItem.Lfimg)) {
				DelQtyObject.Lfimg = "0.000"; // removed DelQtyObject.Lfimg === "0.000";
				// oEvent.getSource().setValue("");
				that.getView().getModel("BatchItems").refresh();
				MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("DeliveryQty_Exceed_MainQty"));
			}
			//============== Add delivery quantity in all line item batch table ========
			var odata = that.getView().getModel("DeliverySet").getData().LineItems;
			for (var i = 0; i < odata.length; i++) {
				if (DelQtyObject.Posnr == odata[i].Posnr && DelQtyObject.Uecha == odata[i].Uecha) {
					odata[i].Lfimg = DelQtyObject.Lfimg;
					break;
				}
			}
			that.getView().getModel("DeliverySet").refresh();
			//================================================================//
		},

		//Added by Avinash
		fnValidateBatch: function(oEvent) {
			var BatchObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			// var vBatch = oEvent.getSource().getValue();
			if (Number(BatchObject.Pikmg) > 0 && BatchObject.Charg !== "") {
				var oPath = "/ValidateBatchSet";
				var that = this;
				var vWerks = that.getView().getModel("DeliverySet").getData().HeaderItems[0].Werks;
				var vMatnr = that.selectedItem.Matnr;
				var vLgort = that.selectedItem.Lgort;
				var oGetModel = that.getView().getModel('odata');
				sap.ui.core.BusyIndicator.show();
				oGetModel.read(oPath, {
					filters: [
						new Filter("IvCharg", FilterOperator.EQ, BatchObject.Charg),
						new Filter("IvMatnr", FilterOperator.EQ, vMatnr),
						new Filter("IvWerks", FilterOperator.EQ, vWerks),
						new Filter("IvLgort", FilterOperator.EQ, vLgort),
						new Filter("IvQty", FilterOperator.EQ, BatchObject.Pikmg)
					],
					urlParameters: {
						$expand: "DelReturnNav"
					},
					success: function(oData, Response) {
						if (oData.results[0].DelReturnNav.results.length == 0) {
							var odata = that.getView().getModel("DeliverySet").getData().LineItems;
							for (var i = 0; i < odata.length; i++) {
								if (BatchObject.Posnr == odata[i].Posnr && BatchObject.Uecha == odata[i].Uecha) {
									odata[i].Charg = BatchObject.Charg;
									break;
								}
							}
							that.getView().getModel("DeliverySet").refresh();
						} else {
							// oEvent.getSource().setValue("");
							var odata = that.getView().getModel("DeliverySet").getData().LineItems;
							for (var i = 0; i < odata.length; i++) {
								if (BatchObject.Posnr == odata[i].Posnr && BatchObject.Uecha == odata[i].Uecha) {
									odata[i].Charg = "";
									odata[i].Pikmg = "0.000";
									break;
								}
							}
							BatchObject.Charg = "";
							BatchObject.Pikmg = "0.000";
							that.getView().getModel("BatchItems").refresh();
							that.getView().getModel("DeliverySet").refresh();
							MessageBox.error(oData.results[0].DelReturnNav.results[0].Message);
						}
						sap.ui.core.BusyIndicator.hide();
						var vPickedQty = 0;
						for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
							if (that.getView().getModel("BatchItems").getData().Items[i].Posnr == that.selectedItem.Posnr) {
								vPickedQty = vPickedQty + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
							}
						}
						var vOpenQty = Number(that.selectedItem.Lfimg) - Number(vPickedQty);
						if (vPickedQty == Number(that.selectedItem.Lfimg) && vOpenQty == 0) {
							sap.ui.getCore().byId("id_OpQty1").addStyleClass("InputPlaceholder_CPGreen");
							sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPRed");
							sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPYellow");
						}
						if (vOpenQty == Number(that.selectedItem.Lfimg) && vPickedQty == 0) {
							sap.ui.getCore().byId("id_OpQty1").addStyleClass("InputPlaceholder_CPRed");
							sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPGreen");
							sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPYellow");
						}
						if (vOpenQty > 0 && vPickedQty < Number(that.selectedItem.Lfimg) && vPickedQty !== 0) {
							sap.ui.getCore().byId("id_OpQty1").addStyleClass("InputPlaceholder_CPYellow");
							sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPGreen");
							sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPRed");
						}
						sap.ui.getCore().byId("id_OpQty1").setValue(vOpenQty.toFixed(3) + " " + that.selectedItem.Vrkme);
						//End of Added
					},

					error: function(oResponse) {
						oEvent.getSource().setValue("");
						sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
					}
				});
			}
		},

		//=========================================== Change Picking Qty ==================================//
		onChangePickQty: function(oEvent) {
			var that = this;
			//BOC by Avinash for Batch Manual Addition...
			// if (oEvent.getSource().getValue() > 0) {
			var PickQty = oEvent.getSource().getValue();
			// var PickQty = Number(oEvent.getSource().getValue().replace(/[^\d]/g, '')); //Need to check with test data for negative value restriction...
			// oEvent.getSource().setValue(PickQty);
			for (var i = 0; i < that.getView().getModel("DeliverySet").getData().HeaderItems.length; i++) {
				if (that.getView().getModel("DeliverySet").getData().HeaderItems[i].Posnr == that.selectedItem.Posnr) {
					var vDeliveryQty = Number(that.getView().getModel("DeliverySet").getData().HeaderItems[i].Lfimg);
				}
			}
			var vFirstBatchSplit = false;
			var vPickedQty = 0;
			var vSelectedPath = oEvent.getSource().getBindingContext("BatchItems").getPath().split("/")[2];

			if (that.getView().getModel("BatchItems").getData().Items.length > 0) {
				for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
					if (that.getView().getModel("BatchItems").getData().Items[i].Uecha == that.selectedItem.Posnr && i !==
						Number(vSelectedPath)) { //To Not consider same line for getting other all picked quantities...
						// if (that.getView().getModel("DeliverySet").getData().LineItems[i].Uecha == that.selectedItem.Posnr) {
						vPickedQty = vPickedQty + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
					}
				}
			}

			var PickQtyObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			// var PickQty = oEvent.getSource().getValue();
			PickQtyObject.Pikmg = PickQty;
			// PickQtyObject.Lfimg = PickQty; //Added by Avinash
			this.getView().getModel("BatchItems").refresh();

			var odata = that.getView().getModel("BatchItems").getData().Items;
			var TotalQty = 0.000;
			$.each(odata, function(index, value, array) {
				TotalQty += parseFloat(value.PickQty);
			});

			// PickQtyObject.Lfimg = vDeliveryQty - vPickedQty; //Added by Avnash
			PickQtyObject.Lfimg = (vDeliveryQty - vPickedQty).toFixed(3); //Added by Avnash
			if (PickQtyObject.Lfimg > 0) {
				if ((parseFloat(PickQty) > parseFloat(PickQtyObject.Lfimg)) || (TotalQty > parseFloat(that.selectedItem.Lfimg))) {
					PickQtyObject.Pikmg = "0.000"; // removed PickQtyObject.Pikmg === "0.000";
					oEvent.getSource().setValue("");
					this.getView().getModel("BatchItems").refresh();
					MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("pickingQty_Exceeds_DeliveryQty"));
				}
			} else {
				PickQtyObject.Pikmg = "0.000"; // removed PickQtyObject.Pikmg === "0.000";
				oEvent.getSource().setValue("");
				this.getView().getModel("BatchItems").refresh();
				MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("pickingQty_Exceeds_DeliveryQty"));
			}

			//============== Add picking quantity in all line item batch table ========
			var odata = that.getView().getModel("DeliverySet").getData().LineItems;
			if (!vFirstBatchSplit) {
				for (var i = 0; i < odata.length; i++) {
					if (PickQtyObject.Posnr == odata[i].Posnr && PickQtyObject.Uecha == odata[i].Uecha) {
						odata[i].Pikmg = PickQtyObject.Pikmg;
						odata[i].Lfimg = PickQtyObject.Pikmg;
						break;
					}
				}
			}
			that.getView().getModel("DeliverySet").refresh();

			if (PickQtyObject.Charg !== "") {
				that.fnValidateBatch(oEvent);
			}
		},
		//End of added

		onChangePickQty2: function(oEvent) {
			var that = this;
			var PickQtyObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			var PickQty = oEvent.getSource().getValue();
			PickQtyObject.Pikmg = PickQty;
			this.getView().getModel("BatchItems").refresh();

			var odata = that.getView().getModel("BatchItems").getData().Items;
			var TotalQty = 0.000;
			$.each(odata, function(index, value, array) {
				TotalQty += parseFloat(value.PickQty);
			});

			if ((parseFloat(PickQty) > parseFloat(PickQtyObject.Lfimg)) || (TotalQty > parseFloat(that.selectedItem.Lfimg))) {
				PickQtyObject.Pikmg = "0.000"; // removed PickQtyObject.Pikmg === "0.000";
				oEvent.getSource().setValue("");
				this.getView().getModel("BatchItems").refresh();
				MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("pickingQty_Exceeds_DeliveryQty"));
			}

			//============== Add picking quantity in all line item batch table ========
			var odata = that.getView().getModel("DeliverySet").getData().LineItems;
			for (var i = 0; i < odata.length; i++) {
				if (PickQtyObject.Posnr == odata[i].Posnr && PickQtyObject.Uecha == odata[i].Uecha) {
					odata[i].Pikmg = PickQtyObject.Pikmg;
					break;
				}
			}
			that.getView().getModel("DeliverySet").refresh();
			//================================================================//
		},

		// //===============================================================
		// //-------------------    Add new Batch    --------------------
		// //===============================================================
		handleAddBatch: function() {
			var that = this;
			var aItem = this.getView().getModel("BatchItems").getData().Items;
			var vLength = this.getView().getModel("BatchItems").getData().Items.length;
			var vPosnr = this.getView().getModel("BatchItems").getData().Items[vLength - 1].Posnr;
			var newItem = parseInt(vPosnr) + 1;
			newItem = newItem.toString();
			var oNew = {
				Vbeln: aItem[0].Vbeln,
				Posnr: newItem,
				Uecha: aItem[0].Uecha,
				Matnr: aItem[0].Matnr,
				Maktx: aItem[0].Maktx,
				Charg: "",
				Lfimg: "0.000",
				Meins: aItem[0].Meins,
				Werks: aItem[0].Werks,
				Lgort: aItem[0].Lgort,
				Lgobe: aItem[0].Lgobe,
				Pikmg: "0.000",
				Vrkme: aItem[0].Vrkme,
				Vgbel: aItem[0].Vgbel,
				Vgpos: aItem[0].Vgpos,
				Kwmeng: aItem[0].Kwmeng,
				Vkorg: aItem[0].Vkorg,
				Vtweg: aItem[0].Vtweg,
				Spart: aItem[0].Spart,
				StrLoc: aItem[0].StrLoc,
				PikmgF: aItem[0].PikmgF,
				"delete": true
			};
			var odata = that.getView().getModel("DeliverySet").getData().LineItems;
			odata.push(oNew);
			aItem.push(oNew);
			this.getView().getModel("BatchItems").refresh();
			that.getView().getModel("DeliverySet").refresh();
		},
		//============================	Delete Batch ===================================//		
		onDeleteBatch: function(oEvent) {
			var that = this;
			var vPath = oEvent.getSource().getBindingContext("BatchItems").getPath(); // delete in Batch Item array
			var oBject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			var odata = that.getView().getModel("DeliverySet").getData().LineItems; // delete in All Line item batch table
			for (var i = 0; i < odata.length; i++) {
				if (oBject.Posnr == odata[i].Posnr && oBject.Uecha == odata[i].Uecha) {
					odata.splice(i, 1);
					break;
				}
			}
			var Index = vPath.split("/", 3);
			this.getView().getModel("BatchItems").getData().Items.splice(Index[2], 1);
			this.getView().getModel("BatchItems").refresh();
			that.getView().getModel("DeliverySet").refresh();

		},

		// Added by AVinash
		fnLiveChangeOTNum: function(oEvent) {
			var self = this;
			var svalue = oEvent.getSource().getValue();
			svalue = svalue.replace(/[^a-zA-Z0-9/ -]/g, '');
			svalue = svalue.toUpperCase();
			oEvent.getSource().setValue(svalue);
			if (svalue) {
				oEvent.getSource().setValueState("None");
			}
			for (var i = 0; i < self.getView().getModel("BatchItems").getData().Items.length; i++) {
				if (self.getView().getModel("BatchItems").getData().Items[i].Uecha == this.selectedItem.Posnr) {
					self.getView().getModel("BatchItems").getData().Items[i].Otnum = svalue;
				}
				// if(self.getView().getModel("BatchItems").getData().Items[i].Sc_No)
			}
			for (var i = 0; i < self.getView().getModel("DeliverySet").getData().HeaderItems.length; i++) {
				if (self.getView().getModel("DeliverySet").getData().HeaderItems[i].Posnr == this.selectedItem.Posnr) {
					self.getView().getModel("DeliverySet").getData().HeaderItems[i].Otnum = svalue;
				}
			}
			for (var i = 0; i < self.getView().getModel("DeliverySet").getData().LineItems.length; i++) {
				if (self.getView().getModel("DeliverySet").getData().LineItems[i].Uecha == this.selectedItem.Posnr) {
					self.getView().getModel("DeliverySet").getData().LineItems[i].Otnum = svalue;
				}
			}
			self.getView().getModel("BatchItems").refresh();
			self.getView().getModel("DeliverySet").refresh();
		},

		// End of added
		// added by dharma on 24-02-2021
		onScanQRValue: function() {
			if (sap.ushell.Container) {
				var oUser = sap.ushell.Container.getService("UserInfo").getUser().getId();
				// oView.byId("id_username").setText(oBundle.getText("Hello") + " " + oUser.getFullName());
			} else {
				var oUser = "IN_THANDAYUT";
			}
			if (oUser === "GH_FORKLIFT1" || oUser === "GH_FORKLIFT2" || oUser === "GH_FORKLIFT3" || oUser === "GH_FORKLIFT4" || oUser ===
				"IN_THANDAYUT") {

				if (!this.Message) {
					this.Message = sap.ui.xmlfragment("LoadingConfirmation.fragment.LaserScan", this);
					this.getView().addDependent(this.Message);
				}

				this.Message.open();
				sap.ui.getCore().byId("test").setValue('');
				setTimeout(function() {
					sap.ui.getCore().byId("test").focus()
						//sap.ui.getCore().byId(tablelastId).focus();
				}, 1000);

			} else {
				var oThat = this;
				var oVideoDeviceModel = new JSONModel();
				//Initialize the ZXing QR Code Scanner
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
									// oView.byId("idInOutBond").setValue(mResult.text.trim());
									oThat.fnBarcode(mResult.text.trim());
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
								text: "Start",
								type: "Accept",
								press: function() {
									oThat._oScanQRDialog.close();
									oThat.onScanQRValue();
								}

							})

							this.startScanning();
						})
					}
				});
			}
		},

		startScanning: function() {
			var oThat = this;
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
						title: "Scan QR code",
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
							text: "Cancel",
							press: function(oEvent) {
								this._oScanQRDialog.close();
								codeReader.reset();
								sap.ndc.BarcodeScanner.scan(
									function(mResult) {
										if (!mResult.cancelled) {
											// oView.byId("idInOutBond").setValue(mResult.text.trim());
											oThat.fnBarcode(mResult.text.trim());
										}
									},
									function(Error) {
										sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

									},
								);
							}.bind(this)
						}),
						afterOpen: function() {
							codeReader.decodeFromVideoDevice(selectedDeviceId, this.getView().byId("scanContainer_QR").getDomRef(), (result, err) => {
								if (result) {
									console.log(result)
										//this.getView().byId("scannedValue").setValue(result.text);
										// this.getView().getModel("BatchItems").getData().Items[0].Pikmg = result.text;
										// this.getView().getModel("BatchItems").refresh();
									this._oScanQRDialog.close();
									codeReader.reset();
									// oThat.fnBarcode(mResult.text.trim()); Commented by Malar - 12.04.2023
									oThat.fnBarcode(result.text.trim());  //Added by Malar - 12.04.2023
								}
								if (err && !(err instanceof ZXing.NotFoundException)) {
									console.error(err)
										// this.getView().getModel("BatchItems").getData().Items[0].Pikmg = result.text;
										// this.getView().getModel("BatchItems").refresh();
										//this.getView().byId("scannedValue").setValue(err);
								}
							})
							console.log('Started continous decode from camera');
						}.bind(this),
						afterClose: function() {}
					});
					this.getView().addDependent(this._oScanQRDialog);
				}
				this._oScanQRDialog.open();
			} else { //QR Scanner is available and on Mobile Fiori Client
				sap.ndc.BarcodeScanner.scan(
					function(mResult) {
						oCont.fnBarcode(mResult.text);
					},
					function(Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);
					},
				);
			}

		},

		fnBarcode: function(vBarcode) {
			if (sap.ui.getCore().byId("test") !== undefined) {
				var vScanSplit = sap.ui.getCore().byId("test").getValue().split(",");
				this.Message.close();
			} else {
				var vScanSplit = vBarcode.split(",");
			}

			var that = this;
			var self = this;
			if (vScanSplit.length > 10) {
				var vScanMatnr = vScanSplit[0].trim(); //Material
				var vScanPlant = vScanSplit[1].trim(); //Plant
				var vScanBatch = vScanSplit[10].trim(); //Batch Number
				var vScanQty = vScanSplit[8].trim(); //Scanned Qty
				var vScanQtyUom = vScanSplit[6].trim(); //Scanned Qty Uom
				var vHU = vScanSplit[11].trim(); //HU
				var VHU1 = vScanSplit[2].trim(); //HU1  //Added by malar - 02.02.2023
				var VHU2 = vScanSplit[3].trim(); //HU2
				var VHU1Bages = vScanSplit[4].trim(); //No of Bags (HU1)
				var VHU2Bages = vScanSplit[5].trim(); //No of Bags (HU2)  //Ended.
			}
			var Batchitem = that.getView().getModel("BatchItems").getData();
			var vSubItemDatas = that.getView().getModel("DeliverySet").getData().LineItems;
			var vItemDatas = that.getView().getModel("DeliverySet").getData().LineItems;
			var vSubItemLen = vItemDatas.length - 1;
			var aHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems;
			var vlength = Batchitem.Items.length - 1;
			var vPickingQty = 0;
			var vDelQty = 0;
			var vSameBatchUpd = false;
			var vErr = false;
			var vErrMsg = "";
			if (!vScanMatnr || !vScanPlant || !vScanBatch || !vScanQty || !vScanQtyUom) {
				vErr = true;
				vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("InvalidQr") + "\n";
			} else { //Added by Malar - 27.01.2023
				if (Batchitem.Items[0].Lenum === "") {
					if (Batchitem.Items[0].Charg !== vScanBatch) {
						vErr = true;
						vErrMsg = vErrMsg + that.getView().getModel("i18n").getResourceBundle().getText("InvalBatch") + "\n";
					}
					vSameBatchUpd = true;
				}
			} //Ended.

			for (var i = 0; i < Batchitem.Items.length; i++) {
				vPickingQty = vPickingQty + Number(Batchitem.Items[i].Pikmg);
				vDelQty = vDelQty + Number(Batchitem.Items[i].Lfimg);
				if (formatter.LeadingZero(Batchitem.Items[i].Matnr) == formatter.LeadingZero(vScanMatnr) && Batchitem.Items[i].Charg == vScanBatch &&
					Batchitem.Items[i].Lenum == vHU &&
					Batchitem.Items[i].Pikmg !== "0.000") {
					vErr = true;
					vErrMsg = vErrMsg + that.getView().getModel("i18n").getResourceBundle().getText("DuplNotPos") + "\n";
				}
				// if (Batchitem.Items[0].Charg === "") {
				// 	vSameBatchUpd = true;
				// }
			}

			// for (var K = 0; K < Batchitem.Items.length; K++) {
			if (!vErr) {
				var vVbeln = that.getView().getModel("DeliverySet").getData().Header.Vbeln;
				var vProcess = "C";
				sap.ui.core.BusyIndicator.show();
				that.getView().getModel('odata').read("/ToScanValSet", {
					filters: [new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, vVbeln),
						new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, that.selectedItem.Posnr),
						new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, that.selectedItem.Matnr),
						new sap.ui.model.Filter("Lenum", sap.ui.model.FilterOperator.EQ, vHU),
						new sap.ui.model.Filter("InQty", sap.ui.model.FilterOperator.EQ, vScanQty),
						new sap.ui.model.Filter("InUom", sap.ui.model.FilterOperator.EQ, vScanQtyUom),
						new sap.ui.model.Filter("OutUom", sap.ui.model.FilterOperator.EQ, that.selectedItem.Vrkme),
						new sap.ui.model.Filter("Process", sap.ui.model.FilterOperator.EQ, vProcess) //Added by malar on 25.01.2023
					],
					urlParameters: {
						$expand: "ToScanValOutNav,DelReturnNav"
					},
					async: true,
					success: function(oData, Iresponse) {
						if (oData.results[0].DelReturnNav.results.length == 0) {
							vScanQty = oData.results[0].ToScanValOutNav.results[0].OutQty;
							vScanQtyUom = that.selectedItem.Vrkme;
							var vOpenQty = sap.ui.getCore().byId("id_OpQty1").getValue(); //Added by Suvethaa for OpenQty Change on 22.08.2022
							if (vSameBatchUpd) {
								//	if (Number(that.selectedItem.Lfimg) < Number(vScanQty)) {
								if (Number(that.selectedItem.Lfimg) === 0) { //Changed by Malar on 23.11.2022
									vErr = true;
									vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("ScanQtyExceeds") + "\n";
								}
							} else {

								if (Number(that.selectedItem.Lfimg) < vPickingQty + Number(vScanQty) && Number(vOpenQty) === 0) { //Added by Suvethaa for OpenQty Change on 22.08.2022
									vErr = true;
									vErrMsg = vErrMsg + self.getView().getModel("i18n").getResourceBundle().getText("ScanQtyExceeds") + "\n";
								}
							}
							if (!vErr) {
								if (!vSameBatchUpd) {
									var vItemArr = [];
									for (var i = 0; i < vItemDatas.length; i++) {
										if (vItemDatas[i].Uecha !== "000000") {
											vItemArr.push(vItemDatas[i]);
										}
									}
									if (vItemArr.length > 0) {
										var vSubItemPosnr = (Number(vItemArr[vItemArr.length - 1].Posnr) + 1);
									} else {
										var vSubItemPosnr = "900001";
										vSubItemLen = 0;
									}

									// Added by Suvethaa on 23.08.2022
									var vPendingQty = Number(vScanQty) - Number(vOpenQty);
									if (vPendingQty < 0) {
										vPendingQty = 0;
									}

									// Added by Suvethaa for Openqty on 22.08.2022
									if (Number(vOpenQty) < Number(vScanQty)) {
										vScanQty = vOpenQty;
									}

									var Batchitemnew = {
										Charg: vScanBatch,
										Bstme: Batchitem.Items[0].Bstme,
										Del_type: Batchitem.Items[0].Del_type,
										Fbatc: Batchitem.Items[0].Fbatc,
										Fpicq: Batchitem.Items[0].Fpicq,
										// Kwmeng: Batchitem.Items[0].Kwmeng, commented by Suvethaa on 24.08.2022
										Kwmeng: vPendingQty.toFixed(3), //Added by Suvethaa on 24.08.2022
										Lfimg: Batchitem.Items[0].Lfimg, /// As Picking Qty - Need to check
										Lgobe: Batchitem.Items[0].Lgobe,
										Lgort: Batchitem.Items[0].Lgort,
										Maktx: Batchitem.Items[0].Maktx,
										Matnr: Batchitem.Items[0].Matnr,
										Meins: Batchitem.Items[0].Meins,
										Menge: Batchitem.Items[0].Menge,
										Otnum: Batchitem.Items[0].Otnum,
										Pikmg: vScanQty,
										PikmgF: Batchitem.Items[0].PikmgF,
										// Posnr: vSubItemPosnr.toString(),
										Posnr: that.selectedItem.Posnr,
										Sc_No: Batchitem.Items[0].Sc_No,
										Spart: Batchitem.Items[0].Spart,
										Sto_flg: Batchitem.Items[0].Sto_flg,
										StrLoc: Batchitem.Items[0].StrLoc,
										// Uecha: that.selectedItem.Posnr,
										Uecha: "000000",
										Vbeln: Batchitem.Items[0].Vbeln,
										Vgbel: Batchitem.Items[0].Vgbel,
										Vgpos: Batchitem.Items[0].Vgpos,
										Vkorg: Batchitem.Items[0].Vkorg,
										Vrkme: vScanQtyUom,
										Vtweg: Batchitem.Items[0].Vtweg,
										Werks: Batchitem.Items[0].Werks,
										Tanum: Batchitem.Items[0].Tanum,
										Lgnum: Batchitem.Items[0].Lgnum,
										Lenum: vHU,
										Lgpla: Batchitem.Items[0].Lgpla,
										Pmat1: VHU1, //Added by malar - 02.02.2023
										Pmat2: VHU2,
										Pmatno1: VHU1Bages,
										Pmatno2: VHU2Bages //Ended
									};
									Batchitem.Items.push(Batchitemnew);
									that.getView().getModel("DeliverySet").getData().LineItems.push(Batchitemnew);
								} else { //Batch has already maintained without picking qty in SAP
									var vItemArr = [];
									for (var i = 0; i < vItemDatas.length; i++) {
										if (vItemDatas[i].Uecha !== "000000") {
											vItemArr.push(vItemDatas[i]);
										}
									}
									if (vItemArr.length > 0) {
										var vSubItemPosnr = (Number(vItemArr[vItemArr.length - 1].Posnr) + 1);
									} else {
										var vSubItemPosnr = "900001";
										vSubItemLen = 0;
									}
									var oGetObject = jQuery.extend(true, {}, that.selectedItem);
									// Added by Suvethaa on 24.08.2022
									var vPendingQty = Number(vScanQty) - Number(vOpenQty);
									if (vPendingQty < 0) {
										vPendingQty = 0;
									}
									Batchitem.Items[0].Kwmeng = vPendingQty.toFixed(3);
									// end of added
									// Added by Suvethaa for Openqty on 22.08.2022
									if (Number(vOpenQty) > Number(vScanQty)) {
										Batchitem.Items[0].Pikmg = vScanQty;
									} else {
										Batchitem.Items[0].Pikmg = vOpenQty;
									}
									// End of added
									Batchitem.Items[0].Vrkme = vScanQtyUom;
									Batchitem.Items[0].Lenum = vHU;
									Batchitem.Items[0].Charg = vScanBatch;
									Batchitem.Items[0].Uecha = "000000";
									// Batchitem.Items[0].Uecha = oGetObject.Posnr;
									// Batchitem.Items[0].Posnr = vSubItemPosnr.toString();
									Batchitem.Items[0].Posnr = oGetObject.Posnr;
									Batchitem.Items[0].Pmat1 =  VHU1; //Added by malar - 02.02.2023
									Batchitem.Items[0].Pmat2 = VHU2;
									Batchitem.Items[0].Pmatno1 = VHU1Bages;
									Batchitem.Items[0].Pmatno2 =  VHU2Bages; //Ended
									
									that.getView().getModel("DeliverySet").getData().LineItems.pop(0);
									that.getView().getModel("DeliverySet").getData().LineItems.push(Batchitem.Items[0]);
								}
								that.getView().setModel(new JSONModel(Batchitem), "BatchItems");
								that.getView().getModel("BatchItems").refresh();
								that.getView().getModel("DeliverySet").refresh(true);
								sap.ui.core.BusyIndicator.hide();
								that.fnColorChange();
							} else {
								sap.ui.core.BusyIndicator.hide();
								sap.m.MessageBox.error(vErrMsg);
							}
						} else {
							sap.ui.core.BusyIndicator.hide();
							var vErr = that.getView().getModel("i18n").getProperty("Error");
							sap.m.MessageBox.error(oData.results[0].DelReturnNav.results[0].Message, {
								icon: sap.m.MessageBox.Icon.Error,
								title: vErr
							});
						}
					},
					error: function(Ierror) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show(Ierror);
					}
				});

			} else {
				sap.m.MessageBox.error(vErrMsg);
			}
		},

		fnColorChange: function() {
			var that = this;
			var aItems = that.getView().getModel("BatchItems").getData();
			var vTotDelQty = that.selectedItem.Lfimg;
			var vPickedQty = 0;
			var aQtyTot = aItems.Items.filter(function(x) {
				vPickedQty = vPickedQty + Number(x.Pikmg);
			});
			var vOpenQty = Number(vTotDelQty) - Number(vPickedQty);

			if (vOpenQty == 0) {
				sap.ui.getCore().byId("id_OpQty1").addStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPYellow");
			}
			if (vOpenQty == Number(that.selectedItem.Lfimg)) {
				sap.ui.getCore().byId("id_OpQty1").addStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPYellow");
			}
			if (vOpenQty < Number(that.selectedItem.Lfimg) && vOpenQty > 0) {
				sap.ui.getCore().byId("id_OpQty1").addStyleClass("InputPlaceholder_CPYellow");
				sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty1").removeStyleClass("InputPlaceholder_CPRed");
			}
			sap.ui.getCore().byId("id_OpQty1").setValue(vOpenQty.toFixed(3));
		},

		//Create the Transfer Order -- Post (Confirm)
		fnCreateTO: function(oEvent) {
			var that = this;
			var vGetHeaderObj = oEvent.getSource().getBindingContext("DeliverySet").getObject();
			var txt_tocreat = that.getView().getModel("i18n").getResourceBundle().getText("Cnfto", vGetHeaderObj.Posnr);

			MessageBox.confirm(
				txt_tocreat, {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function(sAction) {
						if (sAction === "OK") {
							var odata = that.getView().getModel("DeliverySet").getData().LineItems;
							var odata1 = that.getView().getModel("DeliverySet").getData().HeaderItems;
							var oPostData = [];
							var aHeadData = [];
							aHeadData.push(vGetHeaderObj);

							var oPostModel = that.getView().getModel('odata');
							for (var j = 0; j < aHeadData.length; j++) {
								delete aHeadData[j].StrLoc;
								delete aHeadData[j].PikmgF;
								oPostData.push(aHeadData[j]);
							}
							var oEntry = {
								"d": {
									"PickFlag": "",
									"Vbeln": odata1[0].Vbeln,
									"PgiFlag": "",
									"WhSign": "",
									"DriverSign": "",
									"DelOutputNav": oPostData,
									"DelReturnNav": [],
									"TOProcess": "F",

								}
							};
							sap.ui.core.BusyIndicator.show();
							oPostModel.create('/DeliverySet', oEntry, null, function(oData, res) {
								var oReturn = oData.DelReturnNav.results[0];
								var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
								if (oReturn.Type === "S") {
									sap.ui.core.BusyIndicator.hide();
									MessageBox.success(oReturn.Message, {
										styleClass: bCompact ? "sapUiSizeCompact" : "",
										onClose: function(oAction) {
											that._LoadDeliveryItems(that, that.selectedItem.Vbeln, false);
										}
									});

								} else {
									sap.ui.core.BusyIndicator.hide();
									MessageBox.error(
										oReturn.Message, {
											styleClass: bCompact ? "sapUiSizeCompact" : "",
											onClose: function(oAction) {
												that.getOwnerComponent().getRouter().navTo("Dashboard");
												// that._LoadDeliveryItems(that, that.selectedItem.Vbeln, false);
											}
										}
									);
								}
							});
						}
					}
				});
		}, //End of  Create Transfer order

		//Begin of Confirm Tranfer Order  --  (Create TO)			
		fnConfirmTO: function(oEvent) {
			var that = this;
			// var vGetHeaderObj = oEvent.getSource().getBindingContext("DeliverySet").getObject();
			var txt_tocreat = that.getView().getModel("i18n").getResourceBundle().getText("Crtto", that.selectedItem.Posnr);
			// var txt_tocreat = that.getView().getModel("i18n").getResourceBundle().getText("Cnfto");

			if (that.getView().getModel("BatchItems") !== undefined) {

				MessageBox.confirm(
					txt_tocreat, {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function(sAction) {
							if (sAction === "OK") {
								var odata1 = that.getView().getModel("BatchItems").getData().Items;
								// var odata1 = that.getView().getModel("DeliverySet").getData().LineItems;
								var odataf = that.getView().getModel("DeliverySet").getData().HeaderItems;
								var odatah = that.getView().getModel("DeliverySet").getData().Header; //Added by malar - 02.02.2023
								var oPostData = [];
								var oPostModel = that.getView().getModel('odata');
								for (var j = 0; j < odata1.length; j++) {
									if (Number(odata1[j].Posnr) == Number(that.selectedItem.Posnr)) {
										var vFlag = false;
										delete odata1[j].StrLoc;
										delete odata1[j].PikmgF;
										oPostData.push(odata1[j]);
									}
								}
								var oEntry = {
									"d": {
										"PickFlag": "",
										"Vbeln": odata1[0].Vbeln,
										"PgiFlag": "",
										"WhSign": "",
										"DriverSign": "",
										"DelOutputNav": odata1,
										"DelReturnNav": [],
										"TOProcess": "T",
										"Wbid": odatah.Wbid

									}
								};
								oPostModel.create('/DeliverySet', oEntry, null, function(oData, res) {
									var oReturn = oData.DelReturnNav.results[0];
									var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

									if (oReturn.Type === "S") {
										var aHeaderData = that.getView().getModel("DeliverySet").getData().HeaderItems;
										for (var i = 0; i < aHeaderData.length; i++) {
											if (Number(aHeaderData[i].Posnr) === Number(that.selectedItem.Posnr)) {
												aHeaderData.splice(i, 1);
												break;
											}
										}
										aHeaderData.push(oData.DelOutputNav.results[0]);
										aHeaderData.sort(function(a, b) {
											return Number(a.Posnr) - Number(b.Posnr);
										});
										var oHeaderLines = {
											HeaderItems: aHeaderData,
											LineItems: that.getView().getModel("DeliverySet").getData().LineItems,
											Header: that.getView().getModel("DeliverySet").getData().Header
										};
										that.getView().setModel(new JSONModel(oHeaderLines), "DeliverySet");
										that.getView().getModel("DeliverySet").refresh();
										sap.ui.core.BusyIndicator.hide();
										MessageBox.success(
											oReturn.Message, {
												styleClass: bCompact ? "sapUiSizeCompact" : "",
											}
										);

									} else {
										MessageBox.error(
											oReturn.Message, {
												styleClass: bCompact ? "sapUiSizeCompact" : "",
												onClose: function(oAction) {
													that._LoadDeliveryItems(that, that.selectedItem.Vbeln, false);
												}
											}
										);
									}
								});
							}
						}
					});
			} else {
				var msg = that.getView().getModel("i18n").getResourceBundle().getText("Plsscanbatch");
				MessageBox.error(msg);
			}
		}
	});

});