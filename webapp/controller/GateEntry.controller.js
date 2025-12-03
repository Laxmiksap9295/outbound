jQuery.sap.require("sap.ndc.BarcodeScanner");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	"sap/m/UploadCollectionParameter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/m/BusyDialog"
], function(Controller, MessageBox, UploadCollectionParameter, FilterOperator, Filter, JSONModel, BusyDialog) {
	"use strict";
	var truckarray = [];
	var vclickscandelno = [];
	var vclickscandelno1 = [];
	var weighbridgescanned;
	var vlength;
	var array = [];
	var weighbridgeid, Announcement, Reporting, ReportingWithDeliv, GvPrint, GvTransporterM;
	var vGDname, vGLifnr, vGChallan, vGDriverMob, vGTruck, vGReason, vGRemarks, vGCnnum; //Added by Avinash
	var parametercheck;
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn; //Added by Avinash
	var arrSelItem = []; //Added by  Pavan on 25/03/2023
	return Controller.extend("LoadingConfirmation.controller.GateEntry", {
		//===============================================================
		//-------------------On Init Function----------------------------
		//===============================================================
		onInit: function() {
			var oThat = this;
			oThat.getView().setModel(new sap.ui.model.json.JSONModel([]), "MatDocList"); //Added by Pavan on 18/04/2023
			oThat.getView().setModel(new sap.ui.model.json.JSONModel([]), "oMDItemModel"); //Added by Pavan on 18/04/2023
			oThat.BusyDialog = new BusyDialog();
			oThat.oView.setModel(new JSONModel(), "oViewModel");
			oThat.getView().getModel("oViewModel").refresh();
			this.getOwnerComponent().getRouter().getRoute("GateEntry").attachPatternMatched(this._onObjectMatched, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			var oGetModel = this.getView().getModel('odata');
			var that = this;
			//	that.getView().getModel("oViewModel").setProperty("/CMSProperty", false);
			that.getView().getModel("oViewModel").setProperty("/CmstoProperty", false);
			that.getView().getModel("oViewModel").setProperty("/EasyProperty", false);
			that.getView().getModel("oViewModel").setProperty("/SalesProperty", false);
			that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
			that.getView().getModel("oViewModel").setProperty("/DriverIdProperty", false);
			document.addEventListener("backbutton", jQuery.proxy(this.onBackKeyDown, this), false);
			var result = this.GetClock();
			that.getView().byId("id_gatetime").setValue(result);
			that.getView().byId("id_gatetimewith").setValue(result);
			that.getView().byId("id_ReportingTime1").setValue(result);
			var localModel = this.getOwnerComponent().getModel("localModel");
			this.getView().setModel(localModel);
			vGReason = ""; //Added by Avinash..
			setInterval(function() {
				var result = that.GetClock();
				that.getView().byId("id_gatetime").setValue(result);
				that.getView().byId("id_gatetimewith").setValue(result);
				that.getView().byId("id_ReportingTime1").setValue(result);
			}, 1000);
		},

		fnParameterCheck: function() {
			var oPath = "/F4Set";
			var that = this;
			var oGetModel = that.getView().getModel('odata');
			var plant = this.getOwnerComponent().getModel("localModel").getProperty("/plant");
			that.BusyDialog.open();
			oGetModel.read(oPath, {
				filters: [
					new Filter("FieldIp", FilterOperator.EQ, "X"),
					new Filter("IvWerks", FilterOperator.EQ, plant)
				],
				urlParameters: {
					$expand: "F4FieldsNav,F4ReturnNav,F4MfieldNav,Fields_DispNav" //Navigation Added by Avinash
				},
				success: function(oData, Response) {
					//	parametercheck = oData.results[0].F4FieldsNav;
					that.BusyDialog.close();
					var show;
					var EnableCtrl = new sap.ui.model.json.JSONModel();
					EnableCtrl.setData(oData.results[0].F4FieldsNav.results);
					that.getView().setModel(EnableCtrl, "oBatchEnable");
					that.getView().getModel("oBatchEnable").refresh(true);
					var MandatoryCtrl = new sap.ui.model.json.JSONModel();
					MandatoryCtrl.setData(oData.results[0].F4MfieldNav.results);
					that.getView().setModel(MandatoryCtrl, "MandatoryEnable");
					that.getView().getModel("oBatchEnable").refresh(true);
					
				/*	if(oData.results[0].F4FieldsNav.results[0].Origin === "B"){
						that.getView().byId("id_DelLabel").setText(that.getView().getModel("i18n").getResourceBundle().getText("salesorder"));	
					}else{
							that.getView().byId("id_DelLabel").setText(that.getView().getModel("i18n").getResourceBundle().getText("DeliveryNo"));	
					}*/

					// Added by Avinash for Port Operation
					// if (that.getView().getModel('oBatchEnable').getData()[0].DriverMob == "") {
					// 	that.getView().byId("id_VboxDriver").setWidth("100%");
					// } else {
					// 	that.getView().byId("id_VboxDriver").setWidth("50%");
					// }
					// if (that.getView().getModel('oBatchEnable').getData()[0].Trtyp == "") {
					// 	that.getView().byId("id_VboxTrans").setWidth("100%");
					// } else {
					// 	that.getView().byId("id_VboxTrans").setWidth("50%");
					// }
					// if (that.getView().getModel('oBatchEnable').getData()[0].Vehtyp == "") {
					// 	that.getView().byId("id_VboxTruckNo").setWidth("100%");
					// } else {
					// 	that.getView().byId("id_VboxTruckNo").setWidth("50%");
					// }

					if (that.getView().getModel('oBatchEnable').getData()[0].Port_Op == "X") {
						that.getView().byId("id_driver").setEnabled(true);
						that.getView().byId("id_DriverMobile").setEnabled(true);
						that.getView().byId("id_truck").setEnabled(true);
						that.getView().byId("id_TransType").setEnabled(true); //Challan
						that.getView().byId("id_Cnnum").setEnabled(true); //Container
					}
					// End of added
					//that.getView().getModel("oBatchEnable").refresh();
					//code added by kirubakaran on 22.07.2020//

					if (oData.results[0].F4FieldsNav.results[0].Nf_Number === "X") {
						that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
						// that.getView().byId("referenceNoId").setVisible(false); //Commented by Avinash
						that.getView().byId("weighprocess").setVisible(false); //Added by Avinash
						that.getView().byId("id_WeighbridgeProcess").setVisible(false); // Added by Avinash
					} else {
						that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
						//	that.getView().byId("referenceNoId").setVisible(true);
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
					if (oData.results[0].F4FieldsNav.results[0].Driver_Id === "X") {
						that.getView().getModel("oViewModel").setProperty("/DriverIdProperty", true);
					} else {
						that.getView().getModel("oViewModel").setProperty("/DriverIdProperty", false);
					}
					if (oData.results[0].F4FieldsNav.results[0].Cms_Tonumber === "X") {
						that.getView().getModel("oViewModel").setProperty("/CmstoProperty", true);
					} else {
						that.getView().getModel("oViewModel").setProperty("/CmstoProperty", false);
					}
					var Batch = oData.results[0].F4FieldsNav.results.find(function(x) {
						if (x.Wbid == "X") {
							if (x.Nf_Number === "X") {
								parametercheck = "X";
							} else {
								parametercheck = "";
							}
						}
						if (x.Wbid !== "X") {
							parametercheck = "X";
						}
					});
					//code ended by kirubakaran on 22.07.2020//
					var Batch1 = oData.results[0].F4FieldsNav.results.find(function(x) {
						if (x.Announcement == "") {
							Announcement = "";
						}
						if (x.Announcement == "X") {
							Announcement = "X";
						}
					});

					var Batch2 = oData.results[0].F4FieldsNav.results.find(function(x) {
						if (x.Reporting == "X") {
							Reporting = "X";
						}
						if (x.Reporting == "") {
							Reporting = "";
						}
					});

					var Batch3 = oData.results[0].F4FieldsNav.results.find(function(x) {
						if (x.Delreport == "X") {
							ReportingWithDeliv = "X";
						}
						if (x.Delreport == "") {
							ReportingWithDeliv = "";
						}
					});

					var Batch4 = oData.results[0].F4FieldsNav.results.find(function(x) {
						if (x.Print == "X") {
							GvPrint = "X";
						}
						if (x.Print == "") {
							GvPrint = "";
						}
					});
					var Batch5 = oData.results[0].F4MfieldNav.results.find(function(x) {
						if (x.Lifnr == "X") {
							GvTransporterM = "X";
						}
						if (x.Lifnr == "") {
							GvTransporterM = "";
						}
					});
					if (that.getView().getModel("oBatchEnable").getData()[0].Werks == "X") {
						var localModel = that.getOwnerComponent().getModel("localModel");
						that.getView().byId("plantvalue").setValue(localModel.getData().plant + " - " + localModel.getData().plantDesc); //Changed by Avinash
						// that.getView().byId("plantvalueDesc").setText(localModel.getData().plantDesc); //Commented by Avinash

					}
					that.fnEntityProcessType();
				},

				error: function(oResponse) {
					that.BusyDialog.close();
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
				}
			});

		},

		onBackKeyDown: function(oEvent) {
			var that = this;
			var DoyouExit = that.getView().getModel("i18n").getResourceBundle().getText("DoyouExit");

			MessageBox.confirm(
				DoyouExit, {
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
		//-------------------Added by Avinash for Display Properties----------------------
		//===============================================================
		_onRouteMatched: function() {
			var that = this;
			// oi18n = this.getView().getModel("i18n");
			that.oDisplayIN = {

				"WBID": false,
				"WBID_REQ": false,
				"WBID_DISP": false,
				"WBID_NAME": "",
				"WBID_HELP": false,

				"PROCESS": false,
				"PROCESS_REQ": false,
				"PROCESS_DISP": false,
				"PROCESS_NAME": "",
				"PROCESS_HELP": false,

				"REMARK": false,
				"REMARK_REQ": false,
				"PREMARK_DISP": false,
				"REMARK_NAME": "",
				"REMARK_HELP": false,

				"SC_NO": false,
				"SC_NO_REQ": false,
				"SC_NO_DISP": false,
				"SC_NO_NAME": "",
				"SC_NO_HELP": false,

				"SIGNATURE": false,
				"SIGNATURE_REQ": false,
				"SIGNATURE_DISP": false,
				"SIGNATURE_NAME": "",
				"SIGNATURE_HELP": false,

				"TRTYP": false,
				"TRTYP_REQ": false,
				"TRTYP_DISP": false,
				"TRTYP_NAME": "",
				"TRTYP_HELP": false,

				"VEHTYP": false,
				"VEHTYP_REQ": false,
				"VEHTYP_DISP": false,
				"VEHTYP_NAME": "",
				"VEHTYP_HELP": false,

				"TRUCKNO": false,
				"TRUCKNO_REQ": false,
				"TRUCKNO_DISP": false,
				"TRUCKNO_NAME": "",
				"TRUCKNO_HELP": false,

				"DNAME": false,
				"DNAME_REQ": false,
				"DNAME_DISP": false,
				"DNAME_NAME": "",
				"DNAME_HELP": false,

				"PRINT": false,
				"PRINT_REQ": false,
				"PRINT_DISP": false,
				"PRINT_NAME": "",
				"PRINT_HELP": false,

				"VBELN": false,
				"VBELN_REQ": false,
				"VBELN_DISP": false,
				"VBELN_NAME": "",
				"VBELN_HELP": false,

				"REPORTING": false, //2901
				"REPORTING_REQ": false,
				"REPORTING_DISP": false,
				"REPORTING_NAME": "",
				"REPORTING_HELP": false,

				"EE_NUMBER": false, //2013
				"EE_NUMBER_REQ": false,
				"EE_NUMBER_DISP": false,
				"EE_NUMBER_NAME": "",
				"EE_NUMBER_HELP": false,

				"CMS_TONUMBER": false, //2013
				"CMS_TONUMBER_REQ": false,
				"CMS_TONUMBER_DISP": false,
				"CMS_TONUMBER_NAME": "",
				"CMS_TONUMBER_HELP": false,

				"CHARG": false, //2013
				"CHARG_REQ": false,
				"CHARG_DISP": false,
				"CHARG_NAME": "",
				"CHARG_HELP": false,

				"AUTO_PGI": false, //2013
				"AUTO_PGI_REQ": false,
				"AUTO_PGI_DISP": false,
				"AUTO_PGI_NAME": "",
				"AUTO_PGI_HELP": false,

				"IMAGE": false,
				"IMAGE_REQ": false,
				"IMAGE_DISP": false,
				"IMAGE_NAME": "",
				"IMAGE_HELP": false,

				"GTIME": false,
				"GTIME_REQ": false,
				"GTIME_DISP": false,
				"GTIME_NAME": "",
				"GTIME_HELP": false,

				"GDATE": false,
				"GDATE_REQ": false,
				"GDATE_DISP": false,
				"GDATE_NAME": "",
				"GDATE_HELP": false,

				"DRIVER_MOB": false,
				"DRIVER_MOB_REQ": false,
				"DRIVER_MOB_DISP": false,
				"DRIVER_MOB_NAME": "",
				"DRIVER_MOB_HELP": false,

				"GATE": false,
				"GATE_REQ": false,
				"GATE_DISP": false,
				"GATE_NAME": "",
				"GATE_HELP": false,

				"LIFNR": false,
				"LIFNR_REQ": false,
				"LIFNR_DISP": false,
				"LIFNR_NAME": "",
				"LIFNR_HELP": false,

				"NF_NUMBER": false,
				"NF_NUMBER_REQ": false,
				"NF_NUMBER_DISP": false,
				"NF_NUMBER_NAME": "",
				"NF_NUMBER_HELP": false,

				"OTNUM": false,
				"OTNUM_REQ": false,
				"OTNUM_DISP": false,
				"OTNUM_NAME": "",
				"OTNUM_HELP": false,

				"PORT_OP": false,
				"PORT_OP_REQ": false,
				"PORT_OP_DISP": false,
				"PORT_OP_NAME": "",
				"PORT_OP_HELP": false,

				"SO_NUMBER": false,
				"SO_NUMBER_REQ": false,
				"SO_NUMBER_DISP": false,
				"SO_NUMBER_NAME": "",
				"SO_NUMBER_HELP": false,

				"WERKS": false,
				"WERKS_REQ": false,
				"WERKS_DISP": false,
				"WERKS_NAME": "",
				"WERKS_HELP": false
			};
			this.getView().setModel(new JSONModel(this.oDisplayIN), "DisplayIN");
			var plant = this.getOwnerComponent().getModel("localModel").getProperty("/plant");
			if (plant) {
				this.BusyDialog.open();
				var oGetModel = that.getView().getModel('odata');
				oGetModel.read("/FieldsInSet", {
					filters: [new sap.ui.model.Filter("ImWerks", sap.ui.model.FilterOperator.EQ, plant)],
					urlParameters: {
						$expand: "Fields_DispNav,DelReturnNav"
					},
					async: true,
					success: function(oData, Iresponse) {
						var i, vTemp;
						if (oData.results[0].DelReturnNav.results.length > 0) {
							MessageBox.error(oData.results[0].DelReturnNav.resultss[0].Message);
						} else {

							if (that.getView().byId("id_segmentbtn").getSelectedKey() === "IN") {
								for (i = 0; i < oData.results[0].Fields_DispNav.results.length; i++) {
									vTemp = oData.results[0].Fields_DispNav.results[i].Fld;
									that.oDisplayIN[vTemp] = true;
									if (oData.results[0].Fields_DispNav.results[i].Req === "X") {
										that.oDisplayIN[vTemp + "_REQ"] = true;
									} else {
										that.oDisplayIN[vTemp + "_REQ"] = false;
									}
									if (oData.results[0].Fields_DispNav.results[i].Disp === "X") {
										that.oDisplayIN[vTemp + "_DISP"] = false;
									} else {
										that.oDisplayIN[vTemp + "_DISP"] = true;
									}
									if (oData.results[0].Fields_DispNav.results[i].HelpType !== "") {
										that.oDisplayIN[vTemp + "_HELP"] = true;
									} else {
										that.oDisplayIN[vTemp + "_HELP"] = false;
									}
									if (oData.results[0].Fields_DispNav.results[i].Cname !== "") {
										that.oDisplayIN[vTemp + "_NAME"] = oData.results[0].FieldsOutNav.results[i].Cname;
									} else {
										that.oDisplayIN[vTemp + "_NAME"] = oData.results[0].FieldsOutNav.results[i].Fname;
									}
								}
								that.getView().getModel("DisplayIN").refresh();
							}
						}
						that.BusyDialog.close();
					},
					error: function(Ierror) {
						that.BusyDialog.close();
					}
				});
			}
		},

		//===============================================================
		//-------------------Load required Data----------------------
		//===============================================================
		_onObjectMatched: function() {
			this.getView().getModel("oViewModel").refresh();
			this.fnParameterCheck();
			// this._onRouteMatched(); //Added by Avinash
			var oSetting = {
				"SwitchFlag": true
			};
			var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			// this.getView().byId('id_logo').setSrc(vPathImage + "/Images/login-logo@2x.png");
			this.getView().byId("id_camerareport").setIcon(vPathImage + "/Images/camera.png");
			this.getView().byId("id_brcdscan").setIcon(vPathImage + "/Images/barcode.png");
			this.getView().byId("id_camera").setIcon(vPathImage + "/Images/camera.png");
			this.getView().byId("id_camera1").setIcon(vPathImage + "/Images/camera.png");
			this.getView().byId('id_homenew').setSrc(vPathImage + "/Images/home.png");
			this.getView().byId('id_AddImg').setSrc(vPathImage + "/Images/Add.png");
			this.getView().byId('id_RemoveImg').setSrc(vPathImage + "/Images/Delete.png");
			/*this.getView().byId('id_AddImage').setSrc(vPathImage + "/Images/Add.png");
			this.getView().byId('id_RemoveImage').setSrc(vPathImage + "/Images/Delete.png");*/
			this.getView().byId('id_scanid').setState(true);
			this.getView().byId('id_PortOprid').setState(true); //Added by Avinash
			this.getView().byId("Save").setVisible(false);

			var vTemp = [{
				"Vbeln": ""
			}];

			var oManualDel = new sap.ui.model.json.JSONModel();
			oManualDel.setData(vTemp);
			this.getView().setModel(oManualDel, "JMManualDel");

			//Added by Pavan on 21/04/2023 Start
			var vTemp1 = [{
				"Mblnr": ""
			}];
			var oManualDel1 = new sap.ui.model.json.JSONModel();
			oManualDel1.setData(vTemp1);
			this.getView().setModel(oManualDel1, "JMManualMatDoc");
			//Added by Pavan on 21/04/2023 End

			this.getView().setModel(new sap.ui.model.json.JSONModel(oSetting), "setting");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			//BOC by Avinash
			var vData = this.getView().getModel('scannerData').getData();
			var vPlant = this.getView().byId("plantvalue").getValue().split(" - ")[0];
			var vPlantDesc = this.getView().byId("plantvalue").getValue().split(" - ")[1];
			if (vPlant) {
				vData.Werks = vPlant;
				vData.Pname = vPlantDesc;
				this.getView().getModel('scannerData').refresh(true);
			}
			//EOC by Avinash
			this.getView().byId("id_ok").setVisible(false);
			this.getView().byId("id_gatedate").setDateValue(new Date());
			this.getView().byId("processty").setSelectedKey();
			this.getView().byId("id_segmentbtn").setSelectedKey("with");
			this.getView().byId("id_gatedatewith").setDateValue(new Date());
			//	this.fnParameterCheck();
			this.getView().byId("id_Wholebox").setVisible(false);
			this.fnSegmentedwith();
			this.fnEntityPlant();
			this.fnEntityTransportGate();
			this.fnEntityReportPlant();
			//	this.fnParameterCheck();
			this.aPath = [];
			this.oAttach = false;

			var vUpldClctn = sap.ui.getCore().byId("id_UploadCollection");
			if (vUpldClctn) {
				vUpldClctn.destroyItems(true);
				vUpldClctn.destroyParameters(true);
				vUpldClctn.removeAllItems(true);

			}
			//=============== added by chaithra =======================//
			this.Images = [];
			this.oView.setModel(new JSONModel(this.Images), "MASS");
			this.getView().byId("id_gateEntryPage").removeStyleClass("sapUiSizeCompact");
			this.fnEntitySalesProcessType();
		},
		//===============================================================
		//-------------------Time  Function----------------------
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
		//	====================transporter=============================
		onValueHelpPress: function(oEvent) {
			var oThat = this;
			oThat.vTransprtId = oEvent.getSource().getId();
			// oThat.vId = oEvent.getSource().getId();
			// var plant = oThat.getView().byId("plantvalue").getValue();
			var plant = oThat.getView().byId("plantvalue").getValue().split(" - ")[0]; //Added by Avinash
			if (!this.ofragmenttransgate) {
				this.ofragmenttransgate = sap.ui.xmlfragment("LoadingConfirmation.fragment.Transporter", this);
				this.getView().addDependent(this.ofragmenttransgate);
			}
			this.ofragmenttransgate.open();
			this.fnEntityTransportGate();
		},
		fnEntityTransportGate: function(plant) {
			var oPath = "/F4Set";
			var that = this;
			var oGettransModel = that.getView().getModel('odata');
			var localModel = this.getOwnerComponent().getModel("localModel");
			var vPlant = localModel.getData().plant;
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
					// if (oDataR.length === 1) {
					// 	that.getView().byId("id_Gateno").setValue(oDataR[0].Gate);
					// }
					var RPGateModel = new sap.ui.model.json.JSONModel();
					RPGateModel.setData(oDataR);
					that.getView().setModel(RPGateModel, "Vendor");
					that.getView().getModel("Vendor").refresh();

					//  that.oGl.setBusy(false);
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
			var oThat = this;
			var oItem = oEvent.getParameter("selectedItem");
			if (oThat.vTransprtId.indexOf("id_InTransport") != -1) {
				//Boc by Avinash //need to check...
				var vData = oThat.getView().getModel('scannerData').getData();
				vData.Lifnr = oItem.getTitle();
				vData.Tr_Name = oItem.getDescription();
				var vPlant = this.getView().byId("plantvalue").getValue().split(" - ")[0];
				var vPlantDesc = this.getView().byId("plantvalue").getValue().split(" - ")[1];
				if (vPlant) {
					vData.Werks = vPlant;
					vData.Pname = vPlantDesc;
				}
				oThat.getView().getModel('scannerData').refresh(true);
				// this.getView().byId("id_InTransport").setValue(oItem.getTitle());
				// this.getView().byId("id_InTransportDesc").setText(oItem.getDescription());
				//EOC by Avinash
			} else {
				this.getView().byId("id_ReporTransport").setValue(oItem.getTitle() + " - " + oItem.getDescription());
				// this.getView().byId("id_ReporTransportDesc").setText(oItem.getDescription()); //Commented by Avinash
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		//=================WeighBridgeData==========================================
		onweighbridgeF4: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var plant = sap.ui.getCore().byId("id_ReprintPlant").getValue();
			var gate = sap.ui.getCore().byId("id_ReprintGate").getValue();
			//BOC by Avinash for PORT Print Out..
			var vError = false;
			var vErrMsg = "";
			var vPortin = "";
			if (sap.ui.getCore().byId('id_ReprintGateLabel').getVisible() && sap.ui.getCore().byId('id_ReprintGate').getVisible()) {
				if (!gate) {
					vError = true;
					vErrMsg = vErrMsg + this.getView().getModel("i18n").getProperty("GateDetailsMan") + "\n";
				}
			} else {
				vPortin = "X";
				gate = "";
			}
			if (!plant) {
				vError = true;
				vErrMsg = vErrMsg + this.getView().getModel("i18n").getProperty("PlantDetailsMan") + "\n";
			}
			// if ((plant) && (gate)) {
			if (!vError) {
				if (!this.Weighfragment) {
					this.Weighfragment = sap.ui.xmlfragment("LoadingConfirmation.fragment.WeighBridge", this);
					this.getView().addDependent(this.Weighfragment);
				}
				this.Weighfragment.open();
				this.fnEntityWeighBridge(plant, gate, vPortin);
			} else {
				sap.m.MessageToast.show(vErrMsg);
			}

		},

		fnEntityWeighBridge: function(plant, gate, vPortIn) {
			var oPath = "/F4Set";
			var that = this;
			var oGetModel = that.getView().getModel('odata');
			var RPWeighBridgeModel = new sap.ui.model.json.JSONModel();
			RPWeighBridgeModel.setData([]);
			that.getView().setModel(RPWeighBridgeModel, "WeighbridgeData");
			oGetModel.read(oPath, {
				filters: [
					new Filter("Gate", FilterOperator.EQ, gate),
					new Filter("IvWerks", FilterOperator.EQ, plant),
					new Filter("IvPortin", FilterOperator.EQ, vPortIn),
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
			var filter1 = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
			var filter2 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
			var allfilter = new sap.ui.model.Filter([filter1, filter2]);
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(allfilter);

		},
		fnWeighbridgeconfirm: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			if (this.vId.indexOf("weighbridge") != -1) {
				sap.ui.getCore().byId("weighbridge").setValue(oItem.getTitle());
			}
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

		//===============================================================
		//-------------------change Function----------------------
		//===============================================================
		fnResetChange: function(oEvent) {
			if (oEvent.getSource().getSelectedIndex() == 0) {
				sap.ui.getCore().byId('id_ReprintGateLabel').setVisible(true);
				sap.ui.getCore().byId('id_ReprintGate').setVisible(true);
			} else {
				sap.ui.getCore().byId('id_ReprintGateLabel').setVisible(false);
				sap.ui.getCore().byId('id_ReprintGate').setVisible(false);
			}
		},

		fnhandleGate: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var plant = this.getView().byId("id_plantwith1").getValue().split(" - ")[0];
			if (!this.ofragmentgate) {
				this.ofragmentgate = sap.ui.xmlfragment("LoadingConfirmation.fragment.Gate", this);
				this.getView().addDependent(this.ofragmentgate);
			}
			this.ofragmentgate.open();
			if (this.vId.indexOf("id_GEgateno") != -1) {
				// var vPlant = this.getView().byId("plantvalue").getValue();
				var vPlant = this.getView().byId("plantvalue").getValue().split(" - ")[0]; //Added by Avinash
				this.fnEntityGate(vPlant);
			} else {
				this.fnEntityGate(plant);
			}

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
						that.getView().byId("id_Gateno").setValue(oDataR[0].Gate + " - " + oDataR[0].Wbname);
					}
					var RPGateModel = new sap.ui.model.json.JSONModel();
					RPGateModel.setData(oDataR);
					that.getView().setModel(RPGateModel, "GateData");
					that.getView().getModel("GateData").refresh();
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
			if (this.vId.indexOf("id_ReprintGate") != -1) {
				sap.ui.getCore().byId("id_ReprintGate").setValue(oItem.getTitle());
			} else if (this.vId.indexOf("id_Gateno") != -1) {
				this.getView().byId("id_Gateno").setValue(oItem.getTitle() + " - " + oItem.getDescription());
				// this.getView().byId("id_Gatenodesc").setText(oItem.getDescription());
			} else if (this.vId.indexOf("id_GEgateno") != -1) {
				//BOC by Avinash
				var vData = oThat.getView().getModel('scannerData').getData();
				vData.Gate = oItem.getTitle();
				vData.Gname = oItem.getDescription();
				var vPlant = this.getView().byId("plantvalue").getValue().split(" - ")[0];
				var vPlantDesc = this.getView().byId("plantvalue").getValue().split(" - ")[1];
				if (vPlant) {
					vData.Werks = vPlant;
					vData.Pname = vPlantDesc;
				}
				oThat.getView().getModel('scannerData').refresh(true);
				// this.getView().byId("id_GEgateno").setValue(oItem.getTitle() + " - " + oItem.getDescription());
				// this.getView().byId("id_GEgatenodesc").setText(oItem.getDescription());
				//EOC by Avinash
			}
			oEvent.getSource().getBinding("items").filter([]);
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
		//-------------------Plant F4 Search Function--------------------
		//===============================================================
		fnhandleplant: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			if (!this.ofragmentplant) {
				this.ofragmentplant = sap.ui.xmlfragment("LoadingConfirmation.fragment.Plant", this);
				this.getView().addDependent(this.ofragmentplant);
			}
			this.ofragmentplant.open();
			this.fnEntityPlant();
		},
		//===============================================================
		//-------------------Plant F4 Entityset Function----------------------
		//===============================================================
		fnEntityReportPlant: function() {
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
					var RPDataModel = new sap.ui.model.json.JSONModel();
					RPDataModel.setData(oDataR);
					that.getView().setModel(RPDataModel, "RPData");
					that.getView().getModel("RPData").refresh();
				},
				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
				}
			});

		},
		//===============================================================
		//-------------------Report Plant F4 Search Function--------------------
		//===============================================================
		fnReporthandleplant: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			if (!this.RPofragmentplant) {
				this.RPofragmentplant = sap.ui.xmlfragment("LoadingConfirmation.fragment.RPPlant", this);
				this.getView().addDependent(this.RPofragmentplant);
			}
			this.RPofragmentplant.open();
			this.fnEntityReportPlant();
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
		//===============================================================
		//-------------------Plant F4 confirm Function--------------------
		//===============================================================
		fnreportconfirm: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			this.getView().byId("id_plantwith1").setValue(oItem.getTitle() + " - " + oItem.getDescription());
			// this.getView().byId("id_plantwith1desc").setText(oItem.getDescription());
			oEvent.getSource().getBinding("items").filter([]);
			this.fnEntityGate(oItem.getTitle());
		},

		fnconfirm: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			if (this.vId.indexOf("id_ReprintPlant") != -1) {
				sap.ui.getCore().byId("id_ReprintPlant").setValue(oItem.getTitle());
				oEvent.getSource().getBinding("items").filter([]);
			} else {
				this.getView().byId("id_plantwithout").setValue(oItem.getTitle());
				this.getView().byId("id_plantwithoutDesc").setText(oItem.getDescription());
				oEvent.getSource().getBinding("items").filter([]);
			}
		},
		//===============================================================
		//-------------------Plant F4 select Function--------------------
		//===============================================================
		fnselect: function(oEvent) {
			var ovar = oEvent.getParameter("selectedItem");
			this.getView().byId("id_plantwithout").setValue(ovar.getText());

		},
		//===============================================================
		//-------------------Plant F4 cancel Function--------------------
		//===============================================================
		fncancel: function(oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
		},

		//===============================================================
		//-------------------Switch  Function--------------------
		//===============================================================
		onSwitchChange: function(oEvent) {
			this.state = this.getView().byId('id_scanid').getState();
			//	this.state = oEvent.getParameter("state");
			if (parametercheck == "") {
				parametercheck = "";
				this.getView().byId("manualweighLabel").setVisible(true);
				this.getView().byId("id_WeighbridgeProcessManual").setVisible(true);
			}
			if (parametercheck == "X") {
				parametercheck = "X";
				this.getView().byId("manualweighLabel").setVisible(false);
				this.getView().byId("id_WeighbridgeProcessManual").setVisible(false);
			}
			this.getView().getModel("setting").getData().SwitchFlag = this.state;
			this.getView().getModel("setting").refresh();
			if (this.state === false) {
				this.getView().byId("id_ok").setVisible(true);
				this.getView().byId("id_WeighbridgeProcessManual").setValue("");
				this.getView().byId("id_gateentry").setVisible(false);
				this.getView().byId("id_brcdscan").setVisible(false);
				//this.getView().byId("id_DeliveryManual").setVisible(true);
				if (this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N' && this.getView().byId("processty").getSelectedKey() ===
					"TRANSFER") {
					this.getView().byId("id_DeliveryManual").setVisible(false);
					this.getView().byId("id_MatDocManual").setVisible(true);
				} else {
					this.getView().byId("id_DeliveryManual").setVisible(true);
					this.getView().byId("id_MatDocManual").setVisible(false);
				}

				// this.getView().byId("id_deliverywithbox").setVisible(false); //Commented by Avinash
				this.getView().byId("id_DelLabel").setVisible(false); //Added by Avinash
				this.getView().byId("id_delivery").setVisible(false); //Added by Avinash
				this.getView().byId("Save").setVisible(false);
				this.getView().byId("id_scanProcess").setVisible(false);
				var vTemp = [{
					"Vbeln": ""
				}];

				var oManualDel = new sap.ui.model.json.JSONModel();
				oManualDel.setData(vTemp);
				this.getView().setModel(oManualDel, "JMManualDel");

				//Added by Pavan on 21/04/2023 Start
				var vTemp1 = [{
					"Mblnr": ""
				}];
				var oManualDel1 = new sap.ui.model.json.JSONModel();
				oManualDel1.setData(vTemp1);
				this.getView().setModel(oManualDel1, "JMManualMatDoc");
				//Added by Pavan on 21/04/2023 End

			} else {
				this.getView().byId("id_scanProcess").setVisible(true);
				this.getView().byId("id_brcdscan").setVisible(true);
				this.getView().byId("id_ok").setVisible(false);
				this.getView().byId("id_gateentry").setVisible(true);
				this.getView().byId("id_DeliveryManual").setVisible(false);
				this.getView().byId("id_MatDocManual").setVisible(false); //Added by Pavan on 21.04.2023
				// this.getView().byId("id_deliverywithbox").setVisible(true);
				if (this.getView().getModel('oBatchEnable')) {
					if (this.getView().getModel('oBatchEnable').getData()[0].CfmProcess === "X" && this.getView().byId("processty").getSelectedKey() ==
						"TRANSFER") {
						this.getView().byId("id_DelLabel").setVisible(false); //Added by Avinash
						this.getView().byId("id_delivery").setVisible(false); //Added by Avinash
					} else {
						this.getView().byId("id_DelLabel").setVisible(true); //Added by Avinash
						this.getView().byId("id_delivery").setVisible(true); //Added by Avinash
					}
				} else {
					this.getView().byId("id_DelLabel").setVisible(true); //Added by Avinash
					this.getView().byId("id_delivery").setVisible(true); //Added by Avinash	
				}
				//Added by Pavan on 21/04/2023 Start
				if (this.getView().getModel().getData().plant === '6534' && this.getView().byId("processty").getSelectedKey() !== "TRANSFER") {
					this.getView().byId("id_DelLabel").setVisible(true);
					this.getView().byId("id_delivery").setVisible(true);
				} else {
					this.getView().byId("id_DelLabel").setVisible(false);
					this.getView().byId("id_delivery").setVisible(false);
				}
				//Added by Pavan on 21/04/2023 End
				this.getView().byId("Save").setVisible(false);
				var vTemp = [{
					"Vbeln": ""
				}];
				var oManualDel = new sap.ui.model.json.JSONModel();
				oManualDel.setData(vTemp);
				this.getView().setModel(oManualDel, "JMManualDel");

				//Added by Pavan on 21/04/2023 Start
				var vTemp1 = [{
					"Mblnr": ""
				}];
				var oManualDel1 = new sap.ui.model.json.JSONModel();
				oManualDel1.setData(vTemp1);
				this.getView().setModel(oManualDel1, "JMManualMatDoc");
				//Added by Pavan on 21/04/2023 End
			}

		},
		//	added by leela//
		onReportingSwitchChange: function(oEvent) {
			this.getView().byId("id_scanProcess").setVisible(false);
			this.getView().byId("id_DeliveryManual").setVisible(false);
			this.getView().byId("id_MatDocManual").setVisible(false); //Added by Pavan on 21.03.2023
			if (ReportingWithDeliv == "X") {
				this.getView().byId('id_scanid1').setVisible(true);
				this.ReportingSwitchFlag = this.getView().byId('id_scanid1').getState();
			} else {
				this.getView().byId('id_scanid1').setVisible(false);
				this.ReportingSwitchFlag = true;
			}
			this.getView().getModel("setting").getData().ReportingSwitchFlag = this.ReportingSwitchFlag;
			this.getView().getModel("setting").refresh();
			if (this.ReportingSwitchFlag === false) {
				this.getView().byId("id_withoutreport").setVisible(true);
				this.getView().byId("id_withreport").setVisible(false);
				this.getView().byId("id_gateentry").setVisible(true);
				this.getView().byId("Save").setVisible(false);
				this.getView().byId("Reprint").setVisible(false);
			}
			if (this.ReportingSwitchFlag === true) {
				this.getView().byId("id_withreport").setVisible(true);
				this.getView().byId("Reprint").setVisible(true);
				this.getView().byId("id_withoutreport").setVisible(false);
				this.getView().byId("Save").setVisible(true);
				this.getView().byId("id_gateentry").setVisible(false);
				//Added by chaithra 
				var localModel = this.getOwnerComponent().getModel("localModel");
				this.getView().byId("id_plantwith1").setValue(localModel.getData().plant + " - " + localModel.getData().plantDesc); //Changed by Avinash
				// this.getView().byId("id_plantwith1desc").setText(localModel.getData().plantDesc); //Commented by Avinash
			}
		},
		//	added by leela//
		//=======================================================================================
		//-------------------Switch is Manual click ok get Delivery Details Function--------------------
		//=======================================================================================
		onOkButton: function() {
			if (this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N' && this.getView().byId("processty").getSelectedKey() ===
				"TRANSFER") {
				//this.fnOkMatDoc();
				sap.ui.core.BusyIndicator.show();
				var oData1 = this.getView().getModel("JMManualMatDoc").getData()[0].Mblnr;
				var vPlant = this.getOwnerComponent().getModel("localModel").getData().plant;
				var vFlag = "X";
				oData1 = oData1.split("#");
				var oPath = "F4Set?$filter=IvMblnr eq '" + oData1[0] + "'and IvWerks eq '" + vPlant + "' and F4Mblnr eq '" + vFlag +
					"'and Gjahr eq '" + oData1[1] + "'&$expand=F4MbItemNav";
				this.fnGetMatDoclist(oPath);
				return;
			} else {
				this.state = true;
				var vError = false;
				var Errordeliverytext = this.getView().getModel("i18n").getResourceBundle().getText("EnterDeliveryNumberforAllItems");
				//	var id = this.getView().byId("id_delivery").getValue();
				var vData = this.getView().getModel('JMManualDel').getData();
				var weigbrd = this.getView().byId("id_WeighbridgeProcessManual").getValue();
				for (var i = 0; i < vData.length; i++) {
					if (vData[i].Vbeln == "" && vData.length !== 1) {
						vError = true;
						break;
					}
				}
				if (vError == false) {
					var vData = this.getView().getModel('JMManualDel').getData();
					if (weigbrd) {
						this.fnexpandokwbid(weigbrd);
						// if(vData != ""){
					} else {
						for (var i = 0; i < vData.length; i++) {
							vlength = vData.length;
							if ((vData[i].Vbeln)) {
								this.fnexpandok(vData[i].Vbeln, weigbrd);
								// oData.results[0].DelEsOutNav.results[0].Truck;
							}
						}
						this.onSwitchChange1();
					}
				} else {
					sap.m.MessageToast.show(Errordeliverytext);
				}

			}

		},
		//Added by Pavan on 21/04/2023 Start
		fnOkMatDoc: function() {

			/*this.state = true;
			var vError = false;
			var that = this;
			var Errordeliverytext = this.getView().getModel("i18n").getResourceBundle().getText("EnterDeliveryNumberforAllMatDoc");
			var vData = this.getView().getModel('JMManualMatDoc').getData();
			var weigbrd = this.getView().byId("id_WeighbridgeProcessManual").getValue();
			for (var i = 0; i < vData.length; i++) {
				if (vData[i].Mblnr == "" && vData.length !== 1) {
					vError = true;
					break;
				}
			}
			if (vError == false) {
				var vData = this.getView().getModel('JMManualMatDoc').getData();
				if (weigbrd) {
					this.fnexpandokwbid(weigbrd);
				} else {
					for (var i = 0; i < vData.length; i++) {
						if ((vData[i].Mblnr)) {
							var oMultiInput1 = that.getView().byId("id_MaDocGe");
							var aTokens = oMultiInput1.getTokens();
							var vExists = false;
							if (aTokens) {
								for (var j = 0; j < aTokens.length; j++) {
									if (aTokens[j].getKey() == vData[i].Mblnr) {
										vExists = true;
										break;
									}
								}
							}
							if (vExists == false) {
								var vTokenv = new sap.m.Token({
									text: vData[i].Mblnr,
									key: vData[i].Mblnr
								});
								aTokens.push(vTokenv);
								oMultiInput1.removeAllTokens();
								oMultiInput1.setTokens(aTokens);
							} else {
								var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("MatDelAlredyScanned");
								sap.m.MessageToast.show(EnterDel);
							}

						}
					}
					this.onSwitchChange1();
				}
			} else {
				sap.m.MessageToast.show(Errordeliverytext);
			}*/
		},
		//Added by Pavan on 21/04/2023 End

		ondeliverycheck: function() {
			var weigbrd = this.getView().byId("id_WeighbridgeProcessManual").getValue();
			var vData = this.getView().getModel('JMManualDel').getData();
			for (var i = 0; i < vData.length; i++) {
				vlength = vData.length;
				if ((vData[i].Vbeln)) {
					this.fnexpandok(vData[i].Vbeln, weigbrd);
					// oData.results[0].DelEsOutNav.results[0].Truck;
				}
			}
			this.onSwitchChange1();
		},
		onSwitchChange1: function() {
			this.getView().byId('id_scanid').setState(true);
			this.state = this.getView().byId('id_scanid').getState();
			this.getView().getModel("setting").getData().SwitchFlag = this.state;
			this.getView().getModel("setting").refresh();
			/*this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			this.getView().getModel("scannerData").refresh();*/
			if (this.state === false) {
				this.getView().byId("id_ok").setVisible(true);
				this.getView().byId("id_gateentry").setVisible(false);
				this.getView().byId("id_DeliveryManual").setVisible(true);
				// this.getView().byId("id_deliverywithbox").setVisible(false);
				this.getView().byId("id_DelLabel").setVisible(false); //Added by Avinash
				this.getView().byId("id_delivery").setVisible(false);
				this.getView().byId("id_brcdscan").setVisible(false);
				var vTemp = [{
					"Vbeln": ""
				}];
				var oManualDel = new sap.ui.model.json.JSONModel();
				oManualDel.setData(vTemp);
				this.getView().setModel(oManualDel, "JMManualDel");

				//Added by Pavan on 21/04/2023 Start
				var vTemp1 = [{
					"Mblnr": ""
				}];
				var oManualDel1 = new sap.ui.model.json.JSONModel();
				oManualDel1.setData(vTemp1);
				this.getView().setModel(oManualDel1, "JMManualMatDoc");

				this.getView().getModel("MatDocList").setData([]);
				this.getView().getModel("MatDocList").refresh();
				//Added by Pavan on 21/04/2023 End
			} else {
				this.getView().byId("id_scanProcess").setVisible(true);
				this.getView().byId("id_brcdscan").setVisible(true);
				this.getView().byId("id_ok").setVisible(false);
				this.getView().byId("id_gateentry").setVisible(true);
				this.getView().byId("id_DeliveryManual").setVisible(false);
				this.getView().byId("id_MatDocManual").setVisible(false); //Added by Pavan on 21/03/2023
				// this.getView().byId("id_deliverywithbox").setVisible(true);
				this.getView().byId("id_DelLabel").setVisible(true); //Added by Avinash
				this.getView().byId("id_delivery").setVisible(true);
				var vTemp = [{
					"Vbeln": ""
				}];
				var oManualDel = new sap.ui.model.json.JSONModel();
				oManualDel.setData(vTemp);
				this.getView().setModel(oManualDel, "JMManualDel");

				//Added by Pavan on 21/04/2023 Start
				var vTemp1 = [{
					"Mblnr": ""
				}];
				var oManualDel1 = new sap.ui.model.json.JSONModel();
				oManualDel1.setData(vTemp1);
				this.getView().setModel(oManualDel1, "JMManualMatDoc");

				this.getView().getModel("MatDocList").setData([]);
				this.getView().getModel("MatDocList").refresh();
				//Added by Pavan on 21/04/2023 End
				var that = this;
				if (that.getView().getModel('oBatchEnable').getData()[0].CfmProcess === "X") {
					if (that.getView().byId("processty").getSelectedKey() === "") {
						that.getView().byId("id_delivery").setVisible(false);
						that.getView().byId("id_DelLabel").setVisible(false);
					} else if (that.getView().byId("processty").getSelectedKey() == "TRANSFER") {
						that.getView().byId("id_delivery").setVisible(false);
						that.getView().byId("id_DelLabel").setVisible(false);
					} else {
						this.getView().byId("id_DelLabel").setVisible(true);
						this.getView().byId("id_delivery").setVisible(true);
					}
				} else {
					this.getView().byId("id_DelLabel").setVisible(true);
					this.getView().byId("id_delivery").setVisible(true);
				}
				//Added by Pavan on 21/04/2023 Start
				if (this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N' && this.getView().byId("processty").getSelectedKey() !==
					"TRANSFER") {
					this.getView().byId("id_DelLabel").setVisible(true);
					this.getView().byId("id_delivery").setVisible(true);
				} else {
					this.getView().byId("id_DelLabel").setVisible(false);
					this.getView().byId("id_delivery").setVisible(false);
				}
				//Added by Pavan on 21/04/2023 End
			}

		},

		//===============================================================
		//-------------------Segemented btn visible details Function--------------------
		//===============================================================
		fnSegmentedwith: function() {
			weighbridgeid = "";
			this.getView().byId("commonProcess").setVisible(true);
			// this.getView().byId("id_deliverywithbox").setVisible(true);
			this.getView().byId("id_DelLabel").setVisible(true); //Added by Avinash
			this.getView().byId("id_delivery").setVisible(true);
			this.getView().byId("id_Wholebox").setVisible(false);
			// this.getView().byId("id_plantwith").setVisible(true);
			this.getView().byId("id_Plantlabel").setVisible(true); //Added by Avinash
			this.getView().byId("plantvalue").setVisible(true); //Added by Avinash
			this.getView().byId("id_scanProcess").setVisible(true);
			this.getView().byId("id_gatetime").setDateValue(new Date());
			this.getView().byId("id_gatetimewith").setDateValue(new Date());
			this.getView().byId("id_ReportingDate1").setDateValue(new Date());
			this.getView().byId("id_ReportingTime1").setDateValue(new Date());
			if (this.getView().getModel("oProceeModel") && this.getView().getModel("oProceSalesModel")) {
				if (this.getView().getModel("oProceeModel").getData().length == 1) {
					this.getView().byId("processty").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
				}
				if (this.getView().getModel("oProceSalesModel").getData().length == 1) {
					this.getView().byId("process").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].ProcessType);
				}
			}
			this.onSwitchChange();

		},
		//===============================================================
		//-------------------Segemented btn visible details Function-----
		//===============================================================
		fnSegmentedwithout: function() {
			this.onScannerCancel();
			weighbridgeid = "";
			this.getView().byId("commonProcess").setVisible(false);
			// this.getView().byId("id_deliverywithbox").setVisible(false);
			this.getView().byId("id_DelLabel").setVisible(false); //Added by Avinash
			this.getView().byId("id_delivery").setVisible(false);
			this.getView().byId("id_Wholebox").setVisible(true);
			// this.getView().byId("id_plantwith").setVisible(false);
			this.getView().byId("id_Plantlabel").setVisible(false); //Added by Avinash
			this.getView().byId("plantvalue").setVisible(false); //Added by Avinash
			this.getView().byId("id_scanProcess").setVisible(false);

			this.getView().byId("id_gateentry").setVisible(true);
			this.getView().byId("id_ok").setVisible(false);

			this.getView().byId("id_MatDocLabelGe").setVisible(false); //Added by Pavan on 18/04/2023
			this.getView().byId("id_MaDocGe").setVisible(false); //Added by Pavan on 18/04/2023

			this.getView().byId("id_gatetime").setDateValue(new Date());
			this.getView().byId("id_gatetimewith").setDateValue(new Date());
			this.getView().byId("id_ReportingDate1").setDateValue(new Date());
			this.getView().byId("id_ReportingTime1").setDateValue(new Date());
			if (this.getView().getModel("oProceeModel").getData().length == 1) {
				this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
			}
			if (this.getView().getModel("oProceSalesModel").getData().length == 1) {
				this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].ProcessType);
			}
			this.onSwitchChange();
			this.onReportingSwitchChange();

		},
		//===============================================================
		//-------------------Back to Dasborad  Function-----
		//===============================================================
		onBackPress: function() {
			this.getOwnerComponent().getRouter().navTo("Dashboard");
			this.fnClear();
		},

		//===============================================================
		//-------------------Clear Function----
		//===============================================================
		onScannerCancel: function(oEvent) {
			//Added by Avinash
			var vData = this.getView().getModel('scannerData').getData();
			var vPlant = this.getView().byId("plantvalue").getValue().split(" - ")[0];
			var vPlantDesc = this.getView().byId("plantvalue").getValue().split(" - ")[1];
			if (vPlant) {
				vData.Werks = vPlant;
				vData.Pname = vPlantDesc;
				this.getView().getModel('scannerData').refresh(true);
			} else {
				vData.Werks = "";
				vData.Pname = "";
			}
			var oEntity = {
				"Gate": "",
				"Gname": "",
				"Lifnr": "",
				"Tr_Name": "",
				"Werks": vData.Werks,
				"Pname": vData.Pname
			};
			this.getView().setModel(new sap.ui.model.json.JSONModel(oEntity), "scannerData");
			//ENd of Added
			// this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData"); //Commented by Avinash on 22/06/21
			this.getView().getModel("scannerData").refresh();
			var oMultiInput1 = this.getView().byId("id_delivery");
			oMultiInput1.setTokens([]);
			var oMultiInput2 = this.getView().byId("id_MaDocGe");
			oMultiInput2.setTokens([]);
			vclickscandelno = [];
			vclickscandelno1 = [];
			vGReason = ""; //Added by Avinash...
			truckarray = [];
			this.fnClear();
			//Added by Avinash
			if (this.getView().getModel('oBatchEnable').getData()[0].CfmProcess === "X") {
				this.getView().getModel('oBatchEnable').getData()[0].Vbeln = "";
			}
			this.getView().getModel('oBatchEnable').refresh(true);
			//End of Added
		},

		//===============================================================
		//------------------Gate Entry Creation validate Function----
		//===============================================================
		onScannerSave: function(oEvent) {
			var that = this;
			var oMultiInput1 = this.getView().byId("id_delivery");
			var aTokens = oMultiInput1.getTokens();
			var oMultiInput2 = this.getView().byId("id_MaDocGe");
			var aTokens1 = oMultiInput2.getTokens();
			var oInput = this.getView().byId("id_MaDocGe").getValue(); //Added by Pavan on 20/04/2023 
			var vbeln = that.getView().getModel("scannerData").getProperty('/Vbeln');
			var vSelect = this.getView().byId("id_segmentbtn").getSelectedKey();
			var weightbid = this.getView().byId("id_WeighbridgeProcess").getValue();
			if ((weighbridgescanned == "true") || (weightbid)) {
				var vError = false;
				var driver = this.getView().byId("id_driver").getValue();
				var truck = this.getView().byId("id_truck").getValue();
				var scannedresult = this.getView().getModel('scannerData').getData();
				
				var valid= true;
					if (this.getView().byId("process").getSelectedKey() === "ADVANCE LOADING") {
					valid= false;	
						
					}
				
				if (this.getView().byId("process").getSelectedKey() !== "EXPORT" && valid) {
					if (aTokens.length === 0) {
						vError = true;
						var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("EnterDelivery");
						sap.m.MessageToast.show(EnterDel);
					}
				}
				truck = truck.trim();
				if (parametercheck !== "X") {
					if (this.getView().byId("process").getSelectedKey() == "") {
						var EnterprocessType = that.getView().getModel("i18n").getResourceBundle().getText("EnterprocessType");
						sap.m.MessageToast.show(EnterprocessType);
						vError = true;
						//	sap.m.MessageToast.show("Please Enter Driver Name");
					}
				}
				if (driver == "") {
					var EnterDriverName = that.getView().getModel("i18n").getResourceBundle().getText("EnterDriverName");
					sap.m.MessageToast.show(EnterDriverName);
					vError = true;
					//	sap.m.MessageToast.show("Please Enter Driver Name");
				}
				if (truck == "") {
					var EnterTruckName = that.getView().getModel("i18n").getResourceBundle().getText("EnterTruckName");
					sap.m.MessageToast.show(EnterTruckName);
					vError = true;
					//sap.m.MessageToast.show("Please Enter Truck Number");
				}
				//Added by Avinash for Container Number Validation for IVC Rubber...
				if (that.getView().getModel("oBatchEnable").getData()[0].Cnnum == "X" && that.getView().byId('id_PortOprid').getState()) {
					if (that.getView().byId("id_Cnnum").getValue() == "") {
						vError = true;
						var EnterGate = that.getView().getModel("i18n").getResourceBundle().getText("CnnumisMandat");
						sap.m.MessageToast.show(EnterGate);
					}
					//Container Number Validation...
					var vCont1 = that.getView().byId("id_Cnnum").getValue();
					var vContLen = vCont1.length;
					var ChkNum = /^[0-9]+$/;
					var ChkAlpha = /^[A-Za-z]+$/;
					if (vContLen == '11') {
						var vContSlice = vCont1.slice(4);
						var vAlphaCont = vCont1.substring(0, 4);
						var isNumValid = ChkNum.test(vContSlice);
						var isAlphaValid = ChkAlpha.test(vAlphaCont);
					}
					if (vContLen !== 11) {
						vError = true;
						var vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText('EnterCorrectContNo');
						sap.m.MessageToast.show(vErrMsg);
					}
					if (vContLen == '11') {
						if (!isAlphaValid) {
							vError = true;
							var vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText('EnterCorrectContNo');
							sap.m.MessageToast.show(vErrMsg);
						}
						if (!isNumValid) {
							vError = true;
							var vErrMsg = that.getView().getModel("i18n").getResourceBundle().getText('EnterCorrectContNo');
							sap.m.MessageToast.show(vErrMsg);
						}
					}
					//End of Validation...
				}
				//Added by Avinash on 11-05-2021 for gate Number Mandatory Validation....
				if (that.getView().getModel("MandatoryEnable").getData()[0].Gate == "X") {
					if (that.getView().byId("id_GEgateno").getValue() == "" ||
						that.getView().byId("id_GEgateno").getValue() == undefined) {
						vError = true;
						var EnterGate = that.getView().getModel("i18n").getResourceBundle().getText("EnterGate");
						sap.m.MessageToast.show(EnterGate);
					}
				}
				//End of added...

				if (vError === false) {

					var submit = that.getView().getModel("i18n").getResourceBundle().getText("submit");
					MessageBox.confirm(submit, {
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						onClose: function(oAction) {
							if (oAction === "OK") {
								var vPortKey;
								if (that.getView().byId('id_PortOprid').getVisible()) {
									if (that.getView().byId('id_PortOprid').getState()) {
										that.fnCheckReason();
									}
								} else {
									that.fnweighbridgeGateEntry();
								}
								// that._LoadDeliveryItems(that, vbeln, true);
							}

						}

					});
				}
			} else {
				if (vSelect == "with") {
					var vError = false;
					var driver = this.getView().byId("id_driver").getValue();
					var truck = this.getView().byId("id_truck").getValue();
					truck = truck.trim();
					if (this.getView().byId("process").getSelectedKey() == "DOMESTIC") {
						if (aTokens.length === 0) {
							vError = true;
							var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("EnterDelivery");
							sap.m.MessageToast.show(EnterDel);
						}
					}
					if (parametercheck !== "X") {
						if (this.getView().byId("process").getSelectedKey() == "" && this.getView().getModel('oBatchEnable').getData()[0].CfmProcess ==
							"") {
							var EnterprocessType = that.getView().getModel("i18n").getResourceBundle().getText("EnterprocessType");
							sap.m.MessageToast.show(EnterprocessType);
							vError = true;
							//	sap.m.MessageToast.show("Please Enter Driver Name");
						}
					}
					if (!weightbid) {
						if (this.getView().byId("processty").getSelectedKey() !== "SCRAP" && this.getView().getModel("oBatchEnable").getData()[0].Origin !==
							'N') {
							if (this.getView().getModel('oBatchEnable').getData()[0].Vbeln == "X" && this.getView().getModel('oBatchEnable').getData()[0].CfmProcess ==
								"") { //Added by Avinash for CFM Changes
								if (aTokens.length === 0) {
									vError = true;
									var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("EnterDelivery");
							
									sap.m.MessageToast.show(EnterDel);
								}
							}
						}
					}
					//Added by Pavan on 20/04/2023 Start
					if (aTokens1.length === 0 && this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N' && this.getView().byId(
							"processty").getSelectedKey() === "TRANSFER") {
						vError = true;
						var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("EntMatDoc");
						sap.m.MessageToast.show(EnterDel);
					}
					if (aTokens.length === 0 && this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N' && this.getView().byId(
							"processty").getSelectedKey() === "SALES") {
						vError = true;
						var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("EnterDelivery");
						sap.m.MessageToast.show(EnterDel);
					}
					//Added by Pavan on 20/04/2023 End
					if (driver === "" || truck === "") {
						vError = true;
						var EnterDels = that.getView().getModel("i18n").getResourceBundle().getText("EnterDelivery");
						sap.m.MessageToast.show(EnterDels);
					}
					if (driver == "") {
						var EnterDriverName = that.getView().getModel("i18n").getResourceBundle().getText("EnterDriverName");
						sap.m.MessageToast.show(EnterDriverName);
						//	sap.m.MessageToast.show("Please Enter Driver Name");
					}
					if (truck == "") {
						var EnterTruckName = that.getView().getModel("i18n").getResourceBundle().getText("EnterTruckName");
						sap.m.MessageToast.show(EnterTruckName);
						//sap.m.MessageToast.show("Please Enter Truck Number");
					}
					if (GvTransporterM == "X") {
						if (this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N' && this.getView().byId("processty").getSelectedKey() !==
							"SALES") {
							if (that.getView().byId("id_InTransport").getValue() == " - " ||
								that.getView().byId("id_InTransport").getValue() == undefined) {
								vError = true;
								var EnterTruckName = that.getView().getModel("i18n").getResourceBundle().getText("EnterTransporter");
								sap.m.MessageToast.show(EnterTruckName);
							}
						} else if (this.getView().getModel("oBatchEnable").getData()[0].Origin !== 'N') {
							if (that.getView().byId("id_InTransport").getValue() == " - " ||
								that.getView().byId("id_InTransport").getValue() == undefined) {
								vError = true;
								var EnterTruckName = that.getView().getModel("i18n").getResourceBundle().getText("EnterTransporter");
								sap.m.MessageToast.show(EnterTruckName);
							}
						}

					}
					if (that.getView().getModel("MandatoryEnable").getData()[0].Gate == "X") {
						if (that.getView().byId("id_GEgateno").getValue() == "" ||
							that.getView().byId("id_GEgateno").getValue() == undefined) {
							vError = true;
							var EnterGate = that.getView().getModel("i18n").getResourceBundle().getText("EnterGate");
							sap.m.MessageToast.show(EnterGate);
						}
					}

					//Added by Karthikeyan K   
					if (that.getView().getModel("MandatoryEnable").getData()[0].Trtyp == "X") {
						if (that.getView().byId("id_TransType").getValue() == "" ||
							that.getView().byId("id_TransType").getValue() == undefined) {
							vError = true;
							var Entertrtyp = that.getView().getModel("i18n").getResourceBundle().getText("Entertrtyp");
							sap.m.MessageToast.show(Entertrtyp);
						}
					}
					if (that.getView().getModel("MandatoryEnable").getData()[0].Vehtyp == "X") {
						if (that.getView().byId("id_VehType").getValue() == "" ||
							that.getView().byId("id_VehType").getValue() == undefined) {
							vError = true;
							var Entervehtyp = that.getView().getModel("i18n").getResourceBundle().getText("Entervehtyp");
							sap.m.MessageToast.show(Entervehtyp);
						}
					}
					if (that.getView().getModel("MandatoryEnable").getData()[0].DriverMob == "X") {
						if (that.getView().byId("id_DriverMobile").getValue() == "" ||
							that.getView().byId("id_DriverMobile").getValue() == undefined) {
							vError = true;
							var Enterdrivermob = that.getView().getModel("i18n").getResourceBundle().getText("Enterdrivermob");
							sap.m.MessageToast.show(Enterdrivermob);
						}
					}
					//End of add

					if (vError === false) {
						var submit = that.getView().getModel("i18n").getResourceBundle().getText("submit");
						MessageBox.confirm(submit, {
							actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
							onClose: function(oAction) {
								if (oAction === "OK") {
									that.fnGateEntry();
									//	that._LoadDeliveryItems(that, vbeln, true);
								}

							}

						});
						//	that._LoadDeliveryItems(that, vbeln, true);

					}
				}
				if (vSelect != "with") {
					var vError = false;
					var Plant = this.getView().byId("id_plantwithout").getValue();

					var driver1 = this.getView().byId("id_driverwith").getValue();
					var truck1 = this.getView().byId("id_truckwith").getValue();
					truck1 = truck1.trim();
					if (driver1 === "" || truck1 === "") {
						vError = true;
					}
					if (driver1 == "") {
						var EnterDriverName = that.getView().getModel("i18n").getResourceBundle().getText("EnterDriverName");
						sap.m.MessageToast.show(EnterDriverName);
						//	sap.m.MessageToast.show("Please Enter Driver Name");
					}
					if (truck1 == "") {
						var EnterTruckName = that.getView().getModel("i18n").getResourceBundle().getText("EnterTruckName");
						sap.m.MessageToast.show(EnterTruckName);
						//	sap.m.MessageToast.show("Please Enter Truck Number");
					}
					if (vError === false) {

						var submit = that.getView().getModel("i18n").getResourceBundle().getText("submit");
						MessageBox.confirm(submit, {
							actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
							onClose: function(oAction) {
								if (oAction === "OK") {
									that.fnGateEntry();
								}
							}

						});
					}
				}
			}
		},
		onReportSave: function(oEvent) {
			var vError = false;
			var Plant = this.getView().byId("id_plantwith1").getValue().split(" - ")[0]; //Changed by Avinash
			var that = this;
			var driver1 = this.getView().byId("id_driverwith1").getValue();
			var truck1 = this.getView().byId("id_truckwith1").getValue();
			var processType = this.getView().byId("processType").getSelectedKey();
			truck1 = truck1.trim();
			if (driver1 === "" || truck1 === "") {
				vError = true;
			}
			if (processType == "" || processType == undefined) {
				var EnterprocessType = that.getView().getModel("i18n").getResourceBundle().getText("EnterprocessType");
				sap.m.MessageToast.show(EnterprocessType);
				vError = true;
				//	sap.m.MessageToast.show("Please Enter Driver Name");
			}
			if (driver1 == "") {
				var EnterDriverName = that.getView().getModel("i18n").getResourceBundle().getText("EnterDriverName");
				sap.m.MessageToast.show(EnterDriverName);
				vError = true;
				//	sap.m.MessageToast.show("Please Enter Driver Name");
			}
			if (truck1 == "") {
				var EnterTruckName = that.getView().getModel("i18n").getResourceBundle().getText("EnterTruckName");
				sap.m.MessageToast.show(EnterTruckName);
				vError = true;
				//	sap.m.MessageToast.show("Please Enter Truck Number");
			}
			if (Plant == "") {
				var EnterPlant = that.getView().getModel("i18n").getResourceBundle().getText("EnterPlantName");
				sap.m.MessageToast.show(EnterPlant);
				vError = true;
				//	sap.m.MessageToast.show("Please Enter Truck Number");
			}
			if (vError === false) {

				var submit = that.getView().getModel("i18n").getResourceBundle().getText("submit");
				MessageBox.confirm(submit, {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function(oAction) {

						if (oAction === "OK") {
							that.onSave();

						}
					}

				});
			}

		},
		//===============================================================
		//------------------Gate Entry Creation  Function----
		//===============================================================
		onSave: function() {
			var that = this;
			var oPostModel = that.getView().getModel('odata');
			// var newdata = [];
			var arr = [];
			var GateEntryDmsNav = [];
			arr = that.getView().getModel('scannerData').getData();
			var config6 = "";
			if (that.getView().byId("processType").getSelectedKey() !== "SALES") {
				config6 = that.getView().byId("processType").getSelectedKey();
			} else {
				config6 = that.getView().byId("ReportSalesProcess").getSelectedKey();
			}
			var vLifnr = "";
			if (that.getView().getModel("oBatchEnable").getData()[0].Lifnr == "X") {
				vLifnr = that.getView().byId("id_ReporTransport").getValue().split(" - ")[0];
			}
			var oEntity = {
				Config6: config6,
				Config2: "S01",
				Wtype: that.getView().byId("processType").getSelectedKey(),
				Config4: "WPC",
				Tmode: "Out Queue",
				InOut: "IN",
				Direction: "OUT",
				Remark: that.getView().byId("id_remarks1").getValue(),
				Vehno: that.getView().byId("id_truckwith1").getValue(),
				Vehtyp: that.getView().byId("id_TruckType1").getSelectedKey(),
				Dname: that.getView().byId("id_driverwith1").getValue(),
				Werks: that.getView().byId("id_plantwith1").getValue().split(" - ")[0],
				//	Nf_Number: that.getView().byId("notavalue").getValue(),
				DriverId: that.getView().byId("id_driverId").getValue(),
				Gate: that.getView().byId("id_Gateno").getValue().split(" - ")[0],
				DriverMob: that.getView().byId("id_MobileNumber").getValue(), //Commented by Avinash
				// DriverMob: that.getView().byId("id_DriverMobile").getValue(),   //Added by Avinash
				Flag: "R",
				GatePrintNav: [{}],
				Lifnr: vLifnr
					// GateEntryDmsNav:GateEntryDmsNav
			};

			var oItems = [];
			var vItem = 10;

			var vTemp = {
				Config1: 'R01',
				Config4: "R01",
				Werks: arr.Werks,
				Item: vItem.toString()
			};
			oItems.push(vTemp);
			oEntity.NavGateEntry = [];
			oEntity.GateReturnNav = [];
			var oPath = '/GateEntrySet';
			oPostModel.create(oPath, oEntity, {
				success: function(oData, Response) {
					var vehicleinside = that.getView().getModel("i18n").getResourceBundle().getText("vehicleinside");
					if (oData.Wbid !== "") {
						if (oData.Msg === 'X') {
							MessageBox.error(vehicleinside);
							that.getBusyDialog.close();
						} else {
							that.WbidTrans = oData.Wbid;
							/*	if (sap.ui.getCore().byId("id_UploadCollection")) {
									if (sap.ui.getCore().byId("id_UploadCollection").aItems.length > 0) {
										that.onStartUpload();
									}
								}*/

							var Transaction = that.getView().getModel("i18n").getResourceBundle().getText("Referencenumber");
							var Generated = that.getView().getModel("i18n").getResourceBundle().getText("Generated");
							sap.m.MessageBox.show(Transaction + " " + oData.Wbid + " " + Generated, {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								actions: [MessageBox.Action.OK],
								title: that.getView().getModel("i18n").getResourceBundle().getText("Information"),
								onClose: function(oAction) {
									that.onDmsPost(oData.Wbid);
									if (oAction === "OK") {
										MessageBox.show(that.oView.getModel("i18n").getResourceBundle().getText("Msg2"), {
											icon: MessageBox.Icon.INFORMATION,
											title: that.oView.getModel("i18n").getResourceBundle().getText("Information"),
											actions: [MessageBox.Action.YES, MessageBox.Action.NO],
											onClose: function(oAction) {
												if (oAction === 'YES') {
													// var pdfURL = oData.GatePrintNav.results[1].print;
													// if (sap.ui.Device.system.desktop) {
													// 	that.initiatePdfDialog();
													// 	var byteCharacters = atob(pdfURL);
													// 	var byteNumbers = new Array(byteCharacters.length);
													// 	for (var i = 0; i < byteCharacters.length; i++) {
													// 		byteNumbers[i] = byteCharacters.charCodeAt(i);
													// 	}
													// 	var byteArray = new Uint8Array(byteNumbers);
													// 	var blob1 = new Blob([byteArray], {
													// 		type: "application/" + "PDF"
													// 	});
													// 	var url = window.URL.createObjectURL(blob1);
													// 	var oContent = "<div><iframe src=" + url + " width='100%' height='520'></iframe></div>";
													// 	that.oImageDialog.getContent()[0].setContent(oContent);
													// 	that.oImageDialog.addStyleClass("sapUiSizeCompact");
													// 	that.oImageDialog.open();
													// } else {
													// 	window.open(url);
													// }
													var sServiceUrl = oPostModel.sServiceUrl;
													var sRead = "/ReprintSet(IvWbid='" + oData.Wbid + "')/$value";
													var pdfURL = sServiceUrl + sRead;
													if (sap.ui.Device.system.desktop) {
														that.initiatePdfDialog();
														var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
														that.oImageDialog.getContent()[0].setContent(oContent);
														that.oImageDialog.addStyleClass("sapUiSizeCompact");
														that.oImageDialog.open();
													} else {
														window.open(pdfURL);
													}
													that.fnClear();
													// that.getOwnerComponent().getRouter().navTo("Dashboard");

													//that.getView().byId("id_selectedvtn").setSelectedKey("with");
													//	 that.fnClear();
													//	that.getOwnerComponent().getRouter().navTo("Dashboard");

												}
												if (oAction === 'NO') {
													that.fnClear();
													// that.getOwnerComponent().getRouter().navTo("Dashboard");

												}
											}
										});
										//that.getView().byId("id_selectedvtn").setSelectedKey("with");
										/*	that.fnClear();
										that.getOwnerComponent().getRouter().navTo("Dashboard");
*/
									}
								}
							});
						}
					}
					if (oData.GateReturnNav.results.length != 0) {
						if (oData.GateReturnNav.results[0].Type === "E") {
							var vErrorTxt = oData.GateReturnNav.results[0].Message;
							sap.m.MessageToast.show(vErrorTxt);
						}
					}

					// 	)else {
					// 	var vErrorTxt = that.getView().getModel("i18n").getResourceBundle().getText("ErrorinGateEntry");
					// 	sap.m.MessageToast.show(vErrorTxt);
					// }

				},
				error: function(oResponse) {
					var vErrorTxt = that.getView().getModel("i18n").getResourceBundle().getText("ErrorinGateEntry");
					sap.m.MessageToast.show(vErrorTxt);
				}

			});
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
						that.fnClear();
					}
				})
			});
		},

		//Added by Avinash...
		onValuehelpChallan: function() {
			var oThat = this;
			if (!this.TruckType) {
				this.TruckType = sap.ui.xmlfragment("LoadingConfirmation.fragment.Ttype", this);
				this.getView().addDependent(this.TruckType);
			}
			this.TruckType.open();
			this.onCallTruckTypeF4();
		},
		onCallTruckTypeF4: function() {
			var self = this;
			this.BusyDialog.open();
			var oPostModel = self.getView().getModel('odata');
			var vPlant = self.getOwnerComponent().getModel("localModel").getData().plant;
			oPostModel.read("/F4Set", {
				filters: [
					new sap.ui.model.Filter("Ttype", sap.ui.model.FilterOperator.EQ, "X"),
					new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, vPlant)
				],
				urlParameters: {
					$expand: "F4TtypeNav"
				},
				async: true,
				success: function(Idata, Iresponse) {
					self.BusyDialog.close();
					self.getView().setModel(new JSONModel(Idata.results[0].F4TtypeNav.results), "oTTF4Model");
				},
				error: function(Ierror) {
					self.BusyDialog.close();
				}
			});
		},
		onTTsearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			if (sValue == undefined) {
				sValue = "";
			}
			oFilter = new sap.ui.model.Filter([
				new Filter("Ttype", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},

		fnTTconfirm: function(oEvent) {
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			self.getView().getModel("scannerData").getData().Challan = oSelectedItem.getTitle();
			self.getView().getModel("scannerData").refresh(true);
		},

		onValuehelpTruckType: function() {
			var oThat = this;
			if (!this.VehType) {
				this.VehType = sap.ui.xmlfragment("LoadingConfirmation.fragment.VehType", this);
				this.getView().addDependent(this.VehType);
			}
			this.VehType.open();
			this.onCallVehTypeF4();
		},

		onCallVehTypeF4: function() {
			var self = this;
			this.BusyDialog.open();
			var oPostModel = self.getView().getModel('odata');
			var vPlant = self.getOwnerComponent().getModel("localModel").getData().plant;
			oPostModel.read("/F4Set", {
				filters: [
					new sap.ui.model.Filter("Vehtyp", sap.ui.model.FilterOperator.EQ, "X"),
					new sap.ui.model.Filter("IvWerks", sap.ui.model.FilterOperator.EQ, vPlant)
				],
				urlParameters: {
					$expand: "F4VehtypNav"
				},
				async: true,
				success: function(Idata, Iresponse) {
					self.BusyDialog.close();
					self.getView().setModel(new JSONModel(Idata.results[0].F4VehtypNav.results), "oVehTypeF4Model");
				},
				error: function(Ierror) {
					self.BusyDialog.close();
				}
			});
		},
		onVehTypesearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			if (sValue == undefined) {
				sValue = "";
			}
			oFilter = new sap.ui.model.Filter([
				new Filter("Vehtype", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},

		fnVehTypeconfirm: function(oEvent) {
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			self.getView().getModel("scannerData").getData().Vehtyp = oSelectedItem.getTitle();
			self.getView().getModel("scannerData").refresh(true);
		},

		fnCheckReason: function() {
			var that = this;
			var vScanArr = that.getView().getModel('scannerData').getData();
			if (vGReason == "") {
				if (vScanArr.Dname !== vGDname || vScanArr.Truck !== vGTruck || vScanArr.Lifnr !== vGLifnr || vScanArr.Challan !== vGChallan ||
					vScanArr.DriverMob !== vGDriverMob || vScanArr.Cnnum !== vGCnnum) {
					if (!this.Reason) {
						this.Reason = sap.ui.xmlfragment(
							"LoadingConfirmation.fragment.Reason",
							this
						);
						this.getView().addDependent(this.Reason);
					}
					this.Reason.open();
					that.onCallReasonF4();
				} else {
					that.fnweighbridgeGateEntry();
				}
			} else {
				that.fnweighbridgeGateEntry(vGReason);
			}
		},

		onCloseReason: function() {
			var self = this;
			// sap.ui.getCore().byId('id_Reason').setSelectedKey();
			self.Reason.close();
			// self.getView().byId("process").setSelectedKey(self.getView().byId("process").getSelectedKey());
		},

		onCallReasonF4: function() {
			var self = this;
			// var ivWerks = self.getView().getModel("DoPortInModel").getData().Werks;
			this.BusyDialog.open();
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
					self.BusyDialog.close();
					var oJSONModelSize = new sap.ui.model.json.JSONModel();
					oJSONModelSize.setData(oData.results[0].F4ReasonNav.results);
					self.getView().setModel(oJSONModelSize, "JMReason");
				},
				error: function(oResponse) {
					self.BusyDialog.close();
					sap.m.MessageToast.show(oResponse.message);
				}
			});
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
		//End of added...

		/////////////////////////////////////weighbridgeSv////////////////////////////////////////
		fnweighbridgeGateEntry: function(vReason) {
			var that = this;
			var oPostModel = that.getView().getModel('odata');
			var newdata = [];
			var arr = [];
			arr = that.getView().getModel('scannerData').getData();
			var data = arr.Vbeln;
			var Wtype = "";
			// if(arr.Wtype == undefined || arr.Wtype == ""){
			// 	Wtype = "SALES";
			// }
			// if(that.getView().byId("processty").getSelectedKey() != undefined && that.getView().byId("processty").getSelectedKey() != ""){
			Wtype = that.getView().byId("processty").getSelectedKey();
			// }
			if (Wtype == "SALES") {
				if (that.getView().byId("process").getSelectedKey() == undefined || that.getView().byId("processty").getSelectedKey() == "") {
					that.getView().byId("process").setSelectedKey("EXPORT");
				}
			} else {
				that.getView().byId("process").setSelectedKey(Wtype);
			}
			var GateEntryDmsNav = [];
			// arr = that.getView().getModel('scannerData').getData();
			if (this.Images.length !== 0) {
				this.Images.forEach(function(x) {
					GateEntryDmsNav.push({
						"Dokar": "",
						"Doknr": x.Doknr,
						"Dokvr": "",
						"Doktl": "",
						"Dokob": "",
						"Object": "",
						"Objky": "",
						"Fname": x.Fname,
						"Ftype": x.Ftype,
						"Filename": x.Filename
					});
				});
			}
			//Added by Avinash for port operation
			var vPortKey;
			if (that.getView().byId('id_PortOprid').getVisible()) {
				if (that.getView().byId('id_PortOprid').getState()) {
					vPortKey = "X";
				} else {
					vPortKey = "";
				}
			} else {
				vPortKey = "";
			}
			//Added by Nagaraj for WB switch
			var vWBKey;
			if (that.getView().byId('id_WB7Key').getVisible()) {
				if (that.getView().byId('id_WB7Key').getState()) {
					vWBKey = "W";
				} else {
					vWBKey = "W/O";
				}
			} else {
				vWBKey = "";
			}
			var vChangeReason;
			if (vReason) {
				vChangeReason = vReason;
			} else {
				vChangeReason = "";
			}
			//End of added....
			var oEntity = {
				/*	Config1: arr.Vbeln,*/
				Config1: "WPC",
				Config4: "S01",
				InOut: "IN",
				Direction: "OUT",
				Wtype: Wtype,
				Gate: arr.Gate,
				Vehno: arr.Truck,
				Dname: arr.Dname,
				DriverId: arr.DriverId,
				Werks: arr.Werks,
				Wbid: arr.Wbid,
				DriverMob: arr.DriverMob,
				Lifnr: arr.Lifnr,
				Remark: that.getView().byId("id_remarkswith").getValue(),
				Config6: that.getView().byId("process").getSelectedKey(),
				Port_Op: vPortKey, //Added by Avinash....
				Challan: arr.Challan, //Added by Avinash....
				Reason: vChangeReason, //Added by Avinash....
				Cnnum: arr.Cnnum, //Added by Avinash....
					Dwbtype: vWBKey // Added by Nagaraj.....
			};
			var oMultiInput1 = this.getView().byId("id_delivery");
			var aTokens = oMultiInput1.getTokens();

			var vLength = aTokens.length;
			var oItems = [];
			var vItem = 1;
			for (var i = 0; i < vLength; i++) {
				if (i > 0) {
					vItem = +vItem + +1;
				}
				var vTemp = {
					Config1: 'WPC',
					Vbeln: aTokens[i].getKey(),
					Config4: "S01",
					Werks: arr.Werks
						//	Item: vItem.toString()
				};
				oItems.push(vTemp);
			}
			oEntity.GateReturnNav = [];
			oEntity.NavGateEntry = oItems;
			// oEntity.GateEntryDmsNav = GateEntryDmsNav;
			oEntity.GatePrintNav = [{}];
			var oPath = '/GateEntrySet';
			oPostModel.create(oPath, oEntity, {
				success: function(oData, Response) {
					var vehicleinside = that.getView().getModel("i18n").getResourceBundle().getText("vehicleinside");
					if (oData.Wbid !== "") {
						if (oData.Msg === 'X') {
							MessageBox.error(vehicleinside);
							that.getBusyDialog.close();
						} else {
							vGReason = ""; //Added by Avinash...
							that.WbidTrans = oData.Wbid;
							var Transaction = that.getView().getModel("i18n").getResourceBundle().getText("weighTransaction");
							var Completed = that.getView().getModel("i18n").getResourceBundle().getText("Completed");
							sap.m.MessageBox.show(Transaction + " " + oData.Wbid, {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								actions: [MessageBox.Action.OK],
								title: that.getView().getModel("i18n").getResourceBundle().getText("Information"),
								onClose: function(oAction) {
									that.onDmsPost(oData.Wbid);
									if (oAction === "OK") {
										//============= added by chaithra on 30/6/2020 =============// 
										if (GvPrint == 'X') {
											MessageBox.show(that.oView.getModel("i18n").getResourceBundle().getText("Msg2"), {
												icon: MessageBox.Icon.INFORMATION,
												title: that.oView.getModel("i18n").getResourceBundle().getText("Information"),
												actions: [MessageBox.Action.YES, MessageBox.Action.NO],
												onClose: function(oAction) {
													if (oAction === 'YES') {
														var sServiceUrl = oPostModel.sServiceUrl;
														var sRead = "/ReprintSet(IvWbid='" + oData.Wbid + "')/$value";
														var pdfURL = sServiceUrl + sRead;
														if (sap.ui.Device.system.desktop) {
															that.initiatePdfDialog();
															var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
															that.oImageDialog.getContent()[0].setContent(oContent);
															that.oImageDialog.addStyleClass("sapUiSizeCompact");
															that.oImageDialog.open();
														} else {
															window.open(pdfURL);
														}
														that.fnClear();
														// that.getOwnerComponent().getRouter().navTo("Dashboard");  //Commented by Avinash
													}
													if (oAction === 'NO') {
														that.fnClear();
														that.getOwnerComponent().getRouter().navTo("Dashboard");
													}
												}
											});
										} else {
											that.fnClear();
											that.getOwnerComponent().getRouter().navTo("Dashboard");
										}
									}
								}
							});
						}
					}
					if (oData.GateReturnNav.results.length != 0) {
						if (oData.GateReturnNav.results[0].Type === "E") {
							var vErrorTxt = oData.GateReturnNav.results[0].Message;
							sap.m.MessageToast.show(vErrorTxt);
						}
					}

				},
				error: function(oResponse) {
					var vErrorTxt = that.getView().getModel("i18n").getResourceBundle().getText("ErrorinGateEntry");
					sap.m.MessageToast.show(vErrorTxt);
				}

			});
		},
		fnGateEntry: function() {
			var that = this;
			var oPostModel = that.getView().getModel('odata');
			var newdata = [];
			var arr = [];
			arr = that.getView().getModel('scannerData').getData();
			var data = arr.Vbeln;
			var vSelect = this.getView().byId("id_segmentbtn").getSelectedKey();
			var GateEntryDmsNav = [];
			var Wtype = "";
			if (arr.Wtype == undefined || arr.Wtype == "") {
				Wtype = "SALES";
			}
			if (that.getView().byId("processty").getSelectedKey() != undefined && that.getView().byId("processty").getSelectedKey() != "") {
				Wtype = that.getView().byId("processty").getSelectedKey();
			}
			// arr = that.getView().getModel('scannerData').getData();
			//Added by Avinash for port operation
			var vPortKey;
			if (that.getView().byId('id_PortOprid').getVisible()) {
				if (that.getView().byId('id_PortOprid').getState()) {
					vPortKey = "X";
				} else {
					vPortKey = "";
				}
			} else {
				vPortKey = "";
			}
			//End of added....
			if (vSelect !== "with") {
				var oEntity = {
					Config2: "S01",
					Config4: "WPC",
					InOut: "IN",
					Direction: "OUT",
					Remark: that.getView().byId("id_remarks").getValue(),
					Vehno: that.getView().byId("id_truckwith").getValue(),
					Dname: that.getView().byId("id_driverwith").getValue(),
					DriverId: that.getView().byId("id_driverId").getValue(),
					Werks: that.getView().byId("id_plantwithout").getValue(),
					Port_Op: vPortKey //Added by Avinash for Port Operation Flag
						// Challan: arr.Challan  //Added by Avinash....
				};

				var oItems = [];
				var vItem = 10;

				var vTemp = {
					Config1: 'WPC',
					Config4: "S01",
					Werks: arr.Werks,
					Item: vItem.toString()
				};
				oItems.push(vTemp);

			} else {
				var oEntity = {
					/*	Config1: arr.Vbeln,*/
					Config1: "WPC",
					Config4: "S01",
					InOut: "IN",
					Direction: "OUT",
					Wtype: Wtype,
					Vehno: arr.Truck,
					Vehtyp: arr.Vehtyp, //Added by IN_KARTHI
					Dname: arr.Dname,
					DriverId: arr.DriverId,
					Werks: arr.Werks,
					Gate: arr.Gate,
					Lifnr: arr.Lifnr,
					Remark: that.getView().byId("id_remarkswith").getValue(),
					Wbid: that.getView().byId("id_WeighbridgeProcess").getValue(),
					Config6: that.getView().byId("process").getSelectedKey(),
					DriverMob: arr.DriverMob
				};
				var oMultiInput1 = this.getView().byId("id_delivery");
				var aTokens = oMultiInput1.getTokens();

				var oMultiInput2 = this.getView().byId("id_MaDocGe");
				var aTokens1 = oMultiInput2.getTokens();

				if (this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N' && this.getView().byId("processty").getSelectedKey() ===
					"TRANSFER") {
					var vLength = aTokens1.length;
					var oItems = [];
					var vItem = 10;
					for (var i = 0; i < vLength; i++) {
						vItem = vItem + 10;
						var vTemp = {
							Config1: 'WPC',
							Mblnr: aTokens1[i].getKey().split("#")[0],
							Config4: "S01",
							Werks: arr.Werks,
							Mjahr: aTokens1[i].getKey().split("#")[1],
							Matnr: arrSelItem[i].Matnr,
							Zeile: arrSelItem[0].Zeile,
							Parnr: arr.Lifnr
						};
						oItems.push(vTemp);
					}
				} else {
					var vLength = aTokens.length;
					var oItems = [];
					var vItem = 10;
					for (var i = 0; i < vLength; i++) {
						vItem = vItem + 10;
						var vTemp = {
							Config1: 'WPC',
							Vbeln: aTokens[i].getKey(),
							Config4: "S01",
							Werks: arr.Werks
								//	Item: vItem.toString()
						};
						oItems.push(vTemp);
					}
				}
			}

			oEntity.NavGateEntry = oItems;
			// oEntity.GateEntryDmsNav = GateEntryDmsNav;
			oEntity.GatePrintNav = [{}];
			oEntity.GateReturnNav = [];
			var oPath = '/GateEntrySet';
			oPostModel.create(oPath, oEntity, {
				success: function(oData, Response) {
					var vehicleinside = that.getView().getModel("i18n").getResourceBundle().getText("vehicleinside");
					if (oData.Wbid !== "") {
						if (oData.Msg === 'X') {
							MessageBox.error(vehicleinside);
							that.getBusyDialog.close();
						} else {
							that.WbidTrans = oData.Wbid;
							var Transaction = that.getView().getModel("i18n").getResourceBundle().getText("Transaction");
							var Completed = that.getView().getModel("i18n").getResourceBundle().getText("Completed");
							// Added by Avinash
							var vTransCompleted;
							if (oData.GateReturnNav.results.length === 0) {
								vTransCompleted = Transaction + " " + oData.Wbid + " " + Completed;
							} else {
								vTransCompleted = oData.GateReturnNav.results[0].Message;
							}
							// End of Added
							sap.m.MessageBox.show(vTransCompleted, {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								actions: [MessageBox.Action.OK],
								title: that.getView().getModel("i18n").getResourceBundle().getText("Information"),
								onClose: function(oAction) {
									that.onDmsPost(oData.Wbid);
									if (oAction === "OK") {

										//that.getView().byId("id_selectedvtn").setSelectedKey("with");
										//============= added by chaithra on 30/6/2020 =============//
										// that.fnClear();
										// that.getOwnerComponent().getRouter().navTo("Dashboard");
										if (GvPrint == 'X') {
											MessageBox.show(that.oView.getModel("i18n").getResourceBundle().getText("Msg2"), {
												icon: MessageBox.Icon.INFORMATION,
												title: that.oView.getModel("i18n").getResourceBundle().getText("Information"),
												actions: [MessageBox.Action.YES, MessageBox.Action.NO],
												onClose: function(oAction) {
													if (oAction === 'YES') {
														var sServiceUrl = oPostModel.sServiceUrl;
														var sRead = "/ReprintSet(IvWbid='" + oData.Wbid + "')/$value";
														var pdfURL = sServiceUrl + sRead;
														if (sap.ui.Device.system.desktop) {
															that.initiatePdfDialog();
															var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
															that.oImageDialog.getContent()[0].setContent(oContent);
															that.oImageDialog.addStyleClass("sapUiSizeCompact");
															that.oImageDialog.open();
														} else {
															window.open(pdfURL);
														}
														that.fnClear();
														// that.getOwnerComponent().getRouter().navTo("Dashboard");
													}
													if (oAction === 'NO') {
														that.fnClear();
														// that.getOwnerComponent().getRouter().navTo("Dashboard");

													}
												}
											});
										} else {
											that.fnClear();
											that.getOwnerComponent().getRouter().navTo("Dashboard");
										}
									}
								}
							});
						}
					}
					if (oData.GateReturnNav.results.length != 0) {
						if (oData.GateReturnNav.results[0].Type === "E") {
							var vErrorTxt2 = oData.GateReturnNav.results[0].Message;
							var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
							sap.m.MessageBox.error(vErrorTxt2, {
								icon: sap.m.MessageBox.Icon.Error,
								title: vErr
							});
						}
					}

				},
				error: function(oResponse) {
					var vErrorTxt = that.getView().getModel("i18n").getResourceBundle().getText("ErrorinGateEntry");
					sap.m.MessageToast.show(vErrorTxt);
				}

			});
		},

		//===============================================================
		//------------------Clear  Function---------------
		//===============================================================
		fnClear: function() {
			this.getView().byId("id_WeighbridgeProcess").setValue("");
			this.getView().byId("id_delivery").setValue("");
			this.getView().byId("id_plantwithout").setValue("");
			this.getView().byId("id_driverwith").setValue("");
			this.getView().byId("id_truckwith").setValue("");
			this.getView().byId("id_remarkswith").setValue("");
			this.getView().byId("id_remarks").setValue("");
			this.getView().byId("id_remarks1").setValue("");
			this.getView().byId("id_truckwith1").setValue("");
			this.getView().byId("id_TruckType1").setSelectedKey("");
			this.getView().byId("id_driverwith1").setValue("");
			// this.getView().byId("id_plantwith1").setValue("");
			this.getView().byId("id_Gateno").setValue("");
			this.getView().byId("id_MobileNumber").setValue("");
			this.getView().byId("id_DriverMobile").setValue(""); //Added by Avinash
			this.getView().byId("id_VehType").setValue(""); //Added by Avinash
			this.getView().byId("id_TransType").setValue(""); //Added by Avinash
			this.getView().byId("id_Cnnum").setValue(""); //Added by Avinash
			this.getView().byId("processType").setSelectedKey("");
			this.getView().byId("process").setSelectedKey("");
			this.getView().byId("id_InTransport").setValue("");
			this.getView().byId("id_GEgateno").setValue("");
			this.getView().byId("id_driver").setValue("");
			this.getView().byId("id_truck").setValue("");
			// this.getView().byId("Cmsvalue").setValue("");
			// this.getView().byId("PurchValue").setValue("");
			this.getView().byId("Easyvalue").setValue("");
			this.getView().byId("SaleValue").setValue("");
			this.getView().byId("notavalue").setValue("");
			vclickscandelno = [];
			vclickscandelno1 = [];
			truckarray = [];
			arrSelItem = [];
			var oMultiInput1 = this.getView().byId("id_delivery");
			var aTokens = oMultiInput1.setTokens([]);
			var oMultiInputNota = this.getView().byId("notavalue");
			var dTokens = oMultiInputNota.setTokens([]);
			var oMultiInputEasy = this.getView().byId("Easyvalue");
			var bTokens = oMultiInputEasy.setTokens([]);
			var oMultiInputSales = this.getView().byId("SaleValue");
			var cTokens = oMultiInputSales.setTokens([]);
			// var oMultiInputPurchase = this.getView().byId("PurchValue");
			// var cTokens = oMultiInputPurchase.setTokens([]);
			// var oMultiInputCMS = this.getView().byId("Cmsvalue");
			// var bTokens = oMultiInputCMS.setTokens([]);
			var oMultiInputCMSSTO = this.getView().byId("cmsTovalue");
			var cmTokens = oMultiInputCMSSTO.setTokens([]);

			var vTemp = [{
				"Vbeln": ""
			}];

			var oManualDel = new sap.ui.model.json.JSONModel();
			oManualDel.setData(vTemp);
			this.getView().setModel(oManualDel, "JMManualDel");

			//Added by Pavan on 21/04/2023 Start
			var vTemp1 = [{
				"Mblnr": ""
			}];
			var oManualDel1 = new sap.ui.model.json.JSONModel();
			oManualDel1.setData(vTemp1);
			this.getView().setModel(oManualDel1, "JMManualMatDoc");
			//Added by Pavan on 21/04/2023 End
			//================ Added by chaithra ===========		
			this.Images = [];
			this.getView().getModel("MASS").setData([]);
			this.getView().getModel("MASS").refresh();
			// this.getView().byId("id_plantwith1desc").setText("");
			// this.getView().byId("id_Gatenodesc").setText(""); //Commented by Avinash
			// this.getView().byId("id_InTransportDesc").setText(""); //Commented by Avinash
			// this.getView().byId("id_GEgatenodesc").setText("");    //Commented by Avinash
			this.getView().byId("id_plantwithoutDesc").setText("");
			this.getView().byId("processty").setSelectedKey("");
			this.getView().byId("ReportSalesProcess").setSelectedKey("");
			this.getView().byId("id_ReporTransport").setValue("");
			// this.getView().byId("id_ReporTransportDesc").setText("");
			// this.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
			if (this.getView().getModel("oProceSalesModel").getData().length == 1) {
				this.getView().byId("process").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
				this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
			}
			if (this.getView().getModel("oProceeModel").getData().length == 1) {
				this.getView().byId("processty").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
				this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
			}
			//Added by Pavan on 20/04/2023 Start
			this.getView().getModel("MatDocList").setData([]);
			this.getView().getModel("MatDocList").refresh();
			this.getView().getModel("oMDItemModel").setData([]);
			this.getView().getModel("oMDItemModel").refresh();
			this.getView().byId("id_MatDocLabelGe").setVisible(false);
			this.getView().byId("id_MaDocGe").setVisible(false);
			var oMultiInputMatdoc = this.getView().byId("id_MaDocGe");
			var eTokens = oMultiInputMatdoc.setTokens([]);
			//Added by Pavan on 20/04/2023 End
		},
		fnexpandokwbid: function(weighbridgeid) {
			var that = this;
			var weighbridge = weighbridgeid.trim();
			var oGetModel = this.getView().getModel('odata');
			sap.ui.core.BusyIndicator.show();
			var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
			var vResErr = false;
			var vResErrMsg = "";
			// var oPath2 = "GateEntrySet?$filter=Wbid eq '" + weighbridgeid + "'and Flag eq 'E'&$expand=NavGateEntry,GateReturnNav";
			//Added by Avinash for Plant Validation...
			var oPath2 = "GateEntrySet?$filter=Wbid eq '" + weighbridgeid + "'and Werks eq '" + vPlant +
				"'and Flag eq 'E' &$expand=NavGateEntry,GateReturnNav";
			oGetModel.read(oPath2, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					for (var i = 0; i < oData.results[0].GateReturnNav.results.length; i++) {
						if (oData.results[0].GateReturnNav.results[i].Type == "E") {
							vResErr = true;
							vResErrMsg = vResErrMsg + oData.results[0].GateReturnNav.results[i].Message + "\n";
						}
					}
					if (!vResErr) {
						weighbridgescanned = "true";
						if (Announcement == "X") {
							// if ((oData.results[0].Config4 == "R01") && (oData.results[0].Config3 == "X")) {
							var oScanDataModel = new sap.ui.model.json.JSONModel();
							oScanDataModel.setData(oData.results[0]);
							that.getView().setModel(oScanDataModel, "scannerData");
							that.getView().byId("id_truck").setValue(oData.results[0].Vehno);
							if (oData.results[0].Config6 !== "" && oData.results[0].Config6 !== undefined) {
								that.getView().byId("process").setSelectedKey(oData.results[0].Config6.toUpperCase());
							} else {
								if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
									that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
									// this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
								}
							}
							if (oData.results[0].Wtype !== "" && oData.results[0].Wtype !== undefined) {
								that.getView().byId("processty").setSelectedKey(oData.results[0].Wtype.toUpperCase());
							} else {
								if (that.getView().getModel("oProceeModel").getData().length == 1) {
									that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].Wtype);
									// this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
								}
							}
							if (that.getView().byId("processty").getSelectedKey() !== "SALES") {
								// that.getView().byId("id_SalesProcessGateEntry").setVisible(false); //Commented by Avinash
								that.getView().byId("labelprocess").setVisible(false); //Added by Avinash
								that.getView().byId("process").setVisible(false); //Added by Avinash
							} else {
								if (that.getView().byId("process").getSelectedKey() == "") {
									that.getView().byId("process").setEnabled(true);
								}
								// that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
								that.getView().byId("labelprocess").setVisible(true); //Added by Avinash
								that.getView().byId("process").setVisible(true); //Added by Avinash
							}
							weighbridgeid = oData.results[0].Wbid;
							var slKey = oData.results[0].Config6;
							if (slKey !== "" && slKey !== undefined) {
								if (slKey == "DOMESTIC") {
									that.getView().byId("id_delivery").setEnabled(true);
								}
								if ((slKey == "EXPORT") || (slKey == "SCRAP")) {
									that.getView().byId("id_delivery").setEnabled(false);
								}
							}
							that.getView().getModel("scannerData").refresh();
							that.ondeliverycheck();
						}

						if (Announcement !== "X") {
							var oScanDataModel = new sap.ui.model.json.JSONModel();
							oScanDataModel.setData(oData.results[0]);
							that.getView().setModel(oScanDataModel, "scannerData");
							that.getView().byId("id_truck").setValue(oData.results[0].Vehno);
							if (oData.results[0].Config6 !== "" && oData.results[0].Config6 !== undefined) {
								that.getView().byId("process").setSelectedKey(oData.results[0].Config6.toUpperCase());
							} else {
								if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
									that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
									// this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
								}
							}
							if (oData.results[0].Wtype !== "" && oData.results[0].Wtype !== undefined) {
								that.getView().byId("processty").setSelectedKey(oData.results[0].Wtype.toUpperCase());
							} else {
								if (that.getView().getModel("oProceeModel").getData().length == 1) {
									that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].Wtype);
									// this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
								}
							}
							if (that.getView().byId("processty").getSelectedKey() != "SALES") {
								// that.getView().byId("id_SalesProcessGateEntry").setVisible(false);
								that.getView().byId("labelprocess").setVisible(false); //Added by Avinash
								that.getView().byId("process").setVisible(false); //Added by Avinash
							} else {
								if (that.getView().byId("process").getSelectedKey() == "") {
									that.getView().byId("process").setEnabled(true);
								}
								// that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
								that.getView().byId("labelprocess").setVisible(true); //Added by Avinash
								that.getView().byId("process").setVisible(true); //Added by Avinash
							}
							weighbridgeid = oData.results[0].Wbid;
							var slKey = oData.results[0].Config6;
							if (slKey !== "" && slKey !== undefined) {
								if (slKey == "DOMESTIC") {
									that.getView().byId("id_delivery").setEnabled(true);
								}
								if ((slKey == "EXPORT") || (slKey == "SCRAP")) {
									that.getView().byId("id_delivery").setEnabled(false);
								}
							}
							that.getView().getModel("scannerData").refresh();
							that.ondeliverycheck();
						}
					} else {
						that.getView().byId("id_WeighbridgeProcessManual").setValue("");
						var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
						sap.m.MessageBox.error(vResErrMsg, {
							icon: sap.m.MessageBox.Icon.Error,
							title: vErr
						});
					}
				},
				error: function() {
					sap.m.MessageToast("ReferenceError");
				}

			});
		},
		fnexpandok: function(vbeln, weighbridgeid) {
			var that = this;
			var msg = "";
			var weighbridge = weighbridgeid.trim();
			var oGetModel = this.getView().getModel('odata');

			var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
			var vResErr = false;
			var vResErrMsg = "";
			//Added by Avinash
			if (that.getView().byId('id_PortOprid').getState() && that.getView().byId('id_PortOprid').getVisible() && that.getView().getModel(
					"scannerData").getData()) {
				var vPortWbId = that.getView().getModel("scannerData").getData().Wbid;
				var oPath = "DeliverySet?$filter=Vbeln eq '" + vbeln +
					"'and PgiFlag eq 'X'and PortOp eq 'X'and Wbid eq '" + vPortWbId +
					"'and Werks eq '" + vPlant + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";
			} else {
				var oPath = "DeliverySet?$filter=Vbeln eq '" + vbeln +
					"'and PgiFlag eq 'X'and Werks eq '" + vPlant + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";
			}
			//End of added..

			// var oPath = "DeliverySet?$filter=Vbeln eq '" + vbeln + "'and Werks eq '" + vPlant +
			// 	"'and PgiFlag eq 'X'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";

			if ((parametercheck !== "X") && (!weighbridge) && (vbeln.length !== 12) && !that.getView().byId('id_PortOprid').getVisible() &&
				this.getView().getModel('oBatchEnable').getData()[0].CfmProcess !== "X") { //added for 2901 plant validation....
				sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("Errorinweighbridgescan"));
			} else {
				sap.ui.core.BusyIndicator.show();
				oGetModel.read(oPath, {
					success: function(oData) {
						//oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
						sap.ui.core.BusyIndicator.hide();
						// added by Srileaka on 28.01.2020
						truckarray.push(oData.results[0].DelEsOutNav.results[0].Truck);
						//end of code by Srileaka
						var oDataR = oData.results[0];
						if (oData.results[0].PickFlag === 'X') {
							var GateEntrytextDelivery = that.getView().getModel("i18n").getResourceBundle().getText("GateEntrytextDelivery");
							MessageBox.error(GateEntrytextDelivery + " " + oData.results[0].Vbeln, {
								actions: [MessageBox.Action.CLOSE],
								onClose: function(oAction) {
									//that.getBusyDialog.close();
									if (oAction === "CLOSE") {
										//that.getOwnerComponent().getRouter().navTo("Dashboard");
									}
								}
							});
						} else if (oData.results[0].PickFlag === 'Y') {
							var vCompletePick = this.getView().getModel("i18n").getResourceBundle().getText("CompletelyPicked");
							MessageBox.error(GateEntrytextDelivery + "  " + oData.results[0].Vbeln, {
								actions: [MessageBox.Action.CLOSE],
								onClose: function(oAction) {
									//that.getBusyDialog.close();
									if (oAction === "CLOSE") {
										var oMultiInput1 = that.getView().byId("id_delivery");
										var aTokens = oMultiInput1.setTokens([]);
										if (aTokens.length == 0) {
											that.getOwnerComponent().getRouter().navTo("Dashboard");
										}
									}
								}
							});
						} else {
							//Added by Avinash
							var vErrormsg = false;
							if (oDataR.DelReturnNav.results["length"] > 0) {
								if (oDataR.DelReturnNav.results[0].Type == "E") {
									vErrormsg = true;
								}
							}
							//Added by Avinash - 30th March CFM Validation...
							var vResErrMsg = "";
							if (that.getView().getModel('oBatchEnable').getData()[0].CfmProcess === "X") {
								if (that.getView().byId("processty").getSelectedKey() === "") {
									vErrormsg = true;
									vResErrMsg = vResErrMsg + that.getView().getModel("i18n").getResourceBundle().getText("PlsSelectPtype") + "\n";
									that.getView().byId("id_delivery").setVisible(false);
									that.getView().byId("id_DelLabel").setVisible(false);
								} else if (that.getView().byId("processty").getSelectedKey() == "TRANSFER") {
									vErrormsg = true;
									vResErrMsg = vResErrMsg + that.getView().getModel("i18n").getResourceBundle().getText("NotAllowed") + "\n";
									that.getView().byId("id_delivery").setVisible(false);
									that.getView().byId("id_DelLabel").setVisible(false);
								} else {
									that.getView().byId("id_delivery").setVisible(true);
									that.getView().byId("id_DelLabel").setVisible(true);
								}
							}
							//End of Added

							//End of added...
							if (vErrormsg) {
								if (that.getView().getModel('oBatchEnable').getData()[0].CfmProcess !== "X") {
									var vResErrMsg = "";
									for (var i = 0; i < oDataR.DelReturnNav.results.length; i++) {
										if (oDataR.DelReturnNav.results[i].Type == "E") {
											vResErrMsg = vResErrMsg + oData.results[0].DelReturnNav.results[i].Message + "\n";
										}
									}
									sap.m.MessageBox.error(vResErrMsg, {
										actions: [MessageBox.Action.CLOSE],
										onClose: function(oAction) {
											//that.getBusyDialog.close();
											if (oAction === "CLOSE") {
												//	that.getOwnerComponent().getRouter().navTo("Dashboard");
												//	that._ResetQRCode(that);
											}
										}
									});
								} else {
									sap.m.MessageBox.error(vResErrMsg);
								}
							} else {
								var vResWarMsg = "";
								var vResWar = false;
								for (var i = 0; i < oDataR.DelReturnNav.results.length; i++) {
									if (oDataR.DelReturnNav.results[i].Type == "W") {
										vResWar = true;
										vResWarMsg = vResWarMsg + oData.results[0].DelReturnNav.results[i].Message + "\n";
									}
								}
								if (vResWar) {
									MessageBox.show(vResWarMsg, {
										icon: MessageBox.Icon.WARNING,
										title: that.getView().getModel("i18n").getResourceBundle().getText("Warning"),
										actions: [MessageBox.Action.YES, MessageBox.Action.NO],
										onClose: function(oAction) {
											if (oAction == 'YES') {

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
													var vBatch = false;
													var count = 0;
													var vBatcharr = [];
													var n = oData.results[0].DelOutputNav.results.length;

													var vUniqueArry = [];
													for (var i = 0; i < n; i++) {

														if (oData.results[0].DelOutputNav.results[i].Lfimg === "0.000") {} else {
															vUniqueArry.push(oData.results[0].DelOutputNav.results[i]);
														}
													}

													for (var k = 0; k < vUniqueArry.length; k++) {
														if (vUniqueArry[k].Charg === "") {
															if (oData.results[0].DelOutputNav.results[0].Sto_flg === "X") { // Code added by kirubakaran on 31.08.2020 for without batch delivery number
																vBatch = false;
																break;
															} else {
																vBatch = true;
																break;
															}
														} else {
															vBatch = false;
														}
													}
													// added by dharma on 23-03-2021
													if (vBatch) {
														if (oData.results[0].DelOutputNav.results[0].Fbatc !== "X") {
															vBatch = false;
														}
													}
													// ended by dharma on 23-03-2021

													if (vBatch == false) {
														var val1 = oDataR.DelEsOutNav;
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
															that.getView().byId("id_truck").setEnabled(false);
														}

														if (val1.results[0].Config6 !== "" && val1.results[0].Config6 !== undefined) {
															that.getView().byId("process").setSelectedKey(val1.results[0].Config6.toUpperCase());
														} else {
															if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
																that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
																// this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
															}
														}
														if (val1.results[0].Wtype !== "" && val1.results[0].Wtype !== undefined) {
															that.getView().byId("processty").setSelectedKey(val1.results[0].Wtype.toUpperCase());
														} else {
															if (that.getView().getModel("oProceeModel").getData().length == 1) {
																that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].Wtype);
																// this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
															}
														}
														//Added by Avinash
														var vWerksDesc;
														if (oData.results[0].DelEsOutNav.results.length > 0) {
															vWerksDesc = oData.results[0].DelEsOutNav.results[0].WerksDesc;
														} else {
															vWerksDesc = "";
														}
														//End of added
														oSet = {
															"Vbeln": vbeln,
															"Werks": val1.results[0].Werks,
															"Truck": val1.results[0].Truck,
															"Dname": val1.results[0].Dname,
															"DriverId": val1.results[0].DriverId,
															"Nf_Number": val1.results[0].Nf_Number,
															"Ee_Number": val1.results[0].Ee_Number,
															"So_Number": val1.results[0].So_Number,
															"ProcessType": that.getView().byId("process").getSelectedKey(),
															"Wtype": that.getView().byId("processty").getSelectedKey(),
															"Pname": vWerksDesc, //Added by Avinash
															"Config6": that.getView().byId("process").getSelectedKey() //Added by Avinash
														};

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

														if (that.getView().byId("process").getSelectedKey() === "") {
															if (val1.results[0].Vtweg === "01") {
																that.getView().byId("process").setSelectedKey("EXPORT");
															} else {
																that.getView().byId("process").setSelectedKey("DOMESTIC");
															}
														}
														if (that.getView().byId("processty").getSelectedKey() == "SALES") {
															// that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
															that.getView().byId("labelprocess").setVisible(true); //Added by Avinash
															that.getView().byId("process").setVisible(true); //Added by Avinash
															if (that.getView().byId("process").getSelectedKey() == "" ||
																that.getView().byId("process").getSelectedKey() == undefined) {
																that.getView().byId("process").setEnabled(true);
															}
														} else {
															// that.getView().byId("id_SalesProcessGateEntry").setVisible(false);
															that.getView().byId("labelprocess").setVisible(false); //Added by Avinash
															that.getView().byId("process").setVisible(false); //Added by Avinash
														}

														if (weighbridge) {
															var weighbrideTruck = that.getView().byId("id_truck").getValue();
															if (weighbrideTruck) {
																weighbrideTruck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
															}
															var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("weightruckvalidate");
															if (val1.results[0].Truck.replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g, "").toUpperCase() &&
																val1.results[0].Truck.replace(/ +/g, "").toUpperCase() != "") {
																sap.m.MessageBox.error(weightruckvalidate);
																oMultiInput1.removeToken(vTokenv);
																return;
															}
															if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() == "") {
																val1.results[0].Truck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
															}
														}

														if (!weighbridge) {
															var oScanDataModel = new sap.ui.model.json.JSONModel();
															oScanDataModel.setData(oSet);
															that.getView().setModel(oScanDataModel, "scannerData");
															that.getView().getModel("scannerData").refresh();
														}

														//Added by Avinash for 2901 Plant..
														// if (oDataR.DelVendorNav.results.length > 0) {
														// 	that.getView().getModel("scannerData").getData().Lifnr = oDataR.DelVendorNav.results[0].Lifnr;
														// 	that.getView().getModel("scannerData").getData().Tr_Name = oDataR.DelVendorNav.results[0].Name1;
														// }
														// //End of added...
														// that.getView().getModel("scannerData").refresh();

													} else {
														var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("BatchNotMaintained");
														Errordeliverytext = Errordeliverytext + " " + vbeln;
														sap.m.MessageBox.error(Errordeliverytext, {
															actions: [MessageBox.Action.CLOSE],
															onClose: function(oAction) {}
														});
													}

												} else {
													var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("DeliveryAlreadyScaned");
													sap.m.MessageToast.show(Errordeliverytext);
												}

											} else {
												sap.m.MessageToast.show((that.getView().getModel("i18n").getResourceBundle().getText("ActionCancelled")));
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
										var vBatch = false;
										var count = 0;
										var vBatcharr = [];
										var n = oData.results[0].DelOutputNav.results.length;

										var vUniqueArry = [];
										for (var i = 0; i < n; i++) {

											if (oData.results[0].DelOutputNav.results[i].Lfimg === "0.000") {} else {
												vUniqueArry.push(oData.results[0].DelOutputNav.results[i]);
											}
										}

										for (var k = 0; k < vUniqueArry.length; k++) {
											if (vUniqueArry[k].Charg === "") {
												if (oData.results[0].DelOutputNav.results[0].Sto_flg === "X") { // Code added by kirubakaran on 31.08.2020 for without batch delivery number
													vBatch = false;
													break;
												} else if(vUniqueArry[k].BatchValidSkip === "X"){ // Added by Laxmikanth on 17/09/2025 for skip batch validation from material master	
													vBatch = false;
													break;
												}else {
													vBatch = true;
													break;
												}
											} else {
												vBatch = false;
											}
										}
										// added by dharma on 23-03-2021
										if (vBatch) {
											if (oData.results[0].DelOutputNav.results[0].Fbatc !== "X") {
												vBatch = false;
											}
										}
										// ended by dharma on 23-03-2021

										if (vBatch == false) {
											var val1 = oDataR.DelEsOutNav;
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
												that.getView().byId("id_truck").setEnabled(false);
											}

											if (val1.results[0].Config6 !== "" && val1.results[0].Config6 !== undefined) {
												that.getView().byId("process").setSelectedKey(val1.results[0].Config6.toUpperCase());
											} else {
												if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
													that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
													// this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
												}
											}
											if (val1.results[0].Wtype !== "" && val1.results[0].Wtype !== undefined) {
												that.getView().byId("processty").setSelectedKey(val1.results[0].Wtype.toUpperCase());
											} else {
												if (that.getView().getModel("oProceeModel").getData().length == 1) {
													that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].Wtype);
													// this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
												}
											}
											//Added by Avinash
											var vWerksDesc;
											if (oData.results[0].DelEsOutNav.results.length > 0) {
												vWerksDesc = oData.results[0].DelEsOutNav.results[0].WerksDesc;
											} else {
												vWerksDesc = "";
											}
											//End of added
											oSet = {
												"Vbeln": vbeln,
												"Werks": val1.results[0].Werks,
												"Truck": val1.results[0].Truck,
												"Dname": val1.results[0].Dname,
												"DriverId": val1.results[0].DriverId,
												"Nf_Number": val1.results[0].Nf_Number,
												"Ee_Number": val1.results[0].Ee_Number,
												"So_Number": val1.results[0].So_Number,
												"ProcessType": that.getView().byId("process").getSelectedKey(),
												"Wtype": that.getView().byId("processty").getSelectedKey(),
												"Pname": vWerksDesc, //Added by Avinash
												"Config6": that.getView().byId("process").getSelectedKey() //Added by Avinash
											};

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

											if (that.getView().byId("process").getSelectedKey() === "") {
												if (val1.results[0].Vtweg === "01") {
													that.getView().byId("process").setSelectedKey("EXPORT");
												} else {
													that.getView().byId("process").setSelectedKey("DOMESTIC");
												}
											}
											if (that.getView().byId("processty").getSelectedKey() == "SALES") {
												// that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
												that.getView().byId("labelprocess").setVisible(true); //Added by Avinash
												that.getView().byId("process").setVisible(true); //Added by Avinash
												if (that.getView().byId("process").getSelectedKey() == "" ||
													that.getView().byId("process").getSelectedKey() == undefined) {
													that.getView().byId("process").setEnabled(true);
												}
											} else {
												// that.getView().byId("id_SalesProcessGateEntry").setVisible(false);
												that.getView().byId("labelprocess").setVisible(false); //Added by Avinash
												that.getView().byId("process").setVisible(false); //Added by Avinash
											}

											if (weighbridge) {
												var weighbrideTruck = that.getView().byId("id_truck").getValue();
												if (weighbrideTruck) {
													weighbrideTruck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
												}
												var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("weightruckvalidate");
												if (val1.results[0].Truck.replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g, "").toUpperCase() &&
													val1.results[0].Truck.replace(/ +/g, "").toUpperCase() != "") {
													sap.m.MessageBox.error(weightruckvalidate);
													oMultiInput1.removeToken(vTokenv);
													return;
												}
												if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() == "") {
													val1.results[0].Truck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
												}
											}

											if (!weighbridge) {
												var oScanDataModel = new sap.ui.model.json.JSONModel();
												oScanDataModel.setData(oSet);
												that.getView().setModel(oScanDataModel, "scannerData");
												that.getView().getModel("scannerData").refresh();
											}

											//Added by Avinash for 2901 Plant..
											// if (oDataR.DelVendorNav.results.length > 0) {
											// 	that.getView().getModel("scannerData").getData().Lifnr = oDataR.DelVendorNav.results[0].Lifnr;
											// 	that.getView().getModel("scannerData").getData().Tr_Name = oDataR.DelVendorNav.results[0].Name1;
											// }
											// //End of added...
											// that.getView().getModel("scannerData").refresh();

										} else {
											var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("BatchNotMaintained");
											Errordeliverytext = Errordeliverytext + " " + vbeln;
											sap.m.MessageBox.error(Errordeliverytext, {
												actions: [MessageBox.Action.CLOSE],
												onClose: function(oAction) {}
											});
										}

									} else {
										var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("DeliveryAlreadyScaned");
										sap.m.MessageToast.show(Errordeliverytext);
									}
								}
							}
						}
						//added by srileaka 
						//to add truck no. to the null truck no.'s

						// if (truckarray.length > 1) {

						// 	for (var j = 0; j < truckarray.length; j++) {
						// 		if (truckarray[j] === "") {
						// 			truckarray[j] === truckarray[j + 1];
						// 		}
						// 	}
						// }
						var truckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("truckvalidate");
						var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("weightruckvalidate");

						if (weighbridge) {
							if (truckarray.length > 1) {
								for (var i = 0; i < truckarray.length; i++) {
									if (truckarray[i].replace(/ +/g, "").toUpperCase() !== weighbrideTruck.replace(/ +/g, "").toUpperCase() && truckarray[i].replace(
											/ +/g, "").toUpperCase() != "") {
										sap.m.MessageBox.error(weightruckvalidate);
										break;
									}
									if (truckarray[i].replace(/ +/g, "").toUpperCase() == "") {
										truckarray[i] = weighbrideTruck.replace(/ +/g, "").toUpperCase();
									}
								}
							}
						}
						if (truckarray.length > 1 && vlength > 1) { // Added by Srileaka for truck validation
							for (var k = 0; k < vlength; k++) {
								for (var j = 0; j < truckarray.length; j++) {
									// if (truckarray[j] === "") {
									// 	sap.m.MessageBox.error(truckvalidate);
									// 	//	that.onScannerCancel();
									// 	break;
									// } else 
									if ((truckarray[k].toUpperCase() !== truckarray[j].toUpperCase()) &&
										(truckarray[k].toUpperCase() !== "") &&
										(truckarray[j].toUpperCase() !== "")) {
										sap.m.MessageBox.error(truckvalidate);
										//	that.onScannerCancel();
										break;
									}
								}

								break;
							}

						}
						//	that.fnSegmentedwith(); // added by dharma on 21-01-2020
					},

					error: function() {
						var vError = that.getView().getModel("i18n").getResourceBundle().getText("Error");
						sap.m.MessageToast.show(vError);
						that.onScannerCancel();
					}
				});
			}
		},
		fnexpand: function(vbeln, weighbridgeid) {
			var that = this;
			var weighbridge = weighbridgeid;
			sap.ui.core.BusyIndicator.show();
			//	var vbeln = this.getView().byId("id_delivery").getValue();
			var oPath = "DeliverySet?$filter=Vbeln eq '" + vbeln + "'and PgiFlag eq 'X'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
			var oGetModel = this.getView().getModel('odata');
			oGetModel.read(oPath, {
				success: function(oData) {
					//oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
					sap.ui.core.BusyIndicator.hide();
					// added by Srileaka on 28.01.2020
					truckarray.push(oData.results[0].DelEsOutNav.results[0].Truck);
					//end of code by Srileaka
					var oDataR = oData.results[0];
					if (oData.results[0].PickFlag === 'X') {
						var GateEntrytextDelivery = that.getView().getModel("i18n").getResourceBundle().getText("GateEntrytextDelivery");
						MessageBox.error(GateEntrytextDelivery + " " + oData.results[0].Vbeln, {
							actions: [MessageBox.Action.CLOSE],
							onClose: function(oAction) {
								//that.getBusyDialog.close();
								if (oAction === "CLOSE") {
									//that.getOwnerComponent().getRouter().navTo("Dashboard");
								}
							}
						});
					} else if (oData.results[0].PickFlag === 'Y') {
						var vCompletePick = this.getView().getModel("i18n").getResourceBundle().getText("CompletelyPicked");
						MessageBox.error(GateEntrytextDelivery + "  " + oData.results[0].Vbeln, {
							actions: [MessageBox.Action.CLOSE],
							onClose: function(oAction) {
								//that.getBusyDialog.close();
								if (oAction === "CLOSE") {
									var oMultiInput1 = that.getView().byId("id_delivery");
									var aTokens = oMultiInput1.setTokens([]);
									if (aTokens.length == 0) {
										that.getOwnerComponent().getRouter().navTo("Dashboard");
									}
								}
							}
						});
					} else {
						if (oDataR.DelReturnNav.results["length"] !== 0) {

							sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
								actions: [MessageBox.Action.CLOSE],
								onClose: function(oAction) {
									//that.getBusyDialog.close();
									if (oAction === "CLOSE") {
										//	that.getOwnerComponent().getRouter().navTo("Dashboard");
										//	that._ResetQRCode(that);
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
								var vBatch = false;
								var count = 0;
								var vBatcharr = [];
								var n = oData.results[0].DelOutputNav.results.length;

								var vUniqueArry = [];
								for (var i = 0; i < n; i++) {

									if (oData.results[0].DelOutputNav.results[i].Lfimg === "0.000") {} else {
										vUniqueArry.push(oData.results[0].DelOutputNav.results[i]);
									}
								}

								for (var k = 0; k < vUniqueArry.length; k++) {
									if (vUniqueArry[k].Charg === "") {
										if (oData.results[0].DelOutputNav.results[0].Sto_flg === "X") { // Code added by kirubakaran on 31.08.2020 for without batch delivery number
											vBatch = false;
											break;
										} else {
											vBatch = true;
											break;
										}
									} else {
										vBatch = false;
									}
								}

								if (vBatch == false) {
									var val1 = oDataR.DelEsOutNav;
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
										that.getView().byId("id_truck").setEnabled(false);
									}
									if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
										that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
									}
									if (that.getView().getModel("oProceeModel").getData().length == 1) {
										that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].ProcessType);
									}
									oSet = {
										"Vbeln": vbeln,
										"Werks": val1.results[0].Werks,
										"Truck": val1.results[0].Truck,
										"Dname": val1.results[0].Dname,
										"DriverId": val1.results[0].DriverId,
										"Nf_Number": val1.results[0].Nf_Number,
										"Ee_Number": val1.results[0].Ee_Number,
										"So_Number": val1.results[0].So_Number,
										"ProcessType": that.getView().byId("process").getSelectedKey(),
										"Wtype": that.getView().byId("processty").getSelectedKey(),
										"Config6": that.getView().byId("process").getSelectedKey()
									};

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
									if (weighbridge) {
										var weighbrideTruck = that.getView().byId("id_truck").getValue();
										if (weighbrideTruck) {
											weighbrideTruck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
										}
										var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("weightruckvalidate");
										if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g, "").toUpperCase() &&
											val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() != "") {
											sap.m.MessageBox.error(weightruckvalidate);
											return;
										}
										if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() == "") {
											val1.results[0].Truck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
										}
									}
									if (!weighbridge) {
										var oScanDataModel = new sap.ui.model.json.JSONModel();
										oScanDataModel.setData(oSet);
										that.getView().setModel(oScanDataModel, "scannerData");
										that.getView().getModel("scannerData").refresh();
									}
								} else {
									var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("BatchNotMaintained");
									Errordeliverytext = Errordeliverytext + " " + vbeln;
									sap.m.MessageBox.error(Errordeliverytext, {
										actions: [MessageBox.Action.CLOSE],
										onClose: function(oAction) {}
									});
								}

							} else {
								var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("DeliveryAlreadyScaned");
								sap.m.MessageToast.show(Errordeliverytext);
							}

						}
					}
					//added by srileaka 
					//to add truck no. to the null truck no.'s

					// if (truckarray.length > 1) {

					// 	for (var j = 0; j < truckarray.length; j++) {
					// 		if (truckarray[j] === "") {
					// 			truckarray[j] === truckarray[j + 1];
					// 		}
					// 	}
					// }
					var truckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("truckvalidate");
					// if (weighbridge) {
					// 	if (truckarray.length > 1) {
					// 		for (var i = 0; i < truckarray.length; i++) {
					// 			if (truckarray[i].trim().toUpperCase() !== weighbrideTruck.trim().toUpperCase()) {
					// 				sap.m.MessageBox.error(truckvalidate1);

					// 				break;
					// 			}
					// 		}
					// 	}
					// }
					if (truckarray.length > 1 && vlength > 1) { // Added by Srileaka for truck validation
						for (var k = 0; k < vlength; k++) {
							for (var j = 0; j < truckarray.length; j++) {
								if (truckarray[j] === "") {
									sap.m.MessageBox.error(truckvalidate);
									//	that.onScannerCancel();
									break;
								} else if (truckarray[k] !== truckarray[j]) {
									sap.m.MessageBox.error(truckvalidate);
									//	that.onScannerCancel();
									break;
								}
							}

							break;
						}

					}

				},

				error: function() {
					sap.m.MessageToast.show("Error");
					that.onScannerCancel();
				}

			});
		},
		//===============================================================
		//------------------Process Function--------------------
		//===============================================================

		fnprocessChange: function(event) {
			var slKey = event.getSource().getSelectedKey();
			// if (slKey == "DOMESTIC") {
			// 	this.getView().byId("id_delivery").setEnabled(true);
			// }
			// if ((slKey == "EXPORT") ) {
			// 	this.getView().byId("id_delivery").setEnabled(false);
			// }
			if ((slKey == "SCRAP")) {
				this.getView().byId("id_delivery").setEnabled(false);
				this.getView().byId("id_driver").setEnabled(true);
				this.getView().byId("id_truck").setEnabled(true);
				this.getView().byId("process").setSelectedKey("SCRAP");
				this.getView().byId("id_MatDocLabelGe").setVisible(false); //Added by Pavan on 18/04/2023 
				this.getView().byId("id_MaDocGe").setVisible(false); //Added by Pavan on 18/04/2023 
				this.getView().byId("id_transCode").setText(this.getView().getModel("i18n").getResourceBundle().getText("Transporter")); //Added by Pavan on 25/04/2023
			} else if (slKey == "STO") {
				this.getView().byId("id_delivery").setEnabled(true);
				this.getView().byId("id_driver").setEnabled(true);
				this.getView().byId("id_truck").setEnabled(true);
				this.getView().byId("process").setSelectedKey("STO");
				this.getView().byId("id_MatDocLabelGe").setVisible(false); //Added by Pavan on 18/04/2023
				this.getView().byId("id_MaDocGe").setVisible(false); //Added by Pavan on 18/04/2023 
				this.getView().byId("id_transCode").setText(this.getView().getModel("i18n").getResourceBundle().getText("Transporter")); //Added by Pavan on 25/04/2023
			}
			//Added by Avinash -- CFM Changes
			else if (slKey == "SALES") {
				this.getView().byId("id_delivery").setEnabled(true);
				this.getView().byId("id_driver").setEnabled(true);
				this.getView().byId("id_truck").setEnabled(true);
				this.getView().byId("process").setSelectedKey("SALES");
				this.getView().byId("id_MatDocLabelGe").setVisible(false); //Added by Pavan on 18/04/2023
				this.getView().byId("id_MaDocGe").setVisible(false); //Added by Pavan on 18/04/2023
				this.getView().byId("id_transCode").setText(this.getView().getModel("i18n").getResourceBundle().getText("Transporter")); //Added by Pavan on 25/04/2023
				if (this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N') {
					this.getView().byId("id_transCode").setVisible(false);
					this.getView().byId("id_InTransport").setVisible(false);
				}
				this.getView().byId("id_DelLabel").setVisible(true);
				this.getView().byId("id_delivery").setVisible(true);
			} else if (slKey == "TRANSFER") {
				this.getView().byId("id_delivery").setEnabled(true);
				this.getView().byId("id_driver").setEnabled(true);
				this.getView().byId("id_truck").setEnabled(true);
				this.getView().byId("process").setSelectedKey("TRANSFER");
				this.getView().byId("id_delivery").setTokens([]); //Added on 29th March
				if (this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N') { //Added by Pavan on 18/04/2023 Start
					this.getView().byId("id_transCode").setVisible(true);
					this.getView().byId("id_InTransport").setVisible(true);
					this.getView().byId("id_MatDocLabelGe").setVisible(true);
					this.getView().byId("id_MaDocGe").setVisible(true);
					this.getView().byId("id_DelLabel").setVisible(false);
					this.getView().byId("id_delivery").setVisible(false);
					this.getView().byId("id_transCode").setText(this.getView().getModel("i18n").getResourceBundle().getText("Vendor")); //Added by Pavan on 25/04/2023 End
				}
			}
			//End of Added
			else if(slKey === "DIESEL"){
				// this.getView().byId("id_delivery").setEnabled(false);
				// this.getView().byId("id_driver").setEnabled(true);
				// this.getView().byId("id_truck").setEnabled(true);
				 this.getView().byId("id_DriverMobile").setEnabled(true);
				// this.getView().byId("process").setSelectedKey("DIESEL");
				this.getView().byId("id_delivery").setEnabled(true);
				this.getView().byId("id_driver").setEnabled(true);
				this.getView().byId("id_truck").setEnabled(true);
				this.getView().byId("process").setSelectedKey("DIESEL");
				this.getView().byId("id_MatDocLabelGe").setVisible(false); //Added by Pavan on 18/04/2023
				this.getView().byId("id_MaDocGe").setVisible(false); //Added by Pavan on 18/04/2023
				this.getView().byId("id_transCode").setText(this.getView().getModel("i18n").getResourceBundle().getText("Transporter")); //Added by Pavan on 25/04/2023
				if (this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N') {
					this.getView().byId("id_transCode").setVisible(false);
					this.getView().byId("id_InTransport").setVisible(false);
				}
				this.getView().byId("id_DelLabel").setVisible(true);
				this.getView().byId("id_delivery").setVisible(true);
			}
			else {
				this.getView().byId("id_delivery").setEnabled(true);
				this.getView().byId("id_driver").setEnabled(false);
				this.getView().byId("id_truck").setEnabled(false);
				this.getView().byId("id_MatDocLabelGe").setVisible(false); //Added by Pavan on 18/04/2023 
				this.getView().byId("id_MaDocGe").setVisible(false); //Added by Pavan on 18/04/2023 
				this.getView().byId("id_transCode").setText(this.getView().getModel("i18n").getResourceBundle().getText("Transporter")); //Added by Pavan on 25/04/2023
			}

		},
		//===============================================================
		//-------------------Reprint Function--------------------
		//===============================================================

		onClickReprint: function() {
			var oThat = this;
			oThat.Reprint = sap.ui.xmlfragment("LoadingConfirmation.fragment.RePrint", oThat);
			oThat.oView.addDependent(oThat.Reprint);
			oThat.Reprint.open();
			if (oThat.getView().byId('id_PortOprid').getVisible()) {
				sap.ui.getCore().byId('id_Rb1').setSelected(true);
				sap.ui.getCore().byId('rbg3').setVisible(true);
				// sap.ui.getCore().byId('id_ReprintGate').setVisible(true);
			} else {
				sap.ui.getCore().byId('rbg3').setVisible(false);
				// sap.ui.getCore().byId('id_ReprintGate').setVisible(false);
			}
		},
		onClickReprintDecline: function() {
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
		//===============================================================
		//-------------------Barcode Scan Function--------------------
		//===============================================================

		//Added by Avinash for Scanning Logic Changes -- Start
		// 
		
		// 
		

		onPressBarcode: function () {
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
							function (mResult) {
								if (!mResult.cancelled) {
									// oView.byId("idInOutBond").setValue(mResult.text.trim());
									oThat.onScanBarcode(mResult.text.trim());
								}
							},
							function (Error) {
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
								selectionChange: function (oEvt) {
									selectedDeviceId = oEvt.getSource().getSelectedKey();
									oThat._oScanQRDialog.close();
									codeReader.reset()

								}
							});

							sStartBtn = new sap.m.Button({
								text: oBundle.getText("Start"),
								type: oBundle.getText("Accept"),
								press: function () {
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

		onScanBarcode: function(oData1) {
			var that = this;
			//	that._ResetQRCode(that);
			var oGetModel = this.getView().getModel('odata');
			var weighbridge = that.getView().byId("id_WeighbridgeProcess").getValue();
			var msg = "";
			var weighbridgeerror = false;
			var truckvalidate1error = false;
			var GateEntrytextDelivery = this.getView().getModel("i18n").getResourceBundle().getText("GateEntrytextDelivery");
			// jQuery.sap.require("sap.ndc.BarcodeScanner");
			// sap.ndc.BarcodeScanner.scan(
			// 	function(oResult) {
			//	this.fnexpand();
			try {
				// var oData1 = oResult.text.trim();

				if (oData1) {
					// var vPortOpr = that.getView().byId('id_PortOprid').getState(); //Added by Avinash for IVC Rubber Changes
					var vPortOpr = that.getView().getModel('oBatchEnable').getData()[0].Port_Op; //Added by Avinash for IVC Rubber Changes
					// vPortOpr = false;
					if (vPortOpr) {
						if ((parametercheck !== "X") && (!weighbridge) && (oData1.length !== 12)) {
							sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("Errorinweighbridgescan"));
						} else {
							sap.ui.core.BusyIndicator.show();
							oData1 = oData1.split("#");
							if (oData1[0].startsWith("S")) {
								weighbridgescanned = "false";
								var oPath1 = "/DeliverySet?$filter=Tknum eq '" + oData1[1] + "'";
								oGetModel.read(oPath1, {
									success: function(oData) {
										vlength = oData.results.length;
										vclickscandelno.push(oData1);
										for (var i = 0; i < oData.results.length; i++) {
											if (oData.results[i].Vbeln) {
												that.fnexpand(oData.results[i].Vbeln, weighbridge);
											}
										}

									},
									error: function() {
										sap.ui.core.BusyIndicator.hide();
										that.onScannerCancel();
									}
								});
							} else {
								// var vdeliveryno = this.getView().byId("id_deliveryNo").getValue();
								// vclickscandelno.push(vdeliveryno);
								if (oData1[0].length != 12) {
									weighbridgescanned = "false";
									// Changed by Avinash for Port Operation Process
									var vPortWbId;
									var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
									if (that.getView().byId('id_PortOprid').getState() && that.getView().byId('id_PortOprid').getVisible() && that.getView().getModel(
											"scannerData").getData()) {
										vPortWbId = that.getView().getModel("scannerData").getData().Wbid;
										if (vPortWbId) {
											var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] +
												"'and PgiFlag eq 'X'and PortOp eq 'X'and Wbid eq '" + vPortWbId +
												"'and Werks eq '" + vPlant + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";
										}
									} else {
										var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] +
											"'and PgiFlag eq 'X'and Werks eq '" + vPlant + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";
									}
									if (!vPortWbId) {
										var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] +
											"'and PgiFlag eq 'X'and Werks eq '" + vPlant + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";
									}
									oGetModel.read(oPath, {
										success: function(oData) {
											// oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
											sap.ui.core.BusyIndicator.hide();
											var oDataR = oData.results[0];
											var vResErr = false;
											var vResWar = false;
											var vResErrMsg = "";
											var vResWarMsg = "";
											for (var i = 0; i < oData.results[0].DelReturnNav.results.length; i++) {
												if (oData.results[0].DelReturnNav.results[i].Type == "E") {
													vResErr = true;
													vResErrMsg = vResErrMsg + oData.results[0].DelReturnNav.results[i].Message + "\n";
												}
												if (oData.results[0].DelReturnNav.results[i].Type == "W") {
													vResWar = true;
													vResWarMsg = vResWarMsg + oData.results[0].DelReturnNav.results[i].Message + "\n";
												}
											}
											if (!vResErr) { //Added by AVinash for Port Operation
												if (!vResWar) {
													//code added by kirubkaran on 23.09.2020 for brazil plant 
													if (oData.results[0].DelOutputNav.results.length >= 1) { //Line added by Avinash
														if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
															//	that.getView().getModel("oViewModel").setProperty("/CMSProperty", true);
															that.getView().getModel("oViewModel").setProperty("/CmstoProperty", true);
															that.getView().getModel("oViewModel").setProperty("/EasyProperty", true);
															that.getView().getModel("oViewModel").setProperty("/SalesProperty", true);
														} else {
															that.getView().getModel("oViewModel").setProperty("/CmstoProperty", false);
														}
													} //Line added by Avinash
													if (oDataR.DelEsOutNav.results[0].Nf_Number === "") {
														that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
													} else {
														that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
													}
													//code ended by kirubkaran on 23.09.2020 for brazil plant 
													vclickscandelno.push(oData.results[0].DelEsOutNav.results[0]);
													vclickscandelno1.push(oData.results[0].DelEsOutNav.results[0]);
													var truckvalidate1 = that.getView().getModel("i18n").getResourceBundle().getText("truckvalidate");
													var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("weightruckvalidate");
													if (weighbridge) {
														var weighbrideTruck = that.getView().byId("id_truck").getValue();

														if (vclickscandelno.length > 1) {
															for (var i = 0; i < vclickscandelno1.length; i++) {
																if (vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g, "").toUpperCase() &&
																	vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() != "") {
																	sap.m.MessageBox.error(weightruckvalidate);
																	weighbridgeerror = true;
																	break;
																}
																if (vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() == "") {
																	vclickscandelno1[i].Truck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
																}
															}
														}
													}
													if (vclickscandelno.length > 1) {
														for (var i = 0; i < vclickscandelno.length; i++) {
															for (var j = 0; j < vclickscandelno1.length; j++) {
																if ((vclickscandelno[i].Truck.replace(/ +/g, "").toUpperCase() !== vclickscandelno1[j].Truck.replace(/ +/g,
																		"").toUpperCase()) && (vclickscandelno[i].Truck.replace(/ +/g, "").toUpperCase() !== "") &&
																	vclickscandelno1[j].Truck.replace(/ +/g,
																		"").toUpperCase() !== "") {
																	sap.m.MessageBox.error(truckvalidate1);
																	truckvalidate1error = true;
																	// that.onScannerCancel();
																	break;
																}
															}
															break;
														}
													}
													if ((weighbridgeerror === false) && (truckvalidate1error === false)) {
														if (vResErr) { //Added by Avinash
															if (oDataR.DelReturnNav.results[0].Type == 'E') {
																sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
																	actions: [MessageBox.Action.CLOSE],
																	onClose: function(oAction) {
																		//	that.getBusyDialog.close();
																		if (oAction === "CLOSE") {
																			var oMultiInput1 = that.getView().byId("id_delivery");
																			var aTokens = oMultiInput1.setTokens([]);
																			if (aTokens.length == 0) {
																				that.onScannerCancel();
																				//that._ResetQRCode(that);
																				//that.getOwnerComponent().getRouter().navTo("Dashboard");
																			}
																		}
																	}
																});
															}
														} else {
															if (oData.results[0].PickFlag === 'X') {
																MessageBox.error(GateEntrytextDelivery + "  " + oData.results[0].Vbeln, {
																	actions: [MessageBox.Action.CLOSE],
																	onClose: function(oAction) {
																		//that.getBusyDialog.close();
																		if (oAction === "CLOSE") {
																			var oMultiInput1 = that.getView().byId("id_delivery");
																			var aTokens = oMultiInput1.setTokens([]);
																			if (aTokens.length == 0) {
																				that.getOwnerComponent().getRouter().navTo("Dashboard");
																			}
																		}
																	}
																});
															} else if (oData.results[0].PickFlag === 'Y') {
																var vCompletePick = this.getView().getModel("i18n").getResourceBundle().getText("CompletelyPicked");
																MessageBox.error(GateEntrytextDelivery + "  " + oData.results[0].Vbeln, {
																	actions: [MessageBox.Action.CLOSE],
																	onClose: function(oAction) {
																		//that.getBusyDialog.close();
																		if (oAction === "CLOSE") {
																			var oMultiInput1 = that.getView().byId("id_delivery");
																			var aTokens = oMultiInput1.setTokens([]);
																			if (aTokens.length == 0) {
																				that.getOwnerComponent().getRouter().navTo("Dashboard");
																			}
																		}
																	}
																});
															} else {
																// if (oDataR.DelReturnNav.results[0]) {
																if (vResErr) { //Changed by Avinash
																	if (oDataR.DelReturnNav.results[0].Type == 'E') {
																		sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
																			actions: [MessageBox.Action.CLOSE],
																			onClose: function(oAction) {
																				//that.getBusyDialog.close();
																				if (oAction === "CLOSE") {
																					var oMultiInput1 = that.getView().byId("id_delivery");
																					var aTokens = oMultiInput1.setTokens([]);
																					if (aTokens.length == 0) {
																						that.getOwnerComponent().getRouter().navTo("Dashboard");
																						that._ResetQRCode(that);
																					}
																					//	that.getOwnerComponent().getRouter().navTo("Dashboard");
																				}
																			}
																		});

																	}
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
																		var vBatch = false;
																		var n = oData.results[0].DelOutputNav.results.length;

																		var vUniqueArry = [];
																		for (var i = 0; i < n; i++) {

																			if (oData.results[0].DelOutputNav.results[i].Lfimg === "0.000") {} else {
																				vUniqueArry.push(oData.results[0].DelOutputNav.results[i]);
																			}
																		}

																		for (var k = 0; k < vUniqueArry.length; k++) {
																			if (vUniqueArry[k].Charg === "") {
																				if (oData.results[0].DelOutputNav.results[0].Sto_flg === "X") { // Code added by kirubakaran on 31.08.2020 for without batch delivery number
																					vBatch = false;
																					break;
																				} else {
																					vBatch = true;
																					break;
																				}
																			} else {
																				vBatch = false;
																			}
																		}
																		if (vBatch) {
																			if (oData.results[0].DelOutputNav.results[0].Fbatc !== "X") {
																				vBatch = false;
																			}
																		}

																		if (vBatch == false) {
																			var val1 = oDataR.DelEsOutNav;
																			var val2 = oDataR.DelOutputNav;
																			var oJSONModel = new sap.ui.model.json.JSONModel();
																			if (oData.results[0].DelVendorNav.results.length !== "0") {
																				var Lifnr = oData.results[0].DelVendorNav.results[0].Lifnr;
																			}
																			var oSet;
																			if (val1.results[0].Dname === "") {
																				that.getView().byId("id_driver").setEnabled(true);
																			} else {
																				that.getView().byId("id_driver").setEnabled(false);
																			}
																			if (val1.results[0].Truck === "") {
																				that.getView().byId("id_truck").setEnabled(true);
																			} else {
																				that.getView().byId("id_truck").setEnabled(false);
																			}
																			// if(that.getView().getModel("oProceSalesModel").getData().length == 0){
																			// 	var arr = [
																			// 		{
																			// 			ProcessType : "DOMESTIC"
																			// 		},
																			// 		{
																			// 			ProcessType : "EXPORT"
																			// 		}
																			// 	];
																			// 	that.getView().getModel("oProceSalesModel").setData(arr);
																			// 	that.getView().getModel("oProceSalesModel").refresh();
																			// }

																			if (val1.results[0].Config6 !== "" && val1.results[0].Config6 != undefined) {
																				that.getView().byId("process").setSelectedKey(val1.results[0].Config6.toUpperCase());
																			} else {
																				if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
																					that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
																					// this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
																				}
																			}
																			if (val1.results[0].Wtype !== "" && val1.results[0].Wtype != undefined) {
																				that.getView().byId("processty").setSelectedKey(val1.results[0].Wtype.toUpperCase());
																			} else {
																				if (that.getView().getModel("oProceeModel").getData().length == 1) {
																					that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].Wtype);
																					// this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
																				}
																			}

																			if (that.getView().byId("process").getSelectedKey() === "") {
																				if (val2.results[0].Vtweg === "01") {
																					that.getView().byId("process").setSelectedKey("EXPORT");
																				} else {
																					that.getView().byId("process").setSelectedKey("DOMESTIC");
																				}
																			}
																			// if(that.getView().getModel("oProceeModel").getData().length == 0){
																			// 	var aJson = {
																			// 		Wtype : "SALES"
																			// 	};
																			// 	var arr = [];
																			// 	arr.push(aJson);
																			// 	that.getView().getModel("oProceeModel").setData(arr);
																			// 	that.getView().getModel("oProceeModel").refresh();
																			// }
																			// if(that.getView().byId("processty").getSelectedKey() === ""){
																			// 	that.getView().byId("processty").setSelectedKey("SALES");
																			// 	that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
																			// }
																			if (that.getView().byId("processty").getSelectedKey() == "SALES") {

																				// that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
																				that.getView().byId("labelprocess").setVisible(true); //Added by Avinash
																				that.getView().byId("process").setVisible(true); //Added by Avinash
																				if (that.getView().byId("process").getSelectedKey() == "" ||
																					that.getView().byId("process").getSelectedKey() == undefined) {
																					that.getView().byId("process").setEnabled(true);
																				}
																			} else {
																				// that.getView().byId("id_SalesProcessGateEntry").setVisible(false);
																				that.getView().byId("labelprocess").setVisible(false); //Added by Avinash
																				that.getView().byId("process").setVisible(false); //Added by Avinash
																			}
																			//Added by Avinash to overwrite Lifnr if it is null..
																			var vPortOpr = false;
																			if (that.getView().byId('id_PortOprid').getVisible()) {
																				if (that.getView().byId('id_PortOprid').getState()) {
																					vPortOpr = true;
																				}
																			}
																			if (vPortOpr) {
																				if (Lifnr) {
																					oSet = {
																						"Vbeln": oData1[0],
																						"Werks": val1.results[0].Werks,
																						"Lifnr": Lifnr,
																						"Truck": val1.results[0].Truck,
																						"Dname": val1.results[0].Dname,
																						"DriverId": val1.results[0].DriverId,
																						"Nf_Number": val1.results[0].Nf_Number,
																						"Ee_Number": val1.results[0].Ee_Number,
																						"So_Number": val1.results[0].So_Number,
																						"ProcessType": that.getView().byId("process").getSelectedKey(),
																						"Wtype": that.getView().byId("processty").getSelectedKey(),
																						"Config6": that.getView().byId("process").getSelectedKey(), // added by dharma on 02-02-2021
																						"Pname": val1.results[0].WerksDesc //added by avinash
																					};
																					// that.getView().byId("id_InTransport").setValue(Lifnr);
																				} else {
																					oSet = {
																						"Vbeln": oData1[0],
																						"Werks": val1.results[0].Werks,
																						// "Lifnr": Lifnr,
																						"Truck": val1.results[0].Truck,
																						"Dname": val1.results[0].Dname,
																						"DriverId": val1.results[0].DriverId,
																						"Nf_Number": val1.results[0].Nf_Number,
																						"Ee_Number": val1.results[0].Ee_Number,
																						"So_Number": val1.results[0].So_Number,
																						"ProcessType": that.getView().byId("process").getSelectedKey(),
																						"Wtype": that.getView().byId("processty").getSelectedKey(),
																						"Config6": that.getView().byId("process").getSelectedKey(), // added by dharma on 02-02-2021
																						"Pname": val1.results[0].WerksDesc //added by avinash
																					};
																				}
																			}
																			//End of added...
																			else {
																				oSet = {
																					"Vbeln": oData1[0],
																					"Werks": val1.results[0].Werks,
																					"Lifnr": Lifnr,
																					"Truck": val1.results[0].Truck,
																					"Dname": val1.results[0].Dname,
																					"DriverId": val1.results[0].DriverId,
																					"Nf_Number": val1.results[0].Nf_Number,
																					"Ee_Number": val1.results[0].Ee_Number,
																					"So_Number": val1.results[0].So_Number,
																					"ProcessType": that.getView().byId("process").getSelectedKey(),
																					"Wtype": that.getView().byId("processty").getSelectedKey(),
																					"Config6": that.getView().byId("process").getSelectedKey(), // added by dharma on 02-02-2021
																					"Pname": val1.results[0].WerksDesc //added by avinash
																				};
																				// that.getView().byId("id_InTransport").setValue(Lifnr);
																			}

																			// oSet = {
																			// 	"Vbeln": oData1[0],
																			// 	"Werks": val1.results[0].Werks,
																			// 	"Lifnr": Lifnr,
																			// 	"Truck": val1.results[0].Truck,
																			// 	"Dname": val1.results[0].Dname,
																			// 	"DriverId": val1.results[0].DriverId,
																			// 	"Nf_Number": val1.results[0].Nf_Number,
																			// 	"Ee_Number": val1.results[0].Ee_Number,
																			// 	"So_Number": val1.results[0].So_Number,
																			// 	"ProcessType": that.getView().byId("process").getSelectedKey(),
																			// 	"Wtype": that.getView().byId("processty").getSelectedKey(),
																			// 	"Config6": that.getView().byId("process").getSelectedKey() // added by dharma on 02-02-2021
																			// };
																			// that.getView().byId("id_InTransport").setValue(Lifnr);
																			if (weighbridge) {
																				if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g,
																						"")
																					.toUpperCase() && val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() != "") {
																					sap.m.MessageBox.error(weightruckvalidate);
																					truckvalidate1error = true;
																					// weighbridgeerror = true;
																					// if (that.getView().getModel('JMDelvery')) {
																					// 	var vData = that.getView().getModel('JMDelvery').getData();
																					// }
																					return;
																				}
																				if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() == "") {
																					val1.results[0].Truck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
																				}
																			}
																			if (!weighbridge) {
																				var oScanDataModel = new sap.ui.model.json.JSONModel();
																				oScanDataModel.setData(oSet);
																				that.getView().setModel(oScanDataModel, "scannerData");
																				if (that.getView().getModel('JMDelvery')) {
																					var vData = that.getView().getModel('JMDelvery').getData();
																				}
																			}
																			if (!vData) {
																				var vData = [];
																			}
																			vData.push({
																				"Vbeln": oData1[0],
																				"Ee_Number": val1.results[0].Ee_Number,
																				"So_Number": val1.results[0].So_Number,
																				"Nf_Number": val1.results[0].Nf_Number,
																				"Cms_Tonumber": val1.results[0].Cms_Tonumber
																			});
																			if (oData1[0]) {
																				if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
																					var oMultiInput1 = that.getView().byId("id_delivery");
																					var oMultiInputCMSSTO = that.getView().byId("cmsTovalue");
																					var oMultiInputEasy = that.getView().byId("Easyvalue");
																					var oMultiInputSale = that.getView().byId("SaleValue");
																					var oMultiInputNota = that.getView().byId("notavalue");

																					var aTokens = oMultiInput1.getTokens();
																					var cmTokens = oMultiInputCMSSTO.getTokens();
																					var bTokens = oMultiInputEasy.getTokens();
																					var cTokens = oMultiInputSale.getTokens();
																					var dTokens = oMultiInputNota.getTokens();
																				} else {

																					var oMultiInput1 = that.getView().byId("id_delivery");
																					var oMultiInputEasy = that.getView().byId("Easyvalue");
																					var oMultiInputSale = that.getView().byId("SaleValue");
																					var oMultiInputNota = that.getView().byId("notavalue");

																					var aTokens = oMultiInput1.getTokens();
																					var bTokens = oMultiInputEasy.getTokens();
																					var cTokens = oMultiInputSale.getTokens();
																					var dTokens = oMultiInputNota.getTokens();

																				}
																				var vTokenv = new sap.m.Token({
																					text: oData1[0],
																					key: oData1[0]
																				});
																				aTokens.push(vTokenv);
																				if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
																					var cTokenv = new sap.m.Token({
																						text: val1.results[0].Cms_Tonumber,
																						key: val1.results[0].Cms_Tonumber
																					});
																					cmTokens.push(cTokenv);

																					oMultiInputCMSSTO.removeAllTokens();
																					oMultiInputCMSSTO.setTokens(cmTokens);
																				}
																				var eTokenv = new sap.m.Token({
																					text: val1.results[0].Ee_Number,
																					key: val1.results[0].Ee_Number
																				});
																				bTokens.push(eTokenv);

																				var sTokenv = new sap.m.Token({
																					text: val1.results[0].So_Number,
																					key: val1.results[0].So_Number
																				});
																				cTokens.push(sTokenv);

																				oMultiInputEasy.removeAllTokens();
																				oMultiInputEasy.setTokens(bTokens);

																				oMultiInputSale.removeAllTokens();
																				oMultiInputSale.setTokens(cTokens);

																				var nTokenv = new sap.m.Token({
																					text: val1.results[0].Nf_Number,
																					key: val1.results[0].Nf_Number
																				});
																				dTokens.push(nTokenv);

																				oMultiInput1.removeAllTokens();
																				oMultiInput1.setTokens(aTokens);

																				oMultiInputNota.removeAllTokens();
																				oMultiInputNota.setTokens(dTokens);

																			}
																			if (truckvalidate1error == false) {
																				if (!weighbridge) {
																					var oScanDataModel = new sap.ui.model.json.JSONModel();
																					oScanDataModel.setData(vData);
																					that.getView().setModel(oScanDataModel, "JMDelvery");
																				}

																				if (vclickscandelno.length > 1) {
																					// for (var i = 0; i < vclickscandelno.length; i++) {
																					// 	if (vclickscandelno[i].Truck === vclickscandelno[i + 1].Truck) {

																					// 		// sap.m.MessageBox.error(truckvalidate1);
																					// 		that.onScannerCancel();
																					// 	}

																					// 	break;
																					// }
																					var vclickscandelno2 = [];
																					var vclickscandelno3 = [];

																					for (var i = 0; i < vclickscandelno.length; i++) {
																						for (var j = 0; j < vclickscandelno1.length; j++) {
																							if (vclickscandelno[i].Truck === " ") {
																								sap.m.MessageBox.error(truckvalidate1);
																								truckvalidate1error = true;
																								that.onScannerCancel();
																								// that._ResetQRCode(that);
																								break;
																							} else if (vclickscandelno[i].Truck.replace(/ +/g, "").toUpperCase() !== vclickscandelno1[j].Truck.replace(
																									/ +/g, "").toUpperCase()) {
																								vclickscandelno = vclickscandelno2;
																								vclickscandelno1 = vclickscandelno3;
																								//hat.onScannerCancel();
																								// that._onObjectMatched();
																								break;
																							}
																						}
																						break;
																					}

																				}
																			}
																			if (weighbridge) {
																				// var weighbrideTruck = that.getView().byId("id_truck").getValue();
																				if (vclickscandelno1.length > 1) {
																					for (var i = 0; i < vclickscandelno1.length; i++) {
																						if (vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g,
																								"")
																							.toUpperCase() && vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() != "") {
																							weighbridgeerror = true;
																							// that.onScannerCancel();
																							break;
																						}
																					}
																				}
																			}
																			//Added by Avinash for 2901 Plant..
																			if (oDataR.DelVendorNav.results.length > 0) {
																				if (oDataR.DelVendorNav.results[0].Lifnr !== "") {
																					that.getView().getModel("scannerData").getData().Lifnr = oDataR.DelVendorNav.results[0].Lifnr;
																					that.getView().getModel("scannerData").getData().Tr_Name = oDataR.DelVendorNav.results[0].Name1;
																				}
																			}
																			//End of added...
																			that.getView().getModel("scannerData").refresh();
																		} else {
																			var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("BatchNotMaintained");
																			Errordeliverytext = Errordeliverytext + " " + oData1[0];
																			sap.m.MessageBox.error(Errordeliverytext, {
																				actions: [MessageBox.Action.CLOSE],
																				onClose: function(oAction) {}
																			});
																		}
																	} else {
																		var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("DeliveryAlreadyScaned");
																		sap.m.MessageToast.show(Errordeliverytext);
																	}
																}
															}
														}
														that.getView().byId("id_WeighbridgeProcess").setValue(weighbridgeid);
													}
												} else {
													MessageBox.show(vResWarMsg, {
														icon: MessageBox.Icon.WARNING,
														title: that.getView().getModel("i18n").getResourceBundle().getText("Warning"),
														actions: [MessageBox.Action.YES, MessageBox.Action.NO],
														onClose: function(oAction) {
															if (oAction == 'YES') {
																if (oData.results[0].DelOutputNav.results.length >= 1) { //Line added by Avinash
																	if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
																		//	that.getView().getModel("oViewModel").setProperty("/CMSProperty", true);
																		that.getView().getModel("oViewModel").setProperty("/CmstoProperty", true);
																		that.getView().getModel("oViewModel").setProperty("/EasyProperty", true);
																		that.getView().getModel("oViewModel").setProperty("/SalesProperty", true);
																	} else {
																		that.getView().getModel("oViewModel").setProperty("/CmstoProperty", false);
																	}
																} //Line added by Avinash
																if (oDataR.DelEsOutNav.results[0].Nf_Number === "") {
																	that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
																} else {
																	that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
																}
																//code ended by kirubkaran on 23.09.2020 for brazil plant 
																vclickscandelno.push(oData.results[0].DelEsOutNav.results[0]);
																vclickscandelno1.push(oData.results[0].DelEsOutNav.results[0]);
																var truckvalidate1 = that.getView().getModel("i18n").getResourceBundle().getText("truckvalidate");
																var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("weightruckvalidate");
																if (weighbridge) {
																	var weighbrideTruck = that.getView().byId("id_truck").getValue();

																	if (vclickscandelno.length > 1) {
																		for (var i = 0; i < vclickscandelno1.length; i++) {
																			if (vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g,
																					"").toUpperCase() &&
																				vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() != "") {
																				sap.m.MessageBox.error(weightruckvalidate);
																				weighbridgeerror = true;
																				break;
																			}
																			if (vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() == "") {
																				vclickscandelno1[i].Truck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
																			}
																		}
																	}
																}
																if (vclickscandelno.length > 1) {
																	for (var i = 0; i < vclickscandelno.length; i++) {
																		for (var j = 0; j < vclickscandelno1.length; j++) {
																			if ((vclickscandelno[i].Truck.replace(/ +/g, "").toUpperCase() !== vclickscandelno1[j].Truck.replace(/ +/g,
																					"").toUpperCase()) && (vclickscandelno[i].Truck.replace(/ +/g, "").toUpperCase() !== "") &&
																				vclickscandelno1[j].Truck.replace(/ +/g,
																					"").toUpperCase() !== "") {
																				sap.m.MessageBox.error(truckvalidate1);
																				truckvalidate1error = true;
																				// that.onScannerCancel();
																				break;
																			}
																		}
																		break;
																	}
																}
																if ((weighbridgeerror === false) && (truckvalidate1error === false)) {
																	if (vResErr) { //Added by Avinash
																		if (oDataR.DelReturnNav.results[0].Type == 'E') {
																			sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
																				actions: [MessageBox.Action.CLOSE],
																				onClose: function(oAction) {
																					//	that.getBusyDialog.close();
																					if (oAction === "CLOSE") {
																						var oMultiInput1 = that.getView().byId("id_delivery");
																						var aTokens = oMultiInput1.setTokens([]);
																						if (aTokens.length == 0) {
																							that.onScannerCancel();
																							//that._ResetQRCode(that);
																							//that.getOwnerComponent().getRouter().navTo("Dashboard");
																						}
																					}
																				}
																			});
																		}
																	} else {
																		if (oData.results[0].PickFlag === 'X') {
																			MessageBox.error(GateEntrytextDelivery + "  " + oData.results[0].Vbeln, {
																				actions: [MessageBox.Action.CLOSE],
																				onClose: function(oAction) {
																					//that.getBusyDialog.close();
																					if (oAction === "CLOSE") {
																						var oMultiInput1 = that.getView().byId("id_delivery");
																						var aTokens = oMultiInput1.setTokens([]);
																						if (aTokens.length == 0) {
																							that.getOwnerComponent().getRouter().navTo("Dashboard");
																						}
																					}
																				}
																			});
																		} else if (oData.results[0].PickFlag === 'Y') {
																			var vCompletePick = this.getView().getModel("i18n").getResourceBundle().getText("CompletelyPicked");
																			MessageBox.error(GateEntrytextDelivery + "  " + oData.results[0].Vbeln, {
																				actions: [MessageBox.Action.CLOSE],
																				onClose: function(oAction) {
																					//that.getBusyDialog.close();
																					if (oAction === "CLOSE") {
																						var oMultiInput1 = that.getView().byId("id_delivery");
																						var aTokens = oMultiInput1.setTokens([]);
																						if (aTokens.length == 0) {
																							that.getOwnerComponent().getRouter().navTo("Dashboard");
																						}
																					}
																				}
																			});
																		} else {
																			// if (oDataR.DelReturnNav.results[0]) {
																			if (vResErr) { //Changed by Avinash
																				if (oDataR.DelReturnNav.results[0].Type == 'E') {
																					sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
																						actions: [MessageBox.Action.CLOSE],
																						onClose: function(oAction) {
																							//that.getBusyDialog.close();
																							if (oAction === "CLOSE") {
																								var oMultiInput1 = that.getView().byId("id_delivery");
																								var aTokens = oMultiInput1.setTokens([]);
																								if (aTokens.length == 0) {
																									that.getOwnerComponent().getRouter().navTo("Dashboard");
																									that._ResetQRCode(that);
																								}
																								//	that.getOwnerComponent().getRouter().navTo("Dashboard");
																							}
																						}
																					});

																				}
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
																					var vBatch = false;
																					var n = oData.results[0].DelOutputNav.results.length;

																					var vUniqueArry = [];
																					for (var i = 0; i < n; i++) {

																						if (oData.results[0].DelOutputNav.results[i].Lfimg === "0.000") {} else {
																							vUniqueArry.push(oData.results[0].DelOutputNav.results[i]);
																						}
																					}

																					for (var k = 0; k < vUniqueArry.length; k++) {
																						if (vUniqueArry[k].Charg === "") {
																							if (oData.results[0].DelOutputNav.results[0].Sto_flg === "X") { // Code added by kirubakaran on 31.08.2020 for without batch delivery number
																								vBatch = false;
																								break;
																							} else {
																								vBatch = true;
																								break;
																							}
																						} else {
																							vBatch = false;
																						}
																					}
																					if (vBatch) {
																						if (oData.results[0].DelOutputNav.results[0].Fbatc !== "X") {
																							vBatch = false;
																						}
																					}

																					if (vBatch == false) {
																						var val1 = oDataR.DelEsOutNav;
																						var val2 = oDataR.DelOutputNav;
																						var oJSONModel = new sap.ui.model.json.JSONModel();
																						if (oData.results[0].DelVendorNav.results.length !== "0") {
																							var Lifnr = oData.results[0].DelVendorNav.results[0].Lifnr;
																						}
																						// if (that.getView().byId('id_PortOprid').getVisible()) {

																						// }
																						var oSet;
																						if (val1.results[0].Dname === "") {
																							that.getView().byId("id_driver").setEnabled(true);
																						} else {
																							that.getView().byId("id_driver").setEnabled(false);
																						}
																						if (val1.results[0].Truck === "") {
																							that.getView().byId("id_truck").setEnabled(true);
																						} else {
																							that.getView().byId("id_truck").setEnabled(false);
																						}
																						// if(that.getView().getModel("oProceSalesModel").getData().length == 0){
																						// 	var arr = [
																						// 		{
																						// 			ProcessType : "DOMESTIC"
																						// 		},
																						// 		{
																						// 			ProcessType : "EXPORT"
																						// 		}
																						// 	];
																						// 	that.getView().getModel("oProceSalesModel").setData(arr);
																						// 	that.getView().getModel("oProceSalesModel").refresh();
																						// }

																						if (val1.results[0].Config6 !== "" && val1.results[0].Config6 != undefined) {
																							that.getView().byId("process").setSelectedKey(val1.results[0].Config6.toUpperCase());
																						} else {
																							if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
																								that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0]
																									.ProcessType);
																								// this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
																							}
																						}
																						if (val1.results[0].Wtype !== "" && val1.results[0].Wtype != undefined) {
																							that.getView().byId("processty").setSelectedKey(val1.results[0].Wtype.toUpperCase());
																						} else {
																							if (that.getView().getModel("oProceeModel").getData().length == 1) {
																								that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].Wtype);
																								// this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
																							}
																						}

																						if (that.getView().byId("process").getSelectedKey() === "") {
																							if (val2.results[0].Vtweg === "01") {
																								that.getView().byId("process").setSelectedKey("EXPORT");
																							} else {
																								that.getView().byId("process").setSelectedKey("DOMESTIC");
																							}
																						}
																						// if(that.getView().getModel("oProceeModel").getData().length == 0){
																						// 	var aJson = {
																						// 		Wtype : "SALES"
																						// 	};
																						// 	var arr = [];
																						// 	arr.push(aJson);
																						// 	that.getView().getModel("oProceeModel").setData(arr);
																						// 	that.getView().getModel("oProceeModel").refresh();
																						// }
																						// if(that.getView().byId("processty").getSelectedKey() === ""){
																						// 	that.getView().byId("processty").setSelectedKey("SALES");
																						// 	that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
																						// }
																						if (that.getView().byId("processty").getSelectedKey() == "SALES") {
																							// that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
																							that.getView().byId("labelprocess").setVisible(true); //Added by Avinash
																							that.getView().byId("process").setVisible(true); //Added by Avinash
																							if (that.getView().byId("process").getSelectedKey() == "" ||
																								that.getView().byId("process").getSelectedKey() == undefined) {
																								that.getView().byId("process").setEnabled(true);
																							}
																						} else {
																							// that.getView().byId("id_SalesProcessGateEntry").setVisible(false);
																							that.getView().byId("labelprocess").setVisible(false); //Added by Avinash
																							that.getView().byId("process").setVisible(false); //Added by Avinash
																						}
																						//Added by Avinash to overwrite Lifnr if it is null..
																						var vPortOpr = false;
																						if (that.getView().byId('id_PortOprid').getVisible()) {
																							if (that.getView().byId('id_PortOprid').getState()) {
																								vPortOpr = true;
																							}
																						}
																						if (vPortOpr) {
																							if (Lifnr) {
																								oSet = {
																									"Vbeln": oData1[0],
																									"Werks": val1.results[0].Werks,
																									"Lifnr": Lifnr,
																									"Truck": val1.results[0].Truck,
																									"Dname": val1.results[0].Dname,
																									"DriverId": val1.results[0].DriverId,
																									"Nf_Number": val1.results[0].Nf_Number,
																									"Ee_Number": val1.results[0].Ee_Number,
																									"So_Number": val1.results[0].So_Number,
																									"ProcessType": that.getView().byId("process").getSelectedKey(),
																									"Wtype": that.getView().byId("processty").getSelectedKey(),
																									"Config6": that.getView().byId("process").getSelectedKey() // added by dharma on 02-02-2021
																								};
																								// that.getView().byId("id_InTransport").setValue(Lifnr);
																							} else {
																								oSet = {
																									"Vbeln": oData1[0],
																									"Werks": val1.results[0].Werks,
																									// "Lifnr": Lifnr,
																									"Truck": val1.results[0].Truck,
																									"Dname": val1.results[0].Dname,
																									"DriverId": val1.results[0].DriverId,
																									"Nf_Number": val1.results[0].Nf_Number,
																									"Ee_Number": val1.results[0].Ee_Number,
																									"So_Number": val1.results[0].So_Number,
																									"ProcessType": that.getView().byId("process").getSelectedKey(),
																									"Wtype": that.getView().byId("processty").getSelectedKey(),
																									"Config6": that.getView().byId("process").getSelectedKey() // added by dharma on 02-02-2021
																								};
																							}
																						}
																						//End of added...
																						else {
																							oSet = {
																								"Vbeln": oData1[0],
																								"Werks": val1.results[0].Werks,
																								"Lifnr": Lifnr,
																								"Truck": val1.results[0].Truck,
																								"Dname": val1.results[0].Dname,
																								"DriverId": val1.results[0].DriverId,
																								"Nf_Number": val1.results[0].Nf_Number,
																								"Ee_Number": val1.results[0].Ee_Number,
																								"So_Number": val1.results[0].So_Number,
																								"ProcessType": that.getView().byId("process").getSelectedKey(),
																								"Wtype": that.getView().byId("processty").getSelectedKey(),
																								"Config6": that.getView().byId("process").getSelectedKey() // added by dharma on 02-02-2021
																							};
																							// that.getView().byId("id_InTransport").setValue(Lifnr);
																						}
																						if (weighbridge) {
																							if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(
																									/ +/g,
																									"")
																								.toUpperCase() && val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() != "") {
																								sap.m.MessageBox.error(weightruckvalidate);
																								truckvalidate1error = true;
																								// weighbridgeerror = true;
																								// if (that.getView().getModel('JMDelvery')) {
																								// 	var vData = that.getView().getModel('JMDelvery').getData();
																								// }
																								return;
																							}
																							if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() == "") {
																								val1.results[0].Truck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
																							}
																						}
																						if (!weighbridge) {
																							var oScanDataModel = new sap.ui.model.json.JSONModel();
																							oScanDataModel.setData(oSet);
																							that.getView().setModel(oScanDataModel, "scannerData");
																							if (that.getView().getModel('JMDelvery')) {
																								var vData = that.getView().getModel('JMDelvery').getData();
																							}
																						}
																						if (!vData) {
																							var vData = [];
																						}
																						vData.push({
																							"Vbeln": oData1[0],
																							"Ee_Number": val1.results[0].Ee_Number,
																							"So_Number": val1.results[0].So_Number,
																							"Nf_Number": val1.results[0].Nf_Number,
																							"Cms_Tonumber": val1.results[0].Cms_Tonumber
																						});
																						if (oData1[0]) {
																							if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
																								var oMultiInput1 = that.getView().byId("id_delivery");
																								var oMultiInputCMSSTO = that.getView().byId("cmsTovalue");
																								var oMultiInputEasy = that.getView().byId("Easyvalue");
																								var oMultiInputSale = that.getView().byId("SaleValue");
																								var oMultiInputNota = that.getView().byId("notavalue");

																								var aTokens = oMultiInput1.getTokens();
																								var cmTokens = oMultiInputCMSSTO.getTokens();
																								var bTokens = oMultiInputEasy.getTokens();
																								var cTokens = oMultiInputSale.getTokens();
																								var dTokens = oMultiInputNota.getTokens();
																							} else {

																								var oMultiInput1 = that.getView().byId("id_delivery");
																								var oMultiInputEasy = that.getView().byId("Easyvalue");
																								var oMultiInputSale = that.getView().byId("SaleValue");
																								var oMultiInputNota = that.getView().byId("notavalue");

																								var aTokens = oMultiInput1.getTokens();
																								var bTokens = oMultiInputEasy.getTokens();
																								var cTokens = oMultiInputSale.getTokens();
																								var dTokens = oMultiInputNota.getTokens();

																							}
																							var vTokenv = new sap.m.Token({
																								text: oData1[0],
																								key: oData1[0]
																							});
																							aTokens.push(vTokenv);
																							if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
																								var cTokenv = new sap.m.Token({
																									text: val1.results[0].Cms_Tonumber,
																									key: val1.results[0].Cms_Tonumber
																								});
																								cmTokens.push(cTokenv);

																								oMultiInputCMSSTO.removeAllTokens();
																								oMultiInputCMSSTO.setTokens(cmTokens);
																							}
																							var eTokenv = new sap.m.Token({
																								text: val1.results[0].Ee_Number,
																								key: val1.results[0].Ee_Number
																							});
																							bTokens.push(eTokenv);

																							var sTokenv = new sap.m.Token({
																								text: val1.results[0].So_Number,
																								key: val1.results[0].So_Number
																							});
																							cTokens.push(sTokenv);

																							oMultiInputEasy.removeAllTokens();
																							oMultiInputEasy.setTokens(bTokens);

																							oMultiInputSale.removeAllTokens();
																							oMultiInputSale.setTokens(cTokens);

																							var nTokenv = new sap.m.Token({
																								text: val1.results[0].Nf_Number,
																								key: val1.results[0].Nf_Number
																							});
																							dTokens.push(nTokenv);

																							oMultiInput1.removeAllTokens();
																							oMultiInput1.setTokens(aTokens);

																							oMultiInputNota.removeAllTokens();
																							oMultiInputNota.setTokens(dTokens);

																						}
																						if (truckvalidate1error == false) {
																							if (!weighbridge) {
																								var oScanDataModel = new sap.ui.model.json.JSONModel();
																								oScanDataModel.setData(vData);
																								that.getView().setModel(oScanDataModel, "JMDelvery");
																							}

																							if (vclickscandelno.length > 1) {
																								// for (var i = 0; i < vclickscandelno.length; i++) {
																								// 	if (vclickscandelno[i].Truck === vclickscandelno[i + 1].Truck) {

																								// 		// sap.m.MessageBox.error(truckvalidate1);
																								// 		that.onScannerCancel();
																								// 	}

																								// 	break;
																								// }
																								var vclickscandelno2 = [];
																								var vclickscandelno3 = [];

																								for (var i = 0; i < vclickscandelno.length; i++) {
																									for (var j = 0; j < vclickscandelno1.length; j++) {
																										if (vclickscandelno[i].Truck === " ") {
																											sap.m.MessageBox.error(truckvalidate1);
																											truckvalidate1error = true;
																											that.onScannerCancel();
																											// that._ResetQRCode(that);
																											break;
																										} else if (vclickscandelno[i].Truck.replace(/ +/g, "").toUpperCase() !== vclickscandelno1[j].Truck.replace(
																												/ +/g, "").toUpperCase()) {
																											vclickscandelno = vclickscandelno2;
																											vclickscandelno1 = vclickscandelno3;
																											//hat.onScannerCancel();
																											// that._onObjectMatched();
																											break;
																										}
																									}
																									break;
																								}

																							}
																						}
																						if (weighbridge) {
																							// var weighbrideTruck = that.getView().byId("id_truck").getValue();
																							if (vclickscandelno1.length > 1) {
																								for (var i = 0; i < vclickscandelno1.length; i++) {
																									if (vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(
																											/ +/g,
																											"")
																										.toUpperCase() && vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() != "") {
																										weighbridgeerror = true;
																										// that.onScannerCancel();
																										break;
																									}
																								}
																							}
																						}
																						that.getView().getModel("scannerData").refresh();
																					} else {
																						var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText(
																							"BatchNotMaintained");
																						Errordeliverytext = Errordeliverytext + " " + oData1[0];
																						sap.m.MessageBox.error(Errordeliverytext, {
																							actions: [MessageBox.Action.CLOSE],
																							onClose: function(oAction) {}
																						});
																					}
																				} else {
																					var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText(
																						"DeliveryAlreadyScaned");
																					sap.m.MessageToast.show(Errordeliverytext);
																				}
																			}
																		}
																	}
																	that.getView().byId("id_WeighbridgeProcess").setValue(weighbridgeid);
																}
															} else {
																sap.m.MessageToast.show((that.getView().getModel("i18n").getResourceBundle().getText("ActionCancelled")));
															}
														}
													});
												}
											} //Added by Avinash
											else {
												var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
												sap.m.MessageBox.error(vResErrMsg, {
													icon: sap.m.MessageBox.Icon.Error,
													title: vErr
												});
											}
											//End of added
										},
										error: function() {
											// sap.m.MessageToast("Error");
											that.onScannerCancel();
										}

									});
								}
								if (oData1[0].length === 12) {
									var msg1 = "";
									var msg2 = "";
									var proceedvalidation = true;
									// Changed by Avinash for Port Operation
									var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
									// var vPlant = this.getOwnerComponent().getModel("localModel").getProperty("/plant");
									if (that.getView().byId('id_PortOprid').getState() && that.getView().byId('id_PortOprid').getVisible()) {
										var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] +
											"'and Flag eq 'E'and Werks eq '" + vPlant + "'&$expand=NavGateEntry,GateReturnNav";
									} else {
										var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] +
											"'and Flag eq 'E'and Werks eq '" + vPlant + "'&$expand=NavGateEntry,GateReturnNav";
									}

									// var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] +
									// 	"'and Flag eq 'E'&$expand=NavGateEntry,GateReturnNav";

									oGetModel.read(oPath2, {
										success: function(oData) {
											//Added by Avinash for adding validation while scanning WBID....
											var vResErr = false;
											var vResErrMsg = "";
											if (oData.results[0].GateReturnNav.results.length > 0) {
												for (var i = 0; i < oData.results[0].GateReturnNav.results.length; i++) {
													if (oData.results[0].GateReturnNav.results[i].Type == "E") {
														vResErr = true;
														vResErrMsg = vResErrMsg + oData.results[0].GateReturnNav.results[i].Message + "\n";
													}
												}
											}
											if (!vResErr) {
												//End of added
												weighbridgescanned = "true";
												sap.ui.core.BusyIndicator.hide();
												if ((Announcement === "X") && (Reporting === "X")) {
													if ((oData.results[0].Config4 != "R01") || (oData.results[0].Config3 != "X")) {

														if (oData.results[0].Config3 != "X") {
															msg2 = msg2 + that.getView().getModel("i18n").getProperty("Gateerror123");
															proceedvalidation = false;
														}

														if (oData.results[0].Config4 != "R01") {
															msg2 = msg2 + that.getView().getModel("i18n").getProperty("Gateerrorprocessed");
															proceedvalidation = false;
														}
														var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
														sap.m.MessageBox.error(msg2, {
															icon: sap.m.MessageBox.Icon.Error,
															title: vErr
														});
													}
												}
												if ((Announcement === "X") && (Reporting === "")) {

													if (oData.results[0].Config4 != "R01") {
														msg1 = msg1 + that.getView().getModel("i18n").getProperty("Gateerrorprocessed");
														proceedvalidation = false;
														var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
														sap.m.MessageBox.error(msg1, {
															icon: sap.m.MessageBox.Icon.Error,
															title: vErr
														});
													}

												}
												if ((Announcement === "") && (Reporting === "")) {
													proceedvalidation = true;
												}

												// if (Announcement !== "X") {
												// 	if ((oData.results[0].Config4 == "R01") && (oData.results[0].Config3 == "X")) {
												// 		var oScanDataModel = new sap.ui.model.json.JSONModel();
												// 		oScanDataModel.setData(oData.results[0]);
												// 		that.getView().setModel(oScanDataModel, "scannerData");
												// 		that.getView().byId("id_truck").setValue(oData.results[0].Vehno);
												// 		that.getView().byId("process").setSelectedKey(oData.results[0].Config6.toUpperCase());

												// 		weighbridgeid = oData.results[0].Wbid;
												// 		var slKey = oData.results[0].Config6;
												// 		if (slKey.toUpperCase() == "DOMESTIC") {
												// 			that.getView().byId("id_delivery").setEnabled(true);
												// 		}
												// 		if (slKey.toUpperCase() == "EXPORT") {
												// 			that.getView().byId("id_delivery").setEnabled(false);
												// 		}
												// 		that.getView().getModel("scannerData").refresh();
												// 	}
												// }
												if (proceedvalidation) {
													// if ((oData.results[0].Config4 == "R01") && (oData.results[0].Config3 == "X")) {
													var oScanDataModel = new sap.ui.model.json.JSONModel();
													oScanDataModel.setData(oData.results[0]);
													that.getView().setModel(oScanDataModel, "scannerData");
													that.getView().byId("id_truck").setValue(oData.results[0].Vehno);
													// that.getView().byId("id_GEgatenodesc").setText(oData.results[0].Gname); //Added by Avinash on 10/05/21

													// var arr = [{
													// 	ProcessType : oData.results[0].Config6.toUpperCase()
													// }];
													// that.getView().getModel("oProceSalesModel").setData(arr);
													// that.getView().getModel("oProceSalesModel").refresh();

													// that.getView().byId("process").setSelectedKey(oData.results[0].Config6.toUpperCase());
													// that.getView().byId("processty").setSelectedKey(oData.results[0].Wtype.toUpperCase());

													if (oData.results[0].Config6 !== "" && oData.results[0].Config6 !== undefined) {
														that.getView().byId("process").setSelectedKey(oData.results[0].Config6.toUpperCase());
													} else {
														if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
															that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
															// this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
														}
													}
													if (oData.results[0].Wtype !== "" && oData.results[0].Wtype !== undefined) {
														that.getView().byId("processty").setSelectedKey(oData.results[0].Wtype.toUpperCase());
													} else {
														if (that.getView().getModel("oProceeModel").getData().length == 1) {
															that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].Wtype);
															// this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
														}
													}

													if (that.getView().byId("processty").getSelectedKey() != "SALES") {
														// that.getView().byId("id_SalesProcessGateEntry").setVisible(false);
														that.getView().byId("labelprocess").setVisible(false); //Added by Avinash
														that.getView().byId("process").setVisible(false); //Added by Avinash
													} else {
														if (that.getView().byId("process").getSelectedKey() == "") {
															that.getView().byId("process").setEnabled(true);
														}
														// that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
														that.getView().byId("labelprocess").setVisible(true); //Added by Avinash
														that.getView().byId("process").setVisible(true); //Added by Avinash
													}
													weighbridgeid = oData.results[0].Wbid;
													var slKey = oData.results[0].Config6;
													if (slKey != undefined && slKey !== "") {
														if (slKey.toUpperCase() == "DOMESTIC") {
															that.getView().byId("id_delivery").setEnabled(true);
														}
														if ((slKey == "EXPORT") || (slKey == "SCRAP")) {
															that.getView().byId("id_delivery").setEnabled(false);
														}
													}
													//Added by Avinash for Breakdown Scenario...
													vGDname = that.getView().getModel("scannerData").getData().Dname;
													vGLifnr = that.getView().getModel("scannerData").getData().Lifnr;
													vGChallan = that.getView().getModel("scannerData").getData().Challan;
													vGDriverMob = that.getView().getModel("scannerData").getData().DriverMob;
													vGTruck = that.getView().getModel("scannerData").getData().Truck;
													vGRemarks = that.getView().getModel("scannerData").getData().Remark;
													vGCnnum = that.getView().getModel("scannerData").getData().Cnnum;
													//End of Added...

													that.getView().getModel("scannerData").refresh();

												}
											} else {
												sap.ui.core.BusyIndicator.hide();
												sap.m.MessageBox.error(vResErrMsg);
											}
										},
										error: function() {
											sap.m.MessageBox.error(that.getView().getModel("i18n").getProperty("HTTPFail"));
											sap.ui.core.BusyIndicator.hide();
										}

									});

								}
								if (weighbridgeerror === true) {
									var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("weightruckvalidate");

									sap.m.MessageBox.error(weightruckvalidate);
								}
								if (truckvalidate1error === true) {
									//	var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("truckvalidate1error");
									var truckvalidate1 = that.getView().getModel("i18n").getResourceBundle().getText("truckvalidate");

									sap.m.MessageBox.error(truckvalidate1);
								}
							}

						}
					} else {
						// Added by Avinash for IVC Rubber STO Operation Switched on

						sap.ui.core.BusyIndicator.show();
						oData1 = oData1.split("#");
						if (oData1[0].startsWith("S")) {
							weighbridgescanned = "false";
							var oPath1 = "/DeliverySet?$filter=Tknum eq '" + oData1[1] + "'";
							oGetModel.read(oPath1, {
								success: function(oData) {
									vlength = oData.results.length;
									vclickscandelno.push(oData1);
									for (var i = 0; i < oData.results.length; i++) {
										if (oData.results[i].Vbeln) {
											that.fnexpand(oData.results[i].Vbeln, weighbridge);
										}
									}

								},
								error: function() {
									sap.ui.core.BusyIndicator.hide();
									that.onScannerCancel();
								}
							});
						} else {
							// var vdeliveryno = this.getView().byId("id_deliveryNo").getValue();
							// vclickscandelno.push(vdeliveryno);
							if (oData1[0].length != 12) {
								weighbridgescanned = "false";
								// Changed by Avinash for Port Operation Process
								var vPortWbId;
								var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
								var vFlag = "X";
								// if (that.getView().byId('id_PortOprid').getState() && that.getView().byId('id_PortOprid').getEnabled() && that.getView().getModel(
								// 		"scannerData").getData()) {
								// 	vPortWbId = that.getView().getModel("scannerData").getData().Wbid;
								// 	if (vPortWbId) {
								// 		var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] +
								// 			"'and PgiFlag eq 'X'and PortOp eq 'X'and Wbid eq '" + vPortWbId +
								// 			"'and Werks eq '" + vPlant + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";
								// 	}
								// } else {
								// 	var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] +
								// 		"'and PgiFlag eq 'X'and Werks eq '" + vPlant + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";
								// }
								// if (!vPortWbId) {
								//Commented by Pavan on 18/04/2023 Start
								/*var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] +
									"'and PgiFlag eq 'X'and Werks eq '" + vPlant + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";*/
								//Commented by Pavan on 18/04/2023 End
								// }
								//Added by Pavan on 18/04/2023 Start
								if (this.getView().getModel("oBatchEnable").getData()[0].Origin === 'N') {
									var oPath = "F4Set?$filter=IvMblnr eq '" + oData1[0] + "'and Werks eq '" + vPlant + "' and F4Mblnr eq '" + vFlag +
										"'and Gjahr eq '" + oData1[1] + "'&$expand=F4MbItemNav";
									that.fnGetMatDoclist(oPath);
									return;
								} else {
									var oPath = "DeliverySet?$filter=Vbeln eq '" + oData1[0] + "'and PgiFlag eq 'X'and Werks eq '" + vPlant +
										"'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav,DelVendorNav";
								}
								//Added by Pavan on 18/04/2023 End
								oGetModel.read(oPath, {
									success: function(oData) {
										// oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
										sap.ui.core.BusyIndicator.hide();
										var oDataR = oData.results[0];
										var vResErr = false;
										var vResErrMsg = "";
										for (var i = 0; i < oData.results[0].DelReturnNav.results.length; i++) {
											if (oData.results[0].DelReturnNav.results[i].Type == "E") {
												vResErr = true;
												vResErrMsg = vResErrMsg + oData.results[0].DelReturnNav.results[i].Message + "\n";
											}
										}
										//Added by Avinash - 29th March CFM Validation...
										if (that.getView().getModel('oBatchEnable').getData()[0].CfmProcess === "X") {
											if (that.getView().byId("processty").getSelectedKey() === "") {
												vResErr = true;
												vResErrMsg = vResErrMsg + that.getView().getModel("i18n").getResourceBundle().getText("PlsSelectPtype") + "\n";
											} else if (that.getView().byId("processty").getSelectedKey() == "TRANSFER") {
												vResErr = true;
												vResErrMsg = vResErrMsg + that.getView().getModel("i18n").getResourceBundle().getText("NotAllowed") + "\n";
											}
										}
										//End of Added
										if (!vResErr) { //Added by AVinash for Port Operation
											//code added by kirubkaran on 23.09.2020 for brazil plant 
											if (oData.results[0].DelOutputNav.results.length >= 1) { //Line added by Avinash
												if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
													//	that.getView().getModel("oViewModel").setProperty("/CMSProperty", true);
													that.getView().getModel("oViewModel").setProperty("/CmstoProperty", true);
													that.getView().getModel("oViewModel").setProperty("/EasyProperty", true);
													that.getView().getModel("oViewModel").setProperty("/SalesProperty", true);
												} else {
													that.getView().getModel("oViewModel").setProperty("/CmstoProperty", false);
												}
											} //Line added by Avinash

											//Added by Avinash on 04/1/2022
											if (that.getView().getModel('oBatchEnable').getData()[0].CfmProcess === "X") {
												that.getView().getModel('oBatchEnable').getData()[0].Vbeln = "X";
											}
											that.getView().getModel('oBatchEnable').refresh(true);
											//Ended by Avinash

											if (oDataR.DelEsOutNav.results[0].Nf_Number === "") {
												that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
											} else {
												that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
											}

											//code ended by kirubkaran on 23.09.2020 for brazil plant 
											vclickscandelno.push(oData.results[0].DelEsOutNav.results[0]);
											vclickscandelno1.push(oData.results[0].DelEsOutNav.results[0]);
											var truckvalidate1 = that.getView().getModel("i18n").getResourceBundle().getText("truckvalidate");
											var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("weightruckvalidate");
											if (weighbridge) {
												var weighbrideTruck = that.getView().byId("id_truck").getValue();

												if (vclickscandelno.length > 1) {
													for (var i = 0; i < vclickscandelno1.length; i++) {
														if (vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g, "").toUpperCase() &&
															vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() != "") {
															sap.m.MessageBox.error(weightruckvalidate);
															weighbridgeerror = true;
															break;
														}
														if (vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() == "") {
															vclickscandelno1[i].Truck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
														}
													}
												}
											}
											if (vclickscandelno.length > 1) {
												for (var i = 0; i < vclickscandelno.length; i++) {
													for (var j = 0; j < vclickscandelno1.length; j++) {
														if ((vclickscandelno[i].Truck.replace(/ +/g, "").toUpperCase() !== vclickscandelno1[j].Truck.replace(/ +/g,
																"").toUpperCase()) && (vclickscandelno[i].Truck.replace(/ +/g, "").toUpperCase() !== "") &&
															vclickscandelno1[j].Truck.replace(/ +/g,
																"").toUpperCase() !== "") {
															sap.m.MessageBox.error(truckvalidate1);
															truckvalidate1error = true;
															// that.onScannerCancel();
															break;
														}
													}
													break;
												}
											}
											if ((weighbridgeerror === false) && (truckvalidate1error === false)) {
												if (oDataR.DelReturnNav.results[0]) {
													if (oDataR.DelReturnNav.results[0].Type == 'E') {
														sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
															actions: [MessageBox.Action.CLOSE],
															onClose: function(oAction) {
																//	that.getBusyDialog.close();
																if (oAction === "CLOSE") {
																	var oMultiInput1 = that.getView().byId("id_delivery");
																	var aTokens = oMultiInput1.setTokens([]);
																	if (aTokens.length == 0) {
																		that.onScannerCancel();
																		//that._ResetQRCode(that);
																		//that.getOwnerComponent().getRouter().navTo("Dashboard");
																	}
																}
															}
														});
													}
												} else {
													if (oData.results[0].PickFlag === 'X') {
														MessageBox.error(GateEntrytextDelivery + "  " + oData.results[0].Vbeln, {
															actions: [MessageBox.Action.CLOSE],
															onClose: function(oAction) {
																//that.getBusyDialog.close();
																if (oAction === "CLOSE") {
																	var oMultiInput1 = that.getView().byId("id_delivery");
																	var aTokens = oMultiInput1.setTokens([]);
																	if (aTokens.length == 0) {
																		that.getOwnerComponent().getRouter().navTo("Dashboard");
																	}
																}
															}
														});
													} else if (oData.results[0].PickFlag === 'Y') {
														var vCompletePick = this.getView().getModel("i18n").getResourceBundle().getText("CompletelyPicked");
														MessageBox.error(GateEntrytextDelivery + "  " + oData.results[0].Vbeln, {
															actions: [MessageBox.Action.CLOSE],
															onClose: function(oAction) {
																//that.getBusyDialog.close();
																if (oAction === "CLOSE") {
																	var oMultiInput1 = that.getView().byId("id_delivery");
																	var aTokens = oMultiInput1.setTokens([]);
																	if (aTokens.length == 0) {
																		that.getOwnerComponent().getRouter().navTo("Dashboard");
																	}
																}
															}
														});
													} else {
														if (oDataR.DelReturnNav.results[0]) {
															if (oDataR.DelReturnNav.results[0].Type == 'E') {
																sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
																	actions: [MessageBox.Action.CLOSE],
																	onClose: function(oAction) {
																		//that.getBusyDialog.close();
																		if (oAction === "CLOSE") {
																			var oMultiInput1 = that.getView().byId("id_delivery");
																			var aTokens = oMultiInput1.setTokens([]);
																			if (aTokens.length == 0) {
																				that.getOwnerComponent().getRouter().navTo("Dashboard");
																				that._ResetQRCode(that);
																			}
																			//	that.getOwnerComponent().getRouter().navTo("Dashboard");
																		}
																	}
																});

															}
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
																var vBatch = false;
																var n = oData.results[0].DelOutputNav.results.length;

																var vUniqueArry = [];
																for (var i = 0; i < n; i++) {

																	if (oData.results[0].DelOutputNav.results[i].Lfimg === "0.000") {} else {
																		vUniqueArry.push(oData.results[0].DelOutputNav.results[i]);
																	}
																}

																for (var k = 0; k < vUniqueArry.length; k++) {
																	if (vUniqueArry[k].Charg === "") {
																		if (oData.results[0].DelOutputNav.results[0].Sto_flg === "X") { // Code added by kirubakaran on 31.08.2020 for without batch delivery number
																			vBatch = false;
																			break;
																		} else if(vUniqueArry[k].BatchValidSkip === "X"){ // Added by Laxmikanth on 17/09/2025 for skip batch validation from material master	
																			vBatch = false;
																			break;
																		}else {
																			vBatch = true;
																			break;
																		}
																	} else {
																		vBatch = false;
																	}
																}
																if (vBatch) {
																	if (oData.results[0].DelOutputNav.results[0].Fbatc !== "X") {
																		vBatch = false;
																	}
																}

																if (vBatch == false) {
																	var val1 = oDataR.DelEsOutNav;
																	var val2 = oDataR.DelOutputNav;
																	var oJSONModel = new sap.ui.model.json.JSONModel();
																	if (oData.results[0].DelVendorNav.results.length !== "0") {
																		var Lifnr = oData.results[0].DelVendorNav.results[0].Lifnr;
																	}
																	var oSet;
																	if (val1.results[0].Dname === "") {
																		that.getView().byId("id_driver").setEnabled(true);
																	} else {
																		that.getView().byId("id_driver").setEnabled(false);
																	}
																	if (val1.results[0].Truck === "") {
																		that.getView().byId("id_truck").setEnabled(true);
																	} else {
																		that.getView().byId("id_truck").setEnabled(false);
																	}
																	// if(that.getView().getModel("oProceSalesModel").getData().length == 0){
																	// 	var arr = [
																	// 		{
																	// 			ProcessType : "DOMESTIC"
																	// 		},
																	// 		{
																	// 			ProcessType : "EXPORT"
																	// 		}
																	// 	];
																	// 	that.getView().getModel("oProceSalesModel").setData(arr);
																	// 	that.getView().getModel("oProceSalesModel").refresh();
																	// }

																	if (val1.results[0].Config6 !== "" && val1.results[0].Config6 != undefined) {
																		that.getView().byId("process").setSelectedKey(val1.results[0].Config6.toUpperCase());
																	} else {
																		if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
																			that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
																			// this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
																		}
																	}
																	if (val1.results[0].Wtype !== "" && val1.results[0].Wtype != undefined) {
																		that.getView().byId("processty").setSelectedKey(val1.results[0].Wtype.toUpperCase());
																	} else {
																		if (that.getView().getModel("oProceeModel").getData().length == 1) {
																			that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].Wtype);
																			// this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
																		}
																	}

																	if (that.getView().byId("process").getSelectedKey() === "") {
																		if (val2.results[0].Vtweg === "01") {
																			that.getView().byId("process").setSelectedKey("EXPORT");
																		} else {
																			that.getView().byId("process").setSelectedKey("DOMESTIC");
																		}
																	}
																	// if(that.getView().getModel("oProceeModel").getData().length == 0){
																	// 	var aJson = {
																	// 		Wtype : "SALES"
																	// 	};
																	// 	var arr = [];
																	// 	arr.push(aJson);
																	// 	that.getView().getModel("oProceeModel").setData(arr);
																	// 	that.getView().getModel("oProceeModel").refresh();
																	// }
																	// if(that.getView().byId("processty").getSelectedKey() === ""){
																	// 	that.getView().byId("processty").setSelectedKey("SALES");
																	// 	that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
																	// }
																	if (that.getView().byId("processty").getSelectedKey() == "SALES") {
																		// that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
																		that.getView().byId("labelprocess").setVisible(true); //Added by Avinash
																		that.getView().byId("process").setVisible(true); //Added by Avinash
																		if (that.getView().byId("process").getSelectedKey() == "" ||
																			that.getView().byId("process").getSelectedKey() == undefined) {
																			that.getView().byId("process").setEnabled(true);
																		}
																	} else {
																		// that.getView().byId("id_SalesProcessGateEntry").setVisible(false);
																		that.getView().byId("labelprocess").setVisible(false); //Added by Avinash
																		that.getView().byId("process").setVisible(false); //Added by Avinash
																	}
																	//Added by Avinash
																	var vWerksDesc;
																	if (oData.results[0].DelEsOutNav.results.length > 0) {
																		vWerksDesc = oData.results[0].DelEsOutNav.results[0].WerksDesc;
																	} else {
																		vWerksDesc = "";
																	}
																	//End of added
																	oSet = {
																		"Vbeln": oData1[0],
																		"Werks": val1.results[0].Werks,
																		"Lifnr": Lifnr,
																		"Truck": val1.results[0].Truck,
																		"Dname": val1.results[0].Dname,
																		"DriverId": val1.results[0].DriverId,
																		"Nf_Number": val1.results[0].Nf_Number,
																		"Ee_Number": val1.results[0].Ee_Number,
																		"So_Number": val1.results[0].So_Number,
																		"ProcessType": that.getView().byId("process").getSelectedKey(),
																		"Wtype": that.getView().byId("processty").getSelectedKey(),
																		"Pname": vWerksDesc, //Added by Avinash
																		"Config6": that.getView().byId("process").getSelectedKey() // added by dharma on 02-02-2021
																	};
																	that.getView().byId("id_InTransport").setValue(Lifnr);
																	if (weighbridge) {
																		if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g,
																				"")
																			.toUpperCase() && val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() != "") {
																			sap.m.MessageBox.error(weightruckvalidate);
																			truckvalidate1error = true;
																			// weighbridgeerror = true;
																			// if (that.getView().getModel('JMDelvery')) {
																			// 	var vData = that.getView().getModel('JMDelvery').getData();
																			// }
																			return;
																		}
																		if (val1.results[0].Truck.trim().replace(/ +/g, "").toUpperCase() == "") {
																			val1.results[0].Truck = weighbrideTruck.trim().replace(/ +/g, "").toUpperCase();
																		}
																	}
																	if (!weighbridge) {
																		var oScanDataModel = new sap.ui.model.json.JSONModel();
																		oScanDataModel.setData(oSet);
																		that.getView().setModel(oScanDataModel, "scannerData");
																		if (that.getView().getModel('JMDelvery')) {
																			var vData = that.getView().getModel('JMDelvery').getData();
																		}
																	}
																	if (!vData) {
																		var vData = [];
																	}
																	vData.push({
																		"Vbeln": oData1[0],
																		"Ee_Number": val1.results[0].Ee_Number,
																		"So_Number": val1.results[0].So_Number,
																		"Nf_Number": val1.results[0].Nf_Number,
																		"Cms_Tonumber": val1.results[0].Cms_Tonumber
																	});
																	if (oData1[0]) {
																		if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
																			var oMultiInput1 = that.getView().byId("id_delivery");
																			var oMultiInputCMSSTO = that.getView().byId("cmsTovalue");
																			var oMultiInputEasy = that.getView().byId("Easyvalue");
																			var oMultiInputSale = that.getView().byId("SaleValue");
																			var oMultiInputNota = that.getView().byId("notavalue");

																			var aTokens = oMultiInput1.getTokens();
																			var cmTokens = oMultiInputCMSSTO.getTokens();
																			var bTokens = oMultiInputEasy.getTokens();
																			var cTokens = oMultiInputSale.getTokens();
																			var dTokens = oMultiInputNota.getTokens();
																		} else {

																			var oMultiInput1 = that.getView().byId("id_delivery");
																			var oMultiInputEasy = that.getView().byId("Easyvalue");
																			var oMultiInputSale = that.getView().byId("SaleValue");
																			var oMultiInputNota = that.getView().byId("notavalue");

																			var aTokens = oMultiInput1.getTokens();
																			var bTokens = oMultiInputEasy.getTokens();
																			var cTokens = oMultiInputSale.getTokens();
																			var dTokens = oMultiInputNota.getTokens();

																		}
																		var vTokenv = new sap.m.Token({
																			text: oData1[0],
																			key: oData1[0]
																		});
																		aTokens.push(vTokenv);
																		if (oData.results[0].DelOutputNav.results[0].Del_type === "STO") {
																			var cTokenv = new sap.m.Token({
																				text: val1.results[0].Cms_Tonumber,
																				key: val1.results[0].Cms_Tonumber
																			});
																			cmTokens.push(cTokenv);

																			oMultiInputCMSSTO.removeAllTokens();
																			oMultiInputCMSSTO.setTokens(cmTokens);
																		}
																		var eTokenv = new sap.m.Token({
																			text: val1.results[0].Ee_Number,
																			key: val1.results[0].Ee_Number
																		});
																		bTokens.push(eTokenv);

																		var sTokenv = new sap.m.Token({
																			text: val1.results[0].So_Number,
																			key: val1.results[0].So_Number
																		});
																		cTokens.push(sTokenv);

																		oMultiInputEasy.removeAllTokens();
																		oMultiInputEasy.setTokens(bTokens);

																		oMultiInputSale.removeAllTokens();
																		oMultiInputSale.setTokens(cTokens);

																		var nTokenv = new sap.m.Token({
																			text: val1.results[0].Nf_Number,
																			key: val1.results[0].Nf_Number
																		});
																		dTokens.push(nTokenv);

																		oMultiInput1.removeAllTokens();
																		oMultiInput1.setTokens(aTokens);

																		oMultiInputNota.removeAllTokens();
																		oMultiInputNota.setTokens(dTokens);

																	}
																	if (truckvalidate1error == false) {
																		if (!weighbridge) {
																			var oScanDataModel = new sap.ui.model.json.JSONModel();
																			oScanDataModel.setData(vData);
																			that.getView().setModel(oScanDataModel, "JMDelvery");
																		}

																		if (vclickscandelno.length > 1) {
																			// for (var i = 0; i < vclickscandelno.length; i++) {
																			// 	if (vclickscandelno[i].Truck === vclickscandelno[i + 1].Truck) {

																			// 		// sap.m.MessageBox.error(truckvalidate1);
																			// 		that.onScannerCancel();
																			// 	}

																			// 	break;
																			// }
																			var vclickscandelno2 = [];
																			var vclickscandelno3 = [];

																			for (var i = 0; i < vclickscandelno.length; i++) {
																				for (var j = 0; j < vclickscandelno1.length; j++) {
																					if (vclickscandelno[i].Truck === " ") {
																						sap.m.MessageBox.error(truckvalidate1);
																						truckvalidate1error = true;
																						that.onScannerCancel();
																						// that._ResetQRCode(that);
																						break;
																					} else if (vclickscandelno[i].Truck.replace(/ +/g, "").toUpperCase() !== vclickscandelno1[j].Truck.replace(
																							/ +/g, "").toUpperCase()) {
																						vclickscandelno = vclickscandelno2;
																						vclickscandelno1 = vclickscandelno3;
																						//hat.onScannerCancel();
																						// that._onObjectMatched();
																						break;
																					}
																				}
																				break;
																			}

																		}
																	}
																	if (weighbridge) {
																		// var weighbrideTruck = that.getView().byId("id_truck").getValue();
																		if (vclickscandelno1.length > 1) {
																			for (var i = 0; i < vclickscandelno1.length; i++) {
																				if (vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() !== weighbrideTruck.trim().replace(/ +/g, "")
																					.toUpperCase() && vclickscandelno1[i].Truck.replace(/ +/g, "").toUpperCase() != "") {
																					weighbridgeerror = true;
																					// that.onScannerCancel();
																					break;
																				}
																			}
																		}
																	}
																	that.getView().getModel("scannerData").refresh();
																} else {
																	var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("BatchNotMaintained");
																	Errordeliverytext = Errordeliverytext + " " + oData1[0];
																	sap.m.MessageBox.error(Errordeliverytext, {
																		actions: [MessageBox.Action.CLOSE],
																		onClose: function(oAction) {}
																	});
																}
															} else {
																var Errordeliverytext = that.getView().getModel("i18n").getResourceBundle().getText("DeliveryAlreadyScaned");
																sap.m.MessageToast.show(Errordeliverytext);
															}
														}
													}
												}
												that.getView().byId("id_WeighbridgeProcess").setValue(weighbridgeid);
											}
										} //Added by Avinash
										else {
											var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
											sap.m.MessageBox.error(vResErrMsg, {
												icon: sap.m.MessageBox.Icon.Error,
												title: vErr
											});
										}
										//End of added
									},
									error: function() {
										// sap.m.MessageToast("Error");
										that.onScannerCancel();
									}

								});
							}
							if (oData1[0].length === 12) {
								// sap.m.MessageBox.error(that.getView().getModel("i18n").getProperty("PlsSwitchToPortOpr"));
								// sap.ui.core.BusyIndicator.hide();
								var msg1 = "";
								var msg2 = "";
								var proceedvalidation = true;
								// Changed by Avinash for Port Operation
								var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant;
								// var vPlant = this.getOwnerComponent().getModel("localModel").getProperty("/plant");
								if (that.getView().byId('id_PortOprid').getState() && that.getView().byId('id_PortOprid').getVisible()) {
									var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] +
										"'and Flag eq 'E'and Werks eq '" + vPlant + "'&$expand=NavGateEntry,GateReturnNav";
								} else {
									var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] +
										"'and Flag eq 'E'and Werks eq '" + vPlant + "'&$expand=NavGateEntry,GateReturnNav";
								}

								// var oPath2 = "GateEntrySet?$filter=Wbid eq '" + oData1[0] +
								// 	"'and Flag eq 'E'&$expand=NavGateEntry,GateReturnNav";

								oGetModel.read(oPath2, {
									success: function(oData) {
										//Added by Avinash for adding validation while scanning WBID....
										var vResErr = false;
										var vResErrMsg = "";
										if (oData.results[0].GateReturnNav.results.length > 0) {
											for (var i = 0; i < oData.results[0].GateReturnNav.results.length; i++) {
												if (oData.results[0].GateReturnNav.results[i].Type == "E") {
													vResErr = true;
													vResErrMsg = vResErrMsg + oData.results[0].GateReturnNav.results[i].Message + "\n";
												}
											}
										}
										if (!vResErr) {
											//End of added
											weighbridgescanned = "true";
											sap.ui.core.BusyIndicator.hide();
											if ((Announcement === "X") && (Reporting === "X")) {
												if ((oData.results[0].Config4 != "R01") || (oData.results[0].Config3 != "X")) {

													if (oData.results[0].Config3 != "X") {
														msg2 = msg2 + that.getView().getModel("i18n").getProperty("Gateerror123");
														proceedvalidation = false;
													}

													if (oData.results[0].Config4 != "R01") {
														msg2 = msg2 + that.getView().getModel("i18n").getProperty("Gateerrorprocessed");
														proceedvalidation = false;
													}
													var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
													sap.m.MessageBox.error(msg2, {
														icon: sap.m.MessageBox.Icon.Error,
														title: vErr
													});
												}
											}
											if ((Announcement === "X") && (Reporting === "")) {

												if (oData.results[0].Config4 != "R01") {
													msg1 = msg1 + that.getView().getModel("i18n").getProperty("Gateerrorprocessed");
													proceedvalidation = false;
													var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
													sap.m.MessageBox.error(msg1, {
														icon: sap.m.MessageBox.Icon.Error,
														title: vErr
													});
												}

											}
											if ((Announcement === "") && (Reporting === "")) {
												proceedvalidation = true;
											}

											// if (Announcement !== "X") {
											// 	if ((oData.results[0].Config4 == "R01") && (oData.results[0].Config3 == "X")) {
											// 		var oScanDataModel = new sap.ui.model.json.JSONModel();
											// 		oScanDataModel.setData(oData.results[0]);
											// 		that.getView().setModel(oScanDataModel, "scannerData");
											// 		that.getView().byId("id_truck").setValue(oData.results[0].Vehno);
											// 		that.getView().byId("process").setSelectedKey(oData.results[0].Config6.toUpperCase());

											// 		weighbridgeid = oData.results[0].Wbid;
											// 		var slKey = oData.results[0].Config6;
											// 		if (slKey.toUpperCase() == "DOMESTIC") {
											// 			that.getView().byId("id_delivery").setEnabled(true);
											// 		}
											// 		if (slKey.toUpperCase() == "EXPORT") {
											// 			that.getView().byId("id_delivery").setEnabled(false);
											// 		}
											// 		that.getView().getModel("scannerData").refresh();
											// 	}
											// }
											if (proceedvalidation) {
												// if ((oData.results[0].Config4 == "R01") && (oData.results[0].Config3 == "X")) {
												var oScanDataModel = new sap.ui.model.json.JSONModel();
												oScanDataModel.setData(oData.results[0]);
												that.getView().setModel(oScanDataModel, "scannerData");
												that.getView().byId("id_truck").setValue(oData.results[0].Vehno);
												// that.getView().byId("id_GEgatenodesc").setText(oData.results[0].Gname); //Added by Avinash on 10/05/21

												// var arr = [{
												// 	ProcessType : oData.results[0].Config6.toUpperCase()
												// }];
												// that.getView().getModel("oProceSalesModel").setData(arr);
												// that.getView().getModel("oProceSalesModel").refresh();

												// that.getView().byId("process").setSelectedKey(oData.results[0].Config6.toUpperCase());
												// that.getView().byId("processty").setSelectedKey(oData.results[0].Wtype.toUpperCase());

												if (oData.results[0].Config6 !== "" && oData.results[0].Config6 !== undefined) {
													that.getView().byId("process").setSelectedKey(oData.results[0].Config6.toUpperCase());
												} else {
													if (that.getView().getModel("oProceSalesModel").getData().length == 1) {
														that.getView().byId("process").setSelectedKey(that.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
														// this.getView().byId("ReportSalesProcess").setSelectedKey(this.getView().getModel("oProceSalesModel").getData()[0].ProcessType);
													}
												}
												if (oData.results[0].Wtype !== "" && oData.results[0].Wtype !== undefined) {
													that.getView().byId("processty").setSelectedKey(oData.results[0].Wtype.toUpperCase());
												} else {
													if (that.getView().getModel("oProceeModel").getData().length == 1) {
														that.getView().byId("processty").setSelectedKey(that.getView().getModel("oProceeModel").getData()[0].Wtype);
														// this.getView().byId("processType").setSelectedKey(this.getView().getModel("oProceeModel").getData()[0].Wtype);
													}
												}

												if (that.getView().byId("processty").getSelectedKey() != "SALES") {
													// that.getView().byId("id_SalesProcessGateEntry").setVisible(false);
													that.getView().byId("labelprocess").setVisible(false); //Added by Avinash
													that.getView().byId("process").setVisible(false); //Added by Avinash
												} else {
													if (that.getView().byId("process").getSelectedKey() == "") {
														that.getView().byId("process").setEnabled(true);
													}
													// that.getView().byId("id_SalesProcessGateEntry").setVisible(true);
													that.getView().byId("labelprocess").setVisible(true); //Added by Avinash
													that.getView().byId("process").setVisible(true); //Added by Avinash
												}
												weighbridgeid = oData.results[0].Wbid;
												var slKey = oData.results[0].Config6;
												if (slKey != undefined && slKey !== "") {
													if (slKey.toUpperCase() == "DOMESTIC") {
														that.getView().byId("id_delivery").setEnabled(true);
													}
													if ((slKey == "EXPORT") || (slKey == "SCRAP")) {
														that.getView().byId("id_delivery").setEnabled(false);
													}
												}
												//Added by Avinash for Breakdown Scenario...
												vGDname = that.getView().getModel("scannerData").getData().Dname;
												vGLifnr = that.getView().getModel("scannerData").getData().Lifnr;
												vGChallan = that.getView().getModel("scannerData").getData().Challan;
												vGDriverMob = that.getView().getModel("scannerData").getData().DriverMob;
												vGTruck = that.getView().getModel("scannerData").getData().Truck;
												vGRemarks = that.getView().getModel("scannerData").getData().Remark;
												vGCnnum = that.getView().getModel("scannerData").getData().Cnnum;
												//End of Added...

												that.getView().getModel("scannerData").refresh();

											}
										} else {
											sap.ui.core.BusyIndicator.hide();
											sap.m.MessageBox.error(vResErrMsg);
										}
									},
									error: function() {
										sap.m.MessageBox.error(that.getView().getModel("i18n").getProperty("HTTPFail"));
										sap.ui.core.BusyIndicator.hide();
									}

								});

							}
							if (weighbridgeerror === true) {
								var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("weightruckvalidate");
								sap.m.MessageBox.error(weightruckvalidate);
							}
							if (truckvalidate1error === true) {
								//	var weightruckvalidate = that.getView().getModel("i18n").getResourceBundle().getText("truckvalidate1error");
								var truckvalidate1 = that.getView().getModel("i18n").getResourceBundle().getText("truckvalidate");
								sap.m.MessageBox.error(truckvalidate1);
							}
						}

					}
					// End of Added by Avinash for IVC Rubber STO Operation Switched on
				}
			} catch (e) {

			}
			// },
			// function(oError) {
			// 	sap.ui.core.BusyIndicator.hide();
			// }
			// );

		},

		_LoadDeliveryItems: function(that, vbeln, fSaved) {
			//	this.getOwnerComponent().getRouter().navTo("Deliverycheck");
			//	that.getOwnerComponent().getRouter().navTo("Dashboard");
			// var networkState = navigator.connection.type;
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
					}

				} else {
					var submit = that.getView().getModel("i18n").getResourceBundle().getText("submit");
					MessageBox.confirm(submit, {
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						onClose: function(oAction) {

							if (oAction === "OK") {
								that.fnGateEntry();
								//	that._LoadDeliveryItems(that, vbeln, true);
							} else {
								that.getBusyDialog.close();
							}
						}

					});
				}
			});

		},

		//===============================================================
		//------------------Reset Model-----------------------------------
		//===============================================================
		_ResetQRCode: function(that) {
			//that.getBusyDialog.close();
			var oScanDataModel = new sap.ui.model.json.JSONModel();
			oScanDataModel.setData({});
			that.getOwnerComponent().setModel(oScanDataModel, "scannerData");

			var oMultiInput1 = this.getView().byId("id_delivery");
			var aTokens = oMultiInput1.setTokens([]);
		},
		//===============================================================
		//------------------Capture Image Function-----------------------------------
		//===============================================================
		onCaptureImage: function() {
			if (!this.oCapture) {
				this.oCapture = sap.ui.xmlfragment(
					"LoadingConfirmation.fragment.CaptureImage",
					this
				);
				this.getView().addDependent(this.oCapture);
			}
			this.oCapture.open();
		},
		//===============================================================
		//------------------Image Function-----------------------------------
		//===============================================================
		onFileDeleted: function(oEvent) {
			var vDocumentid = oEvent.getParameter("documentId");
			for (var i = 0; i < this.Images.length; i++) {
				if (this.Images[i].Documentid == vDocumentid) {
					this.Images.splice(this.Images[i], 1);
					// this.Images.splice(i, 1);
					break;
				}
			}
			this.oView.setModel(new JSONModel(this.Images), "MASS");
			this.oView.getModel("MASS").refresh(true);
		},

		onFilenameLengthExceed: function(oEvent) {
			var oView = this.getView();
			sap.m.MessageToast.show(oView.getModel("i18n").getProperty('EventfilenameLengthExceed'));
		},

		onFileSizeExceed: function(oEvent) {
			var oView = this.getView();
			sap.m.MessageToast.show(oView.getModel("i18n").getProperty('EventfileSizeExceed'));
		},

		onTypeMissmatch: function(oEvent) {
			var oView = this.getView();
			sap.m.MessageToast.show(oView.getModel("i18n").getProperty('EventtypeMissmatch'));
		},

		onStartUpload: function(oEvent) {
			var oUploadCollection = sap.ui.getCore().byId("id_UploadCollection");
			oUploadCollection.upload();
		},

		onBeforeUploadStarts: function(oEvent) {
			var oThat = this;
		},

		// onCompleteUpload: function(oEvent) {
		// 	var oThat = this;
		// 	var vRadio = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getId();
		// 	var vRadioText = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getText();
		// 	if (oThat.Images.length != 0) {
		// 		for (var i = 0; i < oThat.Images.length; i++) {
		// 			if (oThat.Images[i].Doknr == vRadio) {
		// 				oThat.Images.splice(i, 1);
		// 				break;
		// 			}
		// 		}
		// 	}
		// 	var file = oEvent.getSource()._getFileUploader()._aXhr[0]['file'];
		// 	var object = {};
		// 	object.Documentid = jQuery.now().toString();
		// 	object.Fname = vRadioText;
		// 	object.Ftype = file.type;
		// 	object.Objky = "";
		// 	object.Doknr = vRadio;
		// 	oEvent.getSource()._getFileUploader()._aXhr.splice(0, 1);
		// 	if (file) {
		// 		var reader = new FileReader();
		// 		var BASE64_MARKER = 'data:' + file.type + ';base64,';
		// 		reader.onloadend = (function(theFile) {
		// 			return function(evt) {
		// 				var base64Index = evt.target.result.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
		// 				var base64Data = evt.target.result.substring(base64Index);
		// 				object.Filename = base64Data;
		// 				oThat.Images.unshift(object);
		// 				object = {}; //clear	
		// 				oThat.getView().setModel(new JSONModel(oThat.Images), "MASS");
		// 				oThat.getView().getModel("MASS").refresh(true);
		// 				oThat.BusyDialog.close();
		// 			};
		// 			// that.getBusy().setBusy(false);
		// 		})(file);
		// 	}
		// 	reader.readAsDataURL(file);

		// },

		onUploadComplete: function(oEvent) {
			var oThat = this;
			var oView = this.getView();
			var vRadio = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getId();
			//Added by Avinash
			var vRadioText = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getText();
			if (oThat.Images.length != 0) {
				for (var i = 0; i < oThat.Images.length; i++) {
					if (oThat.Images[i].Doknr == vRadio) {
						oThat.Images.splice(i, 1);
						break;
					}
				}
			}
			//End of Added
			var file = oEvent.getSource().oFileUpload.files[0];
			var object = {};
			object.Documentid = jQuery.now().toString();
			// object.Fname = file.name;
			object.Fname = vRadioText + "_GE"; //Changed by Avinash
			object.Ftype = file.type;
			object.Objky = "";
			object.Doknr = vRadio;
			if (file) {
				oThat.base64conversionMethod(object, file);
			}
		},
		base64conversionMethod: function(object, file) {
			var that = this;
			if (!FileReader.prototype.readAsBinaryString) {
				FileReader.prototype.readAsBinaryString = function(fileData) {
					var binary = "";
					var reader = new FileReader();
					reader.onload = function(e) {
						var bytes = new Uint8Array(reader.result);
						var length = bytes.byteLength;
						for (var i = 0; i < length; i++) {
							binary += String.fromCharCode(bytes[i]);
						}
						that.base64ConversionRes = btoa(binary);

					};
					reader.readAsArrayBuffer(fileData);
				};
			}
			var reader = new FileReader();
			reader.onload = function(readerEvt) {
				var binaryString = readerEvt.target.result;
				that.base64ConversionRes = btoa(binaryString);
				var oFile = file;
				object.Filename = that.base64ConversionRes;
				that.Images.unshift(object);
				object = {}; //clear	
				that.oView.getModel("MASS").setData(that.Images);
				that.oView.getModel("MASS").refresh(true);
			};
			reader.readAsBinaryString(file);
		},
		fnAddBillClose: function() {
			// added by chaithra 
			var oThat = this;
			// var oView = this.getView();
			oThat.oCapture.close();
		},

		//Need to check
		fnPressAdd: function(oEvent) {
			var oTabModel = this.getView().getModel("JMManualDel");
			var oTabData = oTabModel.getData();

			oTabData.push({
				"Vbeln": ""
			});

			oTabModel.refresh();
		},
		//Added by Pavan on 21/03/2023 Start
		fnPressAddMatDel: function(oEvent) {
			var oTabModel = this.getView().getModel("JMManualMatDoc");
			var oTabData = oTabModel.getData();

			oTabData.push({
				"Mblnr": ""
			});

			oTabModel.refresh();
		},
		//Added by Pavan on 21/03/2023 End
		//Added by Avinash
		fnPressDelete: function(oEvent) {
			var that = this;
			var vPath = Number(oEvent.getSource().getBindingContext("JMManualDel").getPath().split("/")[1]);
			var oTabModel = this.getView().getModel("JMManualDel");
			var oTabData = oTabModel.getData();
			if (oTabData.length > 1) {
				oTabData.splice(vPath, 1);
				oTabModel.refresh();
			} else {
				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("AtLeastOneItemDel"));
			}

		},
		//Added by Pavan on 21/03/2023 Start
		fnPressDeleteMatDel: function(oEvent) {
			var that = this;
			var vPath = Number(oEvent.getSource().getBindingContext("JMManualMatDoc").getPath().split("/")[1]);
			var oTabModel = this.getView().getModel("JMManualMatDoc");
			var oTabData = oTabModel.getData();
			if (oTabData.length > 1) {
				oTabData.splice(vPath, 1);
				oTabModel.refresh();
			} else {
				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("AtLeastOneItemMatDoc"));
			}

		},
		//Added by Pavan on 21/03/2023 Start
		//Need to check
		//End of Added...

		fnDeleteAttachedFiles: function(oEvent) {
			var oView = this.getView();
			var oFilesModel = oView.getModel("MASS").getData();
			var vPath = oEvent.getParameter("listItem").getBindingContext("MASS").getPath().split("/");
			vPath = vPath[vPath.length - 1];
			// var oCurrentItem = oView.getModel("SRITEMDET").getData();

			oFilesModel.splice(vPath, 1);
			// oCurrentItem.Files = oFilesModel.length;
			oView.getModel("MASS").refresh();
			// oView.getModel("SRITEMDET").refresh();

		},

		//=================================== Added by chaithra on 30/6/2020 ========================================//
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
						that.getView().byId("processType").setSelectedKey(oDataR[0].Wtype);
						that.getView().byId("processty").setSelectedKey(oDataR[0].Wtype);
					} else {
						that.getView().byId("processty").setEnabled(true);
					}
					//  that.oGl.setBusy(false);
				},
				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));

				}
			});
		},
		fnEntitySalesProcessType: function() {
			var oPath = "/F4Set";
			var that = this;
			var localModel = this.getOwnerComponent().getModel("localModel");
			var oGetModel = that.getView().getModel('odata');
			oGetModel.read(oPath, {
				filters: [
					new Filter("Process", FilterOperator.EQ, "X"),
					new Filter("IvWerks", FilterOperator.EQ, localModel.getData().plant)
				],
				urlParameters: {
					$expand: "F4ProcessNav"
				},
				success: function(oData, Response) {
					var oDataR = oData.results[0].F4ProcessNav.results;
					var oProceSalesModel = new sap.ui.model.json.JSONModel();
					oProceSalesModel.setData(oDataR);
					that.getView().setModel(oProceSalesModel, "oProceSalesModel");
					that.getView().getModel("oProceSalesModel").refresh();
					if (oDataR.length == 1) {
						that.getView().byId("process").setSelectedKey(oDataR[0].ProcessType);
						that.getView().byId("ReportSalesProcess").setSelectedKey(oDataR[0].ProcessType);
					}
					//  that.oGl.setBusy(false);
				},
				error: function(oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
				}
			});
		},
		onChangeReportProcessTy: function(oEvent) {
			var key = oEvent.getSource().getSelectedKey();
			if (key == "SALES") {
				this.getView().byId("id_ReportSalesProcrss").setVisible(true);
			} else {
				this.getView().byId("id_ReportSalesProcrss").setVisible(false);
			}
		},
		onClickImageDecline: function() {
			this.oCapture.close();
		},

		onDmsPost: function(wbid) {
			var that = this;
			var GateEntryDmsNav = [];
			var oPostModel = that.getView().getModel('odata');
			if (this.Images.length !== 0) {
				this.Images.forEach(function(x) {
					GateEntryDmsNav.push({
						"Dokar": "",
						"Doknr": x.Doknr,
						"Dokvr": "",
						"Doktl": "",
						"Dokob": "",
						"Object": "",
						"Objky": "",
						"Fname": x.Fname,
						"Ftype": x.Ftype,
						"Filename": x.Filename
					});
				});
				var oEntity = {
					Wbid: wbid,
					Flag: "D",
					GateEntryDmsNav: GateEntryDmsNav
				};
				var oPath = '/GateEntrySet';
				oPostModel.create(oPath, oEntity, {
					async: true
				});
			}
		},

		onTruckLiveChangeVT: function(oEvent) {
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

			if (vGTruck !== oEvent.getSource().getValue()) {
				this.getView().byId("id_VehType").setEnabled(true);
			} else {
				this.getView().byId("id_VehType").setEnabled(false);
			}
		},

		onTruckLiveChange: function(oEvent) {
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
		onMobileChange: function(oEvent) {
			var inputtxt = oEvent.getSource().getValue();
			if (inputtxt.length > 12) {
				var vSlice = inputtxt.slice(inputtxt.length - 1, inputtxt.length);
				var vReplace = inputtxt.replace(new RegExp(vSlice + '$'), '');
				oEvent.getSource().setValue(vReplace);
			}
		},
		// Added by AVinash
		onSwitchPortChange: function(oEvent) {
			// var vKey = oEvent.getSelectedKey();
			var that = this;
			var vTemp = [{
				"Vbeln": ""
			}];
			var oManualDel = new sap.ui.model.json.JSONModel();
			oManualDel.setData(vTemp);
			this.getView().setModel(oManualDel, "JMManualDel");

			//Added by Pavan on 21/04/2023 Start
			var vTemp1 = [{
				"Mblnr": ""
			}];
			var oManualDel1 = new sap.ui.model.json.JSONModel();
			oManualDel1.setData(vTemp1);
			this.getView().setModel(oManualDel1, "JMManualMatDoc");
			//Added by Pavan on 21/03/2023 End

			if (!this.getView().byId('id_PortOprid').getState()) {
				that.getView().byId("id_driver").setEnabled(false);
				that.getView().byId("id_DriverMobile").setEnabled(false);
				that.getView().byId("id_truck").setEnabled(false);
				that.getView().byId("id_TransType").setEnabled(false); //Challan
				that.getView().byId("id_Cnnum").setEnabled(false); //Container
				that.getView().byId("weighprocess").setVisible(false);
				that.getView().byId("id_WeighbridgeProcess").setVisible(false);
				that.getView().getModel('oBatchEnable').getData()[0].DriverMob = "";
				that.getView().getModel('oBatchEnable').getData()[0].Trtyp = "";
				that.getView().getModel('oBatchEnable').getData()[0].Vehtyp = "";
				that.getView().getModel('oBatchEnable').getData()[0].Cnnum = "";
				that.getView().getModel("oBatchEnable").refresh(true);
				that.getView().setModel(new sap.ui.model.json.JSONModel({}), "scannerData");
				that.getView().getModel("scannerData").refresh(true);
				var localModel = that.getOwnerComponent().getModel("localModel");
				that.getView().byId("plantvalue").setValue(localModel.getData().plant + " - " + localModel.getData().plantDesc);
			} else {
				that.getView().byId("id_driver").setEnabled(true);
				that.getView().byId("id_DriverMobile").setEnabled(true);
				that.getView().byId("id_truck").setEnabled(true);
				that.getView().byId("id_TransType").setEnabled(true); //Challan
				that.getView().byId("id_Cnnum").setEnabled(true); //Container
				// that.getView().byId("id_VboxDriver").setWidth("50%");
				// that.getView().byId("id_VboxTrans").setWidth("50%");
				// that.getView().byId("id_VboxTruckNo").setWidth("50%");
				// that.getView().byId("referenceNoId").setWidth("100%");
				that.getView().byId("weighprocess").setVisible(true);
				that.getView().byId("id_WeighbridgeProcess").setVisible(true);
				that.getView().getModel('oBatchEnable').getData()[0].DriverMob = "X";
				that.getView().getModel('oBatchEnable').getData()[0].Trtyp = "X";
				that.getView().getModel('oBatchEnable').getData()[0].Vehtyp = "X";
				that.getView().getModel('oBatchEnable').getData()[0].Cnnum = "X";
				that.getView().getModel("oBatchEnable").refresh(true);

			}
		},
		// End of added

		//Added by Avinash for Container Validation...
		fnLiveChangeContValid: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var vCtNo = sValue.toUpperCase();
			oEvent.getSource().setValue(vCtNo);
			var vFstValue = oEvent.getSource().getValue();
			if (vFstValue.length == 11) {
				var ChkNum = /^[0-9]+$/;
				var ChkAlpha = /^[A-Za-z]+$/;
				var vContSlice = vFstValue.slice(4);
				var vAlphaCont = vFstValue.substring(0, 4);
				var isNumValid = ChkNum.test(vContSlice);
				var isAlphaValid = ChkAlpha.test(vAlphaCont);
				if (isNumValid == false || isAlphaValid == false) {
					oEvent.getSource().setValueState("Error");
				} else {
					oEvent.getSource().setValueState("None");
				}
			}
			if (vFstValue.length == 4) {
				var vAlphaCont = vFstValue.substring(0, 4);
				var ChkAlpha = /^[A-Za-z]+$/;
				var isAlphaValid = ChkAlpha.test(vAlphaCont);
				if (isAlphaValid == false) {
					oEvent.getSource().setValueState("Error");
				} else {
					oEvent.getSource().setValueState("None");
				}
			}
			if (vFstValue.length == 0) {
				oEvent.getSource().setValueState("None");
			}
		},
		//Added by Pavan on 18/04/2023 Start
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
					sap.ui.core.BusyIndicator.hide();
				} else {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("NoItemsFound"));
					sap.ui.core.BusyIndicator.hide();
				}
			});
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
						"Mjahr": vSelectItems[i].getBindingContext("oMDItemModel").getObject().Mjahr,
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
				for (var i = 0; i < vWbItemdata.length; i++) {
					var vObj = {
						Config1: 'WPC',
						Config9: "", //Selected Key
						Vbeln: "",
						Config4: "S01",
						Werks: that.getOwnerComponent().getModel("localModel").getData().plant,
						Pmblnr: vWbItemdata[i].Pmblnr,
						Matnr: vWbItemdata[i].Matnr,
						Mjahr: vWbItemdata[i].Mjahr,
						Zeile: (Number(vWbItemdata[i].Zeile)).toString().padStart("4", "0"),
						Item: vWbItemdata[i].Item
					};
					oThat.getView().getModel("MatDocList").getData().push(vObj);
				}
				oThat.getView().getModel("MatDocList").refresh(true);
				/*var oMultiInput1 = that.getView().byId("id_MaDocGe");				//commented by pavan
				oMultiInput1.setValue(vSelectItems[0].getBindingContext("oMDItemModel").getObject().Pmblnr);*/ //commented by pavan
				var vData = this.getView().getModel('JMManualMatDoc').getData();
				var vDataMod = oThat.getView().getModel("MatDocList").getData();
				for (var i = 0; i < vData.length; i++) {
					if ((vDataMod[i].Pmblnr)) {
						var oMultiInput1 = that.getView().byId("id_MaDocGe");
						var aTokens = oMultiInput1.getTokens();
						var vExists = false;
						if (aTokens) {
							for (var j = 0; j < aTokens.length; j++) {
								if (aTokens[j].getKey() == (vDataMod[i].Pmblnr + "#" + vDataMod[i].Mjahr)) {
									vExists = true;
									break;
								}
							}
						}
						if (vExists == false) {
							var vKey = vSelectItems[0].getBindingContext("oMDItemModel").getObject().Pmblnr + "#" + vSelectItems[0].getBindingContext(
								"oMDItemModel").getObject().Mjahr;
							var vTokenv = new sap.m.Token({
								text: vKey,
								key: vKey
							});
							aTokens.push(vTokenv);
							oMultiInput1.removeAllTokens();
							oMultiInput1.setTokens(aTokens);
							arrSelItem.push(vObj);
						} else {
							var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("MatDelAlredyScanned");
							sap.m.MessageToast.show(EnterDel);
						}
					}
				}
				this.onSwitchChange1();
				/*			that.getView().byId("id_MatDocLabelGe").setVisible(true);
							that.getView().byId("id_MaDocGe").setVisible(true);*/
				oThat.MDitemsfragment.close();
				sap.ui.core.BusyIndicator.hide();
			} else {
				var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("MiniOneItem");
				sap.m.MessageBox.error(vError);
			}
		},
		onClWbItem: function() {
			this.MDitemsfragment.close();
			sap.ui.core.BusyIndicator.hide();
		},
		//Added by Pavan on 18/04/2023 End
	});

});