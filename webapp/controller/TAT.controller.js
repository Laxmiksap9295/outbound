sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Filter',
	"LoadingConfirmation/model/formatter"
], function(Controller, JSONModel, FilterOperator, Filter, formatter) {
	"use strict";
	var oMonthly, oDaily, oWeekly, vdateselected, vmonselected, Vflag, vmailid, startDate, endDate, vWearks;
	var selectCurrentWeek = function() {
		window.setTimeout(function() {
			$('.week-picker').find('.ui-datepicker-current-day a').addClass('ui-state-active');
		}, 1);
	};
	return Controller.extend("LoadingConfirmation.controller.TAT", {
		onInit: function() {
			this.dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-ddT00:00:00"
			});
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRoutePatternMatched(this.fnHandleActDet, this);
			if (this.getOwnerComponent().getModel("localModel").getProperty("/plant")) {
				vWearks = this.getOwnerComponent().getModel("localModel").getProperty("/plant");
			}
			this.getView().byId("id_Year").setSelectedKey(new Date().getFullYear());
		},
		fnHandleActDet: function(oEvent) {
			var oPage = oEvent.getParameter("name");
			if (oPage === "TAT") {
				var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
				// this.getView().byId('id_logo').setSrc(vPathImage + "/Images/login-logo@2x.png");
				this.getView().byId('id_homenew').setSrc(vPathImage + "/Images/home.png");
				//		sap.ui.getCore().byId('id_AddImg1').setSrc(vPathImage + "/Images/Add.png");
				//	sap.ui.getCore().byId('id_RemoveImg1').setSrc(vPathImage + "/Images/Delete.png");
				vmonselected = ' ';
				vdateselected = ' ';
				this.fnClear();
				this.fnLoadTATData();
				this.vSelectedGraph = "";
				if (this.getOwnerComponent().getModel("localModel").getProperty("/plant")) {
					vWearks = this.getOwnerComponent().getModel("localModel").getProperty("/plant");
				}

			}
		},
		fnClear: function() {
			var oController = this;
			oController.getView().byId("Id_DailyAvg").setText("");
			oController.getView().byId("Id_DailyVechileCount").setText("");
			oController.getView().byId("Id_DailyMinTAt").setText("");
			oController.getView().byId("Id_DailyMaxTAt").setText("");

			oController.getView().byId("Id_WeeklyAvg").setText("");
			oController.getView().byId("Id_WeeklyVechileCount").setText("");
			oController.getView().byId("Id_WeeklyMinTAt").setText("");
			oController.getView().byId("Id_WeeklyMaxTAt").setText("");

			oController.getView().byId("Id_MonthlyAvg").setText("");
			oController.getView().byId("Id_MonthlyVechileCount").setText("");
			oController.getView().byId("Id_MonthlyMinTAt").setText("");
			oController.getView().byId("Id_MonthlyMaxTAt").setText("");

			oController.getView().byId("id_gatedatewith").setValue(null);
			oController.getView().byId("id_gateweek").setValue(null);
			oController.getView().byId("id_gatemonth").setSelectedKey("");
		},
		fnLoadTATData: function() {
			var oController = this;
			var vDate = oController.byId("id_gatedatewith").getDateValue();
			var vweek = oController.byId("id_gateweek").getDateValue();

		
			oController.byId("id_gateweek").setValue(vweek);
			oController.byId("id_gatedatewith").setValue(vDate);
			// if (vweek) {
			// 	var Enddate = this.dateFormat.parse(vweek);
			// 	Enddate.setDate(Enddate.getDate() + 5);
			// 	var vweekend=this.dateFormat.format(Enddate);
			// 	console.log(vweekend);
			// }
			if (!vweek) {
				vweek = new Date();
				if (vweek.getDay() !== 0) {
					vweek.setDate(vweek.getDate() - vweek.getDay());
					var toDate = new Date(vweek.getFullYear(), vweek.getMonth(), vweek.getDate() + 6);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd.MM.yyyy"
					});
					var start = dateFormat.format(vweek);
					var end = dateFormat.format(toDate);
					oController.byId("Id_WeekPeriod").setText(start + " " + "-" + " " + end);
					
					var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "yyyy-MM-ddT00:00:00"
					});
					vweek = dateFormat1.format(vweek);
					oController.byId("id_gateweek").setValue(vweek);
				} else {
					var toDate = new Date(vweek.getFullYear(), vweek.getMonth(), vweek.getDate() + 6);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd.MM.yyyy"
					});
					var start = dateFormat.format(vweek);
					var end = dateFormat.format(toDate);
					oController.byId("Id_WeekPeriod").setText(start + " " + "-" + " " + end);
					var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "yyyy-MM-ddT00:00:00"
					});
					vweek = dateFormat1.format(vweek);
					oController.byId("id_gateweek").setValue(vweek);
				}
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				vweek = dateFormat.format(new Date());
				oController.byId("id_gateweek").setValue(vweek);
			} else {
				var week = new Date(vweek);
				if (week.getDay() !== 0) {
					week.setDate(week.getDate() - week.getDay());
					var toDate = new Date(week.getFullYear(), week.getMonth(), week.getDate() + 6);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd.MM.yyyy"
					});
					var start = dateFormat.format(week);
					var end = dateFormat.format(toDate);
					oController.byId("Id_WeekPeriod").setText(start + " " + "-" + " " + end);
					var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "yyyy-MM-ddT00:00:00"
					});
					vweek = dateFormat1.format(week);
					oController.byId("id_gateweek").setValue(vweek);
				} else {
					var toDate = new Date(week.getFullYear(), week.getMonth(), week.getDate() + 6);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd.MM.yyyy"
					});
					var start = dateFormat.format(week);
					var end = dateFormat.format(toDate);
					oController.byId("Id_WeekPeriod").setText(start + " " + "-" + " " + end);
					
					var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "yyyy-MM-ddT00:00:00"
					});
					vweek = dateFormat1.format(vweek);
					oController.byId("id_gateweek").setValue(vweek);

				}

			}
			// var date = vweek;
			// startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
			// endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 6);
			// // var dateFormat = inst.settings.dateFormat || $.datepicker._defaults.dateFormat;
			// $('#startDate').text($.datepicker.formatDate( dateFormat, startDate, inst.settings ));
			// $('#endDate').text($.datepicker.formatDate( dateFormat, endDate, inst.settings ));

			if (!vDate) {
				vDate = new Date();
				var vToday = new Date();
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd.MM.yyyy"
				});
				vToday = dateFormat.format(vToday);
				oController.byId("Id_DailyPeriod").setText(vToday);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				vDate = dateFormat.format(vDate);
				oController.byId("id_gatedatewith").setValue(vDate);

			} else {
				var vToday = new Date(vDate);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd.MM.yyyy"
				});
				vToday = dateFormat.format(vToday);
				oController.byId("Id_DailyPeriod").setText(vToday);
				var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				vDate = dateFormat1.format(vDate);
				oController.byId("id_gatedatewith").setValue(vDate);

			}
			var vSelMonDt = "";
			var vSelKey = this.getView().byId("id_gatemonth").getSelectedKey();
			if (vSelKey == "") {
				vSelMonDt = new Date();
				var month = vSelMonDt.getMonth();
				var months = month + 1;
				this.getView().byId("id_gatemonth").setSelectedKey("0" + months);
			} else {
				var vYear = this.oView.byId("id_Year").getSelectedKey();
				vSelKey = Number(vSelKey - 1);
				vSelMonDt = new Date(vYear, vSelKey);
			}
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddT00:00:00"
			});
			if (this.getView().byId("id_gatemonth").getSelectedKey() != "" &&
				this.getView().byId("id_gatemonth").getSelectedKey() != undefined) {
				var MonthDate = new Date();
				switch (this.getView().byId("id_gatemonth").getSelectedKey()) {
					case "01":
						MonthDate.setMonth(0);
						break;
					case "02":
						MonthDate.setMonth(1);
						break;
					case "03":
						MonthDate.setMonth(2);
						break;
					case "04":
						MonthDate.setMonth(3);
						break;
					case "05":
						MonthDate.setMonth(4);
						break;
					case "06":
						MonthDate.setMonth(5);
						break;
					case "07":
						MonthDate.setMonth(6);
						break;
					case "08":
						MonthDate.setMonth(7);
						break;
					case "09":
						MonthDate.setMonth(8);
						break;
					case "10":
						MonthDate.setMonth(9);
						break;
					case "11":
						MonthDate.setMonth(10);
						break;
					case "12":
						MonthDate.setMonth(11);
						break;
					default:
						MonthDate = new Date();
				}
				var y = this.oView.byId("id_Year").getSelectedKey();
				var m = MonthDate.getMonth();
				var vFirstDay = "1";
				var vLastDay = new Date(y, m + 1, 0).getDate();
				month = m + 1;
				if (month < 10) {
					month = "0" + month;
				}
				this.oView.byId("Id_MonthlyPeriod").setText(vFirstDay + "." + month + "." + y + " " + "-" + " " + vLastDay + "." + month + "." + y);
			}
			var vSelMonDtFormat = dateFormat.format(vSelMonDt);
			// var vSelweek= dateFormat.format(vweek);
			var oDataModel = this.getView().getModel('odata');

			var readUrl = "/TATDataSet";
			sap.ui.core.BusyIndicator.show(0);
			oDataModel.read(readUrl, {
				filters: [
					new Filter("Erdat", FilterOperator.EQ, vDate),
					new Filter("Aedat", FilterOperator.EQ, vSelMonDtFormat),
					new Filter("Redat", FilterOperator.EQ, vweek),
					new Filter("Werks", FilterOperator.EQ, vWearks)
				],
				urlParameters: {
					$expand: ["NavDaily,NavWeekly,NavMonthly,NavData"]
				},
				success: function(oData, Response) {
					sap.ui.core.BusyIndicator.hide(0);
					var oDailyyModel = new sap.ui.model.json.JSONModel();
					var Daily = {
						"Data": oData.results[0].NavDaily.results
					};

					oDailyyModel.setData(Daily);
					oController.getView().setModel(oDailyyModel, "oDailyyModel");
					if (oData.results[0].NavDaily.results.length > 0) {
						oController.getView().byId("Id_DailyAvg").setText(oData.results[0].NavDaily.results[0].Avrg);
						oController.getView().byId("Id_DailyVechileCount").setText(oData.results[0].NavDaily.results[0].Vcount);
						oController.getView().byId("Id_DailyMinTAt").setText(oData.results[0].NavDaily.results[0].Mintat);
						oController.getView().byId("Id_DailyMaxTAt").setText(oData.results[0].NavDaily.results[0].Maxtat);
					} else {
						oController.getView().byId("Id_DailyAvg").setText("");
						oController.getView().byId("Id_DailyVechileCount").setText("");
						oController.getView().byId("Id_DailyMinTAt").setText("");
						oController.getView().byId("Id_DailyMaxTAt").setText("");
					}

					//Weekly
					var oWeeklyModel = new sap.ui.model.json.JSONModel();
					if (oData.results[0].NavWeekly) {
						var vWeekly = {
							"Data": oData.results[0].NavWeekly.results
						};
						oWeeklyModel.setData(vWeekly);
					}
					oController.getView().setModel(oWeeklyModel, "oWeeklyModel");
					if (oData.results[0].NavWeekly.results.length > 0) {
						oController.getView().byId("Id_WeeklyAvg").setText(oData.results[0].NavWeekly.results[0].Avrg);
						oController.getView().byId("Id_WeeklyVechileCount").setText(oData.results[0].NavWeekly.results[0].Vcount);
						oController.getView().byId("Id_WeeklyMinTAt").setText(oData.results[0].NavWeekly.results[0].Mintat);
						oController.getView().byId("Id_WeeklyMaxTAt").setText(oData.results[0].NavWeekly.results[0].Maxtat);
					} else {
						oController.getView().byId("Id_WeeklyAvg").setText("");
						oController.getView().byId("Id_WeeklyVechileCount").setText("");
						oController.getView().byId("Id_WeeklyMinTAt").setText("");
						oController.getView().byId("Id_WeeklyMaxTAt").setText("");
					}
					//Monthly
					var oMonthlyModel = new sap.ui.model.json.JSONModel();
					if (oData.results[0].NavMonthly) {
						var vMonthly = {
							"Data": oData.results[0].NavMonthly.results
						};
						oWeeklyModel.setData(vWeekly);
						oMonthlyModel.setData(vMonthly);
					}
					if (oData.results[0].NavMonthly.results.length > 0) {
						oController.getView().byId("Id_MonthlyAvg").setText(oData.results[0].NavMonthly.results[0].Avrg);
						oController.getView().byId("Id_MonthlyVechileCount").setText(oData.results[0].NavMonthly.results[0].Vcount);
						oController.getView().byId("Id_MonthlyMinTAt").setText(oData.results[0].NavMonthly.results[0].Mintat);
						oController.getView().byId("Id_MonthlyMaxTAt").setText(oData.results[0].NavMonthly.results[0].Maxtat);
					} else {
						oController.getView().byId("Id_MonthlyAvg").setText("");
						oController.getView().byId("Id_MonthlyVechileCount").setText("");
						oController.getView().byId("Id_MonthlyMinTAt").setText("");
						oController.getView().byId("Id_MonthlyMaxTAt").setText("");
					}
					var oRes = new sap.ui.model.json.JSONModel();
					var Daily = {
						"data": []
					};
					oRes.setData(Daily);
					oController.getView().setModel(oRes, "oTable");

					oController.getView().setModel(oMonthlyModel, "oMonthlyModel");
					var oVizFrame = oController.getView().byId("idVizFrame");
					//Daily
					oVizFrame.setVizProperties({
						plotArea: {
							colorPalette: ['#1ed6a5', '#fa905b', '#ef3a54'],
							drawingEffect: "glossy",
							dataLabel: {
								visible: true
							}
						}
					});
					//Monthly
					var oVizFrame1 = oController.getView().byId("idVizFrame2");
					oVizFrame1.setVizProperties({
						plotArea: {
							colorPalette: ['#1ed6a5', '#fa905b', '#ef3a54'],
							drawingEffect: "glossy",
							dataLabel: {
								visible: true
							}
						}
					});
					//Weekly
					var oVizFrame2 = oController.getView().byId("idVizFrame1");
					oVizFrame2.setVizProperties({
						plotArea: {
							colorPalette: ['#1ed6a5', '#fa905b', '#ef3a54'],
							drawingEffect: "glossy",
							dataLabel: {
								visible: true
							}
						}
					});
				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show(oResponse.message);
				}
			});
		},
		fnDailypress: function() {
			this.vSelectedGraph = "D";
			var oController = this;
			var vDate = oController.byId("id_gatedatewith").getValue();
			if (!vDate) {
				vDate = new Date();
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				vDate = dateFormat.format(vDate);

			}
			/*  var vDate = oControl.byId("id_gatedatewith").getDateValue();
			 if(vDate){
			 	vDate = new Date();
			 }*/
			var vSelMonDt = "";
			var vSelKey = this.getView().byId("id_gatemonth").getSelectedKey();
			if (vSelKey == "") {
				vSelMonDt = new Date();
			} else {
				var vYear = new Date().getFullYear();
				vSelKey = Number(vSelKey - 1);
				vSelMonDt = new Date(vYear, vSelKey);
			}
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddT00:00:00"
			});
			var vSelMonDtFormat = dateFormat.format(vSelMonDt);

			var oDataModel = this.getView().getModel('odata');

			var readUrl = "/TATDataSet";
			sap.ui.core.BusyIndicator.show(0);
			oDataModel.read(readUrl, {
				filters: [
					new Filter("Erdat", FilterOperator.EQ, vDate),
					new Filter("Aedat", FilterOperator.EQ, vSelMonDtFormat),
					new Filter("Name1", FilterOperator.EQ, "D"),
					new Filter("Werks", FilterOperator.EQ, vWearks)

				],
				urlParameters: {
					$expand: ["NavDaily,NavWeekly,NavMonthly,NavData"]
				},
				success: function(oData, Response) {
					sap.ui.core.BusyIndicator.hide(0);
					var oRes = new sap.ui.model.json.JSONModel();
					var Daily = {
						"data": oData.results[0].NavData.results
					};
					oRes.setData(Daily);
					oController.getView().setModel(oRes, "oTable");

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show(oResponse.message);
				}
			});

		},

		fnMonthlypress: function() {
			this.vSelectedGraph = "M";
			var oController = this;
			var vDate = oController.byId("id_gatedatewith").getValue();
			if (!vDate) {
				vDate = new Date();
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				vDate = dateFormat.format(vDate);

			}
			/*  var vDate = oControl.byId("id_gatedatewith").getDateValue();
			 if(vDate){
			 	vDate = new Date();
			 }*/
			var vSelMonDt = "";
			var vSelKey = this.getView().byId("id_gatemonth").getSelectedKey();
			if (vSelKey == "") {
				vSelMonDt = new Date();
			} else {
				var vYear = this.getView().byId("id_Year").getSelectedKey();
				vSelKey = Number(vSelKey - 1);
				vSelMonDt = new Date(vYear, vSelKey);
			}
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddT00:00:00"
			});
			var vSelMonDtFormat = dateFormat.format(vSelMonDt);

			var oDataModel = this.getView().getModel('odata');

			var readUrl = "/TATDataSet";
			sap.ui.core.BusyIndicator.show(0);
			oDataModel.read(readUrl, {
				filters: [
					new Filter("Erdat", FilterOperator.EQ, vDate),
					new Filter("Aedat", FilterOperator.EQ, vSelMonDtFormat),
					new Filter("Name1", FilterOperator.EQ, "M"),
					new Filter("Werks", FilterOperator.EQ, vWearks)

				],
				urlParameters: {
					$expand: ["NavDaily,NavWeekly,NavMonthly,NavData"]
				},
				success: function(oData, Response) {
					sap.ui.core.BusyIndicator.hide(0);
					var oRes = new sap.ui.model.json.JSONModel();
					var Daily = {
						"data": oData.results[0].NavData.results
					};
					oRes.setData(Daily);
					oController.getView().setModel(oRes, "oTable");

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show(oResponse.message);
				}
			});

		},

		fndeselectmonthly: function() {
			var vizFrame = this.getView().byId("idVizFrame2");
			var action = {
				clearSelection: true
			};
			vizFrame.vizSelection(oMonthly, action);
		},

		fnWeeklypress: function() {
			this.vSelectedGraph = "W";
			var oController = this;

			var vDate = oController.byId("id_gatedatewith").getValue();
			if (!vDate) {
				vDate = new Date();
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				vDate = dateFormat.format(vDate);

			}
			var vWeekDate = oController.byId("id_gateweek").getDateValue();
			if (!vWeekDate) {
				vWeekDate = new Date();
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				vWeekDate = dateFormat.format(vWeekDate);

			}
			/*  var vDate = oControl.byId("id_gatedatewith").getDateValue();
			 if(vDate){
			 	vDate = new Date();
			 }*/
			var vSelMonDt = "";
			var vSelKey = this.getView().byId("id_gatemonth").getSelectedKey();
			if (vSelKey == "") {
				vSelMonDt = new Date();
			} else {
				var vYear = new Date().getFullYear();
				vSelKey = Number(vSelKey - 1);
				vSelMonDt = new Date(vYear, vSelKey);
			}
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddT00:00:00"
			});
			var vSelMonDtFormat = dateFormat.format(vSelMonDt);
			// var vSelWeek= dateFormat.format(vWeekDate);
			var oDataModel = this.getView().getModel('odata');

			var readUrl = "/TATDataSet";
			sap.ui.core.BusyIndicator.show(0);
			oDataModel.read(readUrl, {
				filters: [
					new Filter("Erdat", FilterOperator.EQ, vDate),
					new Filter("Aedat", FilterOperator.EQ, vSelMonDtFormat),
					new Filter("Redat", FilterOperator.EQ, vWeekDate),
					new Filter("Name1", FilterOperator.EQ, "W"),
					new Filter("Werks", FilterOperator.EQ, vWearks)

				],
				urlParameters: {
					$expand: ["NavDaily,NavWeekly,NavMonthly,NavData"]
				},
				success: function(oData, Response) {
					sap.ui.core.BusyIndicator.hide(0);
					var oRes = new sap.ui.model.json.JSONModel();
					var Daily = {
						"data": oData.results[0].NavData.results
					};
					oRes.setData(Daily);
					oController.getView().setModel(oRes, "oTable");

				},
				error: function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show(oResponse.message);
				}
			});

		},
		//To deselect the vizframe chart added by Srileaka on 30.01.2020
		fndeselectweekly: function() {
			var vizFrame = this.getView().byId("idVizFrame1");
			var action = {
				clearSelection: true
			};
			vizFrame.vizSelection(oWeekly, action);
		},
		//===============================================================
		//-------------------Back Function----------------------
		//===============================================================
		onBackPress: function() {
			this.getOwnerComponent().getRouter().navTo("Dashboard");
		},
		fnSendEMail: function(oEvent) {

			var arrmail = [];
			var obj = {
				Vbeln: ""

			};

			if (!this.omail) {
				this.omail = sap.ui.xmlfragment(
					"LoadingConfirmation.fragment.Mail", this);
				//  this.oCurr.setBusy(true);
				this.getView().addDependent(this.omail);

			}

			this.omail.open();
			var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			sap.ui.getCore().byId('id_AddImg1').setSrc(vPathImage + "/Images/Add.png");
			sap.ui.getCore().byId('id_RemoveImg1').setSrc(vPathImage + "/Images/Delete.png");
			arrmail.push(obj);
			var omail = new sap.ui.model.json.JSONModel();
			omail.setData(arrmail);
			this.getView().setModel(omail, "JMinput");
		},
		fnPressAdd: function(oEvent) {
			var oTabModel = this.getView().getModel("JMinput");
			var oTabData = oTabModel.getData();

			oTabData.push({
				"Vbeln": ""

			});

			oTabModel.refresh();
		},
		fnPressDelete: function(oEvent) {
			var vPath = Number(oEvent.getSource().getBindingContext("JMinput").getPath().split("/")[1]);
			var oTabModel = this.getView().getModel("JMinput");
			var oTabData = oTabModel.getData();
			if (oTabData.length > 1) {
				oTabData.splice(vPath, 1);

				oTabModel.refresh();
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("oneItem"));
			}

		},
		onsend: function() {
			// var oControl = this;

			var vData = this.getView().getModel("JMinput").getData();
			// vmailid = sap.ui.getCore().byId("id_mail").getValue();
			var len = vData.length;
			for (var i = 0; i < len; i++) {
				if (vmailid) {

					vmailid = vmailid + "," + vData[i].Vbeln;
				} else {
					vmailid = vData[i].Vbeln;
				}
			}
			var oControl = this;
			var oDataModel = this.getView().getModel('odata');
			var readUrl = "/TatReportSet";
			//var vmailid = sap.m.URLHelper.triggerEmail(vmailid);
			sap.ui.core.BusyIndicator.show(0);
			oDataModel.read(readUrl, {
				filters: [
					new Filter("Flag", FilterOperator.EQ, Vflag),
					new Filter("InOut", FilterOperator.EQ, vmonselected),
					new Filter("Mail", FilterOperator.EQ, vmailid)
				],
				urlParameters: {
					$expand: ["NavFlag"]
				},
				success: function(odata, Response) {
					sap.ui.core.BusyIndicator.hide();
					var aData = {
						"data": odata.results[0].NavFlag.results
					};
					/*	var oTable = new sap.ui.model.json.JSONModel();
						oTable.setData(aData);
						oControl.getView().setModel(oTable, "oTable");*/
					//Excel Model
					var oExcel = new sap.ui.model.json.JSONModel();
					oExcel.setData(aData.data);
					oControl.getView().setModel(oExcel, "oExcel");
					oControl.fndeselectmonthly();
				}

			});
			if (vData[0].Vbeln !== "") {
				var mailsuccess = oControl.getView().getModel('i18n').getProperty('mailsuccess');
				sap.m.MessageToast.show(mailsuccess);
			} else if (vData[0].Vbeln === "") {
				var mailsuccess1 = oControl.getView().getModel('i18n').getProperty('mailsuccess1');
				sap.m.MessageToast.show(mailsuccess1);
			}
			oControl.omail.close();
			// }
		},
		onMailClose: function() {
			this.omail.close();
		},
		onsend1: function() {
			//Vflag = "M";
			var oControl = this;
			var oDataModel = this.getView().getModel('odata');
			var readUrl = "/TatReportSet";

			sap.ui.core.BusyIndicator.show(0);
			oDataModel.read(readUrl, {
				filters: [
					new Filter("Flag", FilterOperator.EQ, Vflag),
					new Filter("InOut", FilterOperator.EQ, vmonselected)
				],
				urlParameters: {
					$expand: ["NavFlag"]
				},
				success: function(odata, Response) {
					sap.ui.core.BusyIndicator.hide();
					var aData = {
						"data": odata.results[0].NavFlag.results
					};
					var oTable = new sap.ui.model.json.JSONModel();
					oTable.setData(aData);
					oControl.getView().setModel(oTable, "oTable");
					//Excel Model
					var oExcel = new sap.ui.model.json.JSONModel();
					oExcel.setData(aData.data);
					oControl.getView().setModel(oExcel, "oExcel");
					oControl.fndeselectmonthly();
				}

			});
			oControl.omail.close();

		},
		fnHeadertext: function(value) {
			if (value) {
				this.addStyleClass("Text");
			}

		},
		fnDownload: function() {
			var aFinal_Excel = [];
			var oView = this.getView();
			var oTab = this.getView().byId("id_Table");
			if (oTab.getModel("oTable")) {
				var aColumn_Record = [
					[{
							'text': oView.getModel("i18n").getProperty("Gate_Entry_No").toUpperCase()
						}, {
							'text': oView.getModel("i18n").getProperty("Plant").toUpperCase()
						}, {
							// Vechile Number
							'text': oView.getModel("i18n").getProperty("VechileNo").toUpperCase()
						}, {
							'text': oView.getModel("i18n").getProperty("ReportingDate1").toUpperCase()
						}, {
							'text': oView.getModel("i18n").getProperty("ReportingTime1").toUpperCase()
						},

						// Gate Entry Date
						{
							'text': oView.getModel("i18n").getProperty("GateEd").toUpperCase()
						},
						// Gate Entry Time
						{
							'text': oView.getModel("i18n").getProperty("GateEt").toUpperCase()
						},
						// Transporter Code
						{
							'text': oView.getModel("i18n").getProperty("Transporter").toUpperCase()
						},
						// Transporter Description
						{
							'text': oView.getModel("i18n").getProperty("Transprt").toUpperCase()
						},
						// Loading Start date
						{
							'text': oView.getModel("i18n").getProperty("Loadingstrtdat").toUpperCase()
						},
						// Loading Start Time					
						{
							'text': oView.getModel("i18n").getProperty("Loadingstrttim").toUpperCase()
						},
						// Loading End Date					
						{
							'text': oView.getModel("i18n").getProperty("Loadingenddat").toUpperCase()
						},
						// Loading End Time					
						{
							'text': oView.getModel("i18n").getProperty("Loadingendtim").toUpperCase()
						}, {
							'text': oView.getModel("i18n").getProperty("LoadinginHrs").toUpperCase()
						},
						// Picking Status					
						{
							'text': oView.getModel("i18n").getProperty("Pickingstat").toUpperCase()
						},
						// Pgi Date					
						{
							'text': oView.getModel("i18n").getProperty("Pgidat").toUpperCase()
						},
						// Pgi Time					
						// {
						// 	'text': oView.getModel("i18n").getProperty("Pgitim")
						// },
						// Invoice Status					
						{
							'text': oView.getModel("i18n").getProperty("Invoicestat").toUpperCase()
						},
						// Gate Exit Date
						{
							'text': oView.getModel("i18n").getProperty("GateExitd").toUpperCase()
						},
						// Gate Exit Time
						{
							'text': oView.getModel("i18n").getProperty("GateExitt").toUpperCase()
						},
						// TAT
						{
							'text': oView.getModel("i18n").getProperty("TAT").toUpperCase()
						}, {
							'text': oView.getModel("i18n").getProperty("TAThrs").toUpperCase()
						},
						// Delivery Number
						{
							'text': oView.getModel("i18n").getProperty("DeliverNo").toUpperCase()
						},
						// Ship To Patry ID
						{
							'text': oView.getModel("i18n").getProperty("Shippat").toUpperCase()
						},
						// Ship To Party Desc
						{
							'text': oView.getModel("i18n").getProperty("Shippatdesc").toUpperCase()
						},
						// Remarks
						{
							'text': oView.getModel("i18n").getProperty("Remarks").toUpperCase()
						},
						// Current Stat
						{
							'text': oView.getModel("i18n").getProperty("CurrentStat").toUpperCase()
						}

						// // Pgi Status					
						// {
						// 	'text': oView.getModel("i18n").getProperty("pgistat")
						// }

					]
				];

				var arrData = oTab.getModel("oTable").getData(); // We got the data of the model in an array
				for (var i = 0; i < arrData.data.length; i++) {
					var loadingdiff = ((formatter.fnmsToTime(oTab.getModel("oTable").getData().data[i].Ertim)) - (formatter.fnmsToTime(oTab.getModel(
						"oTable").getData().data[i].Kouhr)));
					aColumn_Record.push([{
							"text": oTab.getModel("oTable").getData().data[i].Wbid
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Werks
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Vehno

						}, {
							"text": formatter.fnDateConversion(oTab.getModel("oTable").getData().data[i].Redat)
						}, {
							"text": formatter.fnmsToTime(oTab.getModel("oTable").getData().data[i].Retim)
						}, {
							"text": formatter.fnDateConversion(oTab.getModel("oTable").getData().data[i].Erdat)
						}, {
							"text": formatter.fnmsToTime(oTab.getModel("oTable").getData().data[i].Ertim)
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Lifnr
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Lname
						}, {
							"text": formatter.fnDateConversion(oTab.getModel("oTable").getData().data[i].Kodat)
						}, {
							"text": formatter.fnmsToTime(oTab.getModel("oTable").getData().data[i].Kouhr)
						}, {
							"text": formatter.fnDateConversion(oTab.getModel("oTable").getData().data[i].Lddat)
						}, {
							"text": formatter.fnmsToTime(oTab.getModel("oTable").getData().data[i].Lduhr)
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Loadtat
						}, {
							"text": formatter.fnpgistatus(oTab.getModel("oTable").getData().data[i].Kosta)
						}, {
							"text": formatter.fnDateConversion(oTab.getModel("oTable").getData().data[i].WadatIst)
						},
						// {
						// 	"text": formatter.fnmsToTime(oTab.getModel("oTable").getData().data[i].Wauhr)
						// }, 
						{
							"text": formatter.fnpgistatus(oTab.getModel("oTable").getData().data[i].Fksta)
						}, {

							"text": formatter.fnDateConversion(oTab.getModel("oTable").getData().data[i].Aedat)
						}, {
							"text": formatter.fnmsToTime(oTab.getModel("oTable").getData().data[i].Aetim)
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Tat
						}, {
							"text": formatter.fnHoursFormat(oTab.getModel("oTable").getData().data[i].Tat)
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Vbeln
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Kunnr
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Name1
						}, {
							"text": oTab.getModel("oTable").getData().data[i].Remark
						}, {
							"text": formatter.fnStatus(oTab.getModel("oTable").getData().data[i].Config4)
						}

						// {
						// 	"text": formatter.fnpgistatus(oTab.getModel("oTable").getData().data[i].Wbsta)
						// }
					]);
				}
				aFinal_Excel.push(aColumn_Record);

				//context
				var tabularData = [{
					"sheetName": "Total Turn Around Time Report",
					"data": aColumn_Record

				}];

				var options = {
					fileName: "Total Turn Around Time Report",
					extension: ".xlsx",
					sheetName: "Sheet",
					fileFullName: "Total Turn Around Time Report.xlsx",
					header: true,
					maxCellWidth: 30
				};
				Jhxlsx.export(tabularData, options);
			}
		},
		fnSendEMailFinal: function() {
			var oController = this;
			var vDate = oController.byId("id_gatedatewith").getValue();

			var vData1 = this.getView().getModel("JMinput").getData();
			var vData = vData1.filter(function(el) {
				return el.Vbeln !== "";
			});
			if (vData.length) {

				if (!vDate) {
					vDate = new Date();
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "yyyy-MM-ddT00:00:00"
					});
					vDate = dateFormat.format(vDate);

				}

				var vSelMonDt = "";
				var vSelKey = this.getView().byId("id_gatemonth").getSelectedKey();
				if (vSelKey == "") {
					vSelMonDt = new Date();
				} else {
					var vYear = new Date().getFullYear();
					vSelKey = Number(vSelKey - 1);
					vSelMonDt = new Date(vYear, vSelKey);
				}
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vSelMonDtFormat = dateFormat.format(vSelMonDt);

				var oDataModel = this.getView().getModel('odata');

				var aFilters = [];

				for (var i = 0; i < vData.length; i++) {
					var vMail = vData[i].Vbeln;
					var oFilter1 = new sap.ui.model.Filter("Remark", sap.ui.model.FilterOperator.EQ, vMail);
					aFilters.push(oFilter1);
				}
				var oFilter2 = new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, vDate);
				aFilters.push(oFilter2);

				var oFilter3 = new sap.ui.model.Filter("Aedat", sap.ui.model.FilterOperator.EQ, vSelMonDtFormat);
				aFilters.push(oFilter3);

				var oFilter4 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.EQ, this.vSelectedGraph);
				aFilters.push(oFilter4);

				var readUrl = "/TATDataSet";
				sap.ui.core.BusyIndicator.show(0);
				oDataModel.read(readUrl, {
					filters: aFilters,
					urlParameters: {
						$expand: ["NavDaily,NavWeekly,NavMonthly,NavData"]
					},
					success: function(oData, Response) {
						var mailsuccess1 = oController.getView().getModel('i18n').getProperty('mailsuccess');
						sap.m.MessageToast.show(mailsuccess1);
						oController.omail.close();
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(oResponse) {
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageToast.show(oResponse.message);
					}
				});
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("RecipientENter"));

			}
		}

	});
});