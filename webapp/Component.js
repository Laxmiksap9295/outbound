// var oGlobalPlant = "";
jQuery.sap.require("LoadingConfirmation.lib.custom");
jQuery.sap.require("LoadingConfirmation.lib.signature");
jQuery.sap.require("LoadingConfirmation.model.filesaver");
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"LoadingConfirmation/model/models",
	"LoadingConfirmation/model/formatter",
	"LoadingConfirmation/model/xlsx",
	"LoadingConfirmation/model/Jhxlx",
	"LoadingConfirmation/model/jszip",
	"LoadingConfirmation/model/xlsx.full.min"
], function(UIComponent, Device,models, formatter, xlsx, Jhxlsx,jszip, ABC) {
	"use strict";

	return UIComponent.extend("LoadingConfirmation.Component", {

		metadata: {
			manifest: "json"
		},

	
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
	        this.localModel = new sap.ui.model.json.JSONModel();
			this.setModel(this.localModel, "localModel");
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.getRouter().initialize();
		},
		getContentDensityClass : function() {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCozy";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});