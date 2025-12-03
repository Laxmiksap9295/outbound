jQuery.sap.require("sap.ndc.BarcodeScanner");
var a;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/m/MessageBox',
	"sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, MessageBox, JSONModel) {
	"use strict";
	var Signature, oCont;
	this.ContractChange = false;
	/*-----------------------------------------------------------------------------*/
	/*					Author		: Guruprasad								   */
	/*					Description : Delivery controller   	 				   */
	/*					Company		: Exalca Technologies Pvt Ltd.				   */
	/*					Created On	: 											   */
	/*					Changed On	: 											   */
	/*-----------------------------------------------------------------------------*/

	var CanvasToBMP = {
		/**
		 * Convert a canvas element to ArrayBuffer containing a BMP file
		 * with support for 32-bit (alpha).
		 *
		 * Note that CORS requirement must be fulfilled.
		 *
		 * @param {HTMLCanvasElement} canvas - the canvas element to convert
		 * @return {ArrayBuffer}
		 */
		toArrayBuffer: function (canvas) {

			var w = canvas.width,
				h = canvas.height,
				w4 = w * 4,
				idata = canvas.getContext("2d").getImageData(0, 0, w, h),
				data32 = new Uint32Array(idata.data.buffer), // 32-bit representation of canvas

				stride = Math.floor((32 * w + 31) / 32) * 4, // row length incl. padding
				pixelArraySize = stride * h, // total bitmap size
				fileLength = 122 + pixelArraySize, // header size is known + bitmap

				file = new ArrayBuffer(fileLength), // raw byte buffer (returned)
				view = new DataView(file), // handle endian, reg. width etc.
				pos = 0,
				x, y = 0,
				p, s = 0,
				a, v;

			// write file header
			setU16(0x4d42); // BM
			setU32(fileLength); // total length
			pos += 4; // skip unused fields
			setU32(0x7a); // offset to pixels

			// DIB header
			setU32(108); // header size
			setU32(w);
			setU32(-h >>> 0); // negative = top-to-bottom
			setU16(1); // 1 plane
			setU16(32); // 32-bits (RGBA) // Converting to 8 Bit to upload to SAP DMS @Sai
			setU32(3); // no compression (BI_BITFIELDS, 3)
			setU32(pixelArraySize); // bitmap size incl. padding (stride x height)
			setU32(2835); // pixels/meter h (~72 DPI x 39.3701 inch/m)
			setU32(2835); // pixels/meter v
			pos += 8; // skip color/important colors
			setU32(0xff0000); // red channel mask
			setU32(0xff00); // green channel mask
			setU32(0xff); // blue channel mask
			setU32(0xff000000); // alpha channel mask
			setU32(0x57696e20); // " win" color space

			// bitmap data, change order of ABGR to BGRA
			while (y < h) {
				p = 0x7a + y * stride; // offset + stride x height
				x = 0;
				while (x < w4) {
					v = data32[s++]; // get ABGR
					a = v >>> 24; // alpha channel
					view.setUint32(p + x, (v << 8) | a); // set BGRA
					x += 4;
				}
				y++;
			}

			return file;

			// helper method to move current buffer position
			function setU16(data) {
				view.setUint16(pos, data, true);
				pos += 2;
			}

			function setU32(data) {
				view.setUint32(pos, data, true);
				pos += 4;
			}
		},

		/**
		 * Converts a canvas to BMP file, returns a Blob representing the
		 * file. This can be used with URL.createObjectURL().
		 * Note that CORS requirement must be fulfilled.
		 *
		 * @param {HTMLCanvasElement} canvas - the canvas element to convert
		 * @return {Blob}
		 */
		toBlob: function (canvas) {
			return new Blob([this.toArrayBuffer(canvas)], {
				type: "image/bmp"
			});
		},

		/**
		 * Converts the canvas to a data-URI representing a BMP file.
		 * Note that CORS requirement must be fulfilled.
		 *
		 * @param canvas
		 * @return {string}
		 */
		toDataURL: function (canvas) {
			var buffer = new Uint8Array(this.toArrayBuffer(canvas)),
				bs = "",
				i = 0,
				l = buffer.length;
			while (i < l) bs += String.fromCharCode(buffer[i++]);
			return "data:image/bmp;base64," + btoa(bs);
		}
	};
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn;
	return Controller.extend("LoadingConfirmation.controller.Deliverycheck", {
		// formatter: formatter,

		//===============================================================
		//-------------------On Init Function----------------------
		//===============================================================

		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.getOwnerComponent().getRouter().getRoute("Deliverycheck").attachPatternMatched(this._onObjectMatched, this);
			// this.getView().setModel(new JSONModel(), "oViewModel");
			// this.getView().getModel("oViewModel").setProperty("/CMSProperty", false);
			// this.getView().getModel("oViewModel").setProperty("/PurchaseProperty", false);
			// this.getView().getModel("oViewModel").setProperty("/EasyProperty", false);
			// this.getView().getModel("oViewModel").setProperty("/SalesProperty", false);
			// this.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
			//this.oRouter.attachRoutePatternMatched(this.fnHandleActDet, this);
		},
		//===============================================================
		//-------------------Load Required Data Function----------------------
		//===============================================================
		_onObjectMatched: function () {
			oCont = this;
			var vPathImage = jQuery.sap.getModulePath("LoadingConfirmation");
			// this.getView().byId('id_logo').setSrc(vPathImage + "/Images/login-logo@2x.png");
			/*	this.getView().byId('id_logo').setSrc(vPathImage + "/Images/olam-colour.png");*/
			this.getView().byId('id_homenew').setSrc(vPathImage + "/Images/home.png");
			/*this.getView().byId('id_calender').setSrc(vPathImage + "/Images/calendar.png");
			this.getView().byId('id_factory').setSrc(vPathImage + "/Images/-e-Factory.png");
			this.getView().byId('id_box').setSrc(vPathImage + "/Images/box.png");
			this.getView().byId('id_user').setSrc(vPathImage + "/Images/-e-user.png");*/
			//added by srileaka to fetch batch number
			// this.fnEntityBatch();
			this.fnParameterCheck();
			var oHeaderLines = {
				HeaderItems: [],
				LineItems: [],
				Header: []
			};
		},
		//===============================================================
		//-------------------Load Delivery item Function----------------------
		//===============================================================
		_LoadDeliveryItems: function (that, vbeln, fSaved) {
			sap.ui.core.BusyIndicator.show(0);
			var oPath = "DeliverySet?$filter=Vbeln eq '" + vbeln + "'&$expand=DelOutputNav,DelReturnNav,DelEsOutNav";

			var oGetModel = this.getView().getModel("odata");
			oGetModel.read(oPath, null, null, true, function (oData, oResponse) {
				sap.ui.core.BusyIndicator.hide();
				var oDataR = oData.results[0];
				if (oDataR.DelReturnNav.results["length"] !== 0) {
					if (fSaved) {
						sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
							onClose: function (oAction) {
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
					} else {
						// that.getBusyDialog.close();

						// that._ResetQRCode(that);
						// Added By Guruprasad On 3.12.2019 For Restting The QR Code Scanner
						var oScanDataModel = new sap.ui.model.json.JSONModel();
						oScanDataModel.setData({});
						that.getOwnerComponent().setModel(oScanDataModel, "scannerData");
						that.getOwnerComponent().getRouter().navTo("Dashboard");
						//	that.getOwnerComponent().setModel(oScanDataModel, "scannerData");
						// Added By Guruprasad On 3.12.2019 For Restting The QR Code Scanner Ends Here
					}
				} else {

					var oHeaderItems = [],
						oLineItems = [];

					$.each(oDataR.DelOutputNav.results, function (index, value, array) {

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
						if (value.Fbatc === "X") { //Added by IN_KARTHI
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
						} //Added by IN_KARTHI 
					});

					var oHeaderLines = {
						HeaderItems: oHeaderItems,
						LineItems: oLineItems,
						Header: oDataR.DelEsOutNav.results[0]
					};
					sap.ui.core.BusyIndicator.hide();
					that.getOwnerComponent().getRouter().navTo("Dashboard");
					var oJson = new sap.ui.model.json.JSONModel(oHeaderLines);
					that.getOwnerComponent().setModel(oJson, "DeliverySet");
					// that.getBusyDialog.close();
					// that.fnRefresh();
				}
			}, function (oError) {
				// that.getBusyDialog.close();
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageBox.error(oError.message, {
					onClose: function (oAction) {
						this.oRouter.navTo().exitApp();
					}
				});

			});
		},

		// fnRefresh: function() {
		// 	var that = this;
		// 	var oJson = new sap.ui.model.json.JSONModel([]);
		// 	that.getOwnerComponent().setModel(oJson, "DeliverySet");
		// },

		//Added by Avinash
		fnLoadNonBatchItem: function () {
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
			oGetModel.read(oPath, null, null, true, function (oData, oResponse) {
				sap.ui.core.BusyIndicator.hide();
				var oDataR = oData.results[0];
				if (oDataR.DelReturnNav.results["length"] !== 0) {
					// if (fSaved) {
					sap.m.MessageBox.error(oDataR.DelReturnNav.results[0].Message, {
						onClose: function (oAction) {
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
									(oDataR.DelOutputNav.results[i].Charg.toString().trim().length !== 0)) { //&& vbatchSplit == false // Commented by Avi 09/06/22
									// (oDataR.DelOutputNav.results[i].Charg.toString().trim().length == 0) && oDataR.DelOutputNav.results[0].Posnr.search("900") ==
									// 0) { //Facing problem while without batch...
									vPosnr = vPosnr + 1;
									// var vPosnrStr = vPosnr.toString();
									if (oDataR.DelOutputNav.results[i].Fbatc == "X") { //added by IN_KARTHI
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
											Pikmg: "",
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
											Reason: ""
										});
									} //added by IN_KARTHI
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
									if (oDataR.DelOutputNav.results[i].Fbatc == "X") { //Added BY IN_KARTHI
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
											Pikmg: "",
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
											Reason: ""
										});
									} //added by IN_KARTHI								
								}
							} else {
								if (oDataR.DelOutputNav.results[i].Fbatc == "X") { //Added BY IN_KARTHI
									oLineItems.push(oDataR.DelOutputNav.results[i]);
								} //added by IN_KARTHI
							}
						}

					} else {
						var oHeaderItems = [],
							oLineItems = [];

						$.each(oDataR.DelOutputNav.results, function (index, value, array) {

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
							// if (value.Fbatc === "X") { //added by IN_KARTHI //changed by Avinash
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
							// } //added by IN_KARTHI
						});
						// var oHeaderLines = {
						// 	HeaderItems: oHeaderItems,
						// 	LineItems: oLineItems,
						// 	Header: oDataR.DelEsOutNav.results[0]
						// };

						// var oJson = new sap.ui.model.json.JSONModel(oHeaderLines);
						// that.getOwnerComponent().setModel(oJson, "DeliverySet");
						// that.getBusyDialog.close();
						// that.getOwnerComponent().getRouter().navTo("Deliverycheck");
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
			}, function (oError) {
				// that.getBusyDialog.close();
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageBox.error(oError.message, {
					onClose: function (oAction) {
						this.oRouter.navTo().exitApp();
					}
				});

			});

		},

		// For validating weather all the data is entered or not 
		_checkAllItemEntered: function (oData, Lgort) {
			var aHeadItems = this.getView().getModel("DeliverySet").getData().HeaderItems;
			var vAllow = false;
			var aData = jQuery.extend(true, [], oData);
			var vFbatcCheck = aHeadItems.filter(function (x) { //Added due to one non batch managed and other batch managed
				if (!x.Fbatc) {
					vAllow = true;
					aData.push(x);
				}
			});
			// if (oData.length >= aHeadItems.length || vAllow) {
			var bFlag = [];
			// $.each(oData, function(index, value, array) {		//Commented by Avinash
			$.each(aData, function (index, value, array) {
				if (((parseFloat(value.Pikmg) === 0) || value.Pikmg === "" || isNaN(parseFloat(value.Pikmg)))) {
					bFlag.push(true);
				} else {
					bFlag.push(false);
				}
			});
			return (bFlag.indexOf(true) > -1) ? true : false;
			// } else {
			// 	return true;
			// }
		},

		_checkAllNonBatchItemEntered: function (oData, Lgort) {
			var bFlag = [];
			var aData = jQuery.extend(true, [], oData);
			var aItemDatas = this.getView().getModel("DeliverySet").getData().LineItems;
			var aPush = aItemDatas.filter(function (x) {
				// x.Fbatc = "";	//Commented on 15th June
				aData.push(x);
			});
			$.each(aData, function (index, value, array) {
				if (value.Lgort) {
					// if ((!value.Fbatc) && ((parseFloat(value.Pikmg) === 0) || value.Pikmg === "" || isNaN(parseFloat( //Commented on 15th June
					if (((parseFloat(value.Pikmg) === 0) || value.Pikmg === "" || isNaN(parseFloat(
						value.Pikmg)))) {
						bFlag.push(true);
					} else {
						bFlag.push(false);
					}
				} else {
					bFlag.push(true);
				}
			});
			return (bFlag.indexOf(true) > -1) ? true : false;
		},

		_ResetQRCode: function (that) {
			// that.getBusyDialog.close();
			sap.ui.core.BusyIndicator.hide();
			var oScanDataModel = new sap.ui.model.json.JSONModel();
			oScanDataModel.setData({});
			that.getOwnerComponent().setModel(oScanDataModel, "scannerData");
			// sqliteDB.transaction(function(tx) {
			// 	tx.executeSql('DELETE FROM qr_setting;');
			// }, function(oError) {
			// 	console.log('qr_setting Insert Failed!');
			// }, function(oSucees) {
			// 	that.onSettingPress();
			// 	console.log('qr_setting Inserted Successfully!');
			// });
		},
		onCancelItemClose: function (oEvent) {
			this._ItemDialog.close();
			sap.ui.getCore().byId(a).removeStyleClass("backgroundCss");
		},
		fnParameterCheck: function (plant) {
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
				success: function (oData, Response) {
					//Added by Avinash..
					that.getView().setModel(new JSONModel(oData.results[0].F4FieldsNav.results[0]), "oLocEnable");
					that.getView().getModel("oLocEnable").refresh();
					// that.getOwnerComponent().getModel("DelLocVisible").refresh(true);
					//End of Added		

					//code added bu kirubakaran on 22.07.2020//
					// if (oData.results[0].F4FieldsNav.results[0].Nf_Number === "X") {
					// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
					// } else {
					// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
					// }
					// if (oData.results[0].F4FieldsNav.results[0].Ee_Number === "X") {
					// 	that.getView().getModel("oViewModel").setProperty("/EasyProperty", true);
					// } else {
					// 	that.getView().getModel("oViewModel").setProperty("/EasyProperty", false);
					// }
					// if (oData.results[0].F4FieldsNav.results[0].So_Number === "X") {
					// 	that.getView().getModel("oViewModel").setProperty("/SalesProperty", true);
					// } else {
					// 	that.getView().getModel("oViewModel").setProperty("/SalesProperty", false);
					// }
					// if (that.getOwnerComponent().getModel("DeliverySet").getData().Header.Nf_Number === "") {
					// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", false);
					// } else {
					// 	that.getView().getModel("oViewModel").setProperty("/NotaProperty", true);
					// }

					// if (that.getOwnerComponent().getModel("DeliverySet").getData().HeaderItems[0].Del_type === "STO") {
					// 	that.getView().getModel("oViewModel").setProperty("/CMSProperty", true);
					// 	that.getView().getModel("oViewModel").setProperty("/EasyProperty", false);
					// 	that.getView().getModel("oViewModel").setProperty("/SalesProperty", false);
					// 	that.getView().getModel("oViewModel").setProperty("/PurchaseProperty", true);
					// } 

					//code ended bu kirubakaran on 22.07.2020//
					//	parametercheck = oData.results[0].F4FieldsNav;
					// var show;
					// var EnableCtrl = new sap.ui.model.json.JSONModel();
					// EnableCtrl.setData(oData.results[0].F4FieldsNav.results);
					// that.getView().setModel(EnableCtrl, "oBatchEnable");
					//that.getView().getModel("oBatchEnable").refresh();
					// var Batch = oData.results[0].F4FieldsNav.results.find(function(x) {
					// 	if (x.Wbid == "X") {
					// 		parametercheck = "";
					// 	}
					// 	if (x.Wbid !== "X") {
					// 		parametercheck = "X";
					// 	}
					// });
					var Batch1 = oData.results[0].F4FieldsNav.results.find(function (x) {
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

				error: function (oResponse) {
					sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
				}
			});

		},

		//Added by Avinash for Manual Batch Split IVC Changes...
		fnAddBatch: function (oEvent) {
			var that = this;
			var oTabModel = this.getView().getModel("BatchItems");
			that.oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
			// var oTabModel = this.getView().getModel("BatchItems").getData().Items;
			for(var i=0; i<oTabModel.getData().Items.length; i++){
				if(oTabModel.getData().Items[i].Charg === ""){
					sap.m.MessageToast.show(that.oResourceBundle.getText("selectBatch"));
					return;
				}
				if(oTabModel.getData().Items[i].Pikmg === 0 || oTabModel.getData().Items[i].Pikmg === "0.000" || oTabModel.getData().Items[i].Pikmg === '0' || oTabModel.getData().Items[i].Pikmg === ''){
					sap.m.MessageToast.show(that.oResourceBundle.getText("enterPickQuantity"));
					return;
				}
			}
			if(parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) === 0){
				sap.m.MessageBox.error(that.oResourceBundle.getText("QuantitySame"));
				return;
			}
			// if(parseFloat(oTabModel.getData().Items[0].Pikmg) >= parseFloat(sap.ui.getCore().byId("id_OpQty").getValue())){
			// 	sap.m.MessageBox.error(that.oResourceBundle.getText("enterValidQuantity"));
			// 	return;
			// }
			
			var vSubItem = [];
			for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
				if (that.selectedItem.Posnr == that.getView().getModel("BatchItems").getData().Items[i].Uecha) {
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
			//Getting Sloc for Header Items for Updating Line Items..
			// // that.selectedItem.Posnr
			// if(vSubItem.length == 0){
			// 	for(var i=0;i<)
			// }
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
				//Lfimg: vSubItem[0].Lfimg, /// As Picking Qty - Need to check
				Lfimg: "",
				Lgobe: vSubItem[0].Lgobe,
				Lgort: vSubItem[0].Lgort,
				Maktx: vSubItem[0].Maktx,
				Matnr: vSubItem[0].Matnr,
				Meins: vSubItem[0].Meins,
				Menge: vSubItem[0].Menge,
				Otnum: vSubItem[0].Otnum,
				Pikmg: "",
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
				BatchUpdMode: vSubItem[0].BatchUpdMode || "",
				QtyEditFlag: vSubItem[0].QtyEditFlag,
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
				//Lfimg: vSubItem[0].Lfimg, /// As Picking Qty - Need to check
				Lfimg: "",
				Lgobe: vSubItem[0].Lgobe,
				Lgort: vSubItem[0].Lgort,
				Maktx: vSubItem[0].Maktx,
				Matnr: vSubItem[0].Matnr,
				Meins: vSubItem[0].Meins,
				Menge: vSubItem[0].Menge,
				Otnum: vSubItem[0].Otnum,
				Pikmg: "",
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
				BatchUpdMode: vSubItem[0].BatchUpdMode || "",
				QtyEditFlag: vSubItem[0].QtyEditFlag,
			})
		},

		fnRemoveBatch: function (oEvent) {
			var that = this;
			var vPath = Number(oEvent.getSource().getBindingContext("BatchItems").getPath().split("/")[2]);
			var oTabModel = this.getView().getModel("BatchItems");
			var oTabData = oTabModel.getData().Items;
			var oTabModel2 = that.getView().getModel("DeliverySet");
			// var oTabData2 = that.getView().getModel("DeliverySet").getData().LineItems;
			var oTabData2 = [];
			// AutoScan deletion
			if(that.getView().getModel("BatchItems").getData().Items[0].BatchUpdMode === "S" && that.getView().getModel("BatchItems").getData().Items[0].QtyEditFlag === "D"){
				if (oTabData.length > 1) {
				// for (var i = 0; i < oTabModel2.getData().LineItems.length; i++) {
				// 	oTabModel2.getData().LineItems.splice(vPath, 1);
				// 	oTabModel2.refresh(true);
				// 	// if (that.selectedItem.Posnr == oTabModel2.getData().LineItems[i].Uecha) {
				// 	// 	oTabModel2.getData().LineItems.splice(i, 1);
				// 	// 	i--;
				// 	// }
				// }
				oTabModel2.getData().LineItems.splice(vPath, 1);
				oTabData.splice(vPath, 1);
				// oTabData2.splice(vPath, 1);
				oTabModel.refresh();
				// for (var i = 0; i < oTabData.length; i++) {
				// 	oTabModel2.getData().LineItems.push(oTabData[i]);
				// }
				var vOpenQty = 0
				for(var x=0; x<oTabData.length; x++){
					vOpenQty = parseFloat(vOpenQty) + parseFloat(oTabData[x].Pikmg);
				}
				var oTotalDelQuantity = sap.ui.getCore().byId("id_LfimgVal").getValue();
				var oremQty = parseFloat(oTotalDelQuantity) - parseFloat(vOpenQty);
				sap.ui.getCore().byId("id_OpQty").setValue(oremQty.toFixed(3) + " " + that.selectedItem.Vrkme);
				oTabModel2.refresh();
			} else {
				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("AtLeastOneItem"));
			}
			}else{
			if (oTabData.length > 1) {
				for (var i = 0; i < oTabModel2.getData().LineItems.length; i++) {
					if (that.selectedItem.Posnr == oTabModel2.getData().LineItems[i].Uecha) {
						oTabModel2.getData().LineItems.splice(i, 1);
						i--;
						if(that.f4BSelectedBatchPath > 1){
							that.f4BSelectedBatchPath --;
						}
					}
				}
				oTabData.splice(vPath, 1);
				// oTabData2.splice(vPath, 1);
				oTabModel.refresh();
				for (var i = 0; i < oTabData.length; i++) {
					oTabModel2.getData().LineItems.push(oTabData[i]);
				}
				oTabModel2.refresh();
			} else {
				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("AtLeastOneItem"));
			}

			var vPickedQty = 0;
			for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
				if (that.getView().getModel("BatchItems").getData().Items[i].Uecha == that.selectedItem.Posnr) {
					vPickedQty = vPickedQty + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
				}
			}
			var vOpenQty = Number(that.selectedItem.Lfimg) - Number(vPickedQty);
			if (vPickedQty == Number(that.selectedItem.Lfimg) && vOpenQty == 0) {
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}
			if (vOpenQty == Number(that.selectedItem.Lfimg) && vPickedQty == 0) {
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}
			if (vOpenQty > 0 && vPickedQty < Number(that.selectedItem.Lfimg) && vPickedQty !== 0) {
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPYellow");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
			}

			sap.ui.getCore().byId("id_OpQty").setValue(vOpenQty.toFixed(3) + " " + that.selectedItem.Vrkme);
		}

		},

		OpenReasonFrag: function () {
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

		onCloseReason: function () {
			var self = this;
			// sap.ui.getCore().byId('id_Reason').setSelectedKey();
			self.Reason.close();
			// self.getView().byId("process").setSelectedKey(self.getView().byId("process").getSelectedKey());
		},

		fnReasonSubmit: function (oEvent) {
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
		onItemSave: function (oEvent) {

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
					if (odata[i].Fbatc == "X") { //Added BY IN_KARTHI
						if (odata[i].Charg == "" && that.selectedItem.Posnr == odata[i].Uecha) {
							vError = true;
							vErrMsg = vErrMsg + Pickingless + "\n";
						}
					} //added by IN_KARTHI
				}
				if (that.ContractChange) {
					if (!sap.ui.getCore().byId("id_ReasonLP")._getSelectedItemText()) {
						vError = true;
						vErrMsg = vErrMsg + that.getView().getModel("i18n").getResourceBundle().getText("ReasonMandat") + "\n";
					} else {
						that.Reason = sap.ui.getCore().byId("id_ReasonLP")._getSelectedItemText();
					}
				} else {
					that.Reason = sap.ui.getCore().byId("id_ReasonLP")._getSelectedItemText();
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
				that.getView().getModel("DeliverySet").getData().HeaderItems[0].Lfimg = vPickedQty.toString();
				that.getView().getModel("DeliverySet").getData().HeaderItems[0].Pikmg = vPickedQty.toString();
				var vDelQty = 0;
				for (var i = 0; i < that.getView().getModel("DeliverySet").getData().HeaderItems.length; i++) {
					if (that.selectedItem.Posnr == that.getView().getModel("DeliverySet").getData().HeaderItems[i].Posnr) {
						vDelQty = vDelQty + Number(that.getView().getModel("DeliverySet").getData().HeaderItems[i].Lfimg);
						break;
					}
				}
				// if (vDelQty > vPickedQty) {
				// 	vBatchCheck = true //Added by Avinash...
				// 	var vResWarMsg = that.getView().getModel("i18n").getResourceBundle().getText("LessPickQty");
				// 	MessageBox.show(vResWarMsg, {
				// 		icon: MessageBox.Icon.WARNING,
				// 		title: that.getView().getModel("i18n").getResourceBundle().getText("Warning"),
				// 		actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				// 		onClose: function(oAction) {
				// 			if (oAction == 'YES') {
				// 				sap.ui.getCore().byId(a).addStyleClass("backgroundCss");
				// 				that._ItemDialog.close();
				// 				if (!fPikmg) {
				// 					// Check All items for Storage location has Completed	
				// 					var bCheckAllItems = that._checkAllItemEntered(odata, odata[0].Lgort);
				// 					if ((!bCheckAllItems) && (Signature === "X")) {
				// 						that.onSignaturePress();
				// 					}
				// 					if ((!bCheckAllItems) && (Signature === "")) {
				// 						that.PickingSave();
				// 					}
				// 				}
				// 			} else {
				// 				sap.m.MessageToast.show((that.getView().getModel("i18n").getResourceBundle().getText("ActionCancelled")));
				// 			}
				// 		}
				// 	});
				// 	//End of Added by Avinash

				// } else {
				//================================ Added by chaithra on 9/4/2020 ==============//
				// if(that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg != "X"){
				// if (odata.length > 0) { //Line Added by Avinash on 7th June 2022
				$.each(odata, function (index, value, array) {
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
				// }
				// }

				//Added by Avinash for itemsave..
				if (!vBatchCheck) {
					var odataf = that.getView().getModel("DeliverySet").getData().HeaderItems;
					$.each(odataf, function (index, value, array) {
						if (!value.Charg) {
							// Check Value is greater.
							if (parseFloat(that.selectedItem.Lfimg) >= parseFloat(value.Pikmg)) {
								// a =  oEvent.mParameters.id;
								sap.ui.getCore().byId(a).addStyleClass("backgroundCss");
								that._ItemDialog.close();
								if (!fPikmg) {
									// Check All items for Storage location has Completed	
									var bCheckAllItems = that._checkAllNonBatchItemEntered(odataf, value.Lgort);
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
				//End of added...

				//End of added...///
				// }
				// else{
				// 	that.onSignaturePress();
				// }

				that.getView().getModel("DeliverySet").refresh();
			} else {
				MessageBox.error(vErrMsg);
			}
		},

		//Added by Avinash for IVC Rubber Changes...
		onSearchStorage: function (oEvent) {
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

		onPressSloc: function (oEvent) {
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

		SlocCall: function () {
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
					success: function (Idata, Iresponse) {
						sap.ui.core.BusyIndicator.hide();
						self.getView().setModel(new JSONModel(Idata.results[0].F4LgortNav.results), "oStorage");
					},
					error: function (Ierror) {
						sap.ui.core.BusyIndicator.hide();
					}
				});
			} else {
				sap.m.MessageToast.show(oi18n.getProperty("PlSelectPlant"));
			}
		},

		onConfirmStorage: function (oEvent) {
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
		onItemPress: function (oEvent) {
			var that = this;
			//	removed as no use of lines
			that.selectedItem = oEvent.getSource().getBindingContext("DeliverySet").getObject();
			if (that.selectedItem.Lgort !== "") {
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
					success: function (oData, Response) {
						that.getView().setModel(new JSONModel(oData), "oBatchEnable");
						that.getView().getModel("oBatchEnable").refresh();

						var odata = that.getView().getModel("DeliverySet").getData().LineItems;
						var oBatchItems = [],
							saveF = [];
						/**
						 * Fetch Batch Item based on Respective key field value from
						 * Header Item Model
						 */
						$.each(odata, function (index, value, array) {
							if (that.selectedItem.Posnr === value.Uecha) {
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
								if (!value.Lgort) {
									value.Lgort = that.selectedItem.Lgort; //Added by IN_KARTHI
								}
								oBatchItems.push(value);
							}
						});

						//Added by Avinash for considering w/o batches also on 07.04.21...
						if (oBatchItems.length == 0) {
							var odataf = that.getView().getModel("DeliverySet").getData().HeaderItems;
							var vPosnr = 900000;
							var vHigh = odata.filter(function (x) {
								if (Number(x.Posnr) > Number(vPosnr)) {
									vPosnr = Number(x.Posnr);
								}
							});
							vPosnr = vPosnr + 1;
							$.each(odataf, function (index, value, array) {
								if (!value.Charg) {
									if (Number(that.selectedItem.Posnr) === Number(value.Posnr)) { //Added by Avinash on 7th June 22
										var oGetBatchObject = jQuery.extend(true, {}, value);
										if (parseFloat(value.Pikmg) === 0) {
											// value.Pikmg = "";
											oGetBatchObject.Pikmg = "";
											saveF.push(true);
										} else {
											saveF.push(false);
										}

										if (value.PikmgF) {
											saveF.push(true);
										} else {
											saveF.push(false);
										}
										if (!oGetBatchObject.Lgort) {
											oGetBatchObject.Lgort = that.selectedItem.Lgort; //Added by IN_KARTHI
										}
										if (value.Fbatc) {
											oGetBatchObject.Posnr = vPosnr.toString(); //Added by Avinash
											oGetBatchObject.Uecha = that.selectedItem.Posnr; //Added by Avinash
										}
										// oBatchItems.push(value);
										oBatchItems.push(oGetBatchObject);
									}
								}
							});
						}
						//End of added...
						// oBatchItems[0].QtyEditFlag = 'E';
						// oBatchItems[0].BatchUpdMode = 'M';

						var oItems = {
							Save: (saveF.indexOf(true) !== -1) ? true : false,
							Items: oBatchItems
						};
						if(oBatchItems.length > 0){
							that.oExistingScenario = oBatchItems.filter(function (items){
								return items.Charg
							});
							// for(var z=0; z<oBatchItems.length; z++){
							// 	if( oBatchItems[z].Charg){
							// 		that.oExistingScenario = true;
							// 	}
							// 	that.oExistingScenario = false;
							// }
						}
						if(that.oExistingScenario.length > 0){
							that.oExistingScenario = true;
						}else{
							that.oExistingScenario = false;
						}
						var oJson = new sap.ui.model.json.JSONModel(oItems);
						that.getOwnerComponent().setModel(oJson, "BatchItems");

						// console.log(that.selectedItem);
						// console.log(oItems);

						var sStock_Flag = that.getView().getModel("DeliverySet").getData().HeaderItems[0].Sto_flg;
						var sCharg = that.getView().getModel("DeliverySet").getData().HeaderItems[0].Charg;
						if (oData.results.length > 0) {
							if (oData.results[0].F4FieldsNav.results.length > 0) {
								// if (oData.results[0].F4FieldsNav.results[0].Nf_Number === "X") {
								// 	//Brazil Requirement

								// 	if (sStock_Flag === "X" && sCharg === "") {

								// 		that.onSignaturePress();
								// 	} else {
								// 		if (!that._ItemDialog) {
								// 			that._ItemDialog = sap.ui.xmlfragment("LoadingConfirmation.fragment.ItemDetails", that);
								// 			that.getView().addDependent(that._ItemDialog);
								// 		}
								// 		that._ItemDialog.open();
								// 	}
								// } else {
								if (!that._ItemDialog) {
									that._ItemDialog = sap.ui.xmlfragment("LoadingConfirmation.fragment.ItemDetails", that);
									that.getView().addDependent(that._ItemDialog);
								}
								// if(that.selectedItem.QtyEditFlag === "E"){
								// 	that.selectedItem.PikmgF = true;
								// 	that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = true;
								// }else{
								// 	that.selectedItem.PikmgF = false;
								// 	that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = false;
								// }
								if(that.selectedItem.Kostk === ""){
									that.getView().getModel("BatchItems").getData().Save = true
										for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
										if (that.getView().getModel("BatchItems").getData().Items[i].QtyEditFlag === "D" && that.getView().getModel("BatchItems").getData().Items[i].BatchUpdMode  === "S") {
									//	that.selectedItem.PikmgF = false;
										that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = false;
										that.getView().getModel("BatchItems").getData().Items[i].PikmgF = false;
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].DelQty = ''; // Delivery Quantity
										sap.ui.getCore().byId("idMultiScanningBatchNumbers").setVisible(true);
										sap.ui.getCore().byId("idChargBatchnumberInput").setEditable(false);
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg = ''; // Batch Disable
										that.getView().getModel("oBatchEnable").refresh(true)
									}else if(that.getView().getModel("BatchItems").getData().Items[i].QtyEditFlag === "E" && that.getView().getModel("BatchItems").getData().Items[i].BatchUpdMode  === "S"){
										//that.selectedItem.PikmgF = false;								
										that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = false; //Picking Quantity
										that.getView().getModel("BatchItems").getData().Items[i].PikmgF = false; // Picking Quantity
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].DelQty = 'X'; // Delivery Quantity
										sap.ui.getCore().byId("idMultiScanningBatchNumbers").setVisible(true); //Scan Button
										sap.ui.getCore().byId("idChargBatchnumberInput").setEditable(true); //Batch Number
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg = ''; //Batch Visible
										sap.ui.getCore().byId("idPickingQtyVBox").setVisible(false);
										that.getView().getModel("oBatchEnable").refresh(true)
									}else if(that.getView().getModel("BatchItems").getData().Items[i].QtyEditFlag === "D" && that.getView().getModel("BatchItems").getData().Items[i].BatchUpdMode  === "M"){
									//	that.selectedItem.PikmgF = false;								
										that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = false; //Picking Quantity
										that.getView().getModel("BatchItems").getData().Items[i].PikmgF = false; // Picking Quantity
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].DelQty = ''; // Delivery Quantity
										sap.ui.getCore().byId("idMultiScanningBatchNumbers").setVisible(false); //Scan Button
										sap.ui.getCore().byId("idChargBatchnumberInput").setEditable(true); //Batch Number
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg = ''; //Batch Visible
										that.getView().getModel("oBatchEnable").refresh(true)
									}else if(that.getView().getModel("BatchItems").getData().Items[i].QtyEditFlag === "E" && that.getView().getModel("BatchItems").getData().Items[i].BatchUpdMode  === "M"){
									//	that.selectedItem.PikmgF = false;								
										that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = false; //Picking Quantity
										that.getView().getModel("BatchItems").getData().Items[i].PikmgF = false; // Picking Quantity
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].DelQty = 'X'; // Delivery Quantity
										sap.ui.getCore().byId("idMultiScanningBatchNumbers").setVisible(false); //Scan Button
										sap.ui.getCore().byId("idChargBatchnumberInput").setEditable(true); //Batch Number
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg = ''; //Batch Visible
										that.getView().getModel("oBatchEnable").refresh(true)
									}
										}
								}else{
								for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
									if (that.getView().getModel("BatchItems").getData().Items[i].QtyEditFlag === "D" && that.getView().getModel("BatchItems").getData().Items[i].BatchUpdMode  === "S") {
										that.selectedItem.PikmgF = false;
										that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = false;
										that.getView().getModel("BatchItems").getData().Items[i].PikmgF = false;
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].DelQty = ''; // Delivery Quantity
										sap.ui.getCore().byId("idMultiScanningBatchNumbers").setVisible(true);
										sap.ui.getCore().byId("idChargBatchnumberInput").setEditable(false);
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg = ''; // Batch Disable
										that.getView().getModel("oBatchEnable").refresh(true)
									}else if(that.getView().getModel("BatchItems").getData().Items[i].QtyEditFlag === "E" && that.getView().getModel("BatchItems").getData().Items[i].BatchUpdMode  === "S"){
										that.selectedItem.PikmgF = true;								
										that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = true; //Picking Quantity
										that.getView().getModel("BatchItems").getData().Items[i].PikmgF = true; // Picking Quantity
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].DelQty = 'X'; // Delivery Quantity
										sap.ui.getCore().byId("idMultiScanningBatchNumbers").setVisible(true); //Scan Button
										sap.ui.getCore().byId("idChargBatchnumberInput").setEditable(true); //Batch Number
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg = ''; //Batch Visible
										that.getView().getModel("oBatchEnable").refresh(true)
									}else if(that.getView().getModel("BatchItems").getData().Items[i].QtyEditFlag === "D" && that.getView().getModel("BatchItems").getData().Items[i].BatchUpdMode  === "M"){
										that.selectedItem.PikmgF = false;								
										that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = false; //Picking Quantity
										that.getView().getModel("BatchItems").getData().Items[i].PikmgF = false; // Picking Quantity
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].DelQty = ''; // Delivery Quantity
										sap.ui.getCore().byId("idMultiScanningBatchNumbers").setVisible(false); //Scan Button
										sap.ui.getCore().byId("idChargBatchnumberInput").setEditable(true); //Batch Number
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg = 'X'; //Batch Visible
										that.getView().getModel("oBatchEnable").refresh(true)
									}else if(that.getView().getModel("BatchItems").getData().Items[i].QtyEditFlag === "E" && that.getView().getModel("BatchItems").getData().Items[i].BatchUpdMode  === "M"){
										that.selectedItem.PikmgF = true;								
										that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = true; //Picking Quantity
										that.getView().getModel("BatchItems").getData().Items[i].PikmgF = true; // Picking Quantity
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].DelQty = 'X'; // Delivery Quantity
										sap.ui.getCore().byId("idMultiScanningBatchNumbers").setVisible(false); //Scan Button
										sap.ui.getCore().byId("idChargBatchnumberInput").setEditable(true); //Batch Number
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg = 'X'; //Batch Visible
										that.getView().getModel("oBatchEnable").refresh(true)
									}									
									else{
										that.selectedItem.PikmgF = true;								
										that.getView().getModel("DeliverySet").getData().HeaderItems[0].PikmgF = true; //Picking Quantity
										that.getView().getModel("BatchItems").getData().Items[i].PikmgF = true; // Picking Quantity
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].DelQty = 'X'; // Delivery Quantity
										sap.ui.getCore().byId("idMultiScanningBatchNumbers").setVisible(false); //Scan Button
										sap.ui.getCore().byId("idChargBatchnumberInput").setEditable(true); //Batch Number
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg = 'X'; //Batch Visible
										that.getView().getModel("oBatchEnable").refresh(true)
									}
									// if(that.getView().getModel("BatchItems").getData().Items[i].BatchUpdMode  === "S"){
									// 	sap.ui.getCore().byId("idCancelBatchButton").setVisible(true);
									// 	that.getView().getModel("BatchItems").refresh(true);
									// 	that.getView().getModel("BatchItems").updateBindings(true);
									// }else{
									// 	sap.ui.getCore().byId("idAddBatchButton").setVisible(true);
									// 	sap.ui.getCore().byId("idCancelBatchButton").setVisible(true);
									// 	that.getView().getModel("BatchItems").refresh(true);
									// 	that.getView().getModel("BatchItems").updateBindings(true);
									// }
								}
							}
								that._ItemDialog.open();
								//	}
							}
						}						
								that.getView().getModel("BatchItems").refresh(true);
								that.getView().getModel("BatchItems").updateBindings(true);

						//========= Bath F4 ============//
						that.fnEntityBatch();
						//Added by Avinash
						sap.ui.getCore().byId("id_LfimgVal").setValue(that.selectedItem.Lfimg + " " + that.selectedItem.Vrkme);
						var vPickedQty = 0;
						for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
							if (that.getView().getModel("BatchItems").getData().Items[i].Uecha == that.selectedItem.Posnr) {
								vPickedQty = vPickedQty + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
							}
						}
						var vOpenQty = Number(that.selectedItem.Lfimg) - Number(vPickedQty);
						if (vPickedQty == Number(that.selectedItem.Lfimg) && vOpenQty == 0) {
							sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPGreen");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
						}
						if (vOpenQty == Number(that.selectedItem.Lfimg) && vPickedQty == 0) {
							sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPRed");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
						}
						if (vOpenQty > 0 && vPickedQty < Number(that.selectedItem.Lfimg) && vPickedQty !== 0) {
							sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPYellow");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
						}
						sap.ui.getCore().byId("id_OpQty").setValue(vOpenQty.toFixed(3) + " " + that.selectedItem.Vrkme);
						if (that.ContractChange) {
							sap.ui.getCore().byId("id_ReasonChange").setVisible(true);
						} else {
							sap.ui.getCore().byId("id_ReasonChange").setVisible(false);
						}
						//End of Added
					},
					error: function (oResponse) {
						var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
						sap.m.MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vErr);
						sap.ui.core.BusyIndicator.hide();
					}
				});
			} else {
				var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
				sap.m.MessageBox.show(that.getView().getModel("i18n").getResourceBundle().getText("LocEmpty"), MessageBox.Icon.ERROR, vErr);
			}

		},
		onBackPress: function () {
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
		//For Closing the Signature Fragment

		onSignatureClose: function (oEvent) {
			var canvas1 = document.querySelector("#__custom0 canvas");
			var canvas2 = document.querySelector("#__custom1 canvas");
			var ctx1 = canvas1.getContext("2d");
			var ctx2 = canvas1.getContext("2d");
			var image = new Image();
			this.signaturepad1 = new SignaturePad(canvas1);
			this.signaturepad2 = new SignaturePad(canvas2);
			image.onload = function () {
				ctx1.drawImage(this.datas, 0, 0);
				ctx2.drawImage(this.datas, 0, 0);
			};
			this._SignatureDialog.close();
		},

		//===============================================================
		//-------------------Signature Function----------------------
		//===============================================================
		onSignaturePress: function (oEvent) {
			var that = this,
				//bFlag = false,
				odata = that.getView().getModel("DeliverySet").getData().LineItems;

			if (!this._SignatureDialog) {
				// this._SignatureDialog = sap.ui.xmlfragment("com.LoadingConfirmation.DQC.fragments.Signature", this);
				this._SignatureDialog = sap.ui.xmlfragment("LoadingConfirmation.fragment.Signature", that);
				this.getView().addDependent(this._SignatureDialog);
			}
			sap.ui.getCore().byId("id_Options").setState(true);
			this._SignatureDialog.open();
			// this._ItemDialog.open();
			var canvas0 = document.querySelector("#__custom0 canvas");
			var canvas1 = document.querySelector("#__custom1 canvas");
			this.signaturepad0 = new SignaturePad(canvas0);
			this.signaturepad1 = new SignaturePad(canvas1);
			document.querySelector("#__custom1").style.display = "none";

		},
		//===============================================================
		//-------------------change Function----------------------
		//===============================================================
		fnResetChange: function (oEvent) {
			if (oEvent.getSource().getProperty("state")) {
				document.querySelector("#__custom1").style.display = "none";
				document.querySelector("#__custom0").style.display = "block";
			} else {
				document.querySelector("#__custom0").style.display = "none";
				document.querySelector("#__custom1").style.display = "block";
			}
		},

		//==========================without signature===============

		PickingSave: function (oEvent) {
			var that = this;
			var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;

			var DeliveryPost = that.getView().getModel("i18n").getResourceBundle().getText("conformPost");
			MessageBox.confirm(

				DeliveryPost, {
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				onClose: function (sAction) {
					if (sAction === "OK") {
						//sap.ui.core.BusyIndicator.show(0);  comment on 05.02.2020
						var odata = that.getView().getModel("DeliverySet").getData().LineItems;
						var odata1 = that.getView().getModel("DeliverySet").getData().HeaderItems;
						var oPostData = [];

						var oPostModel = that.getView().getModel('odata');

						$.each(odata, function (index, value, array) {
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
						oPostModel.create('/DeliverySet', oEntry, null, function (oData, res) {
							var oReturn = oData.DelReturnNav.results[0];
							var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
							// that.getBusyDialog.close();
							//sap.ui.core.BusyIndicator.show(0); comment on 5.02.2020
							if (oReturn.Type === "S") {
								//	that._SignatureDialog.close();
								MessageBox.success(
									oReturn.Message, {
									styleClass: bCompact ? "sapUiSizeCompact" : "",
									onClose: function (oAction) {
										that._LoadDeliveryItems(that, that.selectedItem.Vbeln, false);
									}
								}
								);

							} else {

								MessageBox.error(
									oReturn.Message, {
									styleClass: bCompact ? "sapUiSizeCompact" : "",
									onClose: function (oAction) {
										that._LoadDeliveryItems(that, that.selectedItem.Vbeln, false);
									}
								}
								);
							}
						}, function (res) {
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

		//===============================================================
		//-------------------Save Signature Function----------------------
		//===============================================================

		_SignatureSave: function (oEvent) {
			var that = this;
			var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
			if (that.signaturepad0.isEmpty()) {
				// MessageBox.information(
				// 	that.oBundle.getText('WHSignError'), {
				// 		styleClass: bCompact ? "sapUiSizeCompact" : ""
				// 	}
				// );
				var WHSignError = that.getView().getModel("i18n").getResourceBundle().getText("WHSignError");

				MessageBox.information(WHSignError);
			} else {
				if (that.signaturepad1.isEmpty()) {
					//Orginal Code
					// MessageBox.information(
					// 	that.oBundle.getText('DriverSignError'), {
					// 		styleClass: bCompact ? "sapUiSizeCompact" : ""
					// 	}
					// );
					//Changed Code
					var DriverSignError = that.getView().getModel("i18n").getResourceBundle().getText("DriverSignError");
					MessageBox.information(DriverSignError);
				} else {
					/**
					 * Conform before Post Delivery Items
					 */
					var DeliveryPost = that.getView().getModel("i18n").getResourceBundle().getText("conformPost");
					MessageBox.confirm(

						DeliveryPost, {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "OK") {
								//sap.ui.core.BusyIndicator.show(0);  comment on 05.02.2020
								var odata = that.getView().getModel("DeliverySet").getData().LineItems;
								var odata1 = that.getView().getModel("DeliverySet").getData().HeaderItems;
								// if (that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg01 == "X") {
								// 	var vPosnr = 0;
								// 	for (var i = 0; i < odata1.length; i++) {
								// 		if ((odata1[i].Posnr).search("900") == 0) {
								// 			vPosnr = vPosnr + 10;
								// 			var vPosnrStr = vPosnr.toString();
								// 			odata1[i].Posnr = "000" + vPosnrStr;
								// 		}
								// 		// else {
								// 		// 	vPosnr = 10;
								// 		// }
								// 	}
								// 	for (var i = 0; i < odata.length; i++) {
								// 		odata[i].Lfimg = odata[i].Pikmg;
								// 	}
								// }
								var oPostData = [];
								// var oPostData1	= [];
								// var oPostModel = new sap.ui.model.odata.ODataModel(
								// 	url.getServiceUrl("ZGW_GT_SD_DELIVERY_DET_SRV"),
								// 	true,
								// 	that.username,
								// 	that.password);
								var oPostModel = that.getView().getModel('odata');
								/**
								 * To Filter only the Storage Location based Items
								 * and removing StrLoc value
								 **/
								if (that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg01 !== "X") {
									$.each(odata, function (index, value, array) {
										// if (value.Lgort === that.selectedItem.Lgort) {	//Commented by Avinash on 13/6/22 due to multiple loc handled in single delivery
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
										// }
									});
								}
								//BOC by Avinash
								else {
									$.each(odata, function (index, value, array) {
										// if (value.Lgort === that.selectedItem.Lgort) {
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
										// }
									});

									var vPosnrCheck = odata1.filter(function (x) {
										if (x.Posnr === x.Uecha) {
											x.Uecha = "000000";
											x.Charg = "";
										}
									});
								}
								//EOC by Avinash
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
								//Added by Avinash
								if (that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg01 == "X") {
									for (var i = 0; i < oPostData.length; i++) {
										if (Number(oPostData[i].Lfimg) > 0) {
											oPostData[i].Lfimg = Number(oPostData[i].Lfimg).toFixed(3);
										}
										if (oPostData[i].Uecha == "000000" && oPostData[i].Charg !== "") {
											oPostData[i].Charg = "";
											oPostData[i].Pikmg = "0.000";
											// oPostData[i].Pikmg = "0.000";
										}
										if (that.ContractChange && that.Reason) {
											oPostData[i].Reason = that.Reason;
										}
									}
								}
								if(that.getView().getModel("DeliverySet").getData().LineItems.length === 1 && !that.oExistingScenario){
									oPostData[1].Charg = oPostData[0].Charg;
									oPostData[1].Pikmg = oPostData[0].Pikmg;
									oPostData[1].Lfimg = oPostData[0].Lfimg;
									oPostData.splice(0,1);
								}
								// if(that.getView().getModel("DeliverySet").getData().LineItems.length === 1 ){
								// 	oPostData[1].Charg = oPostData[0].Charg;
								// 	oPostData[1].Pikmg = oPostData[0].Pikmg;
								// 	oPostData[1].Lfimg = oPostData[0].Lfimg;
								// 	oPostData.splice(0,1);
								// }
								//End of added
								var oEntry = {
									"d": {
										"PickFlag": "X",
										"Vbeln": that.selectedItem.Vbeln,
										"PgiFlag": "",
										// "WhSign": CanvasToBMP.toDataURL(that.signaturepad0._canvas).split(",")[1],
										// "DriverSign": CanvasToBMP.toDataURL(that.signaturepad1._canvas).split(",")[1],
										// "WhSign": Canvas2Image.convertToBMP(that.signaturepad0._canvas).src.split(",")[1],
										// "DriverSign": Canvas2Image.convertToBMP(that.signaturepad1._canvas).src.split(",")[1],
										// "WhSign": Canvas2Image.convertToBMP(that.signaturepad0._canvas).src.split(",")[1],
										// "DriverSign": Canvas2Image.convertToBMP(that.signaturepad1._canvas).src.split(",")[1],
										"WhSign": that.signaturepad0.toDataURL("image/png").split(",")[1],
										"DriverSign": that.signaturepad1.toDataURL("image/png").split(",")[1],
										"DelOutputNav": oPostData,
										"Wbid": that.getView().getModel("DeliverySet").getData().Header.Wbid,
										"DelReturnNav": []
									}
								};
								oPostModel.create('/DeliverySet', oEntry, null, function (oData, res) {
									var oReturn = oData.DelReturnNav.results[0];
									var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
									// that.getBusyDialog.close();
									//sap.ui.core.BusyIndicator.show(0); comment on 5.02.2020
									var oMessageAry = "";
									for(var i=0; i< oData.DelReturnNav.results.length; i++){
										oMessageAry = oMessageAry + "\n" + oData.DelReturnNav.results[i].Message + "\n";
									}
									if (oReturn.Type === "S") {
										that._SignatureDialog.close();
										MessageBox.success(
											//oReturn.Message, {
											oMessageAry,{
											styleClass: bCompact ? "sapUiSizeCompact" : "",
											onClose: function (oAction) {
												that._LoadDeliveryItems(that, that.selectedItem.Vbeln, false);
											}
										}
										);

									} else {
										that._SignatureDialog.close();
										//	that.getBusyDialog.close(); //commented by Srileaka
										// sap.ui.core.BusyIndicator.show(0); //commented by Srileaka
										// MessageBox.show(res.message, {
										// 	icon: sap.m.MessageBox.Icon.ERROR,
										// 	title: "Error",
										// 	actions: [sap.m.MessageBox.Action.CLOSE],
										// 	details: res.body,
										// 	contentWidth: "100px"

										// });
										MessageBox.error(
											//oReturn.Message, {
											oMessageAry,{
											styleClass: bCompact ? "sapUiSizeCompact" : "",
											onClose: function (oAction) {
												that._LoadDeliveryItems(that, that.selectedItem.Vbeln, false);
											}
										}
										);
									}
								}, function (res) {
									that._SignatureDialog.close();
									sap.ui.core.BusyIndicator.hide(0);
									var vErr = that.getView().getModel("i18n").getProperty("ErrorTxt");
									MessageBox.show(res.message, {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: vErr,
										actions: [sap.m.MessageBox.Action.CLOSE],
										details: res.body,
									});
								});
							}
						}
					}
					);
				}
			}
		},

		//===============================================================
		//-------------------CancelSignature----------------------
		//===============================================================
		_SignatureCancel: function () {
			//                         	this._SignatureDialog.close();
			var canvas1 = document.querySelector("#__custom0 canvas");
			var canvas2 = document.querySelector("#__custom1 canvas");
			var ctx1 = canvas1.getContext("2d");
			var ctx2 = canvas1.getContext("2d");
			var image = new Image();
			this.signaturepad1 = new SignaturePad(canvas1);
			this.signaturepad2 = new SignaturePad(canvas2);
			image.onload = function () {
				ctx1.drawImage(this.datas, 0, 0);
				ctx2.drawImage(this.datas, 0, 0);
			};
		},
		// Formattee for date
		formatDate: function (sDate) {
			var d = "";
			if (sDate !== undefined) {
				d = sDate.substring(6) + "/" + sDate.substring(4, 6) + "/" + sDate.substring(0, 4);
			}
			return d;

		},
		// Formatter for time
		formatTimeS: function (s) {
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
		fnEntityBatch: function (vMatnr, vLgort, vWerks) {
			var oPath = "/BatchShSet";
			var that = this;
			var oGetModel = that.getView().getModel('odata');

			oGetModel.read(oPath, {
				filters: [
					new Filter("Matnr", FilterOperator.EQ, that.selectedItem.Matnr),
					new Filter("Lgort", FilterOperator.EQ, that.selectedItem.Lgort),
					new Filter("Werks", FilterOperator.EQ, that.selectedItem.Werks)
				],
				success: function (oData, Response) {
					var oTabJson = new sap.ui.model.json.JSONModel();
					oTabJson.setData(oData.results);
					that.getView().setModel(oTabJson, "JMBatch");
					sap.ui.getCore().setModel(oTabJson, "JMBatch");
					if (oData.results.length === 0) {
						sap.m.MessageToast.show(that.getModel("i18n").getResourceBundle().getText("NoBatchFound"));
					}
					//  this.getView().getModel("DeliverySet").getData().LineItems.

				},
				error: function (oResponse) {

				}
			});
		},

		//Added by Avinash on 04/06/2021
		// //===============================================================
		// //-------------------Sale Cont F4 Function--------------------
		// //===============================================================
		fnhandleSaleCont: function (oEvent) {
			if (!this.ScHelp) {
				this.ScHelp = sap.ui.xmlfragment("LoadingConfirmation.fragment.SaleContract", this);
				this.getView().addDependent(this.ScHelp);
			}
			this.ScHelp.open();
			this.onCallScF4();
		},
		onCallScF4: function () {
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
				success: function (oData, Response) {
					that.getView().setModel(new JSONModel(oData.results[0].F4OrderNav.results), "JMSc");
				},
				error: function (oResponse) {

				}
			});
		},

		onsearchSc: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			if (sValue && sValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter2 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, sValue);
				var oFilter3 = new sap.ui.model.Filter("Otnum", sap.ui.model.FilterOperator.Contains, sValue);
				var allFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3], false);
			}
			oEvent.getSource().getBinding("items").filter(allFilter);
		},

		fnconfirmSc: function (oEvent) {
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
				sap.ui.getCore().byId("id_ReasonChange").setVisible(true);
			} else {
				sap.ui.getCore().byId("id_ReasonChange").setVisible(false);
			}
			// self.getView().getModel("BatchItems").getData().Items[0].Sc_No = oSelectedItem.getTitle();
			self.getView().getModel("BatchItems").refresh(true);
			self.getView().getModel("DeliverySet").refresh(true);
		},

		//End of added by Avinash
		// //===============================================================
		// //-------------------Batch F4 Search Function--------------------
		// //===============================================================
		fnhandleBatch: function (oEvent) {
			this.oBatchObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			this.f4BSelectedBatchPath =  oEvent.getSource().getBindingContext("BatchItems").getPath().split("/")[2];
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
		onsearchBatch: function (oEvent) {
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
		fnconfirmBatch1: function (oEvent) {
			var that = this;
			var oItem = oEvent.getParameter("selectedItem");
			var odata = that.getView().getModel("DeliverySet").getData().LineItems;

			// Check if order already exists
			var oModel = that.getView().getModel("BatchItems");
			var aItems = oModel.getProperty("/Items");
			var oExisting = aItems.find(function (item) {
				return item.Charg === oItem.getTitle();
			});

			if (oExisting) {
				oExisting.qty += 1;
				if(oExisting.Pikmg === '' || oExisting.Pikmg === undefined){
					sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("maintainPikmg"));
					return;
				}else if(oExisting.Charg === oItem.getTitle()){
					sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("AlreadySelectedmaintainPikmg"));
					return;
				}
				else{
				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("batchalreadySelected") + oExisting.Charg, {
					duration: 3000,                  // default
					width: "15em",                   // default
					my: "CenterCenter",             // default
					at: "CenterCenter",             // default
					of: window,                      // default
					offset: "0 0",                   // default
					collision: "fit fit",            // default
					onClose: null,                   // default
					autoClose: true,                 // default
					animationTimingFunction: "ease", // default
					animationDuration: 5000,         // default
					closeOnBrowserNavigation: true   // default
				});
				return;
			}

			}
			//if (parseFloat(oItem.getDescription()) >= parseFloat(this.oBatchObject.Lfimg)) {
				this.oBatchObject.Charg = oItem.getTitle(); // add batch in batch table of perticular line item
				// add batch to the All item batch table
				var vExist = false;
				for (var i = 0; i < odata.length; i++) {
					if (this.oBatchObject.Posnr == odata[i].Posnr && this.oBatchObject.Uecha == odata[i].Uecha) {
						odata[i].Charg = oItem.getTitle();
						vExist = true;
						break;
					}
				}
				var aHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems;
				this.JMSBatchData = this.getView().getModel("JMBatch").getData();
				var vBatchData = this.JMSBatchData.filter(function (x) {
					return x.Charg == oItem.getTitle();
				});

				if (aHeaderItems[0].BatchUpdMode === 'M' && !vExist) {							
						if (!vExist) { //Added by Avinash on 13/6/22
						var vPosnr = 900000;
						var vHigh = odata.filter(function (x) {
							if (Number(x.Posnr) > Number(vPosnr)) {
								vPosnr = Number(x.Posnr);
							}
						});
						var aHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems;
						vPosnr = vPosnr + 1;
						var oGetBatchObject = jQuery.extend(true, {}, that.oBatchObject);
						oGetBatchObject.Charg = oItem.getTitle();
						oGetBatchObject.Pikmg = vBatchData[0].Clabs;
						if(parseFloat(oItem.getDescription()) > parseFloat(aItems[0].Lfimg)){
							//that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = aItems[0].Lfimg;
							that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3);
							that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg = vBatchData[0].Clabs;
						}else{
							that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = vBatchData[0].Clabs;
							that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg = vBatchData[0].Clabs;
						}
						// that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = vBatchData[0].Clabs;
						// that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = vBatchData[0].Clabs;
						oGetBatchObject.Uecha = that.selectedItem.Posnr;
						//oGetBatchObject.Posnr = that.selectedItem.Posnr;
						 oGetBatchObject.Posnr = vPosnr.toString();
						//that.getView().getModel("DeliverySet").getData().LineItems.push(oGetBatchObject);
						if(that.getView().getModel("DeliverySet").getData().LineItems.length === 0){
							that.getView().getModel("DeliverySet").getData().LineItems.push(oGetBatchObject);

						}else{
							that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
							that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Pikmg =  parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3);
							//that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Uecha =  that.selectedItem.Posnr;
							//that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Posnr = that.selectedItem.Posnr;
						}
						var aBatchItems = that.getView().getModel("BatchItems").getData().Items;
						var vItems = aBatchItems.filter(function (x) {
							x.Uecha === oGetBatchObject.Uecha;
						});
						that.getView().getModel("BatchItems").refresh(true);
					}
					var oPenQuantity = 0;
					for(var i=0; i<that.getView().getModel("BatchItems").getData().Items.length; i++){
						oPenQuantity = oPenQuantity + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
						//sap.ui.getCore().byId("id_OpQty").setValue(oPenQuantity.toFixed(3) + " " + that.selectedItem.Vrkme);
					}
					sap.ui.getCore().byId("id_OpQty").setValue(parseFloat(sap.ui.getCore().byId("id_LfimgVal").getValue()) - parseFloat(oPenQuantity).toFixed(3) + " " + that.selectedItem.Vrkme);
					//that.fnChangeColor();
					//that.fnChangeColorItems();
					
				}else if(aHeaderItems[0].BatchUpdMode === 'M' && vExist){
						var aHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems;
						vPosnr = vPosnr + 1;
						var oGetBatchObject = jQuery.extend(true, {}, that.oBatchObject);
						oGetBatchObject.Charg = oItem.getTitle();
						oGetBatchObject.Pikmg = vBatchData[0].Clabs;
						if(parseFloat(oItem.getDescription()) > parseFloat(sap.ui.getCore().byId("id_LfimgVal").getValue())){
							//that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = aItems[0].Lfimg;
							if(!that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg && !that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg && that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Clabs){
								that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg;
								that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg = that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg; //parseFloat(vBatchData[0].Clabs) - parseFloat(sap.ui.getCore().byId("id_LfimgVal").getValue()) ;
							}else{
							that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3);
							that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3);// parseFloat(vBatchData[0].Clabs) - parseFloat(sap.ui.getCore().byId("id_LfimgVal").getValue()) ;
							}
						}else{
							that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = vBatchData[0].Clabs;
							that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg = vBatchData[0].Clabs;
						}
						//that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = vBatchData[0].Clabs;
						//oGetBatchObject.Uecha = that.selectedItem.Posnr;
						//oGetBatchObject.Posnr = that.selectedItem.Posnr;
						// BatchObject.Posnr = vPosnr.toString();
						//that.getView().getModel("DeliverySet").getData().LineItems.push(oGetBatchObject);
						if(that.getView().getModel("DeliverySet").getData().LineItems.length === 0){
							that.getView().getModel("DeliverySet").getData().LineItems.push(oGetBatchObject);

						}else{
							that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
							that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Pikmg =  parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3);
							//that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Uecha =  that.selectedItem.Posnr;
							//that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Posnr = that.selectedItem.Posnr;
						}
						var aBatchItems = that.getView().getModel("BatchItems").getData().Items;
						var vItems = aBatchItems.filter(function (x) {
							x.Uecha === oGetBatchObject.Uecha;
						});
						var oPenQuantity = 0;
					for(var i=0; i<that.getView().getModel("BatchItems").getData().Items.length; i++){
						oPenQuantity = oPenQuantity + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
						//sap.ui.getCore().byId("id_OpQty").setValue(oPenQuantity.toFixed(3) + " " + that.selectedItem.Vrkme);
					}
					sap.ui.getCore().byId("id_OpQty").setValue(parseFloat(sap.ui.getCore().byId("id_LfimgVal").getValue()) - parseFloat(oPenQuantity).toFixed(3) + " " + that.selectedItem.Vrkme);
					
						that.getView().getModel("BatchItems").refresh(true);
						//that.fnChangeColor();
						

				} else {
					if (!vExist) { //Added by Avinash on 13/6/22
						var vPosnr = 900000;
						var vHigh = odata.filter(function (x) {
							if (Number(x.Posnr) > Number(vPosnr)) {
								vPosnr = Number(x.Posnr);
							}
						});
						var aHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems;

						vPosnr = vPosnr + 1;
						var oGetBatchObject = jQuery.extend(true, {}, that.oBatchObject);
						oGetBatchObject.Charg = oItem.getTitle();
						oGetBatchObject.Pikmg = vBatchData[0].Clabs;
						that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = vBatchData[0].Pikmg;
						oGetBatchObject.Uecha = that.selectedItem.Posnr;
						oGetBatchObject.Posnr = vPosnr.toString();
						// BatchObject.Posnr = vPosnr.toString();
						that.getView().getModel("DeliverySet").getData().LineItems.push(oGetBatchObject);
						var aBatchItems = that.getView().getModel("BatchItems").getData().Items;
						var vItems = aBatchItems.filter(function (x) {
							x.Uecha === oGetBatchObject.Uecha;
						});
						var oPenQuantity = 0;
					for(var i=0; i<that.getView().getModel("BatchItems").getData().Items.length; i++){
						oPenQuantity = oPenQuantity + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
						//sap.ui.getCore().byId("id_OpQty").setValue(oPenQuantity.toFixed(3) + " " + that.selectedItem.Vrkme);
					}
					sap.ui.getCore().byId("id_OpQty").setValue(parseFloat(sap.ui.getCore().byId("id_LfimgVal").getValue()) - parseFloat(oPenQuantity).toFixed(3) + " " + that.selectedItem.Vrkme);
					
						that.getView().getModel("BatchItems").refresh(true);
					}
					//that.fnChangeColor();
				
				}//End of Added
			// } else {
			// 	this.oBatchObject.Charg = "";
			// 	MessageBox.error(this.getModel("i18n").getResourceBundle().getText("DeliveryQty_Exceed_BatchQty"));
			// }
			this.getView().getModel("BatchItems").refresh();
			that.getView().getModel("DeliverySet").refresh();
		},
		fnconfirmBatch: function(oEvent){
			var that = this;
			var aHeaderData = that.selectedItem.Lfimg;
			var oItem = oEvent.getParameter("selectedItem");
			var lineItems = that.getView().getModel("BatchItems").getData().Items;
			var oTotalOpenQty = sap.ui.getCore().byId("id_OpQty").getValue();
			if(lineItems.length > 1){
				var oModel = that.getView().getModel("BatchItems");
				var aItems = oModel.getProperty("/Items");
				var oExisting = aItems.find(function (item) {
					return item.Charg === oItem.getTitle();
				});
				if(oExisting){
					sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("AlreadySelectedmaintainPikmg"));
					return;
				}else{
					if(parseFloat(oItem.getDescription()) > parseFloat(oTotalOpenQty)){
						that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
						that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg =  parseFloat(oTotalOpenQty).toFixed(3);
						that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg =  parseFloat(oTotalOpenQty).toFixed(3);

						that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
						that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Pikmg =  parseFloat(oTotalOpenQty).toFixed(3);
						that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Lfimg =  parseFloat(oTotalOpenQty).toFixed(3);
						var netSum = parseFloat(aHeaderData);
						for(var x in lineItems){
							netSum -= lineItems[x].Pikmg;
						}
						//var totalPickingQuantity = parseFloat(aHeaderData) - parseFloat(oItem.getDescription());
						sap.ui.getCore().byId("id_OpQty").setValue(netSum.toFixed(3) + " " + that.selectedItem.Vrkme);
						that.getView().getModel("BatchItems").refresh(true)
					}else{
						that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
						that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = parseFloat(oItem.getDescription()).toFixed(3);
						that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg = parseFloat(oItem.getDescription()).toFixed(3);

						that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
						that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Pikmg =  parseFloat(oItem.getDescription()).toFixed(3);
						that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Lfimg =  parseFloat(oItem.getDescription()).toFixed(3);
						var totalPickingQuantity = parseFloat(oTotalOpenQty) - parseFloat(oItem.getDescription());
						sap.ui.getCore().byId("id_OpQty").setValue(totalPickingQuantity.toFixed(3) + " " + that.selectedItem.Vrkme);
					}
				}				

			}else{
			if(parseFloat(oItem.getDescription()) > parseFloat(aHeaderData)){
				if(that.getView().getModel("DeliverySet").getData().LineItems.length === 0){
					that.getView().getModel("DeliverySet").getData().LineItems.push(that.oBatchObject);
				}
				that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
				that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = parseFloat(aHeaderData).toFixed(3);
				that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg =parseFloat(aHeaderData).toFixed(3);

				that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
				that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Pikmg =  parseFloat(aHeaderData).toFixed(3);
				that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Lfimg =  parseFloat(aHeaderData).toFixed(3);
				var totalPickingQuantity = parseFloat(aHeaderData) - that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg;
				sap.ui.getCore().byId("id_OpQty").setValue(totalPickingQuantity.toFixed(3) + " " + that.selectedItem.Vrkme);

			}else{
				that.getView().getModel("DeliverySet").getData().LineItems.push(that.oBatchObject);
				that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
				that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Pikmg = parseFloat(oItem.getDescription()).toFixed(3);
				that.getView().getModel("BatchItems").getData().Items[this.f4BSelectedBatchPath].Lfimg = parseFloat(oItem.getDescription()).toFixed(3);

				that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Charg = oItem.getTitle();
				that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Pikmg =  parseFloat(oItem.getDescription()).toFixed(3);
				that.getView().getModel("DeliverySet").getData().LineItems[this.f4BSelectedBatchPath].Lfimg = parseFloat(oItem.getDescription()).toFixed(3);
				var totalPickingQuantity = parseFloat(aHeaderData) - parseFloat(oItem.getDescription());
				sap.ui.getCore().byId("id_OpQty").setValue(totalPickingQuantity.toFixed(3) + " " + that.selectedItem.Vrkme);
			}

			}
			var idTotalQty = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue());
			if(idTotalQty === 0 ){
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}else if(idTotalQty < 0 ){
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}else{
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPYellow");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
			}
			that.getView().getModel("BatchItems").refresh(true);
			that.getView().getModel("DeliverySet").refresh(true);




		},
		//===================================== Change Delivery Qty =========================//
		onChangeDeliveryQty: function (oEvent) {
			var that = this;
			var DelQtyObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			var DelQty = oEvent.getSource().getValue();

			if (DelQty == "") {
				DelQty = "0.000";
			}
			DelQtyObject.Lfimg = DelQty;
			// this.getView().getModel("BatchItems").refresh();
			var oBatchObj = this.getView().getModel("JMBatch").getData().find(function (x) {
				return x.Charg == DelQtyObject.Charg;
			});
			var odata = that.getView().getModel("BatchItems").getData().Items;
			var TotalQty = "0.000";
			$.each(odata, function (index, value, array) {
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

		//Added by Avinash - To Control Batch Managed Material also
		fnChangeColorItems: function (oEvent) {
			var that = this;
			var BatchObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			var vPickedQty = 0;
			for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
				if (that.getView().getModel("BatchItems").getData().Items[i].Uecha == that.selectedItem.Posnr) {
					vPickedQty = vPickedQty + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
				}
			}
			var vOpenQty = Number(that.selectedItem.Lfimg) - Number(vPickedQty);
			if (vPickedQty == Number(that.selectedItem.Lfimg) && vOpenQty == 0) {
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}
			if (vOpenQty == Number(that.selectedItem.Lfimg) && vPickedQty == 0) {
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}
			if (vOpenQty > 0 && vPickedQty < Number(that.selectedItem.Lfimg) && vPickedQty !== 0) {
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPYellow");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
			}
			sap.ui.getCore().byId("id_OpQty").setValue(vOpenQty.toFixed(3) + " " + that.selectedItem.Vrkme);

		},

		//Added by Avinash - To Control Non Batch Managed Material also
		fnChangeColor: function (oEvent) {
			var that = this;
			if(oEvent){
				var BatchObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			}
			//var BatchObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			var vPickedQty = 0;
			for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
				if (that.getView().getModel("BatchItems").getData().Items[i].Posnr == that.selectedItem.Posnr) {
					vPickedQty = vPickedQty + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
				}
			}
			var vOpenQty = Number(that.selectedItem.Lfimg) - Number(vPickedQty);
			if (vPickedQty == Number(that.selectedItem.Lfimg) && vOpenQty == 0) {
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}
			if (vOpenQty == Number(that.selectedItem.Lfimg) && vPickedQty == 0) {
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}
			if (vOpenQty > 0 && vPickedQty < Number(that.selectedItem.Lfimg) && vPickedQty !== 0) {
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPYellow");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
			}
			sap.ui.getCore().byId("id_OpQty").setValue(vOpenQty.toFixed(3) + " " + that.selectedItem.Vrkme);
		},

		//Added by Avinash
		fnValidateBatch: function (oEvent) {
			var BatchObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			// var vBatch = oEvent.getSource().getValue();
			if (Number(BatchObject.Pikmg) > 0 && BatchObject.Charg !== "") {
				var oPath = "/ValidateBatchSet";
				var that = this;
				var vWerks = that.getView().getModel("DeliverySet").getData().HeaderItems[0].Werks;
				var vMatnr = that.selectedItem.Matnr;
				var vLgort = BatchObject.Lgort;
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
					success: function (oData, Response) {
						if (oData.results[0].DelReturnNav.results.length == 0) {
							var odata = that.getView().getModel("DeliverySet").getData().LineItems;
							//BOC by Avinash to include batch if batch is maintained in Header Items...
							var vExist = false;
							for (var i = 0; i < odata.length; i++) {
								if (BatchObject.Posnr == odata[i].Posnr && BatchObject.Uecha == odata[i].Uecha) {
									odata[i].Charg = BatchObject.Charg;
									vExist = true;
									break;
								}
							}
							if (!vExist) {
								var vPosnr = 900000;
								var vHigh = odata.filter(function (x) {
									if (Number(x.Posnr) > Number(vPosnr)) {
										vPosnr = Number(x.Posnr);
									}
								});
								var aHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems;

								vPosnr = vPosnr + 1;
								var oGetBatchObject = jQuery.extend(true, {}, BatchObject);
								oGetBatchObject.Charg = BatchObject.Charg;
								oGetBatchObject.Pikmg = BatchObject.Pikmg;
								oGetBatchObject.Uecha = that.selectedItem.Posnr;
								oGetBatchObject.Posnr = vPosnr.toString();
								// BatchObject.Posnr = vPosnr.toString();
								that.getView().getModel("DeliverySet").getData().LineItems.push(oGetBatchObject);
								var aBatchItems = that.getView().getModel("BatchItems").getData().Items;
								var vItems = aBatchItems.filter(function (x) {
									x.Uecha = oGetBatchObject.Uecha;
								});
								that.getView().getModel("BatchItems").refresh(true);
								// var vSetCharg = aHeaderItems.filter(function(x) {
								// 	if (Number(x.Posnr) === Number(that.selectedItem.Posnr)) {
								// 		x.Charg = "";
								// 	}
								// });
								// that.getView().getModel("BatchItems").getData().Items[0].Uecha = BatchObject.Posnr;
							}
							//EOC by Avinash
							that.getView().getModel("DeliverySet").refresh();
						} else {
							// oEvent.getSource().setValue("");
							var odata = that.getView().getModel("DeliverySet").getData().LineItems;
							for (var i = 0; i < odata.length; i++) {
								if (BatchObject.Posnr == odata[i].Posnr && BatchObject.Uecha == odata[i].Uecha) {
									// odata[i].Charg = "";	//Commented in 10/6/22
									odata[i].Pikmg = "";
									break;
								}
							}
							// BatchObject.Charg = "";	//Commented in 10/6/22
							BatchObject.Pikmg = "";
							that.getView().getModel("BatchItems").refresh();
							that.getView().getModel("DeliverySet").refresh();
							MessageBox.error(oData.results[0].DelReturnNav.results[0].Message);
						}
						sap.ui.core.BusyIndicator.hide();
						var vPickedQty = 0;
						for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
							if (that.getView().getModel("BatchItems").getData().Items[i].Uecha == that.selectedItem.Posnr) {
								vPickedQty = vPickedQty + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
							}
						}
						var vOpenQty = Number(that.selectedItem.Lfimg) - Number(vPickedQty);
						if (vPickedQty == Number(that.selectedItem.Lfimg) && vOpenQty == 0) {
							sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPGreen");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
						}
						if (vOpenQty == Number(that.selectedItem.Lfimg) && vPickedQty == 0) {
							sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPRed");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
						}
						if (vOpenQty > 0 && vPickedQty < Number(that.selectedItem.Lfimg) && vPickedQty !== 0) {
							sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPYellow");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
							sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
						}
						sap.ui.getCore().byId("id_OpQty").setValue(vOpenQty.toFixed(3) + " " + that.selectedItem.Vrkme);
						//End of Added
					},

					error: function (oResponse) {
						oEvent.getSource().setValue("");
						sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("HTTPFail"));
					}
				});
			}
		},

		//=========================================== Change Picking Qty ==================================//
		onChangePickQty: function (oEvent) {
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
			// if (that.getView().getModel("DeliverySet").getData().LineItems.length > 0) {
			// 	for (var i = 0; i < that.getView().getModel("DeliverySet").getData().LineItems.length; i++) {
			// 		if (that.getView().getModel("DeliverySet").getData().LineItems[i].Uecha == that.selectedItem.Posnr && i !==
			// 			Number(vSelectedPath)) { //To Not consider same line for getting other all picked quantities...
			// 			// if (that.getView().getModel("DeliverySet").getData().LineItems[i].Uecha == that.selectedItem.Posnr) {
			// 			vPickedQty = vPickedQty + Number(that.getView().getModel("DeliverySet").getData().LineItems[i].Pikmg);
			// 		}
			// 	}
			// }
			if (that.getView().getModel("BatchItems").getData().Items.length > 0) {
				for (var i = 0; i < that.getView().getModel("BatchItems").getData().Items.length; i++) {
					if (that.getView().getModel("BatchItems").getData().Items[i].Uecha == that.selectedItem.Posnr && i !==
						Number(vSelectedPath)) { //To Not consider same line for getting other all picked quantities...
						// if (that.getView().getModel("DeliverySet").getData().LineItems[i].Uecha == that.selectedItem.Posnr) {
						vPickedQty = vPickedQty + Number(that.getView().getModel("BatchItems").getData().Items[i].Pikmg);
					}
				}
			}
			// else {
			// 	vFirstBatchSplit = true;
			// 	var vArr = [];
			// 	for (var i = 0; i < that.getOwnerComponent().getModel("DeliverySet").getData().HeaderItems.length; i++) {
			// 		if (that.getOwnerComponent().getModel("DeliverySet").getData().HeaderItems[i].Posnr == that.selectedItem.Posnr) {
			// 			vArr = that.getOwnerComponent().getModel("DeliverySet").getData()
			// 				.HeaderItems[i];
			// 			that.getOwnerComponent().getModel("DeliverySet").getData().LineItems.push(vArr);
			// 			that.getOwnerComponent().getModel("BatchItems").getData().Items[i].Charg = that.getOwnerComponent().getModel("DeliverySet").getData()
			// 				.HeaderItems[i].Charg;
			// 			that.getOwnerComponent().getModel("BatchItems").getData().Items[i].Uecha = that.getOwnerComponent().getModel("DeliverySet").getData()
			// 				.HeaderItems[i].Posnr;
			// 			that.getOwnerComponent().getModel("BatchItems").getData().Items[i].Lfimg = that.getOwnerComponent().getModel("DeliverySet").getData()
			// 				.HeaderItems[i].Lfimg;
			// 			that.getOwnerComponent().getModel("BatchItems").getData().Items[i].Posnr = "900001"
			// 			that.getOwnerComponent().getModel("DeliverySet").getData().HeaderItems[i].Posnr = "000010"
			// 			that.getOwnerComponent().getModel("DeliverySet").getData().LineItems[i].Posnr = "900001"
			// 				// that.getOwnerComponent().getModel("DeliverySet").getData().HeaderItems[i].Charg = "";
			// 			break;
			// 		}
			// 	}
			// 	for (var i = 0; i < that.getOwnerComponent().getModel("DeliverySet").getData().LineItems.length; i++) {
			// 		if (that.getOwnerComponent().getModel("DeliverySet").getData().LineItems[i].Uecha == "000000") {
			// 			that.getOwnerComponent().getModel("DeliverySet").getData().LineItems[i].Uecha = that.selectedItem.Posnr;
			// 			that.getOwnerComponent().getModel("DeliverySet").getData().LineItems[i].Posnr = "900001"
			// 			break;
			// 		}
			// 	}
			// 	// vPickedQty = 
			// 	that.getOwnerComponent().getModel("DeliverySet").refresh(true);
			// 	that.getOwnerComponent().getModel("BatchItems").refresh(true);
			// }
			//EOC..

			var PickQtyObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			// var PickQty = oEvent.getSource().getValue();
			PickQtyObject.Pikmg = PickQty;
			// PickQtyObject.Lfimg = PickQty; //Added by Avinash
			this.getView().getModel("BatchItems").refresh();

			var odata = that.getView().getModel("BatchItems").getData().Items;
			var TotalQty = 0.000;
			$.each(odata, function (index, value, array) {
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
			} else {
				var aHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems;
				var ahItems = aHeaderItems.filter(function (x) {
					if (!x.Fbatc && x.Posnr === that.selectedItem.Posnr) {
						x.Pikmg = PickQtyObject.Pikmg;
					}
				});
				that.fnChangeColor(oEvent); //Added by Avinash to consider Non Batch Managed Material also
			}
			// } else {
			// 	oEvent.getSource().setValue("");
			// 	MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("QtyShouldbePositive"));
			// }
			//================================================================//
		},
		//End of added
		onChangePickQtyManual: function(oEvent){

				var that = this;
				var PickQtyObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			var aHeaderData = that.selectedItem.Lfimg;
			var aExistingTotalPikQty = sap.ui.getCore().byId("id_OpQty").getValue();
			
			var lineItems = that.getView().getModel("BatchItems").getData().Items;
			var oSum =  0.000;
			for(var z in lineItems){
				//oSum += parseFloat(lineItems[z].Pikmg);
				oSum += parseFloat(lineItems[z].Pikmg === "" ? "0.000" : lineItems[z].Pikmg);
			}
			if(oSum > parseFloat(aHeaderData)){
				oEvent.getSource().setValue("");
				var oSum = 0.000;
				for(var z in lineItems){
					if(lineItems[z].Pikmg !== ""){
						oSum += parseFloat(lineItems[z].Pikmg);
					}
				//oSum += parseFloat(lineItems[z].Pikmg) == "" ? 0.000 : parseFloat(lineItems[z].Pikmg);
			}
				PickQtyObject.Lfimg = "";

			var oTotalPikingQty = parseFloat(aHeaderData) - oSum;
				sap.ui.getCore().byId("id_OpQty").setValue(oTotalPikingQty + " " + that.selectedItem.Vrkme);
				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("DeliveryQty_Exceed_BatchQty"));

			}else{
				var oSelectedpickQTY = parseFloat(oEvent.getSource().getValue());
				PickQtyObject.Lfimg = oSelectedpickQTY.toFixed(3);
				PickQtyObject.Pikmg = oSelectedpickQTY.toFixed(3);
				var oTotalPikingQty = parseFloat(aHeaderData) - oSum;
				sap.ui.getCore().byId("id_OpQty").setValue(oTotalPikingQty + " " + that.selectedItem.Vrkme);
			}	
				var idTotalQty = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue());
			if(idTotalQty === 0 ){
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}else if(idTotalQty < 0 ){
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPRed");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
			}else{
				sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPYellow");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
				sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
			}
			that.getView().getModel("BatchItems").refresh(true);
			that.getView().getModel("DeliverySet").refresh(true);
			that.getView().getModel("BatchItems").refresh(true);

		},

		onChangePickQty2: function (oEvent) {
			var that = this;
			var PickQtyObject = oEvent.getSource().getBindingContext("BatchItems").getObject();
			var PickQty = oEvent.getSource().getValue();
			PickQtyObject.Pikmg = PickQty;
			this.getView().getModel("BatchItems").refresh();

			var odata = that.getView().getModel("BatchItems").getData().Items;
			var TotalQty = 0.000;
			$.each(odata, function (index, value, array) {
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
			var vExist = false;
			for (var i = 0; i < odata.length; i++) {
				if (PickQtyObject.Posnr == odata[i].Posnr && PickQtyObject.Uecha == odata[i].Uecha) {
					odata[i].Pikmg = PickQtyObject.Pikmg;
					vExist = true;
					break;
				}
			}
			//Added on 13/6/22
			if (!vExist) { //Non Batch Managed Material Item
				var aHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems;
				for (var i = 0; i < aHeaderItems.length; i++) {
					if (PickQtyObject.Posnr == aHeaderItems[i].Posnr) {
						aHeaderItems[i].Pikmg = PickQtyObject.Pikmg;
						break;
					}
				}
			}
			//End of Added
			that.getView().getModel("DeliverySet").refresh();
			//Added on 13/06/22
			if (vExist) {
				that.fnChangeColorItems(oEvent);
			} else {
				that.fnChangeColor(oEvent);
			}
			//================================================================//
		},

		// //===============================================================
		// //-------------------    Add new Batch    --------------------
		// //===============================================================
		handleAddBatch: function () {
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
		onDeleteBatch: function (oEvent) {
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
		fnLiveChangeOTNum: function (oEvent) {
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
		onScanQRValue: function () {
			var oThat = this;
			var oVideoDeviceModel = new JSONModel();
			//Initialize the ZXing QR Code Scanner
			codeReader = new ZXing.BrowserMultiFormatReader();
			codeReader.listVideoInputDevices().then((videoInputDevices) => {
				if (videoInputDevices.length > 1) {
					selectedDeviceId = videoInputDevices[1].deviceId; //Mobile Back Camera
				} else {
					selectedDeviceId = videoInputDevices[0].deviceId; //Default Camera
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
							text: "Start",
							type: "Accept",
							press: function () {
								oThat._oScanQRDialog.close();
								oThat.onScanQRValue();
							}

						})

						this.startScanning();
					})
				}
			});
		},

		startScanning: function () {
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
							press: function (oEvent) {
								this._oScanQRDialog.close();
								codeReader.reset()
							}.bind(this)
						}),
						afterOpen: function () {
							codeReader.decodeFromVideoDevice(selectedDeviceId, this.getView().byId("scanContainer_QR").getDomRef(), (result, err) => {
								if (result) {
									console.log(result)
									//this.getView().byId("scannedValue").setValue(result.text);
									this.getView().getModel("BatchItems").getData().Items[0].Pikmg = result.text;
									this.getView().getModel("BatchItems").refresh();
									this._oScanQRDialog.close();
									codeReader.reset()
								}
								if (err && !(err instanceof ZXing.NotFoundException)) {
									console.error(err)
									this.getView().getModel("BatchItems").getData().Items[0].Pikmg = result.text;
									this.getView().getModel("BatchItems").refresh();
									//this.getView().byId("scannedValue").setValue(err);
								}
							})
							console.log('Started continous decode from camera');
						}.bind(this),
						afterClose: function () { }
					});
					this.getView().addDependent(this._oScanQRDialog);
				}
				this._oScanQRDialog.open();
			} else { //QR Scanner is available and on Mobile Fiori Client
				sap.ndc.BarcodeScanner.scan(
					function (mResult) {
						oCont.fnBarcode(mResult.text);
						// this.getView().getModel("BatchItems").getData().Items[0].Pikmg = mResult.text;
						// this.getView().getModel("BatchItems").refresh();
						// alert("We got a bar code\n" +
						// 	"Result: " + mResult.text + "\n" +
						// 	"Format: " + mResult.format + "\n" +
						// 	"Cancelled: " + mResult.cancelled);

					},
					function (Error) {
						//	alert("Scanning failed: " + Error);

					},
				);
			}

		},
		fnBarcode: function (oEvent) {
			var aData = oEvent.split(",");
			if (aData[10] === this.getView().getModel("BatchItems").getData().Items[0].Charg) {
				this.getView().getModel("BatchItems").getData().Items[0].Pikmg =
					Number(this.getView().getModel("BatchItems").getData().Items[0].Pikmg) + Number(aData[5]);
				if (Number(this.getView().getModel("BatchItems").getData().Items[0].Lfimg) <
					Number(this.getView().getModel("BatchItems").getData().Items[0].Pikmg)) {
					MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("PickingShouldLesser"));
					this.getView().getModel("BatchItems").getData().Items[0].Pikmg = "";
				} else if (Number(this.getView().getModel("BatchItems").getData().Items[0].Lfimg) >
					Number(this.getView().getModel("BatchItems").getData().Items[0].Pikmg)) {
					MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("PickingQtyisless"));
				}
				this.getView().getModel("BatchItems").refresh();
			} else {
				MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("BatchisDifferent"));
			}
		},
		onBatchSacninputLiveUpdate: function (oEvent) {
			//debugger;
		},
		//ended by dharma on 24-02-2021

	// added multi scanning functionality by Laxmikanth B 17-09-2025
		onScanPress: function () {
			// For SAPUI5 1.115 or higher
			var that = this;
			that.BusyDialog = new sap.m.BusyDialog();
			that.oResourceBundles = that.getView().getModel("i18n").getResourceBundle();
			that.oHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems[0];

			sap.ndc.BarcodeScanner.setConfig({
				multiple: true,
				enableMultiScan: true
				//	maxNumberOfBarcodes: 3 // Set the max number of scans
			});

			function scanAgain() {
				sap.ndc.BarcodeScanner.scan(
					function (mResult) {
						if (!mResult.cancelled) {
							var sBatchID = mResult.text;
							sap.m.MessageToast.show(that.oResourceBundles.getText("Scanned_Order") + sBatchID);
							that.BusyDialog.open();
							that.oBatchObject = that.selectedItem;
							that._getOrderDetails(sBatchID).then(function (oBatchData) {
								that.BusyDialog.close();
								if(Number(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) && that.oHeaderItems.QtyEditFlag === 'D'){
									sap.m.MessageBox.information(that.oResourceBundles.getText("Scanned_Batch_Picking_Quantity1")+" "+ oBatchData.PgiQty+ " "+that.oResourceBundles.getText("isGreaterthanOpenQuantity")+" " + parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) + that.oResourceBundles.getText("Scanned_Batch_Picking_Quantity3"));
									return;
								}else if(parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) === 0 ){
									sap.m.MessageBox.information(that.oResourceBundles.getText("openQuantytiZero"));
									return;
								}
								else if(oBatchData.PgiQty === "0.000"){
									// sap.m.MessageBox.information(that.oResourceBundles.getText("ScannedBatchQuantityisZero")+" "+ oBatchData.PgiQty + that.oResourceBundles.getText("Scanned_Batch_Picking_Quantity3"));
									alert(that.oResourceBundles.getText("ScannedBatchQuantityisZero")+" "+ oBatchData.PgiQty + that.oResourceBundles.getText("Scanned_Batch_Picking_Quantity3"));
									scanAgain();
								}else{
								var oModel = that.getView().getModel("BatchItems");
								var aItems = oModel.getProperty("/Items");

								// Check if order already exists
								var oExisting = aItems.find(function (item) {
									return item.Charg === oBatchData.Charg;
								});

								if (oExisting) {
									oExisting.qty += 1;
									sap.m.MessageToast.show("Already Batch scanned:" + oExisting.Charg, {
										duration: 3000,                  // default
										width: "15em",                   // default
										my: "CenterCenter",             // default
										at: "CenterCenter",             // default
										of: window,                      // default
										offset: "0 0",                   // default
										collision: "fit fit",            // default
										onClose: null,                   // default
										autoClose: true,                 // default
										animationTimingFunction: "ease", // default
										animationDuration: 5000,         // default
										closeOnBrowserNavigation: true   // default
									});
									
								} else {
									
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg01 = 'X';
										that.getView().getModel("oBatchEnable").refresh(true);
									if (aItems.length == 1 && aItems[0].Charg == "") {
										var odata = that.getView().getModel("DeliverySet").getData().LineItems;
										var oBatchItems = [];
										var saveF = [];
										$.each(odata, function (index, value, array) {
											if (that.selectedItem.Posnr === value.Uecha) {
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
												if (!value.Lgort) {
													value.Lgort = that.selectedItem.Lgort; 
												}
												oBatchItems.push(value);
											}
										});										
										if (oBatchItems.length == 0) {
											var odataf = that.getView().getModel("DeliverySet").getData().HeaderItems;
											var vPosnr = 900000;
											var vHigh = odata.filter(function (x) {
												if (Number(x.Posnr) > Number(vPosnr)) {
													vPosnr = Number(x.Posnr);
												}
											});
											vPosnr = vPosnr;
											$.each(odataf, function (index, value, array) {
												if (!value.Charg) {
													if (Number(that.selectedItem.Posnr) === Number(value.Posnr)) { 
														var oGetBatchObject = jQuery.extend(true, {}, value);
														if (parseFloat(value.Pikmg) === 0) {
															// value.Pikmg = "";
															oGetBatchObject.Pikmg = "";
															saveF.push(true);
														} else {
															saveF.push(false);
														}

														if (value.PikmgF) {
															saveF.push(true);
														} else {
															saveF.push(false);
														}
														if (!oGetBatchObject.Lgort) {
															oGetBatchObject.Lgort = that.selectedItem.Lgort; 
														}
														if (value.Fbatc) {
															oGetBatchObject.Posnr = vPosnr.toString(); 
															oGetBatchObject.Uecha = that.selectedItem.Posnr; 
														}
														// oBatchItems.push(value);
														oBatchItems.push(oGetBatchObject);
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
										that.getOwnerComponent().setModel(oJson, "BatchItems");
										that.oBatchObject = that.getView().getModel("DeliverySet").getData().HeaderItems[0];
										that.oBatchObject = that.selectedItem;

										var odata = that.getView().getModel("DeliverySet").getData().LineItems;
										if (parseFloat(oBatchData.DelQty) <= parseFloat(that.oBatchObject.Lfimg) || that.oBatchObject.QtyEditFlag === 'E') {
											// that.oBatchObject.Charg = oBatchData.Charg;
											// that.oBatchObject.Pikmg = oBatchData.PgiQty;
											// that.oBatchObject.Lfimg = oBatchData.DelQty;
											//that.oBatchObject.Lfimg = oBatchData.DelQty;
											// add batch to the All item batch table
											var vExist = false;
											for (var i = 0; i < odata.length; i++) {
												if (that.oBatchObject.Posnr == odata[i].Posnr && that.oBatchObject.Uecha == odata[i].Uecha) {
													odata[i].Charg = oBatchData.Charg;
													odata[i].Pikmg = oBatchData.PgiQty;
													odata[i].Lfimg = oBatchData.DelQty;
													vExist = true;
													break;
												}
											}
											if (!vExist) {
												var vPosnr = 900000;
												var vHigh = odata.filter(function (x) {
													if (Number(x.Posnr) > Number(vPosnr)) {
														vPosnr = Number(x.Posnr);
													}
												});
												var aHeaderItems = that.getView().getModel("DeliverySet").getData().HeaderItems;

												vPosnr = vPosnr + 1;
												var oGetBatchObject = jQuery.extend(true, {}, that.oBatchObject);
												oGetBatchObject.Charg = oBatchData.Charg;
												oGetBatchObject.Pikmg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? oGetBatchObject.Lfimg : oBatchData.PgiQty;
											//	oGetBatchObject.Pikmg = oGetBatchObject.Lfimg;
												oGetBatchObject.Uecha =   that.selectedItem.Posnr;
												oGetBatchObject.Posnr = vPosnr.toString();
												//oGetBatchObject.Posnr = that.selectedItem.Posnr;
												//oGetBatchObject.PikmgF = false;
												// BatchObject.Posnr = vPosnr.toString();
												that.getView().getModel("DeliverySet").getData().LineItems.push(oGetBatchObject);
												var aBatchItems = that.getView().getModel("BatchItems").getData().Items;
												var vItems = aBatchItems.filter(function (x) {
													x.Uecha === oGetBatchObject.Uecha;
												});
												that.getView().getModel("BatchItems").getData().Items = [];
												that.getView().getModel("BatchItems").getData().Items.push(oGetBatchObject);
												that.getView().getModel("BatchItems").getData().Items[0].Lfimg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? oGetBatchObject.Lfimg : oBatchData.PgiQty; //oGetBatchObject.Lfimg;
												that.getView().getModel("BatchItems").refresh(true);
											} //End of Added
										} else {
											that.oBatchObject.Charg = "";
											//sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("DeliveryQty_Exceed_BatchQty"));
											// sap.m.MessageBox.error(that.oResourceBundles.getText("Batch_Quantity_is_Greater_Than_Open_Quantity"));
											alert(that.oResourceBundles.getText("Batch_Quantity_is_Greater_Than_Open_Quantity"));
										}
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg01 = '';
										that.getView().getModel("oBatchEnable").refresh(true);
										//var oremainigQty = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) - parseFloat(oBatchData.PgiQty);
										var oremainigQty = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) - parseFloat(oGetBatchObject.Lfimg)
										sap.ui.getCore().byId("id_OpQty").setValue(oremainigQty.toFixed(3) + " " + that.selectedItem.Vrkme);

										var idTotalQty = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue());
										if (idTotalQty === 0) {
											sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPGreen");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
										} else if (idTotalQty < 0) {
											sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPRed");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
										} else {
											sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPYellow");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
										}
										that.getView().getModel("BatchItems").refresh();
										that.getView().getModel("DeliverySet").refresh();
										//that.fnChangeColor();
									} else {
										that.oBatchObject = that.getView().getModel("DeliverySet").getData().HeaderItems[0];
										that.oBatchObject = that.selectedItem;

										if (that.getView().getModel("DeliverySet").getData().LineItems.length > 0) {
											var vLargestPosnr = Number(that.getView().getModel("DeliverySet").getData().LineItems[0].Posnr);
										}
										for (var i = 0; i < that.getView().getModel("DeliverySet").getData().LineItems.length; i++) {
											if (vLargestPosnr < that.getView().getModel("DeliverySet").getData().LineItems[i].Posnr) {
												vLargestPosnr = Number(that.getView().getModel("DeliverySet").getData().LineItems[i].Posnr);
											}
											// if(that.getView().getModel("DeliverySet").getData().LineItems)
										}
										//Getting Sloc for Header Items for Updating Line Items..
										// // that.selectedItem.Posnr
										// if(vSubItem.length == 0){
										// 	for(var i=0;i<)
										// }
										//var oTabData = oTabModel.getData().Items;
										// var vPosnr = (Number(vSubItem[that.getView().getModel("BatchItems").getData().Items.length - 1].Posnr) + 1);
										var vPosnr = (Number(that.getView().getModel("DeliverySet").getData().LineItems[0].Uecha) + 1);
										var vPosnr = 900000;
										vPosnr +=1;

										if (that.getView().getModel("DeliverySet").getData().LineItems.length > 0) {
											var vLargestPosnr = Number(that.getView().getModel("DeliverySet").getData().LineItems[0].Posnr);
										}
										for (var i = 0; i < that.getView().getModel("DeliverySet").getData().LineItems.length; i++) {
											if (vLargestPosnr < that.getView().getModel("DeliverySet").getData().LineItems[i].Posnr) {
												vLargestPosnr = Number(that.getView().getModel("DeliverySet").getData().LineItems[i].Posnr);
											}
											// if(that.getView().getModel("DeliverySet").getData().LineItems)
										}
										
										var vPosnr = (Number(vLargestPosnr) + 1);


										oBatchData.qty = 1;
										oBatchData.lineTotal = oBatchData.price;
										//that.oBatchObject.PikmgF = false;
										//aItems.push(oBatchData);
										aItems.push({
											"BatchUpdMode": that.oBatchObject.BatchUpdMode,
											"BatchValidSkip": that.oBatchObject.BatchValidSkip,
											"Bstme": that.oBatchObject.Bstme,
											"Charg": oBatchData.Charg,
											"Customer": that.oBatchObject.Customer,
											"Del_type": that.oBatchObject.Del_type,
											"Fbatc": that.oBatchObject.Fbatc,
											"Fpicq": that.oBatchObject.Fpicq,
											"Kwmeng": that.oBatchObject.Kwmeng,
											"Lenum": that.oBatchObject.Lenum,
											"Lfimg": oBatchData.DelQty,
											"Lgnum": that.oBatchObject.Lgnum,
											"Lgobe": that.oBatchObject.Lgobe,
											"Lgort": that.oBatchObject.Lgort,
											"Lgpla": that.oBatchObject.Lgpla,
											"Maktx": that.oBatchObject.Maktx,
											"Matnr": that.oBatchObject.Matnr,
											"Meins": that.oBatchObject.Meins,
											"Menge": that.oBatchObject.Menge,
											"Otnum": that.oBatchObject.Otnum,
											"Pikmg": oBatchData.PgiQty,
											"PikmgF": that.oBatchObject.PikmgF,
											"Pmat1": that.oBatchObject.Pmat1,
											"Pmat2": that.oBatchObject.Pmat2,
											"Pmatno1": that.oBatchObject.Pmatno1,
											"Pmatno2": that.oBatchObject.Pmatno2,
											"Pmatqty1": that.oBatchObject.Pmatqty1,
											"Pmatqty2": that.oBatchObject.Pmatqty2,
											"Posnr": vPosnr.toString(),
											"Reason": that.oBatchObject.Reason,
											"Sc_No": that.oBatchObject.Sc_No,
											"Spart": that.oBatchObject.Spart,
											"Sto_flg": that.oBatchObject.Sto_flg,
											"StrLoc": that.oBatchObject.StrLoc,
											"Tanum": that.oBatchObject.Tanum,
											"ToConfirm": that.oBatchObject.ToConfirm,
											"Uecha": that.selectedItem.Posnr,
											"Vbeln": that.oBatchObject.Vbeln,
											"Verme": that.oBatchObject.Verme,
											"Vfdat": null,
											"Vgbel": that.oBatchObject.Vgbel,
											"Vgpos": that.oBatchObject.Vgpos,
											"Vkorg": that.oBatchObject.Vkorg,
											"Vrkme": that.oBatchObject.Vrkme,
											"Vtweg": that.oBatchObject.Vtweg,
											"Werks": that.oBatchObject.Werks
										});
										that.getView().getModel("DeliverySet").getData().LineItems.push({
											"BatchUpdMode": that.oBatchObject.BatchUpdMode,
											"BatchValidSkip": that.oBatchObject.BatchValidSkip,
											"Bstme": that.oBatchObject.Bstme,
											"Charg": oBatchData.Charg,
											"Customer": that.oBatchObject.Customer,
											"Del_type": that.oBatchObject.Del_type,
											"Fbatc": that.oBatchObject.Fbatc,
											"Fpicq": that.oBatchObject.Fpicq,
											"Kwmeng": that.oBatchObject.Kwmeng,
											"Lenum": that.oBatchObject.Lenum,
											"Lfimg": oBatchData.DelQty,
											"Lgnum": that.oBatchObject.Lgnum,
											"Lgobe": that.oBatchObject.Lgobe,
											"Lgort": that.oBatchObject.Lgort,
											"Lgpla": that.oBatchObject.Lgpla,
											"Maktx": that.oBatchObject.Maktx,
											"Matnr": that.oBatchObject.Matnr,
											"Meins": that.oBatchObject.Meins,
											"Menge": that.oBatchObject.Menge,
											"Otnum": that.oBatchObject.Otnum,
											"Pikmg": oBatchData.PgiQty,
											"PikmgF": that.oBatchObject.PikmgF,
											"PackWt":  that.oBatchObject.PackWt,
											"Pmat1": that.oBatchObject.Pmat1,
											"Pmat2": that.oBatchObject.Pmat2,
											"Pmatno1": that.oBatchObject.Pmatno1,
											"Pmatno2": that.oBatchObject.Pmatno2,
											"Pmatqty1": that.oBatchObject.Pmatqty1,
											"Pmatqty2": that.oBatchObject.Pmatqty2,
											"Posnr": vPosnr.toString(), //that.selectedItem.Posnr, //parseFloat(that.oBatchObject.Posnr) + 1,
											"Reason": that.oBatchObject.Reason,
											"Sc_No": that.oBatchObject.Sc_No,
											"Spart": that.oBatchObject.Spart,
											"Sto_flg": that.oBatchObject.Sto_flg,
											"StrLoc": that.oBatchObject.StrLoc,
											"Tanum": that.oBatchObject.Tanum,
											"ToConfirm": that.oBatchObject.ToConfirm,
											"Uecha": that.selectedItem.Posnr, //vPosnr, //that.selectedItem.Posnr,
											"Vbeln": that.oBatchObject.Vbeln,
											"Verme": that.oBatchObject.Verme,
											"Vfdat": null,
											"Vgbel": that.oBatchObject.Vgbel,
											"Vgpos": that.oBatchObject.Vgpos,
											"Vkorg": that.oBatchObject.Vkorg,
											"Vrkme": that.oBatchObject.Vrkme,
											"Vtweg": that.oBatchObject.Vtweg,
											"Werks": that.oBatchObject.Werks
										});
										var oCurrentBatchDelivery = that.getView().getModel("DeliverySet").getData().LineItems.filter(function (params) {
											return params.Charg === oBatchData.Charg
										});
										var oCurrentBatchBatch = aItems.filter(function (params) {
											return params.Charg === oBatchData.Charg
										});

										if (parseFloat(oBatchData.DelQty) <= parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) || that.oBatchObject.QtyEditFlag === 'E') {
											// oCurrentBatchDelivery[0].Lfimg = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3);
											// oCurrentBatchDelivery[0].Pikmg = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3);
											// oCurrentBatchBatch[0].Lfimg = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3);
											// oCurrentBatchBatch[0].Pikmg = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3);
											// oCurrentBatchDelivery[0].Lfimg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? that.oBatchObject.Lfimg : oBatchData.PgiQty;
											// oCurrentBatchDelivery[0].Pikmg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? that.oBatchObject.Lfimg : oBatchData.PgiQty;
											// oCurrentBatchBatch[0].Lfimg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? that.oBatchObject.Lfimg : oBatchData.PgiQty;
											// oCurrentBatchBatch[0].Pikmg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? that.oBatchObject.Lfimg : oBatchData.PgiQty;
											oCurrentBatchDelivery[0].Lfimg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3) : oBatchData.PgiQty;
											oCurrentBatchDelivery[0].Pikmg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3) : oBatchData.PgiQty;
											oCurrentBatchBatch[0].Lfimg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3) : oBatchData.PgiQty;
											oCurrentBatchBatch[0].Pikmg = parseFloat(oBatchData.PgiQty) > parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) ? parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()).toFixed(3) : oBatchData.PgiQty;
											var oremainigQty = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) - parseFloat(oCurrentBatchBatch[0].Lfimg);
											sap.ui.getCore().byId("id_OpQty").setValue(oremainigQty.toFixed(3) + " " + that.selectedItem.Vrkme);

										}else{
											var oremainigQty = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) - parseFloat(oBatchData.PgiQty);
											sap.ui.getCore().byId("id_OpQty").setValue(oremainigQty.toFixed(3) + " " + that.selectedItem.Vrkme);
											that.getView().getModel("BatchItems").refresh();
											that.getView().getModel("DeliverySet").refresh();
										}
										//	that.getView().getModel("DeliverySet").getData().LineItems.push(aItems[aItems.length - 1]);
										that.getView().getModel("oBatchEnable").getData().results[0].F4FieldsNav.results[0].Charg01 = '';
										that.getView().getModel("oBatchEnable").refresh(true);
										// var oremainigQty = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue()) - parseFloat(oBatchData.PgiQty);
										// sap.ui.getCore().byId("id_OpQty").setValue(oremainigQty.toFixed(3) + " " + that.selectedItem.Vrkme);
										that.getView().getModel("BatchItems").refresh();
										that.getView().getModel("DeliverySet").refresh();
										var idTotalQty = parseFloat(sap.ui.getCore().byId("id_OpQty").getValue());
										if (idTotalQty === 0) {
											sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPGreen");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
										} else if (idTotalQty < 0) {
											sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPRed");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPYellow");
										} else {
											sap.ui.getCore().byId("id_OpQty").addStyleClass("InputPlaceholder_CPYellow");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPGreen");
											sap.ui.getCore().byId("id_OpQty").removeStyleClass("InputPlaceholder_CPRed");
										}
										//that.fnChangeColor();
									}
									oModel.setProperty("/Items", aItems);
								}
								//oModel.setProperty("/Items", aItems);
								//that._updateTotal(oModel);
								//that.byId("idDeliveryQtyViewLabel").setText(that.oResourceBundles.getText("DeliveryQty") + ":" + sap.ui.getCore().byId("id_LfimgVal").getValue());
								scanAgain();
								//that.byId("idDeliveryQtyViewLabel").setText(that.oResourceBundles.getText("DeliveryQty") + ":" + sap.ui.getCore().byId("id_LfimgVal").getValue());
								
							}
							}).catch(function (err) {
								that.BusyDialog.close();
								sap.m.MessageToast.show("Error: " + err);
								//that.byId("idDeliveryQtyViewLabel").setText(that.oResourceBundles.getText("DeliveryQty") + ":" + sap.ui.getCore().byId("id_LfimgVal").getValue());
								
								scanAgain();
								//that.byId("idDeliveryQtyViewLabel").setText(that.oResourceBundles.getText("DeliveryQty") + ":" + sap.ui.getCore().byId("id_LfimgVal").getValue());
								
							});
						} else {
							that.BusyDialog.close();
							sap.m.MessageToast.show("Scanning stopped.");
							//that.byId("idDeliveryQtyViewLabel").setText(that.oResourceBundles.getText("DeliveryQty") + ":" + sap.ui.getCore().byId("id_LfimgVal").getValue());
								
						}
					},
					function (Error) {
						that.BusyDialog.close();
						sap.m.MessageToast.show("Scan failed: " + Error);
					},
					function (mParams) {
						//alert("Value entered: " + mParams.newValue);
					},
					"Enter Batch Barcode",
					sap.ui.Device.system.desktop === true ? true : false,
					30,
					1,
					false,
					false
					//that.getView().getModel("BatchItems").getData().Items[0].BatchUpdMode === 'S' ? false : true
				);
			}
			//that.byId("idDeliveryQtyViewLabel").setText(that.oResourceBundles.getText("DeliveryQty") + ":" + sap.ui.getCore().byId("id_LfimgVal").getValue());
								
			scanAgain();


		},

		// Mock backend
		_getOrderDetails: function (sBatchID) {
			
			var that = this;
			that.oResourceBundles = that.getView().getModel("i18n").getResourceBundle();
			return new Promise(function (resolve, reject) {
				//var oPath = "/BatchShSet";
				var oPath = "/BatchQtySet";
			var oGetModel = that.getView().getModel('odata');

			oGetModel.read(oPath, {
				filters: [
					new Filter("Matnr", FilterOperator.EQ, that.selectedItem.Matnr),
					new Filter("Lgort", FilterOperator.EQ, that.selectedItem.Lgort),
					new Filter("Werks", FilterOperator.EQ, that.selectedItem.Werks),
					new Filter("Charg", FilterOperator.EQ, sBatchID),
					new Filter("Uom", FilterOperator.EQ, that.selectedItem.Vrkme)
				],
				success: function (oData, Response) {
					// var oTabJson = new sap.ui.model.json.JSONModel();
					// oTabJson.setData(oData.results);
					// that.getView().setModel(oTabJson, "JMBatch");
					// sap.ui.getCore().setModel(oTabJson, "JMBatch");
					if (oData.results.length === 0) {
						sap.m.MessageToast.show(that.getModel("i18n").getResourceBundle().getText("NoBatchFound"));
					}
					//  this.getView().getModel("DeliverySet").getData().LineItems.
					// Check if order already exists
					var oModel = that.getView().getModel("BatchItems");
					var aItems = oModel.getProperty("/Items");
					var oExisting = aItems.find(function (item) {
						return item.Charg === oData.results[0].Charg;
					});

					if (oExisting) {
						oExisting.qty += 1;
						sap.m.MessageToast.show(that.oResourceBundles.getText("thebatchNumber") + oExisting.Charg + " "+ that.oResourceBundles.getText("thebatchNumber"), {
							duration: 3000,                  // default
							width: "15em",                   // default
							my: "CenterCenter",             // default
							at: "CenterCenter",             // default
							of: window,                      // default
							offset: "0 0",                   // default
							collision: "fit fit",            // default
							onClose: null,                   // default
							autoClose: true,                 // default
							animationTimingFunction: "ease", // default
							animationDuration: 5000,         // default
							closeOnBrowserNavigation: true   // default
						});

					}
					setTimeout(function () {
						if (oData.results.length > 0) {
							for (var i = 0; i < oData.results.length; i++) {
								if (oData.results[i].Charg === sBatchID) {
									resolve(oData.results[i]);
								}
							}
						}
						else {
							reject( that.oResourceBundles.getText("orderNotfound") + sBatchID);
						}
					}, 2000);

				},
				error: function (oResponse) {
					sap.m.MessageBox.error(JSON.parse(oResponse.responseText).error.message.value + that.oResourceBundles.getText("orderNotfound"));
				}
			});
			});
		},
		// Ended multi scanning functionality by Laxmikanth.B 
		onPackagongDetailsBtnPress: function (oEvent) {
			var that = this;
			that.oModel = that.getView().getModel('odata');
			if (!that._PackageDetails) {
				that._PackageDetails = sap.ui.xmlfragment("LoadingConfirmation.fragment.PackingDetails", that);
				that.getView().addDependent(that._PackageDetails);
			}
			// Save parent row context
			that._oRowContext = oEvent.getSource().getBindingContext("DeliverySet");
			var oParentModel = that._oRowContext.getModel("DeliverySet");
			var sPath = that._oRowContext.getPath();

			that._PackageDetails.addStyleClass("customPackingDialog");
			var oDeliveryData = that.getView().getModel("DeliverySet").getData();
			var oHeaderData = oDeliveryData.Header;
			var oHeaderItemData = oDeliveryData.HeaderItems;

			var sWbid = oHeaderData.Wbid;
			var sMatnr = oParentModel.getProperty(sPath + "/Matnr");
			var aFilters = [
				// new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.EQ, "236236000426"),
				// new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, "100000024051"),
				new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.EQ, sWbid),
				new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, sMatnr),
				
			];
			that.oModel.read("/PackingWeightSet", {
				filters: aFilters,
				success: function (oData) {
					var aDropDownValues = oData.results || [];
					  // ✅ Check if parent already has PackagingDetails saved
                    var aSavedRows = oParentModel.getProperty(sPath + "/PackagingDetails") || [];
					   var aRows;
            // if (aSavedRows.length > 0) {
            //     aRows = aSavedRows;   // Use previously saved data
			// 	}
			// 	else
				if(oParentModel.getProperty(sPath).Pmat1 && oParentModel.getProperty(sPath).Pmat2){
					 aRows = [{
							Serial: 1,
							Type: oParentModel.getProperty(sPath).Pmat1,
							Bags: oParentModel.getProperty(sPath).Pmatno1,
							Gross: oParentModel.getProperty(sPath).Pmatqty1,
							Tare: oData.results[0].TareWeight,
							//Ownership: ""
							Uom : ""
						},
						{
							Serial: 2,
							Type: oParentModel.getProperty(sPath).Pmat2,
							Bags: oParentModel.getProperty(sPath).Pmatno2,
							Gross: oParentModel.getProperty(sPath).Pmatqty2,
							Tare: oData.results[0].TareWeight,
						//	Ownership: ""
						    Uom : ""
						}
					];
				}else if(oParentModel.getProperty(sPath).Pmat1){
					aRows = [{
							Serial: 1,
							Type: oParentModel.getProperty(sPath).Pmat1,
							Bags: oParentModel.getProperty(sPath).Pmatno1,
							Gross: oParentModel.getProperty(sPath).Pmatqty1,
							Tare: oData.results[0].TareWeight,
							//Ownership: ""
							Uom : ""
						},
						{
							Serial: 2,
							Type: "",
							Bags: 0,
							Gross: 0,
							Tare: 0,
						//	Ownership: ""
						    Uom : ""
						}
					];
				}else if(oParentModel.getProperty(sPath).Pmat2){
					 aRows = [{
							Serial: 1,
							Type: "",
							Bags: 0,
							Gross: 0,
							Tare: 0,
							//Ownership: ""
							Uom : ""
						},
						{
							Serial: 2,
							Type: oParentModel.getProperty(sPath).Pmat2,
							Bags: oParentModel.getProperty(sPath).Pmatno2,
							Gross: oParentModel.getProperty(sPath).Pmatqty2,
							Tare: oData.results[0].TareWeight,
						//	Ownership: ""
						    Uom : ""
						}
					];
				}
				else{
					// no backend rows, so set to defaults
					 aRows = [{
							Serial: 1,
							Type: "",
							Bags: 0,
							Gross: 0,
							Tare: 0,
							//Ownership: ""
							Uom : ""
						},
						{
							Serial: 2,
							Type: "",
							Bags: 0,
							Gross: 0,
							Tare: 0,
						//	Ownership: ""
						    Uom : ""
						}
					];
				}

					// bind to fragment
					var oPackModel = new sap.ui.model.json.JSONModel({
						Packaging: aRows
					});
					that._PackageDetails.setModel(oPackModel, "PackingWeightModel");
					var oDropModel = new sap.ui.model.json.JSONModel(aDropDownValues);
					that._PackageDetails.setModel(oDropModel, "MaterialTypeModel");

					that._PackageDetails.open();
				},
				error: function (oError) {
					MessageBox.error(oError.responseText);
					  var aSavedRows =  oParentModel.getProperty(sPath + "/PackagingDetails") || [];
					// still open with default rows
					// var aDefault = [{
					// 		Serial: 1,
					// 		Type: "",
					// 		Bags: 0,
					// 		Gross: 0.000,
					// 		Tare: 0.000,
					// 		Uom: ""
					// 	},
					// 	{
					// 		Serial: 2,
					// 		Type: "",
					// 		Bags: 0,
					// 		Gross: 0.000,
					// 		Tare: 0.000,
					// 		Uom: ""
					// 	}
					// ];
					
            var aDefault = (aSavedRows.length > 0) ? aSavedRows : [
                { Serial: 1, Type: "", Bags: 0, Gross: 0.000, Tare: 0.000, Uom: "" },
                { Serial: 2, Type: "", Bags: 0, Gross: 0.000, Tare: 0.000, Uom: "" }
            ];
					var oPackModel = new sap.ui.model.json.JSONModel({
						Packaging: aDefault
					});
					that._PackageDetails.setModel(oPackModel, "PackingWeight");
					that._PackageDetails.open();
				}
			});

			//that._PackageDetails.open();
		},
		onClosePackagingDetails: function () {
			this._PackageDetails.close();
		},
		onPackingMaterialChange: function (oEvent) {
			var oSelect = oEvent.getSource();
			var sSelectedKey = oSelect.getSelectedKey(); // Material chosen
			var oContext = oSelect.getBindingContext("PackingWeightModel");

			// Get the models
			var oPackingModel = oContext.getModel(); // PackingWeightModel
			var oMaterialModel = this._PackageDetails.getModel("MaterialTypeModel"); // OData dropdown values

			// Find selected material in dropdown data
			var aMaterialTypes = oMaterialModel.getData();
			var oSelected = aMaterialTypes.find(function (item) {
				return item.PackingMaterialType === sSelectedKey;
			});

			if (oSelected) {
				// Update the row in PackingWeightModel
				oPackingModel.setProperty(oContext.getPath() + "/Tare", oSelected.TareWeight);
				oPackingModel.setProperty(oContext.getPath() + "/Uom", oSelected.Uom);
				// ✅ Reset Bags and Gross on change
				oPackingModel.setProperty(oContext.getPath() + "/Bags", "0");
				oPackingModel.setProperty(oContext.getPath() + "/Gross", "0.000");
			}
		},
		// commented below for once confirm the payload for DeliverySet
		// added 11 after removing once confirmed
		onSavePackagingDetails: function () {
			var oThat = this;
			var oPackModel = oThat._PackageDetails.getModel("PackingWeightModel");
			var aPack = oPackModel.getProperty("/Packaging");
			// ✅ Convert everything into strings
			var aPackAsStrings = aPack.map(function (oRow) {
				var oConverted = {};
				Object.keys(oRow).forEach(function (key) {
					oConverted[key] = (oRow[key] !== null && oRow[key] !== undefined) ?
						String(oRow[key]) :
						"";
				});
				return oConverted;
			});
			// ✅ Filter only rows where Packing Material Type & Bags are NOT empty
			var aValidPack = aPackAsStrings.filter(function (oRow) {
				return (oRow.Type && oRow.Type.trim() !== "") && (oRow.Bags && oRow.Bags !== "0" && oRow.Bags.trim() !== "");
			});
			if (aValidPack.length === 0) {
				sap.m.MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("noDataPackageWeight"));
				return; // stop further execution
			}

			var fTotalGross = 0;
			aValidPack.forEach(function (oRow) {
				fTotalGross += parseFloat(oRow.Gross) || 0.000;
			});
			// Convert to string
			var sTotalGross = fTotalGross.toFixed(3).toString();
			if (oThat._oRowContext) {
				var sPath = oThat._oRowContext.getPath();
				var oParentModel = oThat._oRowContext.getModel("DeliverySet");;
				//oParentModel.setProperty(sPath + "/Weight", sTotalGross); // ✅ Save total weight		
				//oParentModel.setProperty(sPath + "/PackagingDetails", aValidPack); // ✅ Save full PackagingDetails for parent 
				if(aValidPack.length === 1){
				oParentModel.getProperty(sPath).Pmat1 = aValidPack[0].Type;
				oParentModel.getProperty(sPath).Pmatno1 = aValidPack[0].Bags ;
				oParentModel.getProperty(sPath).Pmatqty1 = aValidPack[0].Gross ;
				}else{
				oParentModel.getProperty(sPath).Pmat1 = aValidPack[0].Type;
				oParentModel.getProperty(sPath).Pmatno1 = aValidPack[0].Bags ;
				oParentModel.getProperty(sPath).Pmatqty1 = aValidPack[0].Gross ;
				oParentModel.getProperty(sPath).Pmat2 = aValidPack[1].Type ;
				oParentModel.getProperty(sPath).Pmatno2 = aValidPack[1].Bags ;
				oParentModel.getProperty(sPath).Pmatqty2 = aValidPack[1].Gross ;
				}
				oParentModel.getProperty(sPath).PackWt = sTotalGross;
				oParentModel.refresh(true);
				//oParentModel.setProperty(sPath + "/PackagingDetailsUI", aPack); // ✅ Save full PackagingDetails for parent  just to show on UI
			}
			oThat._PackageDetails.close();
		},

		onBagsValueChange: function (oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();
			var iBags = parseFloat(sValue) || 0;
			// Get row context
			var oContext = oInput.getBindingContext("PackingWeightModel");
			var oModel = oContext.getModel();
			// Get Tare weight for this row
			var fTare = parseFloat(oModel.getProperty(oContext.getPath() + "/Tare")) || 0.000;
			// Calculate Gross = Bags × Tare
			var fGross = iBags * fTare;
			// Update Gross field in model
			oModel.setProperty(oContext.getPath() + "/Gross", fGross.toFixed(3));
		},

	});

});