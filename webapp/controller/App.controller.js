sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("LoadingConfirmation.controller.App", {
/*	onInit: function() {
			this.oRoter = this.getOwnerComponent().getRouter();
			this.oRoter.attachRoutePatternMatched(this.fnhandler, this);
		},
			fnhandler: function(oEvent) {
			var opage = oEvent.getParameter("name");
			if(opage == "Dashboard"){
			this.getView().byId("id_home").setVisible(false); 
			}
			else{
				this.getView().byId("id_home").setVisible(true);
			}
				if (opage == "Dashboard") {
			                       
				this.getView().byId("id_text").setText("Warehouse Loading Confirmation");
			} else if (opage == "GateEntry") {
				this.getView().byId("id_text").setText("Scan Picklist");
			}
			else if(opage=="GateExit"){
				this.getView().byId("id_text").setText("Scan Picklist");
			}
			},
			handlePressHome:function(){
			this.oRoter.navTo("Dashboard");
		}*/
	});
});