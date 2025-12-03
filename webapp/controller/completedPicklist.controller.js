sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel"
], function(Controller, MessageBox, FilterOperator, Filter, JSONModel) {
	"use strict";

	return Controller.extend("LoadingConfirmation.controller.completedPicklist", {

		/*-----------------------------------------------------------------------------*/
		/*					Author		: Malarpriya N								   */
		/*					Description : completedPicklist  Controller					   */
		/*					Company		: Exalca Technologies Pvt Ltd.				   */
		/*					Created On	: 											   */
		/*					Changed On	: 											   */
		/*-----------------------------------------------------------------------------*/
		//===============================================================
		//-------------------On Init Function----------------------
		//===============================================================
		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("completedPicklist").attachPatternMatched(this._onObjectMatched, this);
			this.oView.setModel(new sap.ui.model.json.JSONModel(), "oViewModel");
		},

		//===============================================================
		//-------------------Back Function----------------------
		//===============================================================
		onBackPress: function() {
			this.getOwnerComponent().getRouter().navTo("Dashboard");
		},
		//===============================================================
		//-------------------Load Requird Data function Function----------------------
		//===============================================================

		_onObjectMatched: function(oEvent) {
			var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			// this.getView().byId('id_logo').setSrc(vPathImage + "/Images/login-logo@2x.png");
			/*this.getView().byId('id_logo').setSrc(vPathImage +"/Images/olam-colour.png");*/
			this.getView().byId('id_homenew').setSrc(vPathImage + "/Images/home.png");
			//	var networkState = navigator.connection.type,
			var that = this;
			that.oBundle = that.getView().getModel("i18n").getResourceBundle();

			// if (networkState !== "none") {
			that.getBusyDialog = new sap.m.BusyDialog({
				//	text: that.oBundle.getText('dataLoadingMsg')
			}).open();
			var oPath = "",
				vWerks = "",
				sPara = oEvent.getParameter("arguments").List;
			if (sPara === "Completed") {
				// oPath = "InputSe?$Werks &$expand=InpHelpNav";
				oPath = "InpHelpNav";
				if (this.getOwnerComponent().getModel("localModel").getProperty("/plant")) {
					vWerks = this.getOwnerComponent().getModel("localModel").getProperty("/plant");
				}
			} else if (sPara === "Pending") {
				// oPath = "InputSet?$expand=InpPendNav";
				oPath = "InpPendNav";
				if (this.getOwnerComponent().getModel("localModel").getProperty("/plant")) {
					vWerks = this.getOwnerComponent().getModel("localModel").getProperty("/plant");
				}
			}
			/*	var oGetModel = new sap.ui.model.odata.ODataModel(
							url.getServiceUrl("ZGW_GT_SD_DELIVERY_DET_SRV"),
							true,
							that.username,
							that.password);*/
			var oGetModel = this.getView().getModel('odata');

			oGetModel.read("/InputSet", {
				filters: [
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, vWerks)
				],
				urlParameters: {
					$expand: oPath
				},
				success: function(oData, oResponse) {
					var oJson = "";
					//	code added by kirubakaran on 22.07.2020//
					// if (sPara === "Completed") {
					// 	for (var t = 0; t < oData.results[0].InpHelpNav.results.length; t++) {
					// 		if (oData.results[0].InpHelpNav.results[t].Nf_Number !== "") {
					// 			that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
					// 		} else {
					// 			that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
					// 		}
					// 	}
					// } else {
					// 	for (var v = 0; v < oData.results[0].InpPendNav.results.length; v++) {
					// 		if (oData.results[0].InpPendNav.results[v].Nf_Number !== "") {
					// 			that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
					// 		} else {
					// 			that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
					// 		}
					// 	}
					// }
					//	code ended by kirubakaran on 22.07.2020//
					if (sPara === "Completed") {
						oJson = new sap.ui.model.json.JSONModel(oData.results[0].InpHelpNav);
						var vtext = that.getView().getModel('i18n').getProperty('CompletedPickList');
						that.getView().byId("PickListHeader").setHeaderText(vtext);
						// that.getView().byId("PickListHeaderText").setText(vtext);

						//End Time					
						that.getView().byId("id_loadendtime").setVisible(true);
						//End Date
						that.getView().byId("id_loadenddate").setVisible(true);
						//Start Date
						that.getView().byId("id_loadstartdate").setVisible(false);
						//Start Time
						that.getView().byId("id_loadstarttime").setVisible(false);

					} else if (sPara === "Pending") {
						if(oData.results[0].InpPendNav.results.length > 0){
							for(var i=0; i<oData.results[0].InpPendNav.results.length; i++){
								if(oData.results[0].InpPendNav.results[i].Kostk === ""){
									oData.results[0].InpPendNav.results[i].Kostk = "Not Relavent";
								}
							}
						}
						oJson = new sap.ui.model.json.JSONModel(oData.results[0].InpPendNav);
						var vtext1 = that.getView().getModel('i18n').getProperty('CompletedPickListHeader');
						that.getView().byId("PickListHeader").setHeaderText(vtext1);
						// that.getView().byId("PickListHeaderText").setText(vtext);
						//End Time					
						that.getView().byId("id_loadendtime").setVisible(false);
						//End Date
						that.getView().byId("id_loadenddate").setVisible(false);
						//Start Date
						that.getView().byId("id_loadstartdate").setVisible(true);
						//Start Time
						that.getView().byId("id_loadstarttime").setVisible(true);
					}
					that.TableData = oJson.getData().results;
					that.vPara = sPara;
					that.getView().setModel(new sap.ui.model.json.JSONModel({}), "PickList");
					that.getView().getModel("PickList").refresh();
					that.getView().setModel(oJson, "PickList");
					//	that.getView().getModel("PickList").refresh();
					that.getBusyDialog.close();
				},
				error: function(oError) {
					sap.m.MessageBox.error(oError.message, {
						onClose: function(oAction) {
							that.getOwnerComponent().getRouter().navTo("Dashboard");
							//	navigator.app.exitApp();
						}
					});
					that.getBusyDialog.close();
				}
			});
		},
		fnListPressToScan: function(oEvent) {
			if (this.vPara == "Pending") {

				var that = this;
				var vDelno = oEvent.getSource().getBindingContext('PickList').getProperty('Vbeln');
				that.oSelectedobj = oEvent.getSource().getBindingContext('PickList').getObject();


				var vActn = 'X';

				var readUrl = "/LoadTimeUpdateSet";
				this.getView().getModel('odata').read(readUrl, {
					filters: [
						new Filter("Vbeln", FilterOperator.EQ, vDelno),
						new Filter("Flag", FilterOperator.EQ, vActn)
					],
					success: function(odata, Response) {
						if (odata.results[0].Flag == 'X') {

							// that.fnNavToPickList(vDelno);
							that.fnNavToPickList2(vDelno);
						} 
					//Begin of IN_KARTHI
						else if (odata.results[0].Flag == 'T' || odata.results[0].Flag == 'C' ) { // Added by Malar - 24.01.2023
							that.fnNavToPickListTO(vDelno,odata.results[0].Flag);
						} 
					//End of IN_KARTHI
						else {
							var EnterDel = that.getView().getModel("i18n").getResourceBundle().getText("PleaseCaptureLoadingStartTime");
							sap.m.MessageToast.show(EnterDel);
						}
					},
					error: function(oResponse) {}
				});

			}
		},
		fnNavToPickList2: function(vDelno) {
			var that = this;
			var localModel = that.getOwnerComponent().getModel("localModel");
			localModel.setProperty("/Vbeln", vDelno);
			localModel.refresh();
			that.getOwnerComponent().getRouter().navTo("Deliverycheck");
		},
		//Begin of IN_KARTHI
           fnNavToPickListTO: function(vDelno,Flag) {
			var that = this;
			var localModel = that.getOwnerComponent().getModel("localModel");
			localModel.setProperty("/Vbeln", vDelno);
			localModel.refresh();
			if(Flag === 'T'){   //Added by Malar - 24.01.2023
				that.getOwnerComponent().getRouter().navTo("TOConfirm");
			}
			else{
				that.getOwnerComponent().getRouter().navTo("TOConfirmNew");
			}
			
		},
        //END of IN_KARTHI
		fnNavToPickList: function(vDelno) {
			var that = this;
			that.getBusyDialog = new sap.m.BusyDialog({

			}).open();

			//var oPath = "DeliverySet?$filter=Vbeln eq '8130002478'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";
			var vPlant = that.getOwnerComponent().getModel("localModel").getData().plant; //Added by Avinash.....
			var oPath = "DeliverySet?$filter=Vbeln eq '" + vDelno + "'and Werks eq '" + vPlant +
				"'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";

			var oGetModel = this.getView().getModel('odata');

			oGetModel.read(oPath, null, null, true, function(oData, oResponse) {
				that.getBusyDialog.close();
				// that.getBusyDialog.close();
				var oDataR = oData.results[0];
				//code added by kirubkaran on 23.09.2020 for brazil plant 
				// if (oDataR.DelEsOutNav.results[0].Nf_Number === "") {
				// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
				// } else {
				// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
				// }
				//code ended by kirubkaran on 23.09.2020 for brazil plant 
				if (oDataR.DelReturnNav.results["length"] !== 0) {

					sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
						actions: [MessageBox.Action.CLOSE],
						onClose: function(oAction) {
							if (oAction === "CLOSE") {
								//Commented By Guruprasad On 14.01.2020.
								// that.getOwnerComponent().getRouter().navTo("Dashboard");
								//Added By Guruprasad On 14.1.2020.
								//	location.reload(); //commented by Srileaka on 30.01.2020
								// that._onObjectMatched();
								that.getBusyDialog.close();
								// that._ResetQRCode(that);
							}
						}
					});

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

					var oHeaderLines = {
						HeaderItems: oHeaderItems,
						LineItems: oLineItems,
						Header: oDataR.DelEsOutNav.results[0]
					};

					var oJson = new sap.ui.model.json.JSONModel(oHeaderLines);
					that.getOwnerComponent().setModel(oJson, "DeliverySet");
					that.getBusyDialog.close();
					that.getOwnerComponent().getRouter().navTo("Deliverycheck");

				}
			}, function(oError) {
				sap.m.MessageBox.error(oError.message, {
					onClose: function(oAction) {
						//	navigator.app.exitApp();
					}
				});
				that.getBusyDialog.close();
			});
		},
		fnSearchDeliveryNo: function(oEvt) {
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("Vbeln", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			var list = this.byId("PickListHeader");
			var binding = list.getBinding("items");
			binding.filter(aFilters);
		},
		onPressFilter: function() {
			var self = this;

			if (self.getView().getModel("PickList") !== undefined) {
				var aData = self.TableData;
				var aArray = [];
				var uniqueMake = [new Set(aData.map(function(obj) {
					return obj.Lgort;
				}))];
				var data = uniqueMake[0].values();
				for (var i = 0; i < uniqueMake[0].size; i++) {
					var aLgort = data.next().value;
					// added by dharma
					var vLgobe = "";
					for (var j = 0; j < aData.length; j++) {
						if (aLgort == aData[j].Lgort) {
							vLgobe = aData[j].Lgobe;
							break;
						}
					}
					// ended by dharma 
					var Object = {
						"Lgort": aData[j].Lgort,
						"Lgobe": vLgobe
					};
					aArray.push(Object);
				}

				aArray.push({
					"Lgort": "All",
					"Lgobe": ""
				});

				self.oJsonModel = new sap.ui.model.json.JSONModel();
				self.oJsonModel.setData(aArray);
				self.getView().setModel(self.oJsonModel, "oStorage");
			}
			if (!self.StorageFilter) {
				self.StorageFilter = sap.ui.xmlfragment("LoadingConfirmation.fragment.StorageFilter", self);
				self.getView().addDependent(self.StorageFilter);
			}
			//self.StorageFilter.fireSearch();
			self.StorageFilter.open();

		},
		onSearchStorage: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			oFilter = new sap.ui.model.Filter([
				new Filter("Lgort", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},
		onConfirmStorage: function(oEvent) {
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			var oData = self.TableData;
			if (oSelectedItem.getTitle() !== "All") {
				var aData = oData.filter(function(obj) {
					return obj.Lgort == oSelectedItem.getTitle();
				});
				self.getView().getModel("PickList").getData().results = aData;
				self.getView().getModel("PickList").refresh(true);
			} else {

				self.getView().getModel("PickList").getData().results = self.TableData;
				self.getView().getModel("PickList").refresh(true);
			}
			// for(var i=oData.length-1; i>= 0 ; i++){
			// 	if(oData[i].Lgort !== oSelectedItem.getTitle() ){
			// 	oData.splice(i,1);	
			// 	}
			// }
			// 	self.getView().getModel("PickList").getData().results = [];
			// 	self.getView().getModel("PickList").getData().results.push(oData);
			// 	self.getView().getModel("PickList").refresh();

		}

	});

});