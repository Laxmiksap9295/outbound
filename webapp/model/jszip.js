jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.declare("LoadingConfirmation.model.formatter");
LoadingConfirmation.model.formatter = {
	fnDate: function(value) {
		if (value) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd-MM-YYYY"
			});
			var vdate = oDateFormat.format(value);
			return vdate;
		}

	},
	fnHoursFormat: function(vValue) {
		if (vValue) {
			var Timearray = vValue.split("Day:")[1];
			var days = Timearray.split("Time")[0];
			var hrs = vValue.split("Time:")[1];
			var time = hrs.split(":")[0];
			var minute = hrs.split(":")[1];
			var sec = hrs.split(":")[2];
			var total = (parseInt(days) * 24);
			//var mininhrs = minute/time;
			var thrs = total + parseInt(time);
			var flag = isFinite(thrs);
			if (flag == true) {
				return (thrs);
			} else {
				return 0;
			}
		} else {
			return vValue;
		}

	},
	fnTime: function(value) {
		if (value) {
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HH:mm:ss"

			});
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			var timeStr = timeFormat.format(new Date(value.ms + TZOffsetMs));
			return timeStr;
			/* var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			     pattern: "hh:mm:ss"
			   });
			     var vdate = oDateFormat.format(value);
			   return vdate;*/
		} else {
			return '';
		}

	},
	fnFindTimeMeridian: function(vValue) {
		if (vValue) {
			if (vValue.split(":")[0] > 12) {
				return vValue + " PM";
			} else {
				return vValue + " AM";
			}
		} else {
			return "";
		}
	},
	fnStatus: function(vValue) {
		if (vValue) {
			if (vValue == 'S01') {
				return " Gate Entry";
			} else if (vValue == 'S02') {
				return " Gate Exit";
			} else {
				return "";
			}
		} else {
			return "";
		}
	},
	fnPickingStatus: function(value) {
		if (Number(value) == 0) {
			return "None";
		} else {
			return "Success";

		}
	},

	fnToStatus: function(value) {
		if (value === "X") {
			return "TO Confirmed";
		}
		return "TO yet to be Confirmed";
	},
	
	fnToStatusColor: function(val){
		if (val === "X") {
			return "Success";
		}
		return "Warning";
	},

	fn12HoursFormat: function(vValue) {
		if (vValue) {
			if (vValue.split(":")[0] > 12) {
				return (vValue.split(":")[0] - 12) + ":" + vValue.split(":")[1];
			} else {
				return vValue;
			}
		} else {
			return "";
		}
	},
	fnpgistatus: function(vValue) {
		if (vValue) {
			if (vValue == 'A') {
				return "Not Yet Processed";
			} else if (vValue == 'B') {
				return "Partially Processed";
			} else if (vValue == 'C') {
				return "Completely Processed";
			} else {
				return "Not Revlevant";
			}
		}
	},

	LeadingZero: function(value) {
		if (!isNaN(value)) {
			value = +value;
			if (value == 0) {
				return '';
			} else {
				return value;
			}
		} else {
			return value;
		}
	},

	fnmsToTime: function(duration) {
		if (duration !== null) {
			try {
				var milliseconds = parseInt((duration.ms % 1000) / 100),
					seconds = parseInt((duration.ms / 1000) % 60),
					minutes = parseInt((duration.ms / (1000 * 60)) % 60),
					hours = parseInt((duration.ms / (1000 * 60 * 60)) % 24);

				hours = (hours < 10) ? "0" + hours : hours;
				minutes = (minutes < 10) ? "0" + minutes : minutes;
				seconds = (seconds < 10) ? "0" + seconds : seconds;

				if (hours > 12) {
					if (hours > 0 || minutes > 0) {
						return hours + ":" + minutes + " PM";
					} else {
						return '';
					}

				} else {
					if (hours > 0 || minutes > 0) {
						return hours + ":" + minutes + " AM";
					} else {
						return '';
					}
				}
			} catch (e) {

			}

		} else {
			return "";
		}
	},

	fnDateConversion: function(vValue) {
		var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			pattern: "dd-MM-yyyy"
		});

		if (vValue == undefined || vValue == "" || vValue == null) {
			return vValue;
		} else {
			return dateFormat.format(vValue);
		}
	},

	fnDelVisibility: function(val) {
		if (val === "X") {
			if (this.getModel("scannerData").getData().Wtype !== undefined) {
				if (this.getModel("scannerData").getData().Wtype !== "TRANSFER") {
					return true;
				}
			}
		}
		return false;
	},

	fnTotaltime: function(value1, value2, value3, value4) {
		try {
			if (value2 != null && value1 != null) {
				//  var vHourdiff  = (value2.getHours() - value1.getHours());
				var timeDiff = Math.abs(value2.getTime() - value1.getTime());
				var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
				var diffHours = Math.ceil(timeDiff / (1000 * 3600 * 1));
				//    try{
				if (diffDays === 0) {

					var V2ms = value4.ms;
					var V1ms = value3.ms;
					var diffms = V2ms - V1ms;
					var DiffHr = parseInt((diffms / (1000 * 60 * 60)) % 24);
					var vDifHr = DiffHr + " " + "Hour" + "(s)";
					this.getBindingContext("RES").getObject().Total = vDifHr;
					this.getModel("RES").refresh();

					return DiffHr + " " + "Hour" + "(s)";

					/*    }
					    catch(e){}*/
				} else {
					var vdifdays = diffDays + " " + "Day" + "(s) " + diffHours + ' Hours';
					this.getBindingContext("RES").getObject().Total = vdifdays;
					this.getModel("RES").refresh();
					return vdifdays;
				}
			} else {
				var vReturn = '';
				this.getBindingContext("RES").getObject().Total = vReturn;
				this.getModel("RES").refresh();
				return vReturn;
			}
			this.getModel("RES").refresh(true);
		} catch (e) {}
	}
}