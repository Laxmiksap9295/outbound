sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
  ],
  function (e, t, i, l) {
    "use strict";
    return e.extend("LoadingConfirmation.controller.Dashboard", {
      onInit: function () {
        var e = jQuery.sap.getModulePath("LoadingConfirmation");
        var t = this.getOwnerComponent().getModel("localModel");
        this.getView().setModel(t);
        this.getOwnerComponent()
          .getRouter()
          .getRoute("Dashboard")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: function () {
        this.fnEntityPlant();
        var e = this;
        e.oBundle = e.getView().getModel("i18n").getResourceBundle();
        e.getBusyDialog = new sap.m.BusyDialog({}).open();
        var i = "AuthChkSet";
        var l = this.getView().getModel("odata");
        l.read(
          i,
          null,
          null,
          true,
          function (i, l) {
            if (i.results[0].Application !== "X") {
              e.getBusyDialog.close();
              if (i.results[0].Gateentry == "X") {
                e.getView().byId("id_GateEntryTile").setVisible(true);
              } else {
                e.getView().byId("id_GateEntryTile").setVisible(false);
              }
              if (i.results[0].Scanpick == "X") {
                e.getView().byId("id_ScanPickTile").setVisible(true);
              } else {
                e.getView().byId("id_ScanPickTile").setVisible(false);
              }
              if (i.results[0].Gatexit == "X") {
                e.getView().byId("id_GateExitTile").setVisible(true);
              } else {
                e.getView().byId("id_GateExitTile").setVisible(false);
              }
              if (i.results[0].Cpl == "X") {
                e.getView().byId("id_CompletedPick").setVisible(true);
              } else {
                e.getView().byId("id_CompletedPick").setVisible(false);
              }
              if (i.results[0].Ppl == "X") {
                e.getView().byId("id_PendPickTile").setVisible(true);
              } else {
                e.getView().byId("id_PendPickTile").setVisible(false);
              }
              if (i.results[0].Tat == "X") {
                e.getView().byId("id_TATRep").setVisible(true);
              } else {
                e.getView().byId("id_TATRep").setVisible(false);
              }
              if (i.results[0].Status == "X") {
                e.getView().byId("id_StatTile").setVisible(true);
              } else {
                e.getView().byId("id_StatTile").setVisible(false);
              }
              if (i.results[0].Statupd == "X") {
                e.getView().byId("id_StatusUpdateTile").setVisible(true);
              } else {
                e.getView().byId("id_StatusUpdateTile").setVisible(false);
              }
              if (i.results[0].Whoapp == "X") {
                e.getView().byId("id_BinConfirmationAppTile").setVisible(true);
              } else {
                e.getView().byId("id_BinConfirmationAppTile").setVisible(false);
              }
              if (i.results[0].Qtyapp == "X") {
                e.getView().byId("id_QualityAppTile").setVisible(true);
              } else {
                e.getView().byId("id_QualityAppTile").setVisible(false);
              }
              if (i.results[0].Docapp == "X") {
                e.getView().byId("id_DocumentAppTile").setVisible(true);
              } else {
                e.getView().byId("id_DocumentAppTile").setVisible(false);
              }
            } else {
              e.getView().byId("id_GateEntryTile").setVisible(false);
              e.getView().byId("id_StatTile").setVisible(false);
              e.getView().byId("id_TATRep").setVisible(false);
              e.getView().byId("id_PendPickTile").setVisible(false);
              e.getView().byId("id_CompletedPick").setVisible(false);
              e.getView().byId("id_GateExitTile").setVisible(false);
              e.getView().byId("id_ScanPickTile").setVisible(false);
              e.getView().byId("id_GateEntryTile").setVisible(false);
              t.error(
                e
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("NoAuth"),
                {}
              );
            }
          },
          function (i) {
            t.error(i.message, { onClose: function (e) {} });
            e.getBusyDialog.close();
          }
        );
      },
      onSelectMenu: function (e) {
        if (e.getParameter("selectedKey") === "QRScan") {
          this.getOwnerComponent().getRouter().navTo("GateEntry");
        } else if (e.getParameter("selectedKey") === "Completed") {
          this.getOwnerComponent()
            .getRouter()
            .navTo("completedPicklist", { List: "Completed" });
        } else if (e.getParameter("selectedKey") === "Pending") {
          this.getOwnerComponent()
            .getRouter()
            .navTo("completedPicklist", { List: "Pending" });
        } else if (e.getParameter("selectedKey") === "Picklist") {
          this.getOwnerComponent().getRouter().navTo("Picklist");
        } else if (e.getParameter("selectedKey") === "GateExit") {
          this.getOwnerComponent().getRouter().navTo("GateExit");
        } else if (e.getParameter("selectedKey") === "TAT") {
          this.getOwnerComponent().getRouter().navTo("TAT");
        }
      },
      fnProcessPress: function (e) {
        var i = this;
        var l = e.getSource().getTitle();
        var n = i.getOwnerComponent().getModel("localModel");
        if (
          l ===
          this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("OutboundQuality")
        ) {
          var s = sap.ushell.Container.getService("CrossApplicationNavigation");
          var r =
            (s &&
              s.hrefForExternal({
                target: { semanticObject: "ZGTSD_ODQUA_APR_SO", action: "manage" },
              })) ||
            "";
          var a = window.location.href.split("#")[0] + r;
          sap.m.URLHelper.redirect(a, false);
        } else if (
          l ===
          this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("OutboundDocument")
        ) {
          var s = sap.ushell.Container.getService("CrossApplicationNavigation");
          var r =
            (s &&
              s.hrefForExternal({
                target: { semanticObject: "ZGTSD_ODDOC_APR_SO", action: "manage" },
              })) ||
            "";
          var a = window.location.href.split("#")[0] + r;
          sap.m.URLHelper.redirect(a, false);
        } else if (
          l ===
          this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("BinConfrimation")
        ) {
          var s = sap.ushell.Container.getService("CrossApplicationNavigation");
          var r =
            (s &&
              s.hrefForExternal({
                target: { semanticObject: "ZGT_BIN_CNFN_SO", action: "manage" },
              })) ||
            "";
          var a = window.location.href.split("#")[0] + r;
          sap.m.URLHelper.redirect(a, false);
        } else if (
          l ===
          this.getView().getModel("i18n").getResourceBundle().getText("GEntry1")
        ) {
          if (
            n.getProperty("/plant") !== "" &&
            n.getProperty("/plant") !== undefined &&
            n.getProperty("/plant") !== null
          ) {
            this.getOwnerComponent().getRouter().navTo("GateEntry");
          } else {
            t.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Select_Plant")
            );
          }
        } else if (
          l ===
          this.getView().getModel("i18n").getResourceBundle().getText("CPD1")
        ) {
          if (
            n.getProperty("/plant") !== "" &&
            n.getProperty("/plant") !== undefined &&
            n.getProperty("/plant") !== null
          ) {
            this.getOwnerComponent()
              .getRouter()
              .navTo("completedPicklist", { List: "Completed" });
          } else {
            t.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Select_Plant")
            );
          }
        } else if (
          l ===
          this.getView().getModel("i18n").getResourceBundle().getText("LD1")
        ) {
          if (
            n.getProperty("/plant") !== "" &&
            n.getProperty("/plant") !== undefined &&
            n.getProperty("/plant") !== null
          ) {
            this.getOwnerComponent()
              .getRouter()
              .navTo("completedPicklist", { List: "Pending" });
          } else {
            t.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Select_Plant")
            );
          }
        } else if (
          l ===
          this.getView().getModel("i18n").getResourceBundle().getText("SP")
        ) {
          if (
            n.getProperty("/plant") !== "" &&
            n.getProperty("/plant") !== undefined &&
            n.getProperty("/plant") !== null
          ) {
            this.getOwnerComponent().getRouter().navTo("Picklist");
          } else {
            t.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Select_Plant")
            );
          }
        } else if (
          l ===
          this.getView().getModel("i18n").getResourceBundle().getText("GE")
        ) {
          if (
            n.getProperty("/plant") !== "" &&
            n.getProperty("/plant") !== undefined &&
            n.getProperty("/plant") !== null
          ) {
            this.getOwnerComponent().getRouter().navTo("GateExit");
          } else {
            t.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Select_Plant")
            );
          }
        } else if (
          l ===
          this.getView().getModel("i18n").getResourceBundle().getText("SU")
        ) {
          this.getOwnerComponent().getRouter().navTo("StatusUpdate");
        } else if (
          l ===
          this.getView().getModel("i18n").getResourceBundle().getText("TATR")
        ) {
          if (
            n.getProperty("/plant") !== "" &&
            n.getProperty("/plant") !== undefined &&
            n.getProperty("/plant") !== null
          ) {
            this.getOwnerComponent().getRouter().navTo("TAT");
          } else {
            t.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Select_Plant")
            );
          }
        } else if (
          l ===
          this.getView().getModel("i18n").getResourceBundle().getText("Status1")
        ) {
          this.getOwnerComponent().getRouter().navTo("Status");
        }
      },
      onClickPlantF4: function (e) {
        var t = this;
        t.vId = e.getSource().getId();
        if (!this.Printfragmentplant) {
          this.Printfragmentplant = sap.ui.xmlfragment(
            "LoadingConfirmation.fragment.Plant",
            this
          );
          this.getView().addDependent(this.Printfragmentplant);
        }
        this.Printfragmentplant.open();
        t.Printfragmentplant.fireLiveChange();
      },
      fnEntityPlant: function (e) {
        var t = "/F4Set";
        var n = this;
        var s = n.getView().getModel("odata");
        s.read(t, {
          filters: [new l("Werks", i.EQ, "X")],
          urlParameters: { $expand: "F4WerksNav" },
          success: function (e, t) {
            var i = e.results[0].F4WerksNav.results;
            if (i.length === 1) {
              var l = n.getOwnerComponent().getModel("localModel");
              l.setProperty("/plant", i[0].Werks);
              l.setProperty("/plantDesc", i[0].Name1);
              l.refresh();
              n.getView()
                .byId("id_PlantGb")
                .setText(i[0].Werks + " - " + i[0].Name1);
            } else {
              n.getView().byId("id_SettingPlant").setVisible(true);
            }
            var s = new sap.ui.model.json.JSONModel();
            s.setData(i);
            n.getView().setModel(s, "JMData");
            n.getView().getModel("JMData").refresh();
          },
          error: function (e) {
            sap.m.MessageToast.show(
              n.getView().getModel("i18n").getProperty("HTTPFail")
            );
          },
        });
      },
      onsearch: function (e) {
        var t = e.getParameter("value");
        var i;
        if (t == undefined) {
          t = "";
        }
        i = new sap.ui.model.Filter([
          new l("Werks", sap.ui.model.FilterOperator.Contains, t),
          new l("Name1", sap.ui.model.FilterOperator.Contains, t),
        ]);
        var n = new sap.ui.model.Filter(i, false);
        var s = e.getSource().getBinding("items");
        s.filter([n]);
      },
      fnconfirm: function (e) {
        var t = this;
        var i = e.getParameter("selectedItem");
        var l = this.getOwnerComponent().getModel("localModel");
        l.setProperty("/plant", i.getTitle());
        l.setProperty("/plantDesc", i.getDescription());
        e.getSource().getBinding("items").filter([]);
        l.refresh();
        t.getView()
          .byId("id_PlantGb")
          .setText(
            l.getProperty("/plant") + " - " + l.getProperty("/plantDesc")
          );
      },
      onSelectTabBar: function (e) {
       
        if (e.getSource().getSelectedKey() == "IN") {
          try {
            var i = sap.ushell.Container.getService(
              "CrossApplicationNavigation"
            );
            var l =
              (i &&
                i.hrefForExternal({
                  target: {
                    semanticObject: "ZGT_MM_INBOUND_SO",
                    action: "create",
                  },
                })) ||
              "";
            var n = window.location.href.split("#")[0] + l;
            sap.m.URLHelper.redirect(n, false);
          } catch (e) {
            t.error(e.message);
          }
        }
      },
    });
  }
);
//# sourceMappingURL=Dashboard-dbg-dbg.controller.js.map
