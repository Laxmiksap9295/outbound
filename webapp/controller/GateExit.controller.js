jQuery.sap.require("sap.ndc.BarcodeScanner");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel"
], function(Controller, MessageBox, FilterOperator, Filter, JSONModel) {
	"use strict";
	var parametercheck;
	var weighbridgeid;
	this.MatDocScanned;
	var vGDname, vGTruck, vGPortKey, vGReason; //Added by Avinash
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn; //Added by Avinash
	return Controller.extend("LoadingConfirmation.controller.GateExit", {
		/*-----------------------------------------------------------------------------*/
		/*					Author		: Malarpriya N								   */
		/*					Description : Gate Exit Controller						   */
		/*					Company		: Exalca Technologies Pvt Ltd.				   */
		/*					Created On	: 											   */
		/*					Changed On	: 											   */
		/*-----------------------------------------------------------------------------*/
		//===============================================================
		//-------------------On Init Function----------------------
		//===============================================================
		onInit: function() {
			var that = this;
			var result = this.GetClock();
			that.getView().setModel(new sap.ui.model.json.JSONModel(), "oViewModel");
			that.getView().getModel("oViewModel").setProperty("/CmstoProperty", false);
			that.getView().getModel("oViewModel").setProperty("/EasyProperty", false);
			that.getView().getModel("oViewModel").setProperty("/SalesProperty", false);
			that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
			that.getView().getModel("oViewModel").setProperty("/DriverIdProperty", false);
			that.getView().byId("id_gatetime").setValue(result);
			vGReason = ""; //Added by Avinash
			setInterval(function() {
				var result = that.GetClock();
				that.getView().byId("id_gatetime").setValue(result);

			}, 1000);

			document.addEventListener("backbutton", jQuery.proxy(this.onBackKeyDown, this), false);
			this.getOwnerComponent().getRouter().getRoute("GateExit").attachPatternMatched(this._onObjectMatched, this);
			this.MatDocScanned = false;
		},
		onBeforeRendering: function() {
			//	this.getView().byId("id_gateEntryPage").removeStyleClass("sapUiSizeCompact");
			this.fnParameterCheck();
		},
		// onAfterRendering: function () {
		//	this.getView().byId("id_gateExitPage").removeStyleClass("sapUiSizeCompact");
		//	this.fnParameterCheck();
		//	},

		fnParameterCheck: function(plant) {
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
					//	parametercheck = oData.results[0].F4FieldsNav;
					var show;
					var EnableCtrl = new sap.ui.model.json.JSONModel();
					EnableCtrl.setData(oData.results[0].F4FieldsNav.results);
					that.getView().setModel(EnableCtrl, "oBatchEnable");
					//that.getView().getModel("oBatchEnable").refresh();
					//code added by kirubakaran on 22.07.2020 for brazil plant
					if (oData.results[0].F4FieldsNav.results[0].Nf_Number === "X") {
						that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
					} else {
						that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
					}
					if (oData.results[0].F4FieldsNav.results[0].Ee_Number === "X") {
						that.getView().getModel("oViewModel").setProperty("/EasyProperty", true);
					} else {
						that.getView().getModel("oViewModel").setProperty("/EasyProperty", false);
					}
					if (oData.results[0].F4FieldsNav.results[0].So_Number === "X") {
						that.getView().getModel("oViewModel").setProperty("/SalesProperty", true);
					} else {
						that.getView().getModel("oViewModel").setProperty("/SalesProperty", false);
					}
					if (oData.results[0].F4FieldsNav.results[0].Cms_Tonumber === "X") {
						that.getView().getModel("oViewModel").setProperty("/CmstoProperty", true);
					} else {
						that.getView().getModel("oViewModel").setProperty("/CmstoProperty", false);
					}
					if (oData.results[0].F4FieldsNav.results[0].Driver_Id === "X") {
						that.getView().getModel("oViewModel").setProperty("/DriverIdProperty", true);
					} else {
						that.getView().getModel("oViewModel").setProperty("/DriverIdProperty", false);
					}
					//code ended by kirubakaran on 22.07.2020 for brazil plant

					//BOC by Avinash for Port Operation -- IVC Rubber Changes
					if (oData.results[0].F4FieldsNav.results[0].Port_Op === "X") {
						vGPortKey = "X";
						that.getView().byId("id_truck").setEnabled(true);
						that.getView().byId("id_driver").setEnabled(true);
					} else {
						vGPortKey = "";
						that.getView().byId("id_truck").setEnabled(false);
						that.getView().byId("id_driver").setEnabled(false);
					}
					//EOC by Avinash

					var Batch = oData.results[0].F4FieldsNav.results.find(function(x) {
						if (x.Wbid == "X") {
							parametercheck = "";
						}
						if (x.Wbid !== "X") {
							parametercheck = "X";
						}
					});
				},

				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
				}
			});

		},
		onBackKeyDown: function(oEvent) {
			var that = this;
			var DoyouExit = that.getView().getModel("i18n").getResourceBundle().getText("DoyouExit");

			MessageBox.confirm(DoyouExit, {
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose: function(sAction) {
					if (sAction === "OK") {
						//	navigator.app.exitApp(); changed on 11_01_2020 dharma
					}
				}
			});
		},
		//===============================================================
		//-------------------Load Required Data----------------------
		//===============================================================
		_onObjectMatched: function() {
			this.fnParameterCheck();
			var oSetting = {
				"SwitchFlag": true
			};

			this.getView().setModel(new sap.ui.model.json.JSONModel(oSetting), "setting");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			// this.getView().byId('id_logo').setSrc(vPathImage + "/Images/login-logo@2x.png");
			this.getView().byId("id_brcdscan").setIcon(vPathImage + "/Images/barcode.png");
			this.getView().byId('id_homenew').setSrc(vPathImage + "/Images/home.png");
			//this.getView().byId('id_AddImg').setSrc(vPathImage + "/Images/Add.png");
			//	this.getView().byId('id_RemoveImg').setSrc(vPathImage + "/Images/Delete.png");
			this.getView().byId("id_ok").setVisible(false);
			this.getView().byId("id_gatedate").setDateValue(new Date());
			//	this.getView().byId('id_scanid').setState(true);
			this.getView().byId('id_AddImg').setSrc(vPathImage + "/Images/Add.png");
			this.getView().byId('id_RemoveImg').setSrc(vPathImage + "/Images/Delete.png");
			this.getView().byId('id_scanid').setState(true);
			this.getView().byId("id_DeliveryManual").setVisible(false);
			this.getView().byId("id_ReasonLabel").setVisible(false); //Added by Avi
			this.getView().byId("id_ReasonChange").setVisible(false); //Added by Avi
			this.ReprintWB = false;
			var vTemp = [{
				"Vbeln": ""
			}];

			var oManualDel = new sap.ui.model.json.JSONModel();
			oManualDel.setData(vTemp);
			this.getView().setModel(oManualDel, "JMManualDel");
			this.onScannerCancel();

			//	this.getView().byId("id_DeliveryManual").setVisible(true);
			this.getView().setModel(new sap.ui.model.json.JSONModel(oSetting), "setting");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");

		},

		//===============================================================
		//--------Weighbridge F4 Help - 08th June 22(Avinash)------------
		//===============================================================
		onweighbridgeF4: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var plant = oThat.getOwnerComponent().getModel("localModel").getProperty("/plant");
			if (!this.Weighfragment) {
				this.Weighfragment = sap.ui.xmlfragment("LoadingConfirmation.fragment.WeighBridgeDetails", this);
				this.getView().addDependent(this.Weighfragment);
			}
			this.Weighfragment.open();
			this.fnEntityWeighBridge(plant);
		},

		fnEntityWeighBridge: function(plant) {
			var oPath = "/F4Set";
			var that = this;
			var gate, plant, vGateFlag;
			if (that.ReprintWB) {
				gate = sap.ui.getCore().byId("id_ReprintGate").getValue();
				plant = sap.ui.getCore().byId("id_ReprintPlant").getValue();
				vGateFlag = "R";
			} else {
				gate = "";
				plant = that.getOwnerComponent().getModel("localModel").getProperty("/plant");
				vGateFlag = "X";
			}
			var oGetModel = that.getView().getModel('odata');
			oGetModel.read(oPath, {
				filters: [
					new Filter("IvWerks", FilterOperator.EQ, plant), //Added by Avi on 04th Jan 22
					new Filter("Wbid", FilterOperator.EQ, "X"),
					new Filter("IvGateExit", FilterOperator.EQ, vGateFlag),
					new Filter("Gate", FilterOperator.EQ, gate)
				],
				urlParameters: {
					$expand: "F4WbidNav,F4WbidGexNav"
				},
				success: function(oData, Response) {
					var oDataR = oData.results[0].F4WbidGexNav.results;
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
			var filter3 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.Contains, vValue);
			var filter4 = new sap.ui.model.Filter("Wtype", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2, filter3, filter4]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);
		},

		fnWeighbridgeconfirm: function(oEvent) {
			var that = this;
			var oItem = oEvent.getParameter("selectedItem");
			var oSelectedItemObject = oEvent.getParameter('selectedItem').getBindingContext("WeighbridgeData").getObject();
			if (that.ReprintWB) {
				sap.ui.getCore().byId("weighbridge").setValue(oSelectedItemObject.Wbid);
			} else {
				that.onScannerCancel();
				this.getView().byId("id_WeighbridgeProcess").setValue(oSelectedItemObject.Wbid);
				oEvent.getSource().getBinding("items").filter([]);
				that.onScanBarcode(oSelectedItemObject.Wbid);
			}
		},

		//===============================================================
		//-------------------Switch Function----------------------
		//===============================================================
		onSwitchChange: function(oEvent) {
			this.state = this.getView().byId('id_scanid').getState();
			this.getView().getModel("setting").getData().SwitchFlag = this.state;
			this.getView().getModel("setting").refresh();
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			this.getView().getModel("scannerData").refresh();

			if (this.state === false) {
				this.getView().byId("id_brcdscan").setVisible(false);
				this.getView().byId("id_ok").setVisible(true);
				this.getView().byId("id_gateentry").setVisible(false);
				this.getView().byId("id_DeliveryManual").setVisible(true);
				this.getView().byId("with_delivery").setVisible(false);
				this.getView().byId("id_WeighbridgeProcessManual").setValue("");
				//	var oMultiInput1 = this.getView().byId("id_delivery");
				//	oMultiInput1.removeAllTokens();

				var vTemp = [{
					"Vbeln": ""
				}];

				var oManualDel = new sap.ui.model.json.JSONModel();
				oManualDel.setData(vTemp);
				this.getView().setModel(oManualDel, "JMManualDel");

			} else {
				this.getView().byId("id_brcdscan").setVisible(true);
				this.getView().byId("id_ok").setVisible(false);
				this.getView().byId("id_gateentry").setVisible(true);
				this.getView().byId("id_DeliveryManual").setVisible(false);
				this.getView().byId("with_delivery").setVisible(true);

				//	var oMultiInput1 = this.getView().byId("id_delivery");
				//	oMultiInput1.removeAllTokens();

				var vTemp = [{
					"Vbeln": ""
				}];

				var oManualDel = new sap.ui.model.json.JSONModel();
				oManualDel.setData(vTemp);
				this.getView().setModel(oManualDel, "JMManualDel");

			}
		},
		//===============================================================
		//-------------------Time Function----------------------
		//===============================================================
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

		//===============================================================
		//-------------------Switch is manual clicking ok button getting Delivery Details----------------------
		//===============================================================
		onOkButton: function() {
			this.state = true;
			var vError = false;
			var Errordeliverytext = this.getView().getModel("i18n").getResourceBundle().getText("EnterDeliveryNumberforAllItems");
			var weigbrd = this.getView().byId("id_WeighbridgeProcessManual").getValue();
			//	var id = this.getView().byId("id_delivery").getValue();
			var vData = this.getView().getModel('JMManualDel').getData();
			// for (var i = 0; i < vData.length; i++) {
			// 	if (vData[i].Vbeln == "") {
			// 		vError = true;
			// 		break;
			// 	}
			// }
			if (!weigbrd) {
				var vData = this.getView().getModel('JMManualDel').getData();
				for (var i = 0; i < vData.length; i++) {
					if (vData[i].Vbeln) {
						this.fnexpandok(vData[i].Vbeln);
						this.onSwitchChange1();
					}
				}

			} else {
				this.fnexpandokweigh(weigbrd);
				var vData = this.getView().getModel('JMManualDel').getData();
				for (var i = 0; i < vData.length; i++) {
					if (vData[i].Vbeln) {
						this.fnexpandok(vData[i].Vbeln);
						// this.onSwitchChange1();
					}
				}
				this.onSwitchChange1();
			}

			// if (id == "") {
			// 	sap.m.MessageToast.show(Errordeliverytext);
			// } else {
			// 	this.fnexpand();
			// 	this.onSwitchChange1();
			// }
		},
		onSwitchChange1: function() {
			this.getView().byId('id_scanid').setState(true);
			this.state = this.getView().byId('id_scanid').getState();
			this.getView().getModel("setting").getData().SwitchFlag = this.state;
			//	this.getView().getModel("setting").getData().SwitchFlag = this.state;
			this.getView().getModel("setting").refresh();
			// this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			// this.getView().getModel("scannerData").refresh();
			if (this.state === false) {
				this.getView().byId("id_brcdscan").setVisible(false);
				this.getView().byId("id_ok").setVisible(true);
				this.getView().byId("id_gateentry").setVisible(false);
				this.getView().byId("id_DeliveryManual").setVisible(true);
				this.getView().byId("id_DelLabel").setVisible(false); //Added by Avinash for Design Changes...
				this.getView().byId("id_delivery").setVisible(false); //Added by Avinash
				this.getView().byId("id_deliverywithbox").setVisible(false);
				this.getView().byId("id_brcdscan").setVisible(false);
				this.getView().byId("with_delivery").setVisible(false);

				var vTemp = [{
					"Vbeln": ""
				}];

				var oManualDel = new sap.ui.model.json.JSONModel();
				oManualDel.setData(vTemp);
				this.getView().setModel(oManualDel, "JMManualDel");

			} else {
				this.getView().byId("id_brcdscan").setVisible(true);
				this.getView().byId("id_ok").setVisible(false);
				this.getView().byId("id_gateentry").setVisible(true);
				this.getView().byId("id_DeliveryManual").setVisible(false);
				this.getView().byId("with_delivery").setVisible(true);

				var vTemp = [{
					"Vbeln": ""
				}];

				var oManualDel = new sap.ui.model.json.JSONModel();
				oManualDel.setData(vTemp);
				this.getView().setModel(oManualDel, "JMManualDel");

			}

		},

		//===============================================================
		//-------------------Barcode Scan Function----------------------
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
		// 						// oView.byId("idInOutBond").setValue(mResult.text.trim());
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
                                // oView.byId("idInOutBond").setValue(mResult.text.trim());
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

		onScanBarcode: function(oData1) {
			var that = this;
			var oGetModel = this.getView().getModel('odata');
			var weighbridgescanned = "false";
			var weighbridge = that.getView().byId("id_WeighbridgeProcess").getValue();
			var GateEntryText = that.getView().getModel("i18n").getResourceBundle().getText("GateEntryText");
			var GateEntryText1 = that.getView().getModel("i18n").getResourceBundle().getText("GateEntryText1");
			// jQuery.sap.require("sap.ndc.BarcodeScanner");
			// sap.ndc.BarcodeScanner.scan(
			// 	function(oResult) {
			try {
				// var oData1 = oResult.text.trim();

				oData1 = oData1.split("#");
				if (oData1[0].startsWith("S")) {

					var oPath = "GateEntrySet?$filter=Tknum eq '" + oData1[1] + "'&$expand=NavGateEntry";
					//var oGetModel = this.getView().getModel('odata');
					oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
						var oDataR = oData.results[0];
						var val1 = oDataR.NavGateEntry;
						if (oData.results[0].Config1 === 'Y') {
							MessageBox.error(GateEntryText + oData1[0], {
								actions: [MessageBox.Action.CLOSE],
								onClose: function(oAction) {
									//that.getBusyDialog.close();
									if (oAction === "CLOSE") {
										that.getOwnerComponent().getRouter().navTo("Dashboard");
									}
								}
							});
						} else if (oData.results[0].Config1 === 'X') {
							MessageBox.error(GateEntryText1 + " " + oData1[0], {
								actions: [MessageBox.Action.CLOSE],
								onClose: function(oAction) {
									//that.getBusyDialog.close();
									if (oAction === "CLOSE") {
										that.getOwnerComponent().getRouter().navTo("Dashboard");
									}

								}
							});
						} else {

							var oMultiInput2 = that.getView().byId("id_delivery");

							var aTokens2 = oMultiInput2.getTokens();
							var vExists = false;
							if (aTokens2) {
								for (var i = 0; i < aTokens2.length; i++) {
									if (aTokens2[i].getKey() == oData.results[0].NavGateEntry.results[i].Config1) {
										vExists = true;
										break;
									}
								}
							}

							if (vExists == false) {
								var oSet;
								//	var val1 = oData.results[0].NavGateEntry.results;
								var oJSONModel = new sap.ui.model.json.JSONModel();
								for (var i = 0; i < oData.results[0].NavGateEntry.results.length; i++) {

									var vbeln = val1.results[i].Config1;
									oSet = {
										"Vbeln": val1.results[i].Config1,
										"Werks": val1.results[0].Werks,
										"Truck": oData.results[0].Vehno,
										"Dname": oData.results[0].Dname,
										"DriverId": oData.results[0].DriverId,
										"Nf_Number": oData.results[0].Nf_Number,
										"Ee_Number": oData.results[0].Ee_Number,
										"So_Number": oData.results[0].So_Number,
										"Gate": oData.results[0].Gate,
										"Remark": oData.results[0].Remark,
										"Wbid": oData.results[0].Wbid,
										"Pname": oData.results[0].Pname,
										"Gname": oData.results[0].Gname
									};
									//code added on 24.09.2020 for brazil plant to set Multi Input
									if (oData.results[0].Del_Type === "STO") {
										var oMultiInputEasy = that.getView().byId("id_EasyNumwith1");
										var bTokens = oMultiInputEasy.getTokens();
										var oMultiInputSale = that.getView().byId("id_SaleNumwith1");
										var cTokens = oMultiInputSale.getTokens();
										var oMultiInput1Nota = that.getView().byId("id_notawith1");
										var dTokens = oMultiInput1Nota.getTokens();
										var oMultiInput1CmsTo = that.getView().byId("id_cmsToValue");
										var cmTokens = oMultiInput1CmsTo.getTokens();
									} else {
										var oMultiInputEasy = that.getView().byId("id_EasyNumwith1");
										var bTokens = oMultiInputEasy.getTokens();
										var oMultiInputSale = that.getView().byId("id_SaleNumwith1");
										var cTokens = oMultiInputSale.getTokens();
										var oMultiInput1Nota = that.getView().byId("id_notawith1");
										var dTokens = oMultiInput1Nota.getTokens();
									}

									if (oData.results[0].Del_Type === "STO") {
										var cmTokenv = new sap.m.Token({
											text: oData.results[0].Cms_Tonumber,
											key: oData.results[0].Cms_Tonumber
										});
										cmTokens.push(cmTokenv);

										oMultiInput1CmsTo.removeAllTokens();
										oMultiInput1CmsTo.setTokens(cmTokens);
										oMultiInput1CmsTo.addValidator(function(args) {
											var text = args.text;

											return new new sap.m.Token({
												key: text,
												text: text
											});
										});
									}

									var eTokenv = new sap.m.Token({
										text: oData.results[0].Ee_Number,
										key: oData.results[0].Ee_Number
									});
									bTokens.push(eTokenv);
									var sTokenv = new sap.m.Token({
										text: oData.results[0].So_Number,
										key: oData.results[0].So_Number
									});
									cTokens.push(sTokenv);
									var nTokenv = new sap.m.Token({
										text: oData.results[0].Nf_Number,
										key: oData.results[0].Nf_Number
									});
									dTokens.push(nTokenv);

									oMultiInputEasy.removeAllTokens();
									oMultiInputEasy.setTokens(bTokens);
									oMultiInputEasy.addValidator(function(args) {
										var text = args.text;

										return new new sap.m.Token({
											key: text,
											text: text
										});
									});

									oMultiInputSale.removeAllTokens();
									oMultiInputSale.setTokens(cTokens);
									oMultiInputSale.addValidator(function(args) {
										var text = args.text;

										return new new sap.m.Token({
											key: text,
											text: text
										});
									});

									oMultiInput1Nota.removeAllTokens();
									oMultiInput1Nota.setTokens(dTokens);
									oMultiInput1Nota.addValidator(function(args) {
										var text = args.text;

										return new new sap.m.Token({
											key: text,
											text: text
										});
									});
									//code ended on 24.09.2020 for brazil plant to set Multi Input

									var oMultiInput1 = that.getView().byId("id_delivery");
									var aTokens = oMultiInput1.getTokens();

									var vTokenv = new sap.m.Token({
										text: vbeln,
										key: vbeln
									});
									aTokens.push(vTokenv);
									oMultiInput1.removeAllTokens();
									oMultiInput1.setTokens(aTokens);
									oMultiInput1.addValidator(function(args) {
										var text = args.text;

										return new new sap.m.Token({
											key: text,
											text: text
										});
									});

									var oScanDataModel = new sap.ui.model.json.JSONModel();
									oScanDataModel.setData(oSet);
									that.getView().setModel(oScanDataModel, "scannerData");

									that.getView().getModel("scannerData").refresh();

								}
							}
						}
					});
				} else {
					if (oData1[0].length != 12) {
						//BOC by Avinash for Delivery Scanning Validation
						var vFlag = "O"; //Flag for Gate Exit - Scanning Validation by Avinash....
						var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
						var oPath1 = "GateEntrySet?$filter=Config1 eq '" + oData1[0] + "'and Werks eq '" + vPlant +
							"' and Flag eq '" + vFlag + "'&$expand=NavGateEntry,GateReturnNav";
						//var oGetModel = this.getView().getModel('odata');
						oGetModel.read(oPath1, null, null, true, function(oData, oResponse) {
							//Added by Avinash for PGI Validation...
							var vResErr = false;
							var vResErrMsg = "";
							for (var i = 0; i < oData.results[0].GateReturnNav.results.length; i++) {
								if (oData.results[0].GateReturnNav.results[i].Type == "E") {
									vResErr = true;
									vResErrMsg = vResErrMsg + oData.results[0].GateReturnNav.results[i].Message + "\n";
								}
							}
							if (!vResErr) {
								//EOC by Avinash

								var oDataR = oData.results[0];
								var val1 = oDataR.NavGateEntry;
								//For Direct Gate Exit reason check..
								var vFlag = oData.results[0].Flag;
								if (vFlag == "R") {
									that.getView().byId("id_ReasonLabel").setVisible(true);
									that.getView().byId("id_ReasonChange").setVisible(true);
								} else {
									that.getView().byId("id_ReasonLabel").setVisible(false);
									that.getView().byId("id_ReasonChange").setVisible(false);
								}
								if (oDataR.Del_Type === "STO") {
									that.getView().getModel("oViewModel").setProperty("/CmstoProperty", true);
									that.getView().getModel("oViewModel").setProperty("/EasyProperty", true);
									that.getView().getModel("oViewModel").setProperty("/SalesProperty", true);
								} else {
									that.getView().getModel("oViewModel").setProperty("/CmstoProperty", false);
								}

								if (that.getView().getModel("oViewModel").getData().NotaProperty === true) {
									if (oData.results[0].Nf_Number === "") {
										var NotaError = that.getView().getModel("i18n").getResourceBundle().getText("NotaErrorMsg");
										sap.m.MessageToast.show(NotaError);
									}
								}

								if (oData.results[0].Config1 === 'Y') {
									MessageBox.error(GateEntryText + oData1[0], {
										actions: [MessageBox.Action.CLOSE],
										onClose: function(oAction) {
											//that.getBusyDialog.close();
											if (oAction === "CLOSE") {
												that.getOwnerComponent().getRouter().navTo("Dashboard");
											}
										}
									});
								} else if (oData.results[0].Config1 === 'X') {
									MessageBox.error(GateEntryText1 + " " + oData1[0], {
										actions: [MessageBox.Action.CLOSE],
										onClose: function(oAction) {
											//that.getBusyDialog.close();
											if (oAction === "CLOSE") {
												that.getOwnerComponent().getRouter().navTo("Dashboard");
											}

										}
									});
								} else {
									var oMultiInput2 = that.getView().byId("id_delivery");

									var aTokens2 = oMultiInput2.getTokens();
									var vExists = false;
									if (aTokens2) {
										for (var i = 0; i < aTokens2.length; i++) {
											if (aTokens2[i].getKey() == oData1[0]) {
												vExists = true;
												break;
											}
										}
									}
									if (vExists == false) {
										//	var oDataR = oData.results[0];
										//var val1 = oDataR.DelEsOutNav;
										var oJSONModel = new sap.ui.model.json.JSONModel();

										var oSet;
										if (val1.results[0].Dname === "") {
											that.getView().byId("id_driver").setEnabled(true);
										}
										//Commented by Avinash for IVC Rubber Changes...
										// else {
										// 	that.getView().byId("id_driver").setEnabled(false);
										// }
										//End of commented
										if (val1.results[0].Truck === "") {
											that.getView().byId("id_truck").setEnabled(true);
										}
										// else {
										// 	that.getView().byId("id_truck").setEnabled(false);
										// }
										oSet = {
											"Vbeln": oData1[0],
											"Werks": val1.results[0].Werks,
											"Truck": oData.results[0].Vehno,
											"Dname": oData.results[0].Dname,
											"DriverId": oData.results[0].DriverId,
											"Gate": oData.results[0].Gate,
											"Nf_Number": oData.results[0].Nf_Number,
											"Ee_Number": oData.results[0].Ee_Number,
											"So_Number": oData.results[0].So_Number,
											"Remark": oData.results[0].Remark,
											"Wbid": oData.results[0].Wbid,
											"Pname": oData.results[0].Pname,
											"Gname": oData.results[0].Gname
										};
										//code added on 24.09.2020 for brazil plant to set Multi Input
										if (oData.results[0].Del_Type === "STO") {
											var oMultiInputEasy = that.getView().byId("id_EasyNumwith1");
											var bTokens = oMultiInputEasy.getTokens();
											var oMultiInputSale = that.getView().byId("id_SaleNumwith1");
											var cTokens = oMultiInputSale.getTokens();
											var oMultiInput1Nota = that.getView().byId("id_notawith1");
											var dTokens = oMultiInput1Nota.getTokens();
											var oMultiInput1CmsTo = that.getView().byId("id_cmsToValue");
											var cmTokens = oMultiInput1CmsTo.getTokens();
										} else {
											var oMultiInputEasy = that.getView().byId("id_EasyNumwith1");
											var bTokens = oMultiInputEasy.getTokens();
											var oMultiInputSale = that.getView().byId("id_SaleNumwith1");
											var cTokens = oMultiInputSale.getTokens();
											var oMultiInput1Nota = that.getView().byId("id_notawith1");
											var dTokens = oMultiInput1Nota.getTokens();
										}

										if (oData.results[0].Del_Type === "STO") {
											var cmTokenv = new sap.m.Token({
												text: oData.results[0].Cms_Tonumber,
												key: oData.results[0].Cms_Tonumber
											});
											cmTokens.push(cmTokenv);

											oMultiInput1CmsTo.removeAllTokens();
											oMultiInput1CmsTo.setTokens(cmTokens);
											oMultiInput1CmsTo.addValidator(function(args) {
												var text = args.text;

												return new new sap.m.Token({
													key: text,
													text: text
												});
											});
										}
										var eTokenv = new sap.m.Token({
											text: oData.results[0].Ee_Number,
											key: oData.results[0].Ee_Number
										});
										bTokens.push(eTokenv);
										var sTokenv = new sap.m.Token({
											text: oData.results[0].So_Number,
											key: oData.results[0].So_Number
										});
										cTokens.push(sTokenv);
										var nTokenv = new sap.m.Token({
											text: oData.results[0].Nf_Number,
											key: oData.results[0].Nf_Number
										});
										dTokens.push(nTokenv);

										oMultiInputEasy.removeAllTokens();
										oMultiInputEasy.setTokens(bTokens);
										oMultiInputEasy.addValidator(function(args) {
											var text = args.text;

											return new new sap.m.Token({
												key: text,
												text: text
											});
										});

										oMultiInputSale.removeAllTokens();
										oMultiInputSale.setTokens(cTokens);
										oMultiInputSale.addValidator(function(args) {
											var text = args.text;

											return new new sap.m.Token({
												key: text,
												text: text
											});
										});

										oMultiInput1Nota.removeAllTokens();
										oMultiInput1Nota.setTokens(dTokens);
										oMultiInput1Nota.addValidator(function(args) {
											var text = args.text;

											return new new sap.m.Token({
												key: text,
												text: text
											});
										});
										//code ended on 24.09.2020 for brazil plant to set Multi Input

										var oMultiInput1 = that.getView().byId("id_delivery");
										var aTokens = oMultiInput1.getTokens();

										var vTokenv = new sap.m.Token({
											text: oData1[0],
											key: oData1[0]
										});
										aTokens.push(vTokenv);
										oMultiInput1.removeAllTokens();
										oMultiInput1.setTokens(aTokens);
										oMultiInput1.addValidator(function(args) {
											var text = args.text;

											return new new sap.m.Token({
												key: text,
												text: text
											});
										});

										var oScanDataModel = new sap.ui.model.json.JSONModel();
										oScanDataModel.setData(oSet);
										that.getView().setModel(oScanDataModel, "scannerData");
										//Added by Avinash for Breakdown Scenario...
										vGDname = that.getView().getModel("scannerData").getData().Dname;
										vGTruck = that.getView().getModel("scannerData").getData().Truck;
										//End of Added...
										that.getView().getModel("scannerData").refresh();

									} else {
										var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("DeliveryAlreadyScaned");
										sap.m.MessageToast.show(Errordeliverytext);
									}

									// 	var oSet;
									// 	oSet = {
									// 		"Vbeln": oData1[0],
									// 		"Werks": val1.results[0].Werks,

									// 		"Truck": oData.results[0].Vehno,
									// 		"Dname": oData.results[0].Dname
									// 	};
									// 	var oScanDataModel = new sap.ui.model.json.JSONModel();
									// 	oScanDataModel.setData(oSet);
									// 	that.getView().setModel(oScanDataModel, "scannerData");
									// 	//this.getView().setModel(oScanDataModel, "scannerData");
									// 	that.getView().getModel("scannerData").refresh();
									// }

								}
							}
							//BOC by Avinash
							else {
								var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
								sap.m.MessageBox.error(vResErrMsg, {
									icon: sap.m.MessageBox.Icon.Error,
									title: vErr
								});
							}
							//EOC by Avinash
						});
					}
					if (oData1[0].length === 12) {
						var msg1 = "";
						var msg2 = "";
						// var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] +
						// 	"'and Flag eq 'E'&$expand=NavGateEntry,GateReturnNav";
						//BOC by Avinash for Delivery Scanning Validation
						var vFlag = "O"; //Flag for Gate Exit For Reference id Scanning Validation by Avinash....
						var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
						var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] + "'and Werks eq '" + vPlant +
							"' and Flag eq '" + vFlag + "' &$expand=NavGateEntry,GateReturnNav";
						oGetModel.read(oPath2, {
							success: function(oData) {
								//Added by Avinash for WBID Validation...
								sap.ui.core.BusyIndicator.hide();
								var vResErr = false;
								var vResErrMsg = "";
								for (var i = 0; i < oData.results[0].GateReturnNav.results.length; i++) {
									if (oData.results[0].GateReturnNav.results[i].Type == "E") {
										vResErr = true;
										vResErrMsg = vResErrMsg + oData.results[0].GateReturnNav.results[i].Message + "\n";
									}
								}
								if (!vResErr) {
									//Added by Avinash for Duplicate Delivery Scanning Validation...
									var oMultiInput2 = that.getView().byId("id_delivery");
									var aTokens2 = oMultiInput2.getTokens();
									var vExists = false;
									if (aTokens2) {
										if (oData.results[0].NavGateEntry.results.length > 0) {
											var aArray = [];
											var uniqueVbeln = [new Set(oData.results[0].NavGateEntry.results.map(function(obj) {
												if (obj.Vbeln !== "") {
													return obj.Vbeln;
												}
											}))];
											var data = uniqueVbeln[0].values();
											for (var i = 0; i < uniqueVbeln[0].size; i++) {
												var VbObject = {
													"Vbeln": data.next().value
												};
												aArray.push(VbObject);
											}
											for (var i = 0; i < aTokens2.length; i++) {
												for (var j = 0; j < aArray.length; j++) {
													if (aTokens2[i].getKey() == aArray[j].Vbeln) {
														vExists = true;
														break;
													}
												}
											}
										}
									}
									if (!vExists) {
										//EOC by Avinash for Duplicate Delivery Scanning Validation
										weighbridgescanned = "true";
										//For Direct Gate Exit reason check..
										// var val1 = oData.results[0].NavGateEntry;
										// if (val1.results.length > 0) {
										var vFlag = oData.results[0].Flag;
										if (vFlag == "R") {
											that.getView().byId("id_ReasonLabel").setVisible(true);
											that.getView().byId("id_ReasonChange").setVisible(true);
										} else {
											that.getView().byId("id_ReasonLabel").setVisible(false);
											that.getView().byId("id_ReasonChange").setVisible(false);
										}
										// }
										// sap.ui.core.BusyIndicator.hide();
										var oScanDataModel = new sap.ui.model.json.JSONModel();
										oScanDataModel.setData(oData.results[0]);
										that.getView().setModel(oScanDataModel, "scannerData");
										that.getView().byId("id_truck").setValue(oData.results[0].Vehno);
										//Added by Avinash for Breakdown Scenario...
										vGDname = that.getView().getModel("scannerData").getData().Dname;
										vGTruck = that.getView().byId("id_truck").getValue();
										//End of Added...

										//	that.getView().byId("process").setSelectedKey(oData.results[0].Config6.toUpperCase());
										weighbridgeid = oData.results[0].Wbid;
										var slKey = oData.results[0].Config6;
										if (slKey.toUpperCase() == "DOMESTIC") {
											that.getView().byId("id_delivery").setEnabled(true);
										}
										if ((slKey == "EXPORT") || (slKey == "SCRAP")) {
											that.getView().byId("id_delivery").setEnabled(false);
										}
										that.getView().getModel("scannerData").refresh();
										if (oData.results[0].NavGateEntry.results.length != 0) {
											if (oData.results[0].NavGateEntry.results[0].Vbeln !== "") { //Added by Avinash for CFM Changes
												var oMultiInput1 = that.getView().byId("id_delivery");
												var aTokens = oMultiInput1.getTokens();
												var aArray = [];
												var uniqueVbeln = [new Set(oData.results[0].NavGateEntry.results.map(function(obj) {
													if (obj.Vbeln !== "") {
														return obj.Vbeln;
													}
												}))];
												var data = uniqueVbeln[0].values();
												for (var i = 0; i < uniqueVbeln[0].size; i++) {
													var Object = {
														"Vbeln": data.next().value
													};
													aArray.push(Object);
												}
												for (var i = 0; i < aArray.length; i++) {
													if (aArray[i].Vbeln != undefined && aArray[i].Vbeln != "") {
														var vTokenv = new sap.m.Token({
															text: aArray[i].Vbeln,
															key: aArray[i].Vbeln
														});
														aTokens.push(vTokenv);
													}
												}
												oMultiInput1.removeAllTokens();
												oMultiInput1.setTokens(aTokens);
												oMultiInput1.addValidator(function(args) {
													var text = args.text;
													return new new sap.m.Token({
														key: text,
														text: text
													});
												});
												that.getView().byId("id_DelLabel").setText(that.getView().getModel("i18n").getResourceBundle().getText(
													"DeliveryNo")); //Added on 29th March
											} else if (oData.results[0].NavGateEntry.results[0].Pmblnr !== "") {
												//Added by Avinash for CFM Changes
												var oMultiInput1 = that.getView().byId("id_delivery");
												var aTokens = oMultiInput1.getTokens();
												var aArray = [];
												var uniqueVbeln = [new Set(oData.results[0].NavGateEntry.results.map(function(obj) {
													if (obj.Pmblnr !== "") {
														return obj.Pmblnr;
													}
												}))];
												var data = uniqueVbeln[0].values();
												for (var i = 0; i < uniqueVbeln[0].size; i++) {
													var Object = {
														"Vbeln": data.next().value
													};
													aArray.push(Object);
												}
												for (var i = 0; i < aArray.length; i++) {
													if (aArray[i].Vbeln != undefined && aArray[i].Vbeln != "") {
														var vTokenv = new sap.m.Token({
															text: aArray[i].Vbeln,
															key: aArray[i].Vbeln
														});
														aTokens.push(vTokenv);
													}
												}
												that.MatDocScanned = true; //Added by Avinash
												that.getView().byId("id_DelLabel").setText(that.getView().getModel("i18n").getResourceBundle().getText(
													"DelMatDoc")); //Added on 29th March
												oMultiInput1.removeAllTokens();
												oMultiInput1.setTokens(aTokens);
												oMultiInput1.addValidator(function(args) {
													var text = args.text;
													return new new sap.m.Token({
														key: text,
														text: text
													});
												});

											}
										}
									} else {
										var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("DeliveryAlreadyScaned");
										sap.m.MessageToast.show(Errordeliverytext);
									}
									//BOC by Avinash
								} else {
									var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
									sap.m.MessageBox.error(vResErrMsg, {
										icon: sap.m.MessageBox.Icon.Error,
										title: vErr
									});
								}
								//EOC by Avinash

							},
							error: function() {
								sap.m.MessageBox.error(that.getView().getModel("i18n").getProperty("HTTPFail"));
								sap.ui.core.BusyIndicator.hide();
							}

						});

					}
				}

			} catch (e) {

			}

			// 	}
			// );

		},
		///////////////////////////////f4/////////////////////////////

		fnhandleGate: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var plant = this.getView().byId("id_plantwith1").getValue();
			if (!this.ofragmentgate) {
				this.ofragmentgate = sap.ui.xmlfragment("LoadingConfirmation.fragment.Gate", this);
				this.getView().addDependent(this.ofragmentgate);
			}
			this.ofragmentgate.open();
			this.fnEntityGate(plant);
		},
		fnEntityGate: function(plant) {
			var oPath = "/F4Set";
			var that = this;
			var oGetModel = that.getView().getModel('odata');
			oGetModel.read(oPath, {
				filters: [
					new Filter("IvGate", FilterOperator.EQ, "X"),
					new Filter("IvWerks", FilterOperator.EQ, plant)
				],
				urlParameters: {
					$expand: "F4GateNav"
				},
				success: function(oData, Response) {
					var oDataR = oData.results[0].F4GateNav.results;
					if (oDataR.length === 1) {
						that.getView().byId("id_Gateno").setValue(oDataR[0].Gate);
					}
					var RPGateModel = new sap.ui.model.json.JSONModel();
					RPGateModel.setData(oDataR);
					that.getView().setModel(RPGateModel, "GateData");
					that.getView().getModel("GateData").refresh();

					//  that.oGl.setBusy(false);
				},
				error: function(oResponse) {

					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));

				}
			});

		},
		ongatesearch: function(oEvent) {
			var vValue = oEvent.getParameter("value");
			var filter1 = new sap.ui.model.Filter("Gate", sap.ui.model.FilterOperator.Contains, vValue);
			var filter2 = new sap.ui.model.Filter("Wbname", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);

		},
		fngateconfirm: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			this.getView().byId("id_Gateno").setValue(oItem.getTitle());
			this.getView().getModel("scannerData").getData().Gname = oItem.getDescription();
			this.getView().getModel("scannerData").refresh();
		},
		//===============================================================
		//-------------------Back Function----------------------
		//===============================================================
		onBackPress: function() {
			this.getOwnerComponent().getRouter().navTo("Dashboard");
		},

		//===============================================================
		//-------------------Clear Function----------------------
		//===============================================================
		onScannerCancel: function(oEvent) {
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			this.getView().getModel("scannerData").refresh();
			this.getView().byId("id_remarks").setValue("");
			this.getView().byId("id_WeighbridgeProcessManual").setValue("");
			this.getView().byId("id_WeighbridgeProcess").setValue("");
			var oMultiInput1 = this.getView().byId("id_delivery");
			var aTokens = oMultiInput1.setTokens([]);
			var oMultiInputNota = this.getView().byId("id_notawith1");
			var dTokens = oMultiInputNota.setTokens([]);
			var oMultiInputEasy = this.getView().byId("id_EasyNumwith1");
			var bTokens = oMultiInputEasy.setTokens([]);
			var oMultiInputSales = this.getView().byId("id_SaleNumwith1");
			var cTokens = oMultiInputSales.setTokens([]);
			this.MatDocScanned = false;
			// var oMultiInputPurchase = this.getView().byId("id_PurchaseNumwith1");
			// var cTokens = oMultiInputPurchase.setTokens([]);
			// var oMultiInputCMS = this.getView().byId("id_CmsNumwith1");
			// var bTokens = oMultiInputCMS.setTokens([]);
			vGReason = ""; //Added by Avinash...
			var vTemp = [{
				"Vbeln": ""
			}];

			var oManualDel = new sap.ui.model.json.JSONModel();
			oManualDel.setData(vTemp);
			this.getView().setModel(oManualDel, "JMManualDel");
			this.getView().byId("id_ReasonLabel").setVisible(false); //Added by Avi
			this.getView().byId("id_ReasonChange").setVisible(false); //Added by Avi
			this.getView().byId("id_DelLabel").setText(this.getView().getModel("i18n").getResourceBundle().getText(
				"DeliveryNo")); //Added on 29th March
		},
		fnPressAdd: function(oEvent) {
			var oTabModel = this.getView().getModel("JMManualDel");
			var oTabData = oTabModel.getData();

			oTabData.push({
				"Vbeln": ""

			});

			oTabModel.refresh();
		},
		fnPressDelete: function(oEvent) {

			var vPath = Number(oEvent.getSource().getBindingContext("JMManualDel").getPath().split("/")[1]);
			var oTabModel = this.getView().getModel("JMManualDel");
			var oTabData = oTabModel.getData();
			if (oTabData.length > 1) {
				oTabData.splice(vPath, 1);

				oTabModel.refresh();
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("oneItem"));
			}

		},

		//===============================================================
		//-------------------Validate Gate Entry Data Function----------------------
		//===============================================================
		onScannerSave: function(oEvent) {
			var that = this;

			var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');

			var vError = false;
			var driver = this.getView().byId("id_driver").getValue();
			var truck = this.getView().byId("id_truck").getValue();
			var vReasLabel = this.getView().byId("id_ReasonLabel").getVisible();
			var vReasonText = this.getView().byId("id_ReasonChange").getVisible();
			var vReasonTextvalue = this.getView().byId("id_ReasonChange")._getSelectedItemText();
			if (vReasLabel && vReasLabel) {
				if (vReasonTextvalue === "") {
					vError = true;
					var EnterReason = that.getView().getModel("i18n").getResourceBundle().getText("EnterReason");
					sap.m.MessageToast.show(EnterReason);
				}
			} else {
				vReasonTextvalue = "";
			}
			if (driver === "" || truck === "") {
				vError = true;
			}
			if (driver == "") {
				var EnterDriverName = that.getView().getModel("i18n").getResourceBundle().getText("EnterDriverName");
				sap.m.MessageToast.show(EnterDriverName);
			}
			if (truck == "") {
				var EnterTruckName = that.getView().getModel("i18n").getResourceBundle().getText("EnterTruckName");
				sap.m.MessageToast.show(EnterTruckName);

			}
			if (vError === false) {
				var submit = that.getView().getModel("i18n").getResourceBundle().getText("submit");
				MessageBox.confirm(submit, {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if (oAction === "OK") {
							if (vGPortKey === "X") {
								that.fnCheckReason(vReasonTextvalue);
							} else {
								that.fnGateExit(vReasonTextvalue);
							}
						}
					}
				});
				//that._LoadDeliveryItems(that, vbeln, true);

			}

		},

		//Added by Avinash for Breakdown Scenario...
		fnCheckReason: function(vReasonTextvalue) {
			var that = this;
			var vScanArr = that.getView().getModel('scannerData').getData();
			if (vGReason == "") {
				if (vScanArr.Dname !== vGDname || vScanArr.Truck !== vGTruck) {
					if (!this.Reason) {
						this.Reason = sap.ui.xmlfragment(
							"LoadingConfirmation.fragment.ReasonGE",
							this
						);
						this.getView().addDependent(this.Reason);
					}
					this.Reason.open();
					that.onCallReasonF4();
				} else {
					that.fnGateExit(vReasonTextvalue);
				}
			} else {
				that.fnGateExit(vGReason);
			}
		},

		onCloseReason: function() {
			var self = this;
			// sap.ui.getCore().byId('id_ReasonGE').setSelectedKey();
			self.Reason.close();
		},

		onCallReasonF4: function() {
			var self = this;
			// var ivWerks = self.getView().getModel("DoPortInModel").getData().Werks;
			sap.ui.core.BusyIndicator.show();
			var oPostModel = self.getView().getModel('odata');
			// var vReasonx = "X";
			oPostModel.read("/F4Set", {
				filters: [
					new sap.ui.model.Filter("Reason", sap.ui.model.FilterOperator.EQ, 'X')
					// new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, ivWerks)
				],
				urlParameters: {
					$expand: "F4ReasonNav"
				},
				async: true,
				success: function(oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					var oJSONModelSize = new sap.ui.model.json.JSONModel();
					oJSONModelSize.setData(oData.results[0].F4ReasonNav.results);
					self.getView().setModel(oJSONModelSize, "JMReason");
				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show(oResponse.message);
				}
			});
		},

		fnReasonSubmit: function(oEvent) {
			var vReason = sap.ui.getCore().byId("id_ReasonGE").getSelectedKey();
			vGReason = vReason;
			var self = this;
			if (vReason) {
				this.fnGateExit(vReason);
				// sap.ui.getCore().byId('id_ReasonGE').setSelectedKey();
				self.Reason.close();
			} else {
				var vErrMsg = self.getView().getModel("i18n").getResourceBundle().getText("PlSelectReason");
				// oi18n.getProperty('PlSelReason');
				MessageBox.error(vErrMsg);
			}
		},

		onTruckLiveChange: function(oEvent) {
			var svalue = oEvent.getSource().getValue();
			svalue = svalue.replace(/[^a-zA-Z0-9 ]/g, '');
			svalue = svalue.toUpperCase();
			oEvent.getSource().setValue(svalue);
			if (svalue) {
				oEvent.getSource().setValueState("None");
			}
		},

		onDriverLiveChange: function(oEvent) {
			var inputtxt = oEvent.getSource().getValue();
			var letters = /^[a-zA-Z ]*$/;
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
		},
		//End of added...

		//===============================================================
		//-------------------Gate Exit Function----------------------
		//===============================================================
		fnGateExit: function(vReason) {
			var that = this;
			var oPostModel = this.getView().getModel('odata');
			var oPath = '';
			var vWBID = "";
			//	var newdata={};
			var newdata = [];
			var arr = [];
			var flag;
			arr = that.getView().getModel('scannerData').getData();
			var remark = that.getView().byId("id_remarks").getValue();
			var oMultiInput1 = this.getView().byId("id_delivery");
			var aTokens = oMultiInput1.getTokens();
			var weighbrige = this.getView().byId("id_WeighbridgeProcess").getValue();
			//Added by Avinash...
			var vChangeReason;
			if (vReason) {
				vChangeReason = vReason;
			} else {
				vChangeReason = "";
			}
			//End of added
			if (weighbrige) {
				var Vbeln = "";
				if (aTokens.length != 0) {
					Vbeln = aTokens[0].getKey();
				}
				var oEntity = {
					Config1: that.MatDocScanned === true ? "" : Vbeln,
					Config4: "S02",
					InOut: "OUT",
					Direction: "IN",
					Vehno: arr.Truck,
					Dname: arr.Dname,
					DriverId: arr.DriverId,
					Werks: arr.Werks,
					Flag: 'X',
					// Gate: that.getView().byId("id_Gateno").getValue(),
					Gate: that.getView().byId("id_Gateno").getValue().split(" - ")[0],
					Wbid: weighbrige,
					Remark: remark,
					Reason: vChangeReason //Added by Avinash....
				};
				oEntity.GateReturnNav = []; //code added by kirubakaran for brazil plant//
				oEntity.NavGateEntry = [];
				var oPath = '/GateEntrySet';
				oPostModel.create(oPath, oEntity, {
					success: function(oData, Response) {
						var Transaction = that.getView().getModel("i18n").getResourceBundle().getText("Transaction1");
						//code added by kirubakaran on 04.08.2020//
						if (oData.GateReturnNav.results.length !== 0) {
							if (oData.GateReturnNav.results[0].Type === "E") {
								//Added  by Avinash
								var vResErrMsg = "";
								for (var i = 0; i < oData.GateReturnNav.results.length; i++) {
									if (oData.GateReturnNav.results[i].Type == "E") {
										// vResErr = true;
										vResErrMsg = vResErrMsg + oData.GateReturnNav.results[i].Message + "\n";
									}
								}
								//End of added
								var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
								MessageBox.show(vResErrMsg, {
									icon: MessageBox.Icon.ERROR,
									title: vErr,
									actions: MessageBox.Action.OK
								});
							}
						}
						//code added by kirubakaran 04.08.2020//
						if (oData.Msg == 'U') {
							var Completed = that.getView().getModel("i18n").getResourceBundle().getText("UpdatedGE");
						} else if (oData.Msg == 'E') {
							var Completed = that.getView().getModel("i18n").getResourceBundle().getText("GateExitTextError");
						} else if (oData.Msg === 'N') {
							var postgoodissue = that.getView().getModel("i18n").getResourceBundle().getText("postgoodissuesforsameDel");
							MessageBox.error(postgoodissue + arr.Vbeln);
							that.onScannerCancel();
						} else if (oData.Msg === 'A') {
							var vDta = [];
							var VData = "";
							var vODataGate = oData.NavGateEntry.results;
							for (var i = 0; i < oData.NavGateEntry.results.length; i++) {
								if (vODataGate[i].Kostk === 'C' && vODataGate[i].Wbstk === 'C') {

								} else {
									//	vDta.push(vODataGate[i]);
									VData = vODataGate[i].Vbeln + " " + VData;

								}

							}
							//Added by Avinash to delete duplicate Delivery..
							var vODataGate = oData.NavGateEntry.results;
							var vUniqueArry = [];
							for (var i = 0; i < oData.NavGateEntry.results.length; i++) {
								if (vODataGate[i].Kostk === 'C' && vODataGate[i].Wbstk === 'C') {
									var k = false;
								} else {
									var vFornd = false;
									var vCurr = vODataGate[i].Vbeln;
									if (vCurr !== "") {
										if (vCurr !== Vbeln) {
											for (var j = 0; j < vUniqueArry.length; j++) {
												if (vCurr == vUniqueArry[j].Vbeln) {
													vFornd = true;
													break;
												}
											}
											if (vFornd == false) {
												vUniqueArry.push(vODataGate[i]);
											}
										} else {
											var vExist = true;
										}
									}
								}
							}
							var vDelData = "";
							for (var i = 0; i < vUniqueArry.length; i++) {
								vDelData = vUniqueArry[i].Vbeln + " " + vDelData;
							}
							//End of added by Avinash

							// var vDelData = ( [...new Set(VData)] );
							//Added by Avinash
							var postgoodissues;
							if (!vExist) {
								postgoodissues = that.getView().getModel("i18n").getResourceBundle().getText("postgoodissues");
							} else {
								var otherDel;
								postgoodissues = that.getView().getModel("i18n").getResourceBundle().getText("postgoodissuesforsameDel");
								otherDel = that.getView().getModel("i18n").getResourceBundle().getText("otherDelivery");
							}
							// MessageBox.error(postgoodissues + VData); //Commented by Avinash
							if (!vExist) {
								MessageBox.error(postgoodissues + " " + vDelData);
							} else {
								if (vDelData !== "") {
									MessageBox.error(postgoodissues + " " + Vbeln + " " + otherDel + " " + vDelData);
								} else {
									MessageBox.error(postgoodissues + " " + Vbeln);
								}
							}
							//End of added...
							//	var len = vDta.length;

							that.onScannerCancel();
						} else {

							if (vGPortKey !== "X") { //Added by Avinash
								var Completed = that.getView().getModel("i18n").getResourceBundle().getText("Completed");
								flag = 1;
								var Information = that.getView().getModel("i18n").getResourceBundle().getText("Information");
								if (oData.Wbid !== "") {
									vGReason = ""; //Added by Avinash...
									var vWBID = oData.Wbid;
									// var vErr = that.getView().getModel("i18n").getProperty("Ok");
									sap.m.MessageBox.show(Transaction + " " + vWBID + " " + Completed, {
										icon: sap.m.MessageBox.Icon.INFORMATION,
										actions: [MessageBox.Action.OK],
										title: Information,
										onClose: function(oAction) {
											if (oAction === MessageBox.Action.OK) {
												that.onScannerCancel();
											}
										}
									});
								}
							}
							//BOC by Avinash
							else {
								var Completed = that.getView().getModel("i18n").getResourceBundle().getText("Completed");
								flag = 1;
								var Information = that.getView().getModel("i18n").getResourceBundle().getText("Information");
								if (oData.Wbid !== "") {
									vGReason = ""; //Added by Avinash...
									var vWBID = oData.Wbid;
									var vResSucMsg = "";
									for (var i = 0; i < oData.GateReturnNav.results.length; i++) {
										if (oData.GateReturnNav.results[i].Type == "S") {
											// vResErr = true;
											vResSucMsg = vResSucMsg + oData.GateReturnNav.results[i].Message + "\n";
										}
									}
									// var vErr = that.getView().getModel("i18n").getProperty("Ok");
									sap.m.MessageBox.show(vResSucMsg, {
										icon: sap.m.MessageBox.Icon.INFORMATION,
										actions: [MessageBox.Action.OK],
										title: Information,
										onClose: function(oAction) {
											if (oAction === MessageBox.Action.OK) {
												that.onScannerCancel();
											}
										}
									});
								}
							}
							//EOC by Avinash
						}

					},
					error: function(oResponse) {
						var ErrorGateExit = that.getView().getModel("i18n").getResourceBundle().getText("ErrorGateExit");
						sap.m.MessageToast.show(ErrorGateExit);
					}

				});
			} else {
				var vLength = aTokens.length;
				var oItems = [];
				var vItem = 10;
				for (var i = 0; i < vLength; i++) {
					var Vbeln = aTokens[i].getKey();
					var oEntity = {
						Config1: Vbeln,
						Config4: "S02",
						InOut: "OUT",
						Direction: "IN",
						Vehno: arr.Truck,
						Dname: arr.Dname,
						DriverId: arr.DriverId,
						Werks: arr.Werks,
						Flag: 'X',
						// Gate: that.getView().byId("id_Gateno").getValue(),
						Gate: that.getView().byId("id_Gateno").getValue().split(" - ")[0],
						Remark: remark
					};

					oEntity.NavGateEntry = [];
					var oPath = '/GateEntrySet';
					oPostModel.create(oPath, oEntity, {
						success: function(oData, Response) {

							var Transaction = that.getView().getModel("i18n").getResourceBundle().getText("Transaction1");
							if (oData.Msg == 'U') {
								var Completed = that.getView().getModel("i18n").getResourceBundle().getText("UpdatedGE");
							} else if (oData.Msg == 'E') {
								var Completed = that.getView().getModel("i18n").getResourceBundle().getText("GateExitTextError");
							} else if (oData.Msg === 'N') {
								var postgoodissue = that.getView().getModel("i18n").getResourceBundle().getText("postgoodissue");
								MessageBox.error(postgoodissue + arr.Vbeln);
								that.onScannerCancel();
							} else if (oData.Msg === 'A') {
								var vDta = [];
								var VData = "";
								var vODataGate = oData.NavGateEntry.results;
								for (var i = 0; i < oData.NavGateEntry.results.length; i++) {
									if (vODataGate[i].Kostk === 'C' && vODataGate[i].Wbstk === 'C') {

									} else {
										//	vDta.push(vODataGate[i]);
										VData = vODataGate[i].Vbeln + " " + VData;

									}

								}
								var postgoodissues = that.getView().getModel("i18n").getResourceBundle().getText("postgoodissues");
								MessageBox.error(postgoodissues + VData);
								//	var len = vDta.length;

								that.onScannerCancel();
							} else {
								var Completed = that.getView().getModel("i18n").getResourceBundle().getText("Completed");
								flag = 1;
								var Information = that.getView().getModel("i18n").getResourceBundle().getText("Information");
								if (oData.Wbid !== "") {
									var vWBID = oData.Wbid;
									sap.m.MessageBox.show(Transaction + " " + vWBID + " " + Completed, {
										icon: sap.m.MessageBox.Icon.INFORMATION,
										actions: [MessageBox.Action.OK],
										title: Information,
										onClose: function(oAction) {
											if (oAction === MessageBox.Action.OK) {
												that.onScannerCancel();

												//	that.getOwnerComponent().getRouter().navTo("Dashboard");

											}
										}
									});
								}

							}

						},
						error: function(oResponse) {
							var ErrorGateExit = that.getView().getModel("i18n").getResourceBundle().getText("ErrorGateExit");

							sap.m.MessageToast.show(ErrorGateExit);
						}

					});

					/*	if(flag==1){
												break;
											}*/
				}
			}

		},

		//===============================================================
		//-------------------Switch is manual validate delivery----------------------
		//===============================================================
		fnexpandokweigh: function(weighbridge) {
			var that = this;
			var oGetModel = this.getView().getModel('odata');
			var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
			var vFlag = "O"; //Flag for Gate Exit For Reference id Scanning Validation by Avinash....
			// var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
			// var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] + "'and Werks eq '" + vPlant +
			// 	"' and Flag eq '" + vFlag + "' &$expand=NavGateEntry,GateReturnNav";
			// var oPath = "GateEntrySet?$filter=Config1 eq '" + vbeln + "'and Werks eq '" + vPlant +
			// 	"'&$expand=NavGateEntry";
			// var oPath2 = "GateEntrySet?$filter=Wbid eq '" + weighbridge + "'and Flag eq 'E'&$expand=NavGateEntry,GateReturnNav";
			var oPath2 = "GateEntrySet?$filter=Wbid eq '" + weighbridge + "' and Werks eq '" + vPlant +
				"' and Flag eq '" + vFlag + "' &$expand=NavGateEntry,GateReturnNav";
			oGetModel.read(oPath2, {
				success: function(oData) {
					//	weighbridgescanned = "true";
					sap.ui.core.BusyIndicator.hide();
					// if(oData.results[0].GateReturnNav.results[0].Message)
					if (oData.results[0].GateReturnNav.results.length == 0) {
						// if ((oData.results[0].Config4 == "R01") && (oData.results[0].Config3 == "X")) {
						//If Direct Gate Exit Flag - IVC Rubber
						var vFlag = oData.results[0].Flag;
						if (vFlag == "R") {
							that.getView().byId("id_ReasonLabel").setVisible(true);
							that.getView().byId("id_ReasonChange").setVisible(true);
						} else {
							that.getView().byId("id_ReasonLabel").setVisible(false);
							that.getView().byId("id_ReasonChange").setVisible(false);
						}
						var oScanDataModel = new sap.ui.model.json.JSONModel();
						oScanDataModel.setData(oData.results[0]);
						that.getView().setModel(oScanDataModel, "scannerData");
						that.getView().byId("id_truck").setValue(oData.results[0].Vehno);
						//	that.getView().byId("process").setSelectedKey(oData.results[0].Config6);
						weighbridgeid = oData.results[0].Wbid;
						that.getView().getModel("scannerData").refresh();
						//Added by Avinash for Breakdown Scenario...
						vGDname = that.getView().getModel("scannerData").getData().Dname;
						vGTruck = that.getView().getModel("scannerData").getData().Truck;
						//End of Added...
						if (oData.results[0].NavGateEntry.results.length != 0) {
							//Added by Avinash for Duplicate Delivery Restriction...
							var oMultiInput2 = that.getView().byId("id_delivery");

							var aTokens2 = oMultiInput2.getTokens();
							var vExists = false;
							if (aTokens2) {
								for (var i = 0; i < aTokens2.length; i++) {
									if (aTokens2[i].getKey() == oData.results[0].NavGateEntry.results[0].Vbeln) {
										vExists = true;
										break;
									}
								}
							}
							if (!vExists) {
								var oMultiInput1 = that.getView().byId("id_delivery");
								var aTokens = oMultiInput1.getTokens();
								var aArray = [];
								var uniqueVbeln = [new Set(oData.results[0].NavGateEntry.results.map(function(obj) {
									return obj.Vbeln;
								}))];
								var data = uniqueVbeln[0].values();
								for (var i = 0; i < uniqueVbeln[0].size; i++) {
									var Object = {
										"Vbeln": data.next().value
									};
									aArray.push(Object);
								}
								for (var i = 0; i < aArray.length; i++) {
									var vTokenv = new sap.m.Token({
										text: aArray[i].Vbeln,
										key: aArray[i].Vbeln
									});
									aTokens.push(vTokenv);
								}
								oMultiInput1.removeAllTokens();
								oMultiInput1.setTokens(aTokens);
								oMultiInput1.addValidator(function(args) {
									var text = args.text;
									return new new sap.m.Token({
										key: text,
										text: text
									});
								});
							} else {
								var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("DeliveryAlreadyScaned");
								sap.m.MessageToast.show(Errordeliverytext);
							}
						}
					} else {
						MessageBox.error(oData.results[0].GateReturnNav.results[0].Message);
					}
					//	that.onSwitchChange1();
				},
				error: function() {
					sap.m.MessageToast("ReferenceError");
				}

			});
		},

		fnexpandok: function(vbeln) {
			var that = this;
			var vFlag = "O"; //Flag for Gate Exit For Reference id Scanning Validation by Avinash....
			// var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
			// var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] + "'and Werks eq '" + vPlant +
			// 	"' and Flag eq '" + vFlag + "' &$expand=NavGateEntry,GateReturnNav";
			//	var vbeln = that.getView().getModel("scannerData").getProperty('/vbeln');
			//	var vbeln = this.getView().byId("id_delivery").getValue();
			var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
			var oPath = "GateEntrySet?$filter=Config1 eq '" + vbeln + "'and Werks eq '" + vPlant +
				"' and Flag eq '" + vFlag + "'&$expand=NavGateEntry,GateReturnNav";
			// var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1 + "'and Werks eq '" + vPlant +
			// "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
			var oGetModel = this.getView().getModel('odata');
			oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
				if (oData.results[0].GateReturnNav.results.length == 0) {
					var oDataR = oData.results[0];
					var val1 = oDataR.NavGateEntry;
					//IF Direct gate exit - IVC Rubber
					var vFlag = oData.results[0].Flag;
					if (vFlag == "R") {
						that.getView().byId("id_ReasonLabel").setVisible(true);
						that.getView().byId("id_ReasonChange").setVisible(true);
					} else {
						that.getView().byId("id_ReasonLabel").setVisible(false);
						that.getView().byId("id_ReasonChange").setVisible(false);
					}

					var GateEntryText = that.getView().getModel("i18n").getResourceBundle().getText("GateEntryText");
					var GateEntryText1 = that.getView().getModel("i18n").getResourceBundle().getText("GateEntryText1");
					if (oData.results[0].Config1 === 'Y') {
						MessageBox.error(GateEntryText + vbeln, {
							actions: [MessageBox.Action.CLOSE],
							onClose: function(oAction) {
								//that.getBusyDialog.close();
								if (oAction === "CLOSE") {
									that.getOwnerComponent().getRouter().navTo("Dashboard");
								}
							}
						});
					} else if (oData.results[0].Config1 === 'X') {
						MessageBox.error(GateEntryText1 + " " + vbeln, {
							actions: [MessageBox.Action.CLOSE],
							onClose: function(oAction) {
								//that.getBusyDialog.close();
								if (oAction === "CLOSE") {
									that.getOwnerComponent().getRouter().navTo("Dashboard");
								}
							}
						});
					} else {
						var oMultiInput2 = that.getView().byId("id_delivery");

						var aTokens2 = oMultiInput2.getTokens();
						var vExists = false;
						if (aTokens2) {
							for (var i = 0; i < aTokens2.length; i++) {
								if (aTokens2[i].getKey() == vbeln) {
									vExists = true;
									break;
								}
							}
						}
						if (vExists == false) {
							//	var oDataR = oData.results[0];
							//var val1 = oDataR.DelEsOutNav;
							var oJSONModel = new sap.ui.model.json.JSONModel();

							var oSet;
							if (val1.results[0].Dname === "") {
								that.getView().byId("id_driver").setEnabled(true);
							} else {
								that.getView().byId("id_driver").setEnabled(false);
							}
							if (val1.results[0].Truck === "") {
								that.getView().byId("id_truck").setEnabled(true);
							} else {
								// if()
								if (vGPortKey == "X") { //For IVC Rubber
									that.getView().byId("id_truck").setEnabled(true);
									that.getView().byId("id_driver").setEnabled(true);
								} else {
									that.getView().byId("id_truck").setEnabled(false);
								}
							}
							oSet = {
								"Vbeln": vbeln,
								"Werks": val1.results[0].Werks,
								"Truck": oData.results[0].Vehno,
								"Dname": oData.results[0].Dname,
								"DriverId": oData.results[0].DriverId,
								"Gate": oData.results[0].Gate,
								"Nf_Number": oData.results[0].Nf_Number,
								"Ee_Number": oData.results[0].Ee_Number,
								"So_Number": oData.results[0].So_Number,
								"Remark": oData.results[0].Remark,
								"Wbid": oData.results[0].Wbid,
								"Pname": oData.results[0].Pname,
								"Gname": oData.results[0].Gname
							};
							//code added on 24.09.2020 for brazil plant to set Multi Input
							if (oData.results[0].Del_Type === "STO") {
								var oMultiInputEasy = that.getView().byId("id_EasyNumwith1");
								var bTokens = oMultiInputEasy.getTokens();
								var oMultiInputSale = that.getView().byId("id_SaleNumwith1");
								var cTokens = oMultiInputSale.getTokens();
								var oMultiInput1Nota = that.getView().byId("id_notawith1");
								var dTokens = oMultiInput1Nota.getTokens();
								var oMultiInput1CmsTo = that.getView().byId("id_cmsToValue");
								var cmTokens = oMultiInput1CmsTo.getTokens();
							} else {
								var oMultiInputEasy = that.getView().byId("id_EasyNumwith1");
								var bTokens = oMultiInputEasy.getTokens();
								var oMultiInputSale = that.getView().byId("id_SaleNumwith1");
								var cTokens = oMultiInputSale.getTokens();
								var oMultiInput1Nota = that.getView().byId("id_notawith1");
								var dTokens = oMultiInput1Nota.getTokens();
							}

							if (oData.results[0].Del_Type === "STO") {
								var cmTokenv = new sap.m.Token({
									text: oData.results[0].Cms_Tonumber,
									key: oData.results[0].Cms_Tonumber
								});
								cmTokens.push(cmTokenv);

								oMultiInput1CmsTo.removeAllTokens();
								oMultiInput1CmsTo.setTokens(cmTokens);
								oMultiInput1CmsTo.addValidator(function(args) {
									var text = args.text;

									return new new sap.m.Token({
										key: text,
										text: text
									});
								});
							}
							//code ended on 24.09.2020 for brazil plant to set Multi Input
							var oMultiInput1 = that.getView().byId("id_delivery");
							var aTokens = oMultiInput1.getTokens();

							//code added on 24.09.2020 for brazil plant to set Multi Input
							var eTokenv = new sap.m.Token({
								text: oData.results[0].Ee_Number,
								key: oData.results[0].Ee_Number
							});
							bTokens.push(eTokenv);
							var sTokenv = new sap.m.Token({
								text: oData.results[0].So_Number,
								key: oData.results[0].So_Number
							});
							cTokens.push(sTokenv);
							var nTokenv = new sap.m.Token({
								text: oData.results[0].Nf_Number,
								key: oData.results[0].Nf_Number
							});
							dTokens.push(nTokenv);
							//code ended on 24.09.2020 for brazil plant to set Multi Input

							var vTokenv = new sap.m.Token({
								text: vbeln,
								key: vbeln
							});
							aTokens.push(vTokenv);

							//code added on 24.09.2020 for brazil plant to set Multi Input
							oMultiInputEasy.removeAllTokens();
							oMultiInputEasy.setTokens(bTokens);
							oMultiInputEasy.addValidator(function(args) {
								var text = args.text;

								return new new sap.m.Token({
									key: text,
									text: text
								});
							});

							oMultiInputSale.removeAllTokens();
							oMultiInputSale.setTokens(cTokens);
							oMultiInputSale.addValidator(function(args) {
								var text = args.text;

								return new new sap.m.Token({
									key: text,
									text: text
								});
							});

							oMultiInput1Nota.removeAllTokens();
							oMultiInput1Nota.setTokens(dTokens);
							oMultiInput1Nota.addValidator(function(args) {
								var text = args.text;

								return new new sap.m.Token({
									key: text,
									text: text
								});
							});
							//code ended on 24.09.2020 for brazil plant to set Multi Input

							oMultiInput1.removeAllTokens();
							oMultiInput1.setTokens(aTokens);
							oMultiInput1.addValidator(function(args) {
								var text = args.text;

								return new new sap.m.Token({
									key: text,
									text: text
								});
							});
							var oScanDataModel = new sap.ui.model.json.JSONModel();
							oScanDataModel.setData(oSet);
							that.getView().setModel(oScanDataModel, "scannerData");
							that.getView().getModel("scannerData").refresh();
							//Added by Avinash for Breakdown Scenario...
							vGDname = that.getView().getModel("scannerData").getData().Dname;
							vGTruck = that.getView().getModel("scannerData").getData().Truck;
							//End of Added...
						}
					}
				} else {
					MessageBox.error(oData.results[0].GateReturnNav.results[0].Message);
				}
			});
		},

		//===============================================================
		//--------Reprint Function(Added by Avinash)--------------------
		//===============================================================

		onClickReprint: function() {
			var oThat = this;
			oThat.Reprint = sap.ui.xmlfragment("LoadingConfirmation.fragment.RePrint", oThat);
			oThat.oView.addDependent(oThat.Reprint);
			oThat.Reprint.open();
			sap.ui.getCore().byId('rbg3').setVisible(false);
			oThat.ReprintWB = true;
			// sap.ui.getCore().byId('id_ReprintGate').setVisible(false);
		},
		onClickReprintDecline: function() {
			var oThat = this;
			oThat.ReprintWB = false;
			this.Reprint.destroy();
		},
		fnClickonReprintOK: function() {
			var oThat = this;
			var vErr = false;
			var vErrMsg = "";
			if (sap.ui.getCore().byId('rbg3').getVisible()) {
				if (sap.ui.getCore().byId('id_Rb1').getSelected()) {
					if (sap.ui.getCore().byId("id_ReprintPlant").getValue() === "" ||
						sap.ui.getCore().byId("id_ReprintGate").getValue() === "" ||
						sap.ui.getCore().byId("weighbridge").getValue() === "") {
						vErr = true;
						vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("PlantGateDetails") + "\n";
					}
				} else if (sap.ui.getCore().byId("id_ReprintPlant").getValue() === "" ||
					sap.ui.getCore().byId("weighbridge").getValue() === "") {
					vErr = true;
					vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("PlantGateDetails2") + "\n";
				}
			} else {
				if (sap.ui.getCore().byId("id_ReprintPlant").getValue() === "" ||
					sap.ui.getCore().byId("id_ReprintGate").getValue() === "" ||
					sap.ui.getCore().byId("weighbridge").getValue() === "") {
					vErr = true;
					vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("PlantGateDetails") + "\n";
				}
			}
			if (!vErr) {
				var vWbid = sap.ui.getCore().byId("weighbridge").getValue();
				var oPostModel = this.getView().getModel('odata');
				var sServiceUrl = oPostModel.sServiceUrl;
				var sRead = "/ReprintSet(IvWbid='" + vWbid + "')/$value";
				var pdfURL = sServiceUrl + sRead;
				oThat.ReprintWB = false;
				if (sap.ui.Device.system.desktop) {
					oThat.initiatePdfDialog();
					var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
					oThat.oImageDialog.getContent()[0].setContent(oContent);
					oThat.oImageDialog.addStyleClass("sapUiSizeCompact");
					oThat.oImageDialog.open();
					this.Reprint.destroy();
				} else {
					window.open(pdfURL);
					this.Reprint.destroy();
				}
			} else {
				MessageBox.error(vErrMsg);
			}
		},

		initiatePdfDialog: function() {
			var that = this;
			that.oImageDialog = new sap.m.Dialog({
				title: 'PDF',
				contentWidth: "100%",
				contentHeight: "",
				content: new sap.ui.core.HTML({}),
				beginButton: new sap.m.Button({
					text: 'Close',
					class: "sapUiSizeCompact",
					press: function() {
						that.oImageDialog.close();
						//that.getView().byId("id_selectedvtn").setSelectedKey("with");
						// that.fnClear();
					}
				})
			});
		},

		//===============================================================
		//-------------------Print Plant F4 Search Function--------------------
		//===============================================================
		onClickPlantF4: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			if (!this.Printfragmentplant) {
				this.Printfragmentplant = sap.ui.xmlfragment("LoadingConfirmation.fragment.Plant", this);
				this.getView().addDependent(this.Printfragmentplant);
			}
			this.Printfragmentplant.open();
			this.fnEntityPlant();
		},

		//===============================================================
		//-------------------Plant F4 Entityset Function----------------------
		//===============================================================
		fnEntityPlant: function() {
			var oPath = "/F4Set";
			var that = this;
			var oGetModel = that.getView().getModel('odata');
			oGetModel.read(oPath, {
				filters: [
					new Filter("Werks", FilterOperator.EQ, "X")
				],
				urlParameters: {
					$expand: "F4WerksNav"
				},
				success: function(oData, Response) {
					var oDataR = oData.results[0].F4WerksNav.results;
					var oScanDataModel = new sap.ui.model.json.JSONModel();
					oScanDataModel.setData(oDataR);
					that.getView().setModel(oScanDataModel, "JMData");
					that.getView().getModel("JMData").refresh();
				},
				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
				}
			});

		},

		//===============================================================
		//-------------------Plant F4 filter Function--------------------
		//===============================================================
		onsearch: function(oEvent) {
			var vValue = oEvent.getParameter("value");
			var filter1 = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, vValue);
			var filter2 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);

		},

		fnconfirm: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			sap.ui.getCore().byId("id_ReprintPlant").setValue(oItem.getTitle());
			oEvent.getSource().getBinding("items").filter([]);
		},

		//=================GATENo==========================================
		onClickGatenoF4: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var plant = sap.ui.getCore().byId("id_ReprintPlant").getValue();
			if (!this.Reprintofragmentgate) {
				this.Reprintofragmentgate = sap.ui.xmlfragment("LoadingConfirmation.fragment.Gate", this);
				this.getView().addDependent(this.Reprintofragmentgate);
			}
			this.Reprintofragmentgate.open();

			this.fnreEntityGate(plant);
		},

		fnreEntityGate: function(plant) {
			var oPath = "/F4Set";
			var that = this;
			var oGetModel = that.getView().getModel('odata');
			oGetModel.read(oPath, {
				filters: [
					new Filter("IvGate", FilterOperator.EQ, "X"),
					new Filter("IvWerks", FilterOperator.EQ, plant)
				],
				urlParameters: {
					$expand: "F4GateNav"
				},
				success: function(oData, Response) {
					var oDataR = oData.results[0].F4GateNav.results;
					var RPGateModel = new sap.ui.model.json.JSONModel();
					RPGateModel.setData(oDataR);
					that.getView().setModel(RPGateModel, "GateData");
					that.getView().getModel("GateData").refresh();
					//  that.oGl.setBusy(false);
				},
				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));

				}
			});

		},

		ongatesearch: function(oEvent) {
			var vValue = oEvent.getParameter("value");
			var filter1 = new sap.ui.model.Filter("Gate", sap.ui.model.FilterOperator.Contains, vValue);
			var filter2 = new sap.ui.model.Filter("Wbname", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);

		},

		fngateconfirm: function(oEvent) {
			var oThat = this;
			var oItem = oEvent.getParameter("selectedItem");
			sap.ui.getCore().byId("id_ReprintGate").setValue(oItem.getTitle());
			oEvent.getSource().getBinding("items").filter([]);
		}

	});
});